import React from 'react';

export const ProjectDetails = ({ project, onBack, ownerUser }) => (
  <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">{project.title}</h2>
          <p className="text-green-100 text-lg">{project.summary}</p>
          <div className="flex items-center mt-3 space-x-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {project.complexity} complexity
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {project.project_type}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              ID: {project.id}
            </span>
          </div>
        </div>
        <button 
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Project Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Technologies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Technologies Used</h3>
            <div className="space-y-3">
              {project.languages && project.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Programming Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.languages.map((lang, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {project.frameworks && project.frameworks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Frameworks & Libraries</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.frameworks.map((fw, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills Required */}
          {project.skills && project.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full border border-purple-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Domains */}
          {project.domains && project.domains.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Domains</h3>
              <div className="flex flex-wrap gap-2">
                {project.domains.map((domain, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full border border-orange-200">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Roles */}
          {project.roles && project.roles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Roles Needed</h3>
              <div className="flex flex-wrap gap-2">
                {project.roles.map((role, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full border border-indigo-200">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Repository */}
          {project.repo_url && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Repository</h3>
              <a 
                href={project.repo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                <span className="mr-2">🔗</span>
                <span className="text-sm">{project.repo_url}</span>
              </a>
            </div>
          )}
        </div>

        {/* Owner Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Owner</h3>
            {ownerUser ? (
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  {ownerUser.avatar_url ? (
                    <img 
                      src={ownerUser.avatar_url} 
                      alt={ownerUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold">
                      {ownerUser.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{ownerUser.name}</p>
                  <p className="text-sm text-gray-600">@{ownerUser.username}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Loading owner info...</p>
            )}
          </div>

          {/* Project Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {project.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-800">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Complexity:</span>
                <span className="text-gray-800 capitalize">{project.complexity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-800">{project.project_type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);