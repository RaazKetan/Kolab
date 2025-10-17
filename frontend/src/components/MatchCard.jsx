import React from 'react';

export const MatchCard = ({ project, onChat, onViewProject, onViewOwner, notificationCount = 0, ownerUser }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {project.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {project.summary}
        </p>
        
        {/* Owner Info */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            {ownerUser?.avatar_url ? (
              <img 
                src={ownerUser.avatar_url} 
                alt={ownerUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-sm font-semibold">
                {ownerUser?.name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {ownerUser?.name || `User #${project.owner_id}`}
            </p>
            <p className="text-xs text-gray-500">
              @{ownerUser?.username || 'unknown'}
            </p>
          </div>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.languages?.slice(0, 3).map((lang, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {lang}
            </span>
          ))}
          {project.frameworks?.slice(0, 2).map((fw, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
            >
              {fw}
            </span>
          ))}
        </div>
      </div>

      {/* Notification Badge */}
      {notificationCount > 0 && (
        <div className="flex flex-col items-end">
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full mb-2">
            {notificationCount} new
          </span>
        </div>
      )}
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      <button
        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); onChat(project); }}
      >
        💬 Chat
      </button>
      <button
        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
        onClick={(e) => { e.stopPropagation(); onViewProject(project.id); }}
      >
        👁️
      </button>
      <button
        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
        onClick={(e) => { e.stopPropagation(); onViewOwner(project.owner_id); }}
      >
        👤
      </button>
    </div>
  </div>
);
