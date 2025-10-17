import React from 'react';

export const ProfileView = ({ currentUser, onBack, onEdit }) => (
  <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
    {/* Header Section */}
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-8 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-6">
            {currentUser.avatar_url ? (
              <img 
                src={currentUser.avatar_url} 
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">
                {currentUser.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{currentUser.name}</h1>
            <p className="text-indigo-100 text-lg">@{currentUser.username}</p>
            <p className="text-indigo-200 text-sm">{currentUser.email}</p>
            {currentUser.org_type && (
              <p className="text-indigo-200 text-sm mt-1">
                {currentUser.org_type}{currentUser.org_name ? ` · ${currentUser.org_name}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>✏️</span>
            Edit Profile
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📝</span>
              About Me
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              {currentUser.bio || "No bio available. Click 'Edit Profile' to add your bio."}
            </p>
          </div>

          {/* Skills Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🛠️</span>
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-3">
              {(currentUser.skills || []).map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                >
                  {skill}
                </span>
              ))}
              {(currentUser.skills || []).length === 0 && (
                <span className="text-gray-500 italic">No skills listed</span>
              )}
            </div>
          </div>

          {/* Technologies Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">💻</span>
              Technologies
            </h3>
            <div className="space-y-4">
              {currentUser.top_languages && currentUser.top_languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Programming Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.top_languages.map((lang, i) => (
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
              {currentUser.top_frameworks && currentUser.top_frameworks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Frameworks & Libraries</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.top_frameworks.map((fw, i) => (
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
            </div>
          </div>

          {/* GitHub Repos Section */}
          {Array.isArray(currentUser.github_selected_repos) && currentUser.github_selected_repos.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🔗</span>
                Featured Repositories
              </h3>
              <div className="space-y-3">
                {currentUser.github_selected_repos.map((repo, i) => (
                  <a
                    key={i}
                    href={(repo && repo.url) || repo}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 hover:underline font-medium">
                        {(repo && repo.url) || String(repo)}
                      </span>
                      <span className="text-gray-400">↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Score */}
          {currentUser.activity_score && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Activity Level
              </h3>
              <div className="flex items-center mb-2">
                <div className="flex-1 bg-green-200 rounded-full h-3 mr-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${currentUser.activity_score}%` }}
                  ></div>
                </div>
                <span className="text-green-700 font-semibold">{currentUser.activity_score}%</span>
              </div>
              <p className="text-sm text-green-700">
                {currentUser.activity_score > 80 ? "Very Active" : 
                 currentUser.activity_score > 60 ? "Active" : 
                 currentUser.activity_score > 40 ? "Moderately Active" : "Getting Started"}
              </p>
            </div>
          )}

          {/* GitHub Profile */}
          {currentUser.github_profile_url && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🐙</span>
                GitHub Profile
              </h3>
              <a
                href={currentUser.github_profile_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {currentUser.github_profile_url}
              </a>
            </div>
          )}

          {/* User Stats */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Profile Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="font-mono text-sm text-gray-800">#{currentUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skills:</span>
                <span className="text-gray-800">{(currentUser.skills || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Languages:</span>
                <span className="text-gray-800">{(currentUser.top_languages || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frameworks:</span>
                <span className="text-gray-800">{(currentUser.top_frameworks || []).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
