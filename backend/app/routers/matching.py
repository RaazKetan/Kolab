from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .. import schemas, models, auth
from ..database import get_db
import random

router = APIRouter(prefix="/matching", tags=["Matching"])

def calculate_match_score(user: models.User, project: models.Project) -> tuple[float, str]:
    """
    Calculate match score between user and project based on skills, languages, and frameworks.
    Returns (score, match_strength) where:
    - score: 0.0 to 1.0
    - match_strength: "strong" (>0.7), "likely" (0.4-0.7), "weak" (<0.4)
    """
    score = 0.0
    weights = {
        'skills': 0.4,
        'languages': 0.3,
        'frameworks': 0.2,
        'complexity': 0.1
    }
    
    # Skills match
    user_skills = set(user.skills or [])
    project_skills = set(project.skills or [])
    if user_skills and project_skills:
        skills_overlap = len(user_skills.intersection(project_skills))
        skills_score = min(1.0, skills_overlap / max(len(project_skills), 1))
        score += skills_score * weights['skills']
    
    # Languages match
    user_languages = set(user.top_languages or [])
    project_languages = set(project.languages or [])
    if user_languages and project_languages:
        lang_overlap = len(user_languages.intersection(project_languages))
        lang_score = min(1.0, lang_overlap / max(len(project_languages), 1))
        score += lang_score * weights['languages']
    
    # Frameworks match
    user_frameworks = set(user.top_frameworks or [])
    project_frameworks = set(project.frameworks or [])
    if user_frameworks and project_frameworks:
        framework_overlap = len(user_frameworks.intersection(project_frameworks))
        framework_score = min(1.0, framework_overlap / max(len(project_frameworks), 1))
        score += framework_score * weights['frameworks']
    
    # Complexity bonus (if user has many skills, they can handle complex projects)
    user_skill_count = len(user.skills or [])
    if project.complexity == "advanced" and user_skill_count >= 5:
        score += weights['complexity']
    elif project.complexity == "intermediate" and user_skill_count >= 3:
        score += weights['complexity'] * 0.7
    elif project.complexity == "beginner":
        score += weights['complexity'] * 0.5
    
    # Determine match strength
    if score >= 0.7:
        match_strength = "strong"
    elif score >= 0.4:
        match_strength = "likely"
    else:
        match_strength = "weak"
    
    return score, match_strength

@router.get("/discover", response_model=schemas.ProjectResponse)
def get_next_project(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # First, try to get projects that haven't been swiped yet
    swiped_ids = db.query(models.Swipe.project_id).filter(
        models.Swipe.user_id == current_user.id
    ).subquery()

    new_candidates = db.query(models.Project).filter(
        and_(
            models.Project.owner_id != current_user.id,
            models.Project.is_active == True,
            ~models.Project.id.in_(swiped_ids)
        )
    ).all()

    if new_candidates:
        # Calculate match scores for all candidates
        scored_projects = []
        for project in new_candidates:
            score, match_strength = calculate_match_score(current_user, project)
            scored_projects.append((project, score, match_strength))
        
        # Sort by score (highest first)
        scored_projects.sort(key=lambda x: x[1], reverse=True)
        
        # Select the top project
        selected_project, score, match_strength = scored_projects[0]
        
        # Add match metadata to the project
        selected_project.is_reshow = False
        selected_project.match_score = score
        selected_project.match_strength = match_strength
        
        return selected_project
    
    # If no new projects, get projects that were passed (not liked) - exclude liked projects
    liked_project_ids = db.query(models.Swipe.project_id).filter(
        and_(
            models.Swipe.user_id == current_user.id,
            models.Swipe.is_like == True
        )
    ).subquery()

    passed_project_ids = db.query(models.Swipe.project_id).filter(
        and_(
            models.Swipe.user_id == current_user.id,
            models.Swipe.is_like == False
        )
    ).subquery()

    passed_candidates = db.query(models.Project).filter(
        and_(
            models.Project.owner_id != current_user.id,
            models.Project.is_active == True,
            models.Project.id.in_(passed_project_ids),
            ~models.Project.id.in_(liked_project_ids)  # Exclude liked projects
        )
    ).all()

    if passed_candidates:
        # Also score passed projects
        scored_projects = []
        for project in passed_candidates:
            score, match_strength = calculate_match_score(current_user, project)
            scored_projects.append((project, score, match_strength))
        
        scored_projects.sort(key=lambda x: x[1], reverse=True)
        selected_project, score, match_strength = scored_projects[0]
        
        # Add metadata
        selected_project.is_reshow = True
        selected_project.match_score = score
        selected_project.match_strength = match_strength
        
        return selected_project
    
    # If no projects at all (including passed ones)
    raise HTTPException(status_code=404, detail="No more projects to discover")

@router.post("/swipe", response_model=schemas.SwipeResponse)
def swipe_project(
    swipe: schemas.SwipeCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if project exists
    project = db.query(models.Project).filter(models.Project.id == swipe.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if already swiped
    existing_swipe = db.query(models.Swipe).filter(
        and_(
            models.Swipe.user_id == current_user.id,
            models.Swipe.project_id == swipe.project_id
        )
    ).first()
    
    if existing_swipe:
        raise HTTPException(status_code=400, detail="Already swiped on this project")
    
    # Create swipe record
    db_swipe = models.Swipe(
        user_id=current_user.id,
        project_id=swipe.project_id,
        is_like=swipe.is_like
    )
    db.add(db_swipe)
    db.commit()
    db.refresh(db_swipe)
    
    return db_swipe

@router.get("/matches", response_model=list[schemas.ProjectResponse])
def get_matches(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Get project IDs that user has liked AND that have been approved
    liked_and_approved_ids = db.query(models.Swipe.project_id).filter(
        and_(
            models.Swipe.user_id == current_user.id,
            models.Swipe.is_like == True,
            models.Swipe.approved_by_owner == True
        )
    ).subquery()
    
    # Get projects based on liked and approved IDs
    liked_projects = db.query(models.Project).filter(
        models.Project.id.in_(liked_and_approved_ids)
    ).all()
    
    return liked_projects

@router.get("/approved-matches", response_model=list[schemas.ProjectResponse])
def get_approved_matches(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Get project IDs that user has liked AND that have been approved by the owner
    approved_project_ids = db.query(models.Swipe.project_id).filter(
        and_(
            models.Swipe.user_id == current_user.id,
            models.Swipe.is_like == True,
            models.Swipe.approved_by_owner == True
        )
    ).subquery()
    
    # Get projects based on approved liked IDs
    approved_projects = db.query(models.Project).filter(
        models.Project.id.in_(approved_project_ids)
    ).all()
    
    return approved_projects

@router.get("/recommendations", response_model=list[schemas.ProjectResponse])
def get_recommendations(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Prefer embedding-based similarity when vectors exist
    def cosine(a, b):
        try:
            import math
            if not a or not b or len(a) != len(b):
                return 0.0
            sa = sum(x*x for x in a)
            sb = sum(y*y for y in b)
            if sa == 0 or sb == 0:
                return 0.0
            dot = sum(x*y for x,y in zip(a,b))
            return max(0.0, min(1.0, dot / (math.sqrt(sa)*math.sqrt(sb))))
        except Exception:
            return 0.0

    user_vec = current_user.user_vector or []
    projects = db.query(models.Project).filter(models.Project.is_active == True, models.Project.owner_id != current_user.id).all()
    if user_vec and projects and any(p.project_vector for p in projects):
        scored = [(p, cosine(user_vec, p.project_vector or [])) for p in projects]
        scored.sort(key=lambda t: t[1], reverse=True)
        return [p for p,_ in scored[:10]]
    # Fallback: skill overlap
    user_skills = set(current_user.skills or [])
    projects.sort(key=lambda p: len(user_skills.intersection(set(p.skills or []))), reverse=True)
    return projects[:10]

@router.get("/my-projects/likes", response_model=list[schemas.OwnerMatchItem])
def get_likes_on_my_projects(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Only show likes that haven't been approved yet
    rows = db.query(models.Project, models.Swipe.user_id).join(
        models.Swipe, models.Project.id == models.Swipe.project_id
    ).filter(
        and_(
            models.Project.owner_id == current_user.id,
            models.Swipe.is_like == True,
            models.Swipe.approved_by_owner == False  # Only unapproved likes
        )
    ).all()

    result: list[schemas.OwnerMatchItem] = []
    for proj, liker_id in rows:
        result.append(schemas.OwnerMatchItem(
            id=proj.id,
            title=proj.title,
            summary=proj.summary,
            repo_url=proj.repo_url,
            languages=proj.languages or [],
            frameworks=proj.frameworks or [],
            project_type=proj.project_type or "unknown",
            domains=proj.domains or [],
            skills=proj.skills or [],
            complexity=proj.complexity or "intermediate",
            roles=proj.roles or [],
            embedding_summary=proj.embedding_summary,
            owner_id=proj.owner_id,
            is_active=bool(proj.is_active),
            created_at=proj.created_at,
            liked_by_user_id=liker_id,
        ))
    return result

@router.post("/approve", response_model=schemas.SwipeResponse)
def approve_like(
    payload: schemas.ApproveLike,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Owner approves a like to form a match
    project = db.query(models.Project).filter(models.Project.id == payload.project_id).first()
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this project")
    swipe = db.query(models.Swipe).filter(
        and_(
            models.Swipe.project_id == payload.project_id,
            models.Swipe.user_id == payload.liker_user_id,
            models.Swipe.is_like == True
        )
    ).first()
    if not swipe:
        raise HTTPException(status_code=404, detail="Like not found")
    swipe.approved_by_owner = True
    db.add(swipe)
    
    # Also create a reverse match for the project owner
    # This allows the project owner to see the match in their matches list
    reverse_swipe = models.Swipe(
        user_id=current_user.id,  # Project owner
        project_id=payload.project_id,  # Their own project
        is_like=True,  # They "like" their own project to show it in matches
        approved_by_owner=True  # Auto-approved since they own it
    )
    db.add(reverse_swipe)
    
    db.commit()
    db.refresh(swipe)
    return swipe