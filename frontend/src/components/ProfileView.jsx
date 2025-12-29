import React, { useState } from 'react';

export const ProfileView = ({ currentUser, onBack, onEdit }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(currentUser);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalyzeRepo = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    if (!repoUrl.includes('github.com')) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    setAnalyzing(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Analyze the repository
      const analyzeResponse = await fetch('http://localhost:8000/analyze-repo/user-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repo_url: repoUrl })
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze repository');
      }

      const analysisData = await analyzeResponse.json();
      console.log('Analysis data:', analysisData);

      // Show modal with analysis results
      setAnalysisData(analysisData);
      setShowAnalysisModal(true);
      setRepoUrl('');
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to analyze repository');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmAddRepo = async () => {
    if (!analysisData) return;

    try {
      const token = localStorage.getItem('token');
      
      // Add the analyzed repository to user profile
      const addResponse = await fetch(`http://localhost:8000/users/${user.id}/repositories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repo_data: analysisData })
      });

      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        throw new Error(errorData.detail || 'Failed to add repository');
      }

      const updatedUser = await addResponse.json();
      console.log('Updated user:', updatedUser);
      setUser(updatedUser);
      setShowAnalysisModal(false);
      setAnalysisData(null);
      setSuccessMessage('Repository added successfully!');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to add repository');
      setShowAnalysisModal(false);
    }
  };

  const handleRemoveRepo = async (index) => {
    if (!confirm('Are you sure you want to remove this repository?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/users/${user.id}/repositories/${index}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove repository');
      }

      const updatedUser = await response.json();
      console.log('Repository removed, updated user:', updatedUser);
      setUser(updatedUser);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to remove repository');
    }
  };

  return (
  <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
    {/* Header Section */}
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-8 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-6">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">
                {user.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-indigo-100 text-lg">@{user.username}</p>
            <p className="text-indigo-200 text-sm">{user.email}</p>
            {user.org_type && (
              <p className="text-indigo-200 text-sm mt-1">
                {user.org_type}{user.org_name ? ` · ${user.org_name}` : ""}
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
              {user.bio || "No bio available. Click 'Edit Profile' to add your bio."}
            </p>
          </div>

          {/* Skills Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🛠️</span>
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-3">
              {(user.skills || []).map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                >
                  {skill}
                </span>
              ))}
              {(user.skills || []).length === 0 && (
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
              {user.top_languages && user.top_languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Programming Languages</h4>
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
              {user.top_frameworks && user.top_frameworks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Frameworks & Libraries</h4>
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
            </div>
          </div>


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Score */}
          {user.activity_score && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Activity Level
              </h3>
              <div className="flex items-center mb-2">
                <div className="flex-1 bg-green-200 rounded-full h-3 mr-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${user.activity_score}%` }}
                  ></div>
                </div>
                <span className="text-green-700 font-semibold">{user.activity_score}%</span>
              </div>
              <p className="text-sm text-green-700">
                {user.activity_score > 80 ? "Very Active" : 
                 user.activity_score > 60 ? "Active" : 
                 user.activity_score > 40 ? "Moderately Active" : "Getting Started"}
              </p>
            </div>
          )}

          {/* GitHub Profile */}
          {user.github_profile_url && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🐙</span>
                GitHub Profile
              </h3>
              <a
                href={user.github_profile_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {user.github_profile_url}
              </a>
            </div>
          )}

          {/* GitHub Repositories Management */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📑</span>
              GitHub Repositories
            </h3>
            
            {/* Add Repository Form */}
            <div className="mb-4">
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                placeholder="https://github.com/username/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={analyzing}
              />
              {error && (
                <p className="text-red-600 text-sm mb-2">{error}</p>
              )}
              {successMessage && (
                <p className="text-green-600 text-sm mb-2">{successMessage}</p>
              )}
              <button
                onClick={handleAnalyzeRepo}
                disabled={analyzing || !repoUrl.trim()}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {analyzing ? 'Analyzing...' : 'Analyze & Add Repository'}
              </button>
              <p className="text-xs text-gray-500 mt-1">Max 5 repositories</p>
            </div>

            {/* Repository List */}
            {Array.isArray(user.github_selected_repos) && user.github_selected_repos.length > 0 ? (
              <div className="space-y-3">
                {user.github_selected_repos.map((repo, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-medium text-sm flex-1"
                      >
                        {repo.name || repo.url}
                      </a>
                      <button
                        onClick={() => handleRemoveRepo(i)}
                        className="text-red-600 hover:text-red-800 text-sm ml-2"
                        title="Remove repository"
                      >
                        ×
                      </button>
                    </div>
                    
                    {repo.analysis_summary && (
                      <p className="text-xs text-gray-600 mb-2">{repo.analysis_summary}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {repo.languages && repo.languages.map((lang, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          {lang}
                        </span>
                      ))}
                      {repo.frameworks && repo.frameworks.map((fw, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                          {fw}
                        </span>
                      ))}
                    </div>
                    
                    {repo.commits_count > 0 && (
                      <p className="text-xs text-gray-500">
                        {repo.commits_count} commits · {repo.contributions}
                      </p>
                    )}
                    
                    {repo.last_analyzed && (
                      <p className="text-xs text-gray-400 mt-1">
                        Analyzed: {new Date(repo.last_analyzed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No repositories added yet</p>
            )}
          </div>

          {/* User Stats */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Profile Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="font-mono text-sm text-gray-800">#{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skills:</span>
                <span className="text-gray-800">{(user.skills || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Languages:</span>
                <span className="text-gray-800">{(user.top_languages || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frameworks:</span>
                <span className="text-gray-800">{(user.top_frameworks || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Repositories:</span>
                <span className="text-gray-800">{(user.github_selected_repos || []).length}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Repository Analysis Modal */}
    {showAnalysisModal && analysisData && (
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center">
                <span className="mr-2">🔍</span>
                Repository Analysis
              </h3>
              <button
                onClick={() => {
                  setShowAnalysisModal(false);
                  setAnalysisData(null);
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Repository Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📦</span>
                Repository Details
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <p className="text-gray-800 font-semibold">{analysisData.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">URL:</span>
                  <a
                    href={analysisData.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm block break-all"
                  >
                    {analysisData.url}
                  </a>
                </div>
              </div>
            </div>

            {/* Contribution Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Commits</span>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-green-800 mt-2">{analysisData.commits_count || 0}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Role</span>
                  <span className="text-2xl">👤</span>
                </div>
                <p className="text-lg font-semibold text-blue-800 mt-2">{analysisData.contributions || 'Contributor'}</p>
              </div>
            </div>

            {/* Analysis Summary */}
            {analysisData.analysis_summary && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
                  <span className="mr-2">📝</span>
                  Analysis Summary
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{analysisData.analysis_summary}</p>
              </div>
            )}

            {/* Skills Detected */}
            {analysisData.skills_detected && analysisData.skills_detected.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">🛠️</span>
                  Skills Detected
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.skills_detected.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Languages */}
              {analysisData.languages && analysisData.languages.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">💻</span>
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Frameworks */}
              {analysisData.frameworks && analysisData.frameworks.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">⚡</span>
                    Frameworks
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.frameworks.map((fw, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full border border-purple-200"
                      >
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Last Analyzed */}
            {analysisData.last_analyzed && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Analyzed on {new Date(analysisData.last_analyzed).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
            <button
              onClick={() => {
                setShowAnalysisModal(false);
                setAnalysisData(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAddRepo}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all shadow-lg font-medium flex items-center gap-2"
            >
              <span>✓</span>
              Add to Profile
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
