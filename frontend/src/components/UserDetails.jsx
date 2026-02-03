import React from 'react';
import { Mail, Github, Globe, MapPin, Award, BookOpen, Layers, Code, Briefcase, Calendar, GitCommit } from 'lucide-react';

export const UserDetails = ({ user, onBack, isDarkMode = true }) => (
  <div className={`w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl mt-6 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
    {/* Header Section */}
    <div className={`relative px-8 py-12 ${
      isDarkMode 
        ? 'bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-b border-white/10' 
        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
    }`}>
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl border-4 ${
            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-white/20 text-indigo-600'
          }`}>
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (user.name?.charAt(0) || 'U')
            )}
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-white'}`}>{user.name}</h1>
            <p className={`text-lg font-medium opacity-80 ${isDarkMode ? 'text-zinc-300' : 'text-indigo-100'}`}>@{user.username}</p>
            <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
              {user.email && (
                <span className={`flex items-center gap-1.5 text-sm ${isDarkMode ? 'text-zinc-400' : 'text-indigo-100'}`}>
                  <Mail className="w-4 h-4" /> {user.email}
                </span>
              )}
              {user.org_name && (
                <span className={`flex items-center gap-1.5 text-sm ${isDarkMode ? 'text-zinc-400' : 'text-indigo-100'}`}>
                  <Briefcase className="w-4 h-4" /> {user.org_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all backdrop-blur-md ${
            isDarkMode 
              ? 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border border-white/5' 
              : 'bg-black/20 hover:bg-black/30 text-white'
          }`}
        >
          Back
        </button>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio Section */}
          <div className={`rounded-3xl p-8 border backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-[#18181b]/60 border-white/10' 
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <BookOpen className="w-5 h-5 text-blue-500" />
              About
            </h3>
            <p className={`leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-gray-700'}`}>
              {user.bio || "No bio available."}
            </p>
          </div>

          {/* Skills Section */}
          <div className={`rounded-3xl p-8 border backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-[#18181b]/60 border-white/10' 
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Award className="w-5 h-5 text-purple-500" />
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {(user.skills || []).map((skill, i) => (
                <span
                  key={i}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                    isDarkMode 
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' 
                      : 'bg-purple-50 border-purple-100 text-purple-700'
                  }`}
                >
                  {skill}
                </span>
              ))}
              {(user.skills || []).length === 0 && (
                <span className={`italic ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>No skills listed</span>
              )}
            </div>
          </div>

          {/* Technologies Section */}
          <div className={`rounded-3xl p-8 border backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-[#18181b]/60 border-white/10' 
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Layers className="w-5 h-5 text-indigo-500" />
              Technologies
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {(user.top_languages && user.top_languages.length > 0) && (
                <div>
                  <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.top_languages.map((lang, i) => (
                      <span key={i} className={`px-3 py-1.5 rounded-lg text-sm border ${
                        isDarkMode 
                          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                          : 'bg-green-50 border-green-100 text-green-700'
                      }`}>
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(user.top_frameworks && user.top_frameworks.length > 0) && (
                <div>
                  <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.top_frameworks.map((fw, i) => (
                      <span key={i} className={`px-3 py-1.5 rounded-lg text-sm border ${
                        isDarkMode 
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                          : 'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
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
            <div className={`rounded-3xl p-6 border ${
              isDarkMode 
                ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20' 
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            }`}>
              <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Award className="w-5 h-5 text-green-500" />
                Activity Level
              </h3>
              <div className="flex items-center mb-2">
                <div className={`flex-1 rounded-full h-2 mr-3 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                    style={{ width: `${user.activity_score}%` }}
                  ></div>
                </div>
                <span className="text-green-500 font-bold">{user.activity_score}%</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                {user.activity_score > 80 ? "🔥 Very Active" : 
                 user.activity_score > 60 ? "⚡ Active" : 
                 user.activity_score > 40 ? "🌱 Moderately Active" : "💤 Getting Started"}
              </p>
            </div>
          )}

          {/* GitHub Repositories */}
          {user.github_selected_repos && user.github_selected_repos.length > 0 && (
            <div className={`rounded-3xl p-6 border backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-[#18181b]/60 border-white/10' 
                : 'bg-white border-gray-100 shadow-sm'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Github className="w-5 h-5" />
                Repositories
              </h3>
              
              <div className="space-y-3">
                {user.github_selected_repos.map((repo, i) => (
                  <div key={i} className={`rounded-xl p-3 border transition-colors ${
                    isDarkMode 
                      ? 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50' 
                      : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                  }`}>
                    <a href={repo.url} target="_blank" rel="noreferrer" className={`font-medium text-sm truncate hover:underline block mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {repo.name || repo.url}
                    </a>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {repo.languages?.slice(0,3).map((lang, idx) => (
                        <span key={idx} className={`px-1.5 py-0.5 text-[10px] rounded border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-white border-gray-200 text-gray-500'
                        }`}>
                          {lang}
                        </span>
                      ))}
                    </div>
                    
                    {repo.last_analyzed && (
                      <div className={`flex items-center gap-1 text-[10px] ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(repo.last_analyzed).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
