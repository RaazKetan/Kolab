from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth, crud
from ..database import get_db
from ..gemini_agent import analyze_repo_url, embed_text
import requests

router = APIRouter(prefix="/repo", tags=["Repo"])

def fetch_repo_readme_and_files(repo_url: str):
    # naive fetch: README  a few key files via raw URLs
    parts = repo_url.rstrip("/").split("/")
    owner, repo = parts[-2], parts[-1]
    readme = ""
    try:
        r = requests.get(f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/README.md", timeout=10)
        readme = r.text if r.status_code == 200 else ""
    except Exception:
        pass
    # try common entry files
    candidates = ["package.json", "requirements.txt", "pyproject.toml", "src/App.jsx", "main.py"]
    files = []
    for p in candidates:
        try:
            r = requests.get(f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{p}", timeout=10)
            if r.status_code == 200 and r.text:
                files.append({"path": p, "content": r.text[:5000]})
        except Exception:
            continue
    return readme, files

@router.post("/project/from_url", response_model=schemas.ProjectResponse)
def create_project_from_repo(
    data: schemas.CreateProjectFromRepo,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    readme_text, files = fetch_repo_readme_and_files(data.repo_url)
    ai = analyze_repo_url(data.repo_url, readme_text, files)

    project = schemas.ProjectCreate(
        title = ai.get("project_title") or "Untitled",
        summary = ai.get("project_summary") or "unknown",
        repo_url = ai.get("repo_url") or data.repo_url,
        languages = ai.get("primary_languages") or [],
        frameworks = ai.get("frameworks_or_libraries") or [],
        project_type = ai.get("project_type") or "unknown",
        domains = ai.get("detected_domains") or [],
        skills = ai.get("required_skills") or [],
        complexity = ai.get("complexity_level") or "intermediate",
        roles = ai.get("estimated_collaboration_roles") or [],
    )
    created = crud.create_project(db, project, owner_id=current_user.id)
    # Compute and store project embedding for semantic matching
    try:
        vector = embed_text(f"{created.title}\n{created.summary}\n{' '.join(created.languages or [])} {' '.join(created.frameworks or [])}")
        created.project_vector = vector
        db.add(created)
        db.commit()
        db.refresh(created)
    except Exception:
        pass
    return created

@router.post("/project/analyze", response_model=schemas.ProjectAnalyzeResponse)
def analyze_project_from_repo(data: schemas.CreateProjectFromRepo):
    try:
        readme_text, files = fetch_repo_readme_and_files(data.repo_url)
        ai = analyze_repo_url(data.repo_url, readme_text, files)
        return schemas.ProjectAnalyzeResponse(
            title = ai.get("project_title") or "Untitled",
            summary = ai.get("project_summary") or "unknown",
            repo_url = ai.get("repo_url") or data.repo_url,
            languages = ai.get("primary_languages") or [],
            frameworks = ai.get("frameworks_or_libraries") or [],
            project_type = ai.get("project_type") or "unknown",
            domains = ai.get("detected_domains") or [],
            skills = ai.get("required_skills") or [],
            complexity = ai.get("complexity_level") or "intermediate",
            roles = ai.get("estimated_collaboration_roles") or [],
        )
    except Exception as e:
        # Fallback so UI can continue without blocking on Gemini
        return schemas.ProjectAnalyzeResponse(
            title = "Untitled",
            summary = "unknown",
            repo_url = data.repo_url,
            languages = [],
            frameworks = [],
            project_type = "unknown",
            domains = [],
            skills = [],
            complexity = "intermediate",
            roles = []
        )