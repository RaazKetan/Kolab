import React from 'react';

export const UserDetails = ({ user, onBack }) => (
  <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {user.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-purple-100">@{user.username}</p>
            <p className="text-purple-200 text-sm">User ID: {user.id}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center">
                <span className="w-20 text-sm font-medium">Email:</span>
                <span className="text-sm">{user.email}</span>
              </div>
              {user.org_type && (
                <div className="flex items-center">
                  <span className="w-20 text-sm font-medium">Affiliation:</span>
                  <span className="text-sm">{user.org_type}{user.org_name ? ` · ${user.org_name}` : ""}</span>
                </div>
              )}
              {user.github_profile_url && (
                <div className="flex items-center">
                  <span className="w-20 text-sm font-medium">GitHub:</span>
                  <a 
                    href={user.github_profile_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {user.github_profile_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Activity Score */}
          {user.activity_score && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Activity Level</h3>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${user.activity_score}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{user.activity_score}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Skills & Technologies */}
        <div className="space-y-6">
          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(user.skills || []).map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                >
                  {skill}
                </span>
              ))}
              {(user.skills || []).length === 0 && (
                <span className="text-gray-400 text-sm">No skills listed</span>
              )}
            </div>
          </div>

          {/* Top Languages */}
          {user.top_languages && user.top_languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Top Languages</h3>
              <div className="flex flex-wrap gap-2">
                {user.top_languages.map((lang, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Frameworks */}
          {user.top_frameworks && user.top_frameworks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Top Frameworks</h3>
              <div className="flex flex-wrap gap-2">
                {user.top_frameworks.map((fw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full border border-purple-200"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Repos */}
          {user.github_selected_repos && user.github_selected_repos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Featured Repositories</h3>
              <div className="space-y-2">
                {user.github_selected_repos.map((repo, i) => (
                  <a
                    key={i}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-sm text-blue-600 hover:underline">{repo.url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
