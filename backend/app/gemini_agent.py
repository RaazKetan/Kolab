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
