import React, { useState } from 'react';
import { MessageSquare, Eye, User, ChevronDown } from 'lucide-react';

export const MatchCard = ({ projects, onChat, onViewProject, onViewOwner, notificationCount = 0, likerUser, isDarkMode = true }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const hasMultipleProjects = projects.length > 1;

  return (
    <div className={`rounded-3xl p-6 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
      isDarkMode 
        ? 'bg-[#18181b]/60 border-white/10 hover:bg-[#18181b]/80' 
        : 'bg-white border-gray-200 shadow-sm hover:shadow-lg'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Matched Person Info */}
          <div className="flex items-center mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 border-2 ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-300 border-gray-400'
            }`}>
              {likerUser?.avatar_url ? (
                <img 
                  src={likerUser.avatar_url} 
                  alt={likerUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                  {likerUser?.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                Matched with
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {likerUser?.name || 'Unknown User'}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                @{likerUser?.username || 'unknown'}
              </p>
            </div>
            {hasMultipleProjects && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                {projects.length} projects
              </span>
            )}
          </div>

          {/* Project Selector (if multiple projects) */}
          {hasMultipleProjects && (
            <div className="relative mb-3">
              <button
                onClick={() => setShowProjectSelector(!showProjectSelector)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border ${
                  isDarkMode 
                    ? 'bg-zinc-900/50 border-white/10 text-zinc-300 hover:bg-zinc-900' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{selectedProject.title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showProjectSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showProjectSelector && (
                <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-48 overflow-y-auto ${
                  isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setShowProjectSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        project.id === selectedProjectId
                          ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700'
                          : isDarkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {project.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Project Info */}
          <div className={`mb-3 pb-3 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
            {!hasMultipleProjects && (
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                For Project
              </p>
            )}
            <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedProject.title}
            </h3>
            <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
              {selectedProject.summary}
            </p>
          </div>

          {/* Technologies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedProject.languages?.slice(0, 3).map((lang, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border ${
                  isDarkMode 
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                {lang}
              </span>
            ))}
            {selectedProject.frameworks?.slice(0, 2).map((fw, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium border ${
                  isDarkMode 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-green-100 text-green-800 border-green-200'
                }`}
              >
                {fw}
              </span>
            ))}
          </div>
        </div>

        {/* Notification Badge */}
        {notificationCount > 0 && (
          <div className="flex flex-col items-end">
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-full font-medium shadow-lg shadow-red-500/20">
              {notificationCount} new
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            isDarkMode
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          onClick={(e) => { e.stopPropagation(); onChat(selectedProject); }}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button
          className={`px-3 py-2.5 text-sm rounded-xl transition-all ${
            isDarkMode
              ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border border-white/5'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          onClick={(e) => { e.stopPropagation(); onViewProject(selectedProject.id); }}
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          className={`px-3 py-2.5 text-sm rounded-xl transition-all ${
            isDarkMode
              ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border border-white/5'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          onClick={(e) => { e.stopPropagation(); onViewOwner(likerUser?.id); }}
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
