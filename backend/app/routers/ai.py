from fastapi import APIRouter, Depends
from .. import models, auth
from ..gemini_agent import analyze_repo, refine_pitch, get_project_requirements_questions, process_project_requirements, generate_project_template, semantic_search_projects

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/refine_pitch")
def refine_pitch_route(data: dict):
    return refine_pitch(data["raw_idea"])

@router.post("/analyze_repo")
def analyze_repo_route(data: dict):
    readme = data.get("readme", "")
    files = data.get("files", [])
    return analyze_repo(readme, files)

@router.get("/project-questions")
def get_questions(current_user: models.User = Depends(auth.get_current_user)):
    """Get initial questions for project requirements gathering"""
    return get_project_requirements_questions()

@router.post("/process-requirements")
def process_requirements(request: dict, current_user: models.User = Depends(auth.get_current_user)):
    """Process user answers and return next questions or project details"""
    answers = request.get("answers", [])
    current_step = request.get("current_step", 1)
    return process_project_requirements(answers, current_step)

@router.post("/generate-template")
def generate_template(request: dict, current_user: models.User = Depends(auth.get_current_user)):
    """Generate project template based on type, complexity, and tech stack"""
    project_type = request.get("project_type", "Web Application")
    complexity = request.get("complexity", "intermediate")
    tech_stack = request.get("tech_stack", [])
    return generate_project_template(project_type, complexity, tech_stack)

@router.post("/search")
def search_projects(request: dict, current_user: models.User = Depends(auth.get_current_user)):
    """Perform semantic search on projects"""
    query = request.get("query", "")
    filters = request.get("filters", {})
    return semantic_search_projects(query, filters)
