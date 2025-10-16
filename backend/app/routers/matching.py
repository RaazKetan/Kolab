from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .. import schemas, models, auth
from ..database import get_db
import random

router = APIRouter(prefix="/matching", tags=["Matching"])

@router.get("/discover", response_model=schemas.ProjectResponse)
def get_next_project(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    swiped_ids = db.query(models.Swipe.project_id).filter(
        models.Swipe.user_id == current_user.id
    ).subquery()

    candidates = db.query(models.Project).filter(
        and_(
            models.Project.owner_id != current_user.id,
            models.Project.is_active == True,
            ~models.Project.id.in_(swiped_ids)
        )
    ).all()

    if not candidates:
        raise HTTPException(status_code=404, detail="No more projects to discover")

    return random.choice(candidates)

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
    # Get project IDs that user has liked
    liked_project_ids = db.query(models.Swipe.project_id).filter(
        and_(
            models.Swipe.user_id == current_user.id,
            models.Swipe.is_like == True
        )
    ).subquery()
    
    # Get projects based on liked IDs
    liked_projects = db.query(models.Project).filter(
        models.Project.id.in_(liked_project_ids)
    ).all()
    
    return liked_projects

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
    rows = db.query(models.Project, models.Swipe.user_id).join(
        models.Swipe, models.Project.id == models.Swipe.project_id
    ).filter(
        and_(
            models.Project.owner_id == current_user.id,
            models.Swipe.is_like == True
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
    db.commit()
    db.refresh(swipe)
    return swipe