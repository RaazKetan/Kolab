from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, auth, models
from ..database import get_db
from ..gemini_agent import embed_text

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=list[schemas.UserResponse])
def list_users(db: Session = Depends(get_db)):
    return crud.get_all_users(db)

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserProfileUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    try:
        print(f"Updating user {user_id} with data: {user_update.dict()}")
        
        # Check if user exists and is the current user
        user = crud.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
        
        # Update user fields (only update fields that are provided)
        update_data = user_update.dict(exclude_unset=True)
        print(f"Update data: {update_data}")
        
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
                print(f"Updated {field} to {value}")
        
        # Recompute user embedding
        try:
            vec_text = f"{user.name} {user.bio} {' '.join(user.skills or [])} {' '.join(user.top_languages or [])}"
            user.user_vector = embed_text(vec_text)
            print("Updated user embedding")
        except Exception as e:
            print(f"Failed to update user embedding: {e}")
            pass
        
        db.commit()
        db.refresh(user)
        print(f"Successfully updated user {user_id}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating user {user_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

@router.post("/{user_id}/repositories", response_model=schemas.UserResponse)
def add_repository_to_user(
    user_id: int,
    repo_data: schemas.AddRepositoryRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add an analyzed repository to user's profile
    """
    try:
        # Check if user exists and is the current user
        user = crud.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
        
        # Get existing repositories or initialize empty list
        existing_repos = user.github_selected_repos or []
        
        # Check if repository already exists
        repo_url = repo_data.repo_data.get("url")
        if any(r.get("url") == repo_url for r in existing_repos):
            raise HTTPException(status_code=400, detail="Repository already added")
        
        # Check max limit (5 repositories)
        if len(existing_repos) >= 5:
            raise HTTPException(status_code=400, detail="Maximum 5 repositories allowed")
        
        # Add new repository
        existing_repos.append(repo_data.repo_data)
        user.github_selected_repos = existing_repos
        
        # Update user's top_languages based on all repositories
        all_languages = set()
        all_skills = set()
        for repo in existing_repos:
            all_languages.update(repo.get("languages", []))
            all_skills.update(repo.get("skills_detected", []))
        
        user.top_languages = list(all_languages)[:10]  # Keep top 10
        
        # Recompute user embedding
        try:
            vec_text = f"{user.name} {user.bio} {' '.join(user.skills or [])} {' '.join(user.top_languages or [])}"
            user.user_vector = embed_text(vec_text)
        except Exception as e:
            print(f"Failed to update user embedding: {e}")
        
        db.commit()
        db.refresh(user)
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding repository to user {user_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to add repository: {str(e)}")

@router.delete("/{user_id}/repositories/{repo_index}", response_model=schemas.UserResponse)
def remove_repository_from_user(
    user_id: int,
    repo_index: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a repository from user's profile by index
    """
    try:
        # Check if user exists and is the current user
        user = crud.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user")
        
        # Get existing repositories
        existing_repos = user.github_selected_repos or []
        
        # Check if index is valid
        if repo_index < 0 or repo_index >= len(existing_repos):
            raise HTTPException(status_code=400, detail="Invalid repository index")
        
        # Remove repository
        existing_repos.pop(repo_index)
        user.github_selected_repos = existing_repos
        
        # Update user's top_languages based on remaining repositories
        all_languages = set()
        for repo in existing_repos:
            all_languages.update(repo.get("languages", []))
        
        user.top_languages = list(all_languages)[:10]
        
        # Recompute user embedding
        try:
            vec_text = f"{user.name} {user.bio} {' '.join(user.skills or [])} {' '.join(user.top_languages or [])}"
            user.user_vector = embed_text(vec_text)
        except Exception as e:
            print(f"Failed to update user embedding: {e}")
        
        db.commit()
        db.refresh(user)
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing repository from user {user_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to remove repository: {str(e)}")

