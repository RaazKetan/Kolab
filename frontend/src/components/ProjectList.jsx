import { useEffect, useState } from "react";
import { fetchProjects } from "../api";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  useEffect(() => { fetchProjects().then(setProjects); }, []);

  return (
    <div className="grid gap-4 mt-4">
      {projects.map((p) => (
        <div key={p.id} className="p-3 border rounded">
          <h3 className="font-bold text-lg">{p.title}</h3>
          <p>{p.summary}</p>
          <div className="text-sm text-gray-600">
            Skills: {p.skills?.join(", ")}
          </div>
        </div>
      ))}
    </div>
  );
}
