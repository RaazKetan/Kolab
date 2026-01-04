from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Any, Dict
import json
from .gemini_client import GeminiClient


app = FastAPI(title="Origin Inference API", docs_url="/docs")


class RefinePitchInput(BaseModel):
	task: Literal["refine_pitch"]
	raw_idea: str


class AnalyzeRepoFile(BaseModel):
	path: str
	content: str


class AnalyzeRepoInput(BaseModel):
	task: Literal["analyze_repo"]
	repo_url: str
	readme: str
	files: List[AnalyzeRepoFile]


class AnalyzeUserRepo(BaseModel):
	name: str
	languages: List[str]
	description: str


class AnalyzeUserInput(BaseModel):
	task: Literal["analyze_user"]
	username: str
	repos: List[AnalyzeUserRepo]


class MatchUserEmbedding(BaseModel):
	id: str
	embedding: List[float]


class MatchInput(BaseModel):
	task: Literal["match"]
	project_embedding: List[float]
	user_embeddings: List[MatchUserEmbedding]


class AutofillProfileData(BaseModel):
	title: str
	missing_fields: List[str]


class AutofillProfileInput(BaseModel):
	task: Literal["autofill_profile"]
	incomplete_data: AutofillProfileData


RequestBody = RefinePitchInput | AnalyzeRepoInput | AnalyzeUserInput | MatchInput | AutofillProfileInput


def safe_json_loads(s: str) -> Any:
	try:
		return json.loads(s)
	except Exception:
		raise HTTPException(status_code=502, detail="Upstream returned non-JSON response")


def compute_cosine_similarity(a: List[float], b: List[float]) -> float:
	if not a or not b or len(a) != len(b):
		return 0.0
	sum_aa = 0.0
	sum_bb = 0.0
	sum_ab = 0.0
	for x, y in zip(a, b):
		sum_ab += x * y
		sum_aa += x * x
		sum_bb += y * y
	if sum_aa == 0.0 or sum_bb == 0.0:
		return 0.0
	return max(0.0, min(1.0, sum_ab / ((sum_aa ** 0.5) * (sum_bb ** 0.5))))


def local_match(payload: MatchInput) -> List[Dict[str, Any]]:
	project = payload.project_embedding
	users = payload.user_embeddings
	scored = [
		{"user_id": u.id, "match_score": compute_cosine_similarity(project, u.embedding)}
		for u in users
	]
	return sorted(scored, key=lambda x: x["match_score"], reverse=True)


@app.post("/origin")
def origin_router(body: RequestBody) -> Any:
	# For now, handle the pure-computation task locally; others are placeholders
	if isinstance(body, MatchInput):
		return local_match(body)

	# For model-backed tasks, forward to Gemini to enforce schemas and content rules
	system_prompt = (
		"You are the autonomous reasoning and data-processing layer of “Origin” — a platform that connects students and professionals who want to collaborate on real projects.\n"
		"Purpose:\n- Enable users to post projects, discover collaborators, and match with relevant people or projects using structured intelligence.\n- Operate as a background reasoning system. You do not chat conversationally. You only return structured data.\n\n"
		"Core functions you perform:\n1. Refine user-submitted project ideas.\n2. Extract structured metadata from GitHub repositories.\n3. Infer user skill profiles from GitHub activity.\n4. Generate vector-friendly embeddings (concise text summaries for semantic matching).\n5. Perform AI-based matching between users and projects based on embeddings.\n6. Produce factual, structured outputs for downstream storage or frontend display.\n\n"
		"Behavioral constraints:\n- Deterministic output. No small talk, no speculation.\n- Output only structured JSON or plain text as requested by the backend.\n- Never hallucinate missing values; explicitly use \"unknown\".\n- Never produce commentary, explanation, or reasoning steps.\n- When unsure, err toward minimalism, not invention.\n- Maintain schema fidelity. Do not alter field names or nesting.\n\n"
		"### MODULE 4: MATCH COMPUTATION\nInput:{\n  \"task\": \"match\",\n  \"project_embedding\": \"<list[float]>\",\n  \"user_embeddings\": [{\"id\": \"user1\", \"embedding\": [...]}]\n}\nOutput:[{\n  \"user_id\": \"user1\", \"match_score\": 0.91\n}]\nRules:\n- Use cosine similarity in [0,1].\n- Sort descending.\n\n"
		"### MODULE 5: PROFILE AUTO-FILL\nInput:{\n  \"task\": \"autofill_profile\",\n  \"incomplete_data\": {\n    \"title\": \"AI-based study planner\",\n    \"missing_fields\": [\"description\", \"required_skills\"]\n  }\n}\nOutput:{\n  \"title\": \"AI-based study planner\",\n  \"description\": \"A web app that recommends personalized study schedules using AI.\",\n  \"required_skills\": [\"Python\", \"FastAPI\", \"React\", \"PostgreSQL\"]\n}\nRules:\n- Only fill requested fields.\n- Description < 50 words.\n\nGeneral Rules:\n- Input always contains a task.\n- Output must match the expected JSON schema for that task.\n- No reasoning traces.\n- Stateless calls."
	)

	client = GeminiClient(system_prompt)
	return client.call(json.loads(body.model_dump_json()))
	if isinstance(body, RefinePitchInput):
		return {
			"refined_pitch": body.raw_idea.strip() if body.raw_idea else "unknown",
			"suggested_title": "unknown",
			"detected_domains": [],
		}

	if isinstance(body, AnalyzeRepoInput):
		return {
			"repo_url": body.repo_url or "unknown",
			"project_title": "unknown",
			"project_summary": "unknown",
			"primary_languages": [],
			"frameworks_or_libraries": [],
			"project_type": "unknown",
			"detected_domains": [],
			"required_skills": [],
			"complexity_level": "unknown",
			"estimated_collaboration_roles": [],
			"embedding_summary": "unknown",
		}

	if isinstance(body, AnalyzeUserInput):
		# Fallback (should not hit because Gemini handles this path)
		return {
			"github_username": body.username or "unknown",
			"core_skills": [],
			"project_domains": [],
			"experience_summary": "unknown",
			"embedding_summary": "unknown",
		}

	if isinstance(body, AutofillProfileInput):
		result: Dict[str, Any] = {"title": body.incomplete_data.title}
		missing = set(body.incomplete_data.missing_fields or [])
		if "description" in missing:
			result["description"] = "unknown"
		if "required_skills" in missing:
			result["required_skills"] = []
		return result

	raise HTTPException(status_code=400, detail="Unsupported task")


# Uvicorn entrypoint: uvicorn backend.server:app --reload

