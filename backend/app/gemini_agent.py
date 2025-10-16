import os, json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """
You are the autonomous reasoning and data-processing layer of “CollabFoundry”.
Follow the structured schemas based on the input `task`.
Output JSON only, no explanations.
"""

def analyze_repo(readme_text, files):
    input_payload = {
        "task": "analyze_repo",
        "repo_url": "n/a",
        "readme": readme_text[:5000],
        "files": files[:5]
    }
    response = genai.GenerativeModel("gemini-2.5-pro").generate_content(
        [SYSTEM_PROMPT, json.dumps(input_payload)]
    )
    return json.loads(response.text)

def refine_pitch(raw_idea):
    input_payload = {"task": "refine_pitch", "raw_idea": raw_idea}
    response = genai.GenerativeModel("gemini-2.5-pro").generate_content(
        [SYSTEM_PROMPT, json.dumps(input_payload)]
    )
    return json.loads(response.text)

def embed_text(text: str) -> list:
    try:
        # Gemini embedding endpoint (google-generativeai SDK)
        # Model name MUST be prefixed with "models/"
        resp = genai.embed_content(
            model="models/text-embedding-004",
            content=text or ""
        )
        # SDK returns {"embedding": {"values": [...]}} or {"embedding": [...]}
        emb = resp.get("embedding", resp)
        if isinstance(emb, dict) and "values" in emb:
            return emb["values"]
        return emb if isinstance(emb, list) else []
    except Exception:
        # Safe fallback: tiny keyword-count vector for demo stability
        words = (text or "").lower().split()
        vocab = ["python","javascript","react","fastapi","ml","ai","mobile","blockchain","data","web"]
        return [float(sum(1 for w in words if v in w)) for v in vocab]

def analyze_user_repos(username, repos_meta):
    input_payload = {
        "task": "analyze_user",
        "username": username,
        "repos": repos_meta[:5]  # [{"name":..., "languages":[...], "description": "..."}]
    }
    response = genai.GenerativeModel("gemini-2.5-pro").generate_content(
        [SYSTEM_PROMPT, json.dumps(input_payload)]
    )
    return json.loads(response.text)

def analyze_repo_url(repo_url, readme_text, files):
    # Reuse MODULE 2
    input_payload = {
        "task": "analyze_repo",
        "repo_url": repo_url,
        "readme": readme_text[:5000],
        "files": files[:8]
    }
    response = genai.GenerativeModel("gemini-2.5-pro").generate_content(
        [SYSTEM_PROMPT, json.dumps(input_payload)]
    )
    return json.loads(response.text)