from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, not_
from .. import schemas, models, auth
from ..database import get_db
from ..match_utlis import cosine_similarity
import random

router = APIRouter(prefix="/matching", tags=["Matching"])

@router.get("/discover", response_model=schemas.ProjectResponse)
def get_next_project(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Get projects user hasn't swiped on yet
    swiped_project_ids = db.query(models.Swipe.project_id).filter(
        models.Swipe.user_id == current_user.id
    ).subquery()
    
    # Get projects not owned by current user and not swiped
    available_projects = db.query(models.Project).filter(
        and_(
            models.Project.owner_id != current_user.id,
            models.Project.is_active == True,
            ~models.Project.id.in_(swiped_project_ids)
        )
    ).all()
    
    if not available_projects:
        raise HTTPException(status_code=404, detail="No more projects to discover")
    
    # For now, return random project. Later we can add AI matching
    return random.choice(available_projects)

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
    # Simple recommendation based on user skills
    user_skills = set(current_user.skills or [])
    
    # Get projects that match user skills
    matching_projects = []
    for project in db.query(models.Project).filter(models.Project.is_active == True).all():
        project_skills = set(project.skills or [])
        if user_skills.intersection(project_skills):
            matching_projects.append(project)
    
    # Sort by skill overlap
    matching_projects.sort(
        key=lambda p: len(user_skills.intersection(set(p.skills or []))),
        reverse=True
    )
    
    return matching_projects[:10]  # Return top 10