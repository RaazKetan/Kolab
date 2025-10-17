import React, { useState } from 'react';

export const MyProjects = ({ projects, onRefresh, onEdit, onDelete }) => {
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (project) => {
    setEditingProject(project.id);
    setEditForm({
      title: project.title,
      summary: project.summary,
      languages: project.languages?.join(', ') || '',
      frameworks: project.frameworks?.join(', ') || '',
      project_type: project.project_type,
      domains: project.domains?.join(', ') || '',
      skills: project.skills?.join(', ') || '',
      complexity: project.complexity,
      roles: project.roles?.join(', ') || ''
    });
  };

  const handleSaveEdit = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const toList = (s) => s.split(',').map(x => x.trim()).filter(Boolean);
      
      const payload = {
        title: editForm.title.trim(),
        summary: editForm.summary.trim(),
        languages: toList(editForm.languages),
        frameworks: toList(editForm.frameworks),
        project_type: editForm.project_type.trim(),
        domains: toList(editForm.domains),
        skills: toList(editForm.skills),
        complexity: editForm.complexity.trim(),
        roles: toList(editForm.roles)
      };

      const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditingProject(null);
        onRefresh();
        alert('Project updated successfully!');
      } else {
        alert('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project');
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        onRefresh();
        alert('Project deleted successfully!');
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#e7ecef] rounded-3xl p-8 shadow-sm border border-[#8b8c89]/30 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#274c77]">My Projects</h2>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-[#a3cef1] hover:bg-[#6096ba] text-[#274c77] rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center text-[#8b8c89] py-12">
          <p className="text-xl">No projects yet.</p>
          <p className="text-sm mt-2">Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl p-6 border border-[#8b8c89]/30">
              {editingProject === project.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="px-3 py-2 border border-[#8b8c89]/40 rounded" placeholder="Title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    />
                    <input className="px-3 py-2 border border-[#8b8c89]/40 rounded" placeholder="Project Type"
                      value={editForm.project_type}
                      onChange={(e) => setEditForm({...editForm, project_type: e.target.value})}
                    />
                    <textarea className="px-3 py-2 border border-[#8b8c89]/40 rounded md:col-span-2"
                      placeholder="Summary"
                      value={editForm.summary}
                      onChange={(e) => setEditForm({...editForm, summary: e.target.value})}
                    />
                    <input className="px-3 py-2 border border-[#8b8c89]/40 rounded"
                      placeholder="Languages (comma separated)"
                      value={editForm.languages}
                      onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                    />
                    <input className="px-3 py-2 border border-[#8b8c89]/40 rounded"
                      placeholder="Frameworks (comma separated)"
                      value={editForm.frameworks}
                      onChange={(e) => setEditForm({...editForm, frameworks: e.target.value})}
                    />
                    <input className="px-3 py-2 border border-[#8b8c89]/40 rounded"
                      placeholder="Domains (comma separated)"
                      value={editForm.domains}
                      onChange={(e) => setEditForm({...editForm, domains: e.target.value})}
                    />
                    <input className="px-3 py-2 border border-[#8b8c89]/40 rounded"
                      placeholder="Skills (comma separated)"
                      value={editForm.skills}
                      onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                    />
                    <select className="px-3 py-2 border border-[#8b8c89]/40 rounded"
                      value={editForm.complexity}
                      onChange={(e) => setEditForm({...editForm, complexity: e.target.value})}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <input className="px-3 py-2 border border-[#8b8c89]/40 rounded"
                      placeholder="Roles (comma separated)"
                      value={editForm.roles}
                      onChange={(e) => setEditForm({...editForm, roles: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(project.id)}
                      className="px-4 py-2 bg-[#274c77] text-white rounded hover:bg-[#6096ba] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 bg-[#a3cef1] text-[#274c77] rounded hover:bg-[#6096ba]/60 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-[#274c77]">{project.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="px-3 py-1 bg-[#a3cef1] hover:bg-[#6096ba] text-[#274c77] text-sm rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-[#8b8c89] mb-3">{project.summary}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.languages?.map((lang, idx) => (
                      <span key={idx} className="px-2 py-1 bg-[#a3cef1] text-[#274c77] text-xs rounded">
                        {lang}
                      </span>
                    ))}
                    {project.frameworks?.map((fw, idx) => (
                      <span key={idx} className="px-2 py-1 bg-[#e7ecef] text-[#274c77] text-xs rounded border border-[#6096ba]/30">
                        {fw}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-[#8b8c89]">
                    <span>Type: {project.project_type}</span>
                    <span>Complexity: {project.complexity}</span>
                    <span>ID: {project.id}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
