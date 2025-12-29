import React, { useState } from 'react';
import { SkillGapAnalysis } from './SkillGapAnalysis';

export const TalentSearch = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please describe what kind of talent you are looking for');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/talent/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to search candidates');
      }

      const data = await response.json();
      setCandidates(data);
      
      if (data.length === 0) {
        setError('No matching candidates found. Try a different search query.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search candidates. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">🔍 AI-Powered Talent Search</h2>
            <p className="text-purple-100">Find the perfect candidates using natural language</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Search Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-purple-100">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-3xl mr-3">💼</span>
            Describe Your Ideal Candidate
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Use natural language to describe the skills, experience, and qualifications you're looking for.
            Our AI will find the best matching candidates from our talent pool.
          </p>

          <div className="space-y-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: I need a senior full-stack engineer with React and Node.js experience, preferably with cloud deployment skills and 5+ years of experience..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={5}
              disabled={searching}
            />

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className={`w-full px-8 py-4 rounded-xl font-semibold transition-all text-white text-lg ${
                searching || !query.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-95'
              }`}
            >
              {searching ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching Candidates...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🔍</span>
                  Search Candidates
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {candidates.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">👥</span>
              Top Matches ({candidates.length})
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900">{candidate.name}</h4>
                      <p className="text-purple-600 font-semibold">{candidate.title}</p>
                      {candidate.location && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <span className="mr-1">📍</span>
                          {candidate.location}
                        </p>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg px-3 py-2 border border-purple-200">
                      <div className="text-xs text-purple-700 font-medium">Match Score</div>
                      <div className="text-2xl font-bold text-purple-800">
                        {Math.round(candidate.match_score * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="mr-1">⏱️</span>
                        {candidate.experience_years} years experience
                      </span>
                      {candidate.current_company && (
                        <span className="flex items-center">
                          <span className="mr-1">🏢</span>
                          {candidate.current_company}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {candidate.summary}
                  </p>

                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-gray-600 mb-2">TOP SKILLS</h5>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 8).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 8 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{candidate.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {candidate.certifications && candidate.certifications.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-gray-600 mb-2">CERTIFICATIONS</h5>
                      <div className="flex flex-wrap gap-2">
                        {candidate.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200"
                          >
                            🏆 {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work History Preview */}
                  {candidate.work_history && candidate.work_history.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="text-xs font-semibold text-gray-600 mb-2">RECENT EXPERIENCE</h5>
                      <div className="space-y-2">
                        {candidate.work_history.slice(0, 2).map((job, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-semibold text-gray-800">{job.role}</div>
                            <div className="text-gray-600 text-xs">
                              {job.company} • {job.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>📧</span>
                        <a href={`mailto:${candidate.email}`} className="text-purple-600 hover:underline">
                          {candidate.email}
                        </a>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <span>📱</span>
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                    >
                      📊 Analyze Skills
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searching && candidates.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Ready to Find Talent</h3>
            <p className="text-gray-600">
              Describe your ideal candidate above and let our AI find the best matches
            </p>
          </div>
        )}
      </div>

      {/* Skill Gap Analysis Modal */}
      {selectedCandidate && (
        <SkillGapAnalysis
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};
