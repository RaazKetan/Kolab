import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Award, Zap, User, Mail, Phone, Loader2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { SkillGapAnalysis } from './SkillGapAnalysis';

export const TalentSearch = ({ onBack, isDarkMode = true }) => {
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

  const inputClass = `w-full px-6 py-4 rounded-2xl border text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none shadow-xl ${
    isDarkMode 
      ? 'bg-zinc-900/80 border-white/10 text-white placeholder-zinc-500 focus:border-purple-500/30' 
      : 'bg-white border-gray-200 text-gray-800 shadow-gray-200/50'
  }`;

  const cardClass = `group relative rounded-3xl border p-6 transition-all hover:-translate-y-1 duration-300 ${
    isDarkMode 
      ? 'bg-[#18181b]/60 border-white/5 hover:bg-[#18181b]/80 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10' 
      : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-xl'
  }`;

  return (
    <div className={`w-full max-w-7xl mx-auto pb-20 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header & Search Area */}
      <div className="text-center py-12 px-4 relative">
        <button
          onClick={onBack}
          className={`absolute left-0 top-8 px-4 py-2 rounded-xl transition-colors backdrop-blur-md flex items-center gap-2 text-sm font-medium ${
            isDarkMode 
              ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5' 
              : 'bg-white/50 hover:bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
          }`}
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back
        </button>

        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Find your dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Talent</span>
        </h1>
        <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
           Describe the skills and role you need. Our AI agent will scour the database to find the perfect match.
        </p>

        <div className="max-w-3xl mx-auto relative group">
           <div className={`absolute -inset-1 rounded-3xl opacity-20 blur-xl transition duration-500 group-hover:opacity-40 ${
              isDarkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-400 to-pink-400'
           }`}></div>
           <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch();
                   }
                }}
                placeholder="Ex: Senior React Developer with 5 years experience, knows Python and AWS..."
                className={`${inputClass} min-h-[140px]`}
              />
              <div className="absolute bottom-4 right-4">
                 <button
                    onClick={handleSearch}
                    disabled={searching || !query.trim()}
                    className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                       searching || !query.trim()
                          ? 'bg-zinc-500/20 text-zinc-500 cursor-not-allowed'
                          : 'bg-white text-black hover:scale-105 active:scale-95 shadow-lg'
                    }`}
                 >
                    {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-purple-600" />}
                    {searching ? 'Scouting...' : 'Find Talent'}
                 </button>
              </div>
           </div>
        </div>
        {error && <p className="mt-4 text-red-400 bg-red-400/10 inline-block px-4 py-2 rounded-lg text-sm">{error}</p>}
      </div>

      {/* Results Grid */}
      {candidates.length > 0 && (
         <div className="px-4">
            <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
               <h3 className={`text-xl font-semibold flex items-center gap-2 ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Top Matches Found
               </h3>
               <span className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-zinc-400' : 'bg-gray-100 text-gray-600'}`}>
                  {candidates.length} candidates
               </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {candidates.map((candidate, index) => (
                  <div key={candidate.id} className={cardClass} style={{ animationDelay: `${index * 100}ms` }}>
                     {/* Match Badge */}
                     <div className="absolute top-4 right-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg border backdrop-blur-md ${
                           candidate.match_score >= 0.8 
                              ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                              : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                        }`}>
                           {Math.round(candidate.match_score * 100)}% Match
                        </div>
                     </div>

                     <div className="flex flex-col h-full">
                        {/* Profile Header */}
                        <div className="mb-6">
                           <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4 ${
                              isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-200 border border-white/5' : 'bg-purple-50 text-purple-600'
                           }`}>
                              {candidate.name.charAt(0)}
                           </div>
                           <h4 className="text-xl font-bold mb-1 truncate">{candidate.name}</h4>
                           <p className="text-purple-500 font-medium text-sm truncate">{candidate.title}</p>
                           {candidate.location && (
                              <p className={`text-xs flex items-center mt-2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                                 <MapPin className="w-3 h-3 mr-1" /> {candidate.location}
                              </p>
                           )}
                        </div>

                        {/* Summary */}
                        <p className={`text-sm line-clamp-3 mb-6 flex-grow ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                           {candidate.summary}
                        </p>

                        {/* Stats Row */}
                        <div className={`flex items-center gap-4 py-4 mb-4 border-t border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                           <div>
                              <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Experience</p>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-200' : 'text-gray-700'}`}>{candidate.experience_years} Years</p>
                           </div>
                           {candidate.current_company && (
                              <div className="flex-1 truncate">
                                 <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Current</p>
                                 <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-zinc-200' : 'text-gray-700'}`}>{candidate.current_company}</p>
                              </div>
                           )}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                           {candidate.skills?.slice(0, 5).map((skill, i) => (
                              <span key={i} className={`px-2 py-1 text-[10px] font-medium rounded-md border ${
                                 isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                              }`}>
                                 {skill}
                              </span>
                           ))}
                           {(candidate.skills?.length || 0) > 5 && (
                              <span className={`px-2 py-1 text-[10px] font-medium rounded-md border ${
                                 isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-gray-50 border-gray-200 text-gray-400'
                              }`}>+{candidate.skills.length - 5}</span>
                           )}
                        </div>

                        {/* Actions */}
                        <div className="mt-auto grid grid-cols-2 gap-3">
                           <a 
                              href={`mailto:${candidate.email}`}
                              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                 isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                              }`}
                           >
                              <Mail className="w-4 h-4" /> Contact
                           </a>
                           <button
                              onClick={() => setSelectedCandidate(candidate)}
                              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                           >
                              <Zap className="w-4 h-4 text-purple-600" /> Analyze
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Skill Gap Analysis Modal */}
      {selectedCandidate && (
        <SkillGapAnalysis
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
