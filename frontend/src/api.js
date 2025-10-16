const BASE_URL = "http://localhost:8000";

export async function fetchProjects() {
  const res = await fetch(`${BASE_URL}/projects/`);
  return await res.json();
}

export async function createProject(data) {
  const res = await fetch(`${BASE_URL}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function refineIdea(rawIdea) {
  const res = await fetch(`${BASE_URL}/ai/refine_pitch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_idea: rawIdea }),
  });
  return await res.json();
}
