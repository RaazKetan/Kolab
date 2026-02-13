from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth, crud
from ..database import get_db
from ..gemini_agent import analyze_repo_url, analyze_project_repo
from ..utils import embed_text
import requests

router = APIRouter(prefix="/repo", tags=["Repo"])

import httpx


async def fetch_repo_readme_and_files(repo_url: str):
    # naive fetch: README  a few key files via raw URLs
    parts = repo_url.rstrip("/").split("/")
    owner, repo = parts[-2], parts[-1]
    readme = ""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(
                f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/README.md"
            )
            readme = r.text if r.status_code == 200 else ""
        except Exception:
            pass
        # try common entry files
        candidates = [
            "package.json",
            "requirements.txt",
            "pyproject.toml",
            "src/App.jsx",
            "main.py",
        ]
        files = []
        for p in candidates:
            try:
                r = await client.get(
                    f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{p}"
                )
                if r.status_code == 200 and r.text:
                    files.append({"path": p, "content": r.text[:5000]})
            except Exception:
                continue
    return readme, files


@router.post("/project/from_url", response_model=schemas.ProjectResponse)
async def create_project_from_repo(
    data: schemas.CreateProjectFromRepo,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    readme_text, files = await fetch_repo_readme_and_files(data.repo_url)
    ai = await analyze_repo_url(data.repo_url, readme_text, files)

    project = schemas.ProjectCreate(
        title=ai.get("project_title") or "Untitled",
        summary=ai.get("project_summary") or "unknown",
        repo_url=ai.get("repo_url") or data.repo_url,
        languages=ai.get("primary_languages") or [],
        frameworks=ai.get("frameworks_or_libraries") or [],
        project_type=ai.get("project_type") or "unknown",
        domains=ai.get("detected_domains") or [],
        skills=ai.get("required_skills") or [],
        complexity=ai.get("complexity_level") or "intermediate",
        roles=ai.get("estimated_collaboration_roles") or [],
    )
    created = crud.create_project(db, project, owner_id=current_user.id)
    # Compute and store project embedding for semantic matching
    try:
        # embed_text is sync, but lightweight-ish api call.
        # For full async, we should make it async too or run in executor.
        # Keeping it simple for now, as it's not the crash reason.
        vector = embed_text(
            f"{created.title}\n{created.summary}\n{' '.join(created.languages or [])} {' '.join(created.frameworks or [])}"
        )
        created.project_vector = vector
        db.add(created)
        db.commit()
        db.refresh(created)
    except Exception:
        pass
    return created


@router.post("/project/analyze", response_model=schemas.ProjectAnalyzeResponse)
async def analyze_project_from_repo(data: schemas.CreateProjectFromRepo):
    try:
        readme_text, files = await fetch_repo_readme_and_files(data.repo_url)
        ai = await analyze_repo_url(data.repo_url, readme_text, files)
        return schemas.ProjectAnalyzeResponse(
            title=ai.get("project_title") or "Untitled",
            summary=ai.get("project_summary") or "unknown",
            repo_url=ai.get("repo_url") or data.repo_url,
            languages=ai.get("primary_languages") or [],
            frameworks=ai.get("frameworks_or_libraries") or [],
            project_type=ai.get("project_type") or "unknown",
            domains=ai.get("detected_domains") or [],
            skills=ai.get("required_skills") or [],
            complexity=ai.get("complexity_level") or "intermediate",
            roles=ai.get("estimated_collaboration_roles") or [],
        )
    except Exception as e:
        # Fallback so UI can continue without blocking on Gemini
        return schemas.ProjectAnalyzeResponse(
            title="Untitled",
            summary="unknown",
            repo_url=data.repo_url,
            languages=[],
            frameworks=[],
            project_type="unknown",
            domains=[],
            skills=[],
            complexity="intermediate",
            roles=[],
        )


@router.post("/project/analyze-autofill", response_model=schemas.ProjectAnalyzeResponse)
async def analyze_project_for_autofill(data: schemas.CreateProjectFromRepo):
    """
    Analyze a GitHub repository using the GitHub ADK agent to auto-fill project creation form.
    This endpoint is specifically for the "Post Project" auto-fill feature.
    """
    try:
        result = await analyze_project_repo(data.repo_url)

        return schemas.ProjectAnalyzeResponse(
            title=result.get("title") or "Untitled",
            summary=result.get("summary") or "No summary available",
            repo_url=result.get("repo_url") or data.repo_url,
            languages=result.get("languages") or [],
            frameworks=result.get("frameworks") or [],
            project_type=result.get("project_type") or "Web Application",
            domains=result.get("domains") or [],
            skills=result.get("skills") or [],
            complexity=result.get("complexity") or "intermediate",
            roles=result.get("roles") or [],
        )
    except Exception as e:
        print(f"Error in analyze_project_for_autofill: {e}")
        import traceback

        traceback.print_exc()

        # Return fallback response
        repo_name = data.repo_url.split("/")[-1] if "/" in data.repo_url else "Project"
        return schemas.ProjectAnalyzeResponse(
            title=repo_name.replace("-", " ").replace("_", " ").title(),
            summary="Analysis failed. Please fill in the details manually.",
            repo_url=data.repo_url,
            languages=[],
            frameworks=[],
            project_type="Web Application",
            domains=[],
            skills=[],
            complexity="intermediate",
            roles=[],
        )
