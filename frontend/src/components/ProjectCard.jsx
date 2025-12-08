import React from 'react';

export const ProjectCard = ({ project, ownerUser, onLike, onPass, isSwiping = false }) => {
  // Match strength configuration
  const matchConfig = {
    strong: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✨',
      label: 'Strong Match',
      description: 'This project aligns perfectly with your profile'
    },
    likely: {
      bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: '🎯',
      label: 'Likely Match',
      description: 'Good fit based on your skills'
    },
    weak: {
      bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      icon: '💡',
      label: 'Explore',
      description: 'Expand your horizons'
    }
  };

  const matchStrength = project.match_strength || 'weak';
  const match = matchConfig[matchStrength];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Match Strength Banner - Apple-inspired minimal design */}
      {project.match_strength && (
        <div className={`${match.bg} ${match.border} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{match.icon}</span>
              <div>
                <h3 className={`${match.text} font-semibold text-sm tracking-wide`}>
                  {match.label}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {match.description}
                </p>
              </div>
            </div>
            {project.match_score && (
              <div className="text-right">
                <div className={`${match.text} text-lg font-bold`}>
                  {Math.round(project.match_score * 100)}%
                </div>
                <div className="text-xs text-gray-500">match</div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
        <p className="text-gray-700 leading-relaxed mb-8 text-base">{project.summary}</p>

        {/* Owner Info Section */}
        {ownerUser && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                {ownerUser.avatar_url ? (
                  <img 
                    src={ownerUser.avatar_url} 
                    alt={ownerUser.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 text-xl font-semibold">
                    {ownerUser.name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">{ownerUser.name}</h4>
                <p className="text-sm text-gray-500">@{ownerUser.username}</p>
                {ownerUser.bio && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ownerUser.bio}</p>
                )}
              </div>
            </div>
            {ownerUser.skills && ownerUser.skills.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {ownerUser.skills.slice(0, 5).map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.languages?.map((lang, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
                >
                  {lang}
                </span>
              ))}
              {project.frameworks?.map((fw, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
                >
                  {fw}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Skills Needed
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-purple-50 text-purple-800 text-sm font-medium rounded-full hover:bg-purple-100 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Roles
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.roles?.map((role, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-green-50 text-green-800 text-sm font-medium rounded-full hover:bg-green-100 transition-colors"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            className={`flex-1 py-4 px-6 font-semibold rounded-2xl transition-all duration-200 text-base ${
              isSwiping 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
            }`}
            onClick={onPass}
            disabled={isSwiping}
          >
            {isSwiping ? '⏳ Processing...' : '✕ Pass'}
          </button>
          <button
            className={`flex-1 py-4 px-6 font-semibold rounded-2xl transition-all duration-200 text-base ${
              isSwiping 
                ? 'bg-red-300 text-red-100 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl active:scale-95'
            }`}
            onClick={onLike}
            disabled={isSwiping}
          >
            {isSwiping ? '⏳ Processing...' : '♥ Like'}
          </button>
        </div>
      </div>
    </div>
  );
};
