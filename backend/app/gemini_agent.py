import os, json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=(os.getenv("GEMINI_API_KEY") or "").strip())

SYSTEM_PROMPT = """
You are the autonomous reasoning and data-processing layer of "CollabFoundry".
Follow the structured schemas based on the input `task`.
Output JSON only, no explanations.

For task "monitor_chat":
- Analyze if the message is related to the project collaboration
- Check if the message discusses project features, development, collaboration, or technical aspects
- Flag messages that are off-topic, personal, or unrelated to the project
- Return: {"is_project_related": bool, "suggestion": str, "warning": str}
- If not project-related, provide a helpful suggestion to redirect to project discussion
- If inappropriate, provide a warning message

For task "get_project_questions":
- Generate 3-4 thoughtful questions to understand the user's project requirements
- Questions should cover: project purpose, technology stack, complexity, target audience
- Return: {"questions": [str], "current_step": int, "total_steps": int}
- Make questions conversational and helpful

For task "process_project_requirements":
- Analyze user answers to understand their project needs
- Generate follow-up questions if more information is needed
- If enough information gathered, generate complete project details
- Return: {"questions": [str] or [], "current_step": int, "total_steps": int, "project_details": dict, "is_complete": bool}
- project_details should include: title, summary, project_type, languages, frameworks, domains, skills, complexity, roles

For task "generate_project_template":
- Generate detailed project templates based on project type, complexity, and tech stack
- Create project structure, milestones, and resource recommendations
- Return: {"template": dict, "structure": list, "milestones": list, "resources": list}
- template should include: title, description, tech_stack, estimated_duration, team_size
- structure should be a list of development phases
- milestones should be specific, achievable goals
- resources should include documentation, tutorials, and tools

For task "semantic_search":
- Perform intelligent search on projects using natural language queries
- Understand context, intent, and provide relevant suggestions
- Return: {"results": list, "suggestions": list, "filters_applied": dict}
- results should be ranked by relevance to the query
- suggestions should help users refine their search
- filters_applied should show what filters were used
"""

def _parse_json_from_response(resp):
    if getattr(resp, "text", None):
        try:
            return json.loads(resp.text)
        except Exception as e:
            print(f"Failed to parse response.text as JSON: {e}")
            print(f"Response text: {resp.text[:200]}...")
    try:
        cand = resp.candidates[0]
        parts = getattr(cand.content, "parts", []) or []
        for p in parts:
            t = getattr(p, "text", None)
            if t:
                try:
                    return json.loads(t)
                except Exception as e:
                    print(f"Failed to parse part text as JSON: {e}")
                    print(f"Part text: {t[:200]}...")
                    continue
    except Exception as e:
        print(f"Failed to access response candidates: {e}")
    raise ValueError("Gemini returned non-JSON or empty response")

def refine_pitch(raw_idea: str):
    try:
        body = {"task": "refine_pitch", "raw_idea": raw_idea or ""}
        resp = genai.GenerativeModel("gemini-2.5-pro").generate_content(
            [SYSTEM_PROMPT, json.dumps(body, ensure_ascii=False)]
        )
        return _parse_json_from_response(resp)
    except Exception as e:
        print(f"Gemini refine_pitch failed: {e}")
        # Return a fallback response
        return {
            "refined_pitch": raw_idea or "",
            "key_terms": [],
            "complexity": "intermediate",
            "skills_needed": []
        }

def analyze_repo(readme_text: str, files: list):
    body = {
        "task": "analyze_repo",
        "repo_url": "n/a",
        "readme": (readme_text or "")[:5000],
        "files": files[:5] if files else []
    }
    resp = genai.GenerativeModel("gemini-2.5-pro").generate_content(
        [SYSTEM_PROMPT, json.dumps(body, ensure_ascii=False)]
    )
    return _parse_json_from_response(resp)

def analyze_repo_url(repo_url: str, readme_text: str, files: list):
    try:
        print(f"Analyzing repo: {repo_url}")
        print(f"README length: {len(readme_text or '')}")
        print(f"Files count: {len(files or [])}")
        
        # Reuse analyze_repo and attach the URL into the response
        data = analyze_repo(readme_text or "", files or [])
        print(f"Analysis result: {data}")
        
        if isinstance(data, dict):
            data.setdefault("repo_url", repo_url or "unknown")
            # Ensure we have a proper title
            if not data.get("project_title") or data.get("project_title") == "Untitled":
                # Try to extract title from repo URL
                repo_name = repo_url.split("/")[-1] if "/" in repo_url else "Project"
                data["project_title"] = repo_name.replace("-", " ").replace("_", " ").title()
        return data
    except Exception as e:
        print(f"Error analyzing repo {repo_url}: {e}")
        import traceback
        traceback.print_exc()
        
        # Return a better fallback response
        repo_name = repo_url.split("/")[-1] if "/" in repo_url else "Project"
        return {
            "project_title": repo_name.replace("-", " ").replace("_", " ").title(),
            "project_summary": f"Repository: {repo_url}. Please add more details manually.",
            "repo_url": repo_url or "unknown",
            "primary_languages": [],
            "frameworks_or_libraries": [],
            "project_type": "unknown",
            "detected_domains": [],
            "required_skills": [],
            "complexity_level": "intermediate",
            "estimated_collaboration_roles": []
        }

def analyze_user_repos(username: str, repos_meta: list):
    # repos_meta: [{"name": str, "languages": [str], "description": str}, ...]
    body = {
        "task": "analyze_user",
        "username": username or "unknown",
        "repos": repos_meta or []
    }
    resp = genai.GenerativeModel("gemini-2.5-pro").generate_content(
        [SYSTEM_PROMPT, json.dumps(body, ensure_ascii=False)]
    )
    return _parse_json_from_response(resp)

def embed_text(text: str) -> list:
    try:
        resp = genai.embed_content(
            model="models/text-embedding-004",
            content=text or ""
        )
        emb = resp.get("embedding", resp)
        if isinstance(emb, dict) and "values" in emb:
            return emb["values"]
        return emb if isinstance(emb, list) else []
    except Exception as e:
        print(f"Gemini embedding failed: {e}")
        # Fallback to simple keyword-based embedding
        words = (text or "").lower().split()
        vocab = ["python","javascript","react","fastapi","ml","ai","mobile","blockchain","data","web","frontend","backend","database","api","ui","ux","design","development","programming","coding"]
        return [float(sum(1 for w in words if v in w)) for v in vocab]

def monitor_chat_message(message_content: str, project_title: str, project_summary: str) -> dict:
    """
    Monitor chat messages to ensure they are project-related
    Returns: {"is_project_related": bool, "suggestion": str, "warning": str}
    """
    try:
        body = {
            "task": "monitor_chat",
            "message": message_content,
            "project_title": project_title,
            "project_summary": project_summary
        }
        resp = genai.GenerativeModel("gemini-2.5-pro").generate_content(
            [SYSTEM_PROMPT, json.dumps(body, ensure_ascii=False)]
        )
        return _parse_json_from_response(resp)
    except Exception as e:
        print(f"Gemini monitor_chat_message failed: {e}")
        # Return a fallback response
        return {
            "is_project_related": True,  # Default to allowing the message
            "suggestion": "",
            "warning": ""
        }

def get_project_requirements_questions() -> dict:
    """
    Get initial questions for project requirements gathering
    Returns: {"questions": list, "current_step": int, "total_steps": int}
    """
    try:
        print("Starting get_project_requirements_questions...")
        
        # Check if Gemini API key is available
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key.strip() == "":
            print("GEMINI_API_KEY not found, using fallback questions")
            return {
                "questions": [
                    "What is the main purpose of your project?",
                    "What type of application are you building? (web app, mobile app, desktop app, etc.)",
                    "What programming languages do you plan to use?",
                    "What frameworks or libraries are you considering?"
                ],
                "current_step": 1,
                "total_steps": 4
            }
        
        body = {
            "task": "get_project_questions",
            "step": 1
        }
        print(f"Request body: {body}")
        
        resp = genai.GenerativeModel("gemini-2.5-pro").generate_content(
            [SYSTEM_PROMPT, json.dumps(body, ensure_ascii=False)]
        )
        print(f"Gemini response: {resp}")
        
        result = _parse_json_from_response(resp)
        print(f"Parsed result: {result}")
        return result
    except Exception as e:
        print(f"Gemini get_project_requirements_questions failed: {e}")
        import traceback
        traceback.print_exc()
        # Return fallback questions
        return {
            "questions": [
                "What is the main purpose of your project?",
                "What type of application are you building? (web app, mobile app, desktop app, etc.)",
                "What programming languages do you plan to use?",
                "What frameworks or libraries are you considering?"
            ],
            "current_step": 1,
            "total_steps": 4
        }

def process_project_requirements(answers: list, current_step: int) -> dict:
    """
    Process user answers and return next questions or final project details
    Returns: {"questions": list, "current_step": int, "total_steps": int, "project_details": dict, "is_complete": bool}
    """
    try:
        print(f"Processing project requirements - answers: {answers}, step: {current_step}")
        
        # Check if Gemini API key is available
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key.strip() == "":
            print("GEMINI_API_KEY not found, using fallback response")
            # If we have enough answers, generate project details
            if len(answers) >= 3:
                return {
                    "questions": [],
                    "current_step": current_step + 1,
                    "total_steps": 4,
                    "project_details": {
                        "title": answers[0] if answers else "My Project",
                        "summary": f"A {answers[1] if len(answers) > 1 else 'web'} project using {answers[2] if len(answers) > 2 else 'modern technologies'}",
                        "project_type": answers[1] if len(answers) > 1 else "Web Application",
                        "languages": [answers[2]] if len(answers) > 2 else ["JavaScript"],
                        "frameworks": ["React"],
                        "domains": ["General"],
                        "skills": ["Development"],
                        "complexity": "intermediate",
                        "roles": ["Developer"]
                    },
                    "is_complete": True
                }
            else:
                return {
                    "questions": [
                        "What is the main purpose of your project?",
                        "What type of application are you building?",
                        "What programming languages do you plan to use?",
                        "What frameworks or libraries are you considering?"
                    ],
                    "current_step": current_step + 1,
                    "total_steps": 4,
                    "project_details": None,
                    "is_complete": False
                }
        
        body = {
            "task": "process_project_requirements",
            "answers": answers,
            "current_step": current_step
        }
        print(f"Request body: {body}")
        
        resp = genai.GenerativeModel("gemini-2.5-pro").generate_content(
            [SYSTEM_PROMPT, json.dumps(body, ensure_ascii=False)]
        )
        print(f"Gemini response: {resp}")
        
        result = _parse_json_from_response(resp)
        print(f"Parsed result: {result}")
        return result
    except Exception as e:
        print(f"Gemini process_project_requirements failed: {e}")
        import traceback
        traceback.print_exc()
        # Return fallback response
        return {
            "questions": [],
            "current_step": current_step + 1,
            "total_steps": 4,
            "project_details": {
                "title": "My Project",
                "summary": "A project based on your requirements",
                "project_type": "Web Application",
                "languages": ["JavaScript"],
                "frameworks": ["React"],
                "domains": ["General"],
                "skills": ["Frontend Development"],
                "complexity": "intermediate",
                "roles": ["Developer"]
            },
            "is_complete": True
        }

def generate_project_template(project_type: str, complexity: str, tech_stack: list) -> dict:
    """
    Generate a detailed project template based on type, complexity, and tech stack
    Returns: {"template": dict, "structure": list, "milestones": list, "resources": list}
    """
    try:
        body = {
            "task": "generate_project_template",
            "project_type": project_type,
            "complexity": complexity,
            "tech_stack": tech_stack
        }
        resp = genai.GenerativeModel("gemini-2.5-pro").generate_content(
            [SYSTEM_PROMPT, json.dumps(body, ensure_ascii=False)]
        )
        return _parse_json_from_response(resp)
    except Exception as e:
        print(f"Gemini generate_project_template failed: {e}")
        # Return fallback template
        return {
            "template": {
                "title": f"{project_type} Project",
                "description": f"A {complexity} {project_type} project",
                "tech_stack": tech_stack,
                "estimated_duration": "4-8 weeks",
                "team_size": "2-4 people"
            },
            "structure": [
                "Project Setup",
                "Core Development",
                "Testing & Debugging",
                "Deployment & Documentation"
            ],
            "milestones": [
                "Project initialization and setup",
                "Core feature development",
                "Testing and bug fixes",
                "Final deployment and documentation"
            ],
            "resources": [
                "Official documentation for chosen technologies",
                "Tutorial videos and guides",
                "Community forums and support"
            ]
        }

def semantic_search_projects(query: str, filters: dict = None) -> dict:
    """
    Perform semantic search on projects based on natural language query
    Returns: {"results": list, "suggestions": list, "filters_applied": dict}
    """
    try:
        body = {
            "task": "semantic_search",
            "query": query,
            "filters": filters or {}
        }
        resp = genai.GenerativeModel("gemini-2.5-pro").generate_content(
            [SYSTEM_PROMPT, json.dumps(body, ensure_ascii=False)]
        )
        return _parse_json_from_response(resp)
    except Exception as e:
        print(f"Gemini semantic_search_projects failed: {e}")
        # Return fallback response
        return {
            "results": [],
            "suggestions": [
                "Try searching for specific technologies like 'React' or 'Python'",
                "Search by project type like 'web app' or 'mobile app'",
                "Use skill level terms like 'beginner' or 'advanced'"
            ],
            "filters_applied": filters or {}
        }