from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import schemas, models, auth
from ..database import get_db

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.get("/{project_id}", response_model=list[schemas.ChatMessageResponse])
def list_messages(project_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Permit chat if user liked the project (or is owner)
    liked = db.query(models.Swipe).filter(
        models.Swipe.user_id == current_user.id,
        models.Swipe.project_id == project_id,
        models.Swipe.is_like == True
    ).first()
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not (liked or (project and project.owner_id == current_user.id)):
        raise HTTPException(status_code=403, detail="Not permitted")

    return db.query(models.ChatMessage).filter(
        models.ChatMessage.project_id == project_id
    ).order_by(models.ChatMessage.created_at.asc()).all()

@router.post("/", response_model=schemas.ChatMessageResponse)
def send_message(msg: schemas.ChatMessageCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == msg.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # same permission rule as above
    liked = db.query(models.Swipe).filter(
        models.Swipe.user_id == current_user.id,
        models.Swipe.project_id == msg.project_id,
        models.Swipe.is_like == True
    ).first()
    if not (liked or project.owner_id == current_user.id):
        raise HTTPException(status_code=403, detail="Not permitted")

    db_msg = models.ChatMessage(
        project_id=msg.project_id,
        from_user_id=current_user.id,
        to_user_id=msg.to_user_id,
        content=msg.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg