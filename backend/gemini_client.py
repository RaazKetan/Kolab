import json
from typing import Any, Dict
from google import genai


MODEL_NAME = "gemini-2.5-pro"


class GeminiClient:
	def __init__(self, system_prompt: str) -> None:
		self.client = genai.Client()
		self.system_prompt = system_prompt

	def call(self, body: Dict[str, Any]) -> Dict[str, Any]:
		resp = self.client.models.generate_content(
			model=MODEL_NAME,
			contents=json.dumps(body, ensure_ascii=False),
			system_instruction=self.system_prompt,
			generation_config={
				"temperature": 0.0,
				"top_p": 1.0,
				"top_k": 40,
				"max_output_tokens": 2048,
				"response_mime_type": "application/json",
			},
		)
		try:
			return json.loads(resp.text)
		except Exception:
			if hasattr(resp, "candidates") and resp.candidates:
				text = getattr(resp.candidates[0].content.parts[0], "text", "")
				return json.loads(text)
			raise


