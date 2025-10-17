from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, auth, models
from ..database import get_db

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("/", response_model=list[schemas.ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return crud.get_all_projects(db)

@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    project: schemas.ProjectCreate, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_project(db, project, current_user.id)

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    project_update: schemas.ProjectCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if project exists and belongs to current user
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    # Update project fields
    for field, value in project_update.dict().items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if project exists and belongs to current user
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    # Delete related swipes and chat messages first
    db.query(models.Swipe).filter(models.Swipe.project_id == project_id).delete()
    db.query(models.ChatMessage).filter(models.ChatMessage.project_id == project_id).delete()
    
    # Delete the project
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}
