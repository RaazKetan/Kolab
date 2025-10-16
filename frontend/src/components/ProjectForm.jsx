import { useState } from "react";
import { createProject, refineIdea } from "../api";

export default function ProjectForm() {
  const [rawIdea, setRawIdea] = useState("");
  const [refined, setRefined] = useState(null);

  async function handleRefine() {
    const data = await refineIdea(rawIdea);
    setRefined(data);
  }

  async function handleSubmit() {
    if (!refined) return alert("Refine your idea first");
    await createProject({
      title: refined.suggested_title,
      summary: refined.refined_pitch,
      repo_url: "",
      languages: [],
      frameworks: [],
      project_type: "unknown",
      domains: refined.detected_domains,
      skills: [],
      complexity: "unknown",
      roles: [],
    });
    alert("Project created");
  }

  return (
    <div className="p-4 border rounded-xl">
      <textarea
        className="w-full border p-2"
        rows="4"
        placeholder="Describe your project idea..."
        value={rawIdea}
        onChange={(e) => setRawIdea(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <button onClick={handleRefine} className="bg-blue-600 text-white px-3 py-1 rounded">
          Refine Idea
        </button>
        {refined && (
          <button onClick={handleSubmit} className="bg-green-600 text-white px-3 py-1 rounded">
            Save Project
          </button>
        )}
      </div>
      {refined && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <h3 className="font-bold">{refined.suggested_title}</h3>
          <p>{refined.refined_pitch}</p>
          <p className="text-sm text-gray-600">
            Domains: {refined.detected_domains.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
