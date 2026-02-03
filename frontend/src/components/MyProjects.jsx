import React, { useState } from 'react';
import { Package, RefreshCw, Trash2, Edit2, Code2, Layers, BarChart, Save, X } from 'lucide-react';

export const MyProjects = ({ projects, onRefresh, onEdit, onDelete, isDarkMode = true }) => {
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

      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/projects/${projectId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
    isDarkMode 
      ? 'bg-zinc-800 border-white/10 text-white placeholder-zinc-500' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
  }`;

  const cardClass = `rounded-xl p-6 border transition-all ${
    isDarkMode 
      ? 'bg-white/5 border-white/5 hover:border-blue-500/30' 
      : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
  }`;

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl p-8 shadow-lg backdrop-blur-xl border mt-6 ${
       isDarkMode ? 'bg-[#18181b]/80 border-white/10' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Package className="w-8 h-8 text-blue-500" />
          My Projects
        </h2>
        <button
          onClick={onRefresh}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isDarkMode 
              ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' 
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {projects.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl border border-dashed ${
          isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-300 text-gray-500'
        }`}>
          <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-medium">No projects yet.</p>
          <p className="text-sm mt-2 opacity-70">Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div key={project.id} className={cardClass}>
              {editingProject === project.id ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className={inputClass} placeholder="Title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    />
                    <input className={inputClass} placeholder="Project Type"
                      value={editForm.project_type}
                      onChange={(e) => setEditForm({...editForm, project_type: e.target.value})}
                    />
                    <textarea className={`${inputClass} md:col-span-2 min-h-[100px]`}
                      placeholder="Summary"
                      value={editForm.summary}
                      onChange={(e) => setEditForm({...editForm, summary: e.target.value})}
                    />
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <input className={inputClass} placeholder="Languages (comma separated)"
                        value={editForm.languages}
                        onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                      />
                      <input className={inputClass} placeholder="Frameworks"
                        value={editForm.frameworks}
                        onChange={(e) => setEditForm({...editForm, frameworks: e.target.value})}
                      />
                      <input className={inputClass} placeholder="Domains"
                        value={editForm.domains}
                        onChange={(e) => setEditForm({...editForm, domains: e.target.value})}
                      />
                      <input className={inputClass} placeholder="Skills"
                        value={editForm.skills}
                        onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                      />
                       <select 
                        className={inputClass}
                        value={editForm.complexity}
                        onChange={(e) => setEditForm({...editForm, complexity: e.target.value})}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <input className={inputClass} placeholder="Open Roles"
                        value={editForm.roles}
                        onChange={(e) => setEditForm({...editForm, roles: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setEditingProject(null)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                         isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(project.id)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                       <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{project.title}</h3>
                       <div className="flex gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                             isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}>
                             {project.project_type}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                             isDarkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
                          }`}>
                             {project.complexity}
                          </span>
                       </div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(project)}
                        className={`p-2 rounded-lg transition-colors ${
                           isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className={`p-2 rounded-lg transition-colors ${
                           isDarkMode ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
                        }`}
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className={`mb-4 text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                     {project.summary}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.languages?.map((lang, idx) => (
                      <span key={idx} className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                         isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <Code2 className="w-3 h-3 opacity-50" />
                        {lang}
                      </span>
                    ))}
                    {project.frameworks?.map((fw, idx) => (
                      <span key={idx} className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                         isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <Layers className="w-3 h-3 opacity-50" />
                        {fw}
                      </span>
                    ))}
                  </div>
                  
                  <div className={`mt-4 pt-3 flex items-center justify-between text-xs border-t ${
                     isDarkMode ? 'border-white/5 text-zinc-500' : 'border-gray-100 text-gray-400'
                  }`}>
                     <span>ID: {project.id}</span>
                     <span>Created now</span>
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
