import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Loader2, ChevronLeft, ChevronRight, ArrowRight,
  Bookmark, RefreshCw, CheckCircle2, Sparkles, Code2, Users, Zap
} from 'lucide-react';

const SwipeCard = ({ project, isDarkMode = true }) => {
  const getTypeGradient = (type) => {
    // Backend returns: "Web Application", "Mobile Application", "Desktop Application", "CLI Tool", etc.
    const lowerType = (type || '').toLowerCase();
    
    if (lowerType.includes('web')) {
      return 'from-blue-600 via-indigo-500 to-cyan-400';
    } else if (lowerType.includes('mobile')) {
      return 'from-violet-600 via-fuchsia-500 to-pink-500';
    } else if (lowerType.includes('desktop') || lowerType.includes('cli')) {
      return 'from-orange-500 via-red-500 to-rose-500';
    } else if (lowerType.includes('api') || lowerType.includes('backend')) {
      return 'from-emerald-500 via-teal-500 to-cyan-400';
    } else {
      return 'from-blue-600 via-indigo-500 to-cyan-400';
    }
  };

  // Combine languages and frameworks into tech stack
  const techStack = [
    ...(project.languages || []),
    ...(project.frameworks || [])
  ];

  console.log('SwipeCard rendering with project:', {
    title: project.title,
    summary: project.summary,
    languages: project.languages,
    frameworks: project.frameworks,
    techStack,
    project_type: project.project_type,
    complexity: project.complexity
  });

  return (
    <div className={`group relative w-full max-w-md h-[680px] backdrop-blur-xl border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
      isDarkMode
        ? 'bg-[#0f0f11]/90 border-white/10 hover:shadow-blue-500/20 hover:border-white/20'
        : 'bg-white/90 border-gray-200 hover:shadow-blue-500/10 hover:border-gray-300'
    }`}>
      <div className={`h-48 bg-gradient-to-br ${getTypeGradient(project.project_type || project.type)} relative overflow-hidden transition-all duration-500`}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -left-20 w-64 h-64 bg-white/20 rounded-full blur-[80px] mix-blend-overlay opacity-50 animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-black/20 rounded-full blur-[60px] group-hover:scale-110 transition-transform duration-700" />

        <div className="absolute top-6 right-6 z-10">
          {project.match_score && (
            <div className="relative flex items-center justify-center w-16 h-16 group/score">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-full scale-90 group-hover/score:scale-100 transition-transform duration-300" />
              <svg className="w-full h-full transform -rotate-90 relative z-10">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/20" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * (project.match_score || 0) * 100) / 100} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-1000 ease-out" />
              </svg>
              <span className="absolute text-sm font-bold text-white z-20">{(project.match_score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        <div className="absolute top-6 left-6 z-10">
          <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-xs font-semibold text-white flex items-center gap-2 shadow-lg group-hover:bg-black/30 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            {project.project_type || project.type}
          </div>
        </div>
      </div>

      <div className={`px-8 pb-8 pt-14 relative flex flex-col h-[calc(100%-192px)] bg-gradient-to-b ${isDarkMode ? 'from-transparent to-[#0a0a0a]/50' : 'from-transparent to-gray-50/50'}`}>
        <div className="mb-5 mt-4">
          <h3 className={`text-2xl font-bold leading-tight mb-1 group-hover:text-blue-400 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {project.title}
          </h3>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar mb-6 relative mask-linear-fade">
          <p className={`text-sm leading-relaxed font-light tracking-wide ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>{project.summary || project.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`hover:bg-white/[0.06] transition-colors rounded-xl p-3 border ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-[10px] uppercase tracking-wider font-bold block mb-1.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Skills</span>
            <div className="flex flex-wrap gap-1">
              {(project.skills || []).slice(0, 3).map((s, i) => (
                <span key={i} className={`text-xs font-medium px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                  {s}
                </span>
              ))}
              {(project.skills || []).length > 3 && (
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-600'}`}>+{project.skills.length - 3}</span>
              )}
            </div>
          </div>
          <div className={`hover:bg-white/[0.06] transition-colors rounded-xl p-3 border ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-[10px] uppercase tracking-wider font-bold block mb-1.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Domains</span>
            <div className="flex flex-wrap gap-1">
              {(project.domains || []).slice(0, 3).map((d, i) => (
                <span key={i} className={`text-xs font-medium px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Code2 className={`w-3.5 h-3.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`} />
              <span className={`text-[10px] uppercase tracking-wider font-bold ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map(t => (
                <span key={t} className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all duration-300 cursor-default ${
                  isDarkMode 
                    ? 'bg-zinc-800/50 border-white/5 hover:border-white/20 hover:bg-white/10 text-zinc-300' 
                    : 'bg-gray-100 border-gray-200 hover:border-gray-300 hover:bg-gray-200 text-gray-700'
                }`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {(project.match_reason || project.embedding_summary) && (
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r border p-3 ${
              isDarkMode 
                ? 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20' 
                : 'from-indigo-100 to-purple-100 border-indigo-200'
            }`}>
              <div className="flex gap-3 items-start relative z-10">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide mb-1 block ${
                    isDarkMode 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300' 
                      : 'text-indigo-700'
                  }`}>
                    AI Analysis
                  </span>
                  <p className={`text-xs leading-snug ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>{project.match_reason || project.embedding_summary || "No analysis available"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Discover = ({ projects = [], onConnect, onLike, onSkip, isDarkMode = true, isLoading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState(projects);

  useEffect(() => {
    console.log('Discover useEffect triggered', {
      newProjectId: projects[0]?.id,
      currentProjectId: filteredProjects[0]?.id
    });
    
    // Always update the projects data to reflect latest props
    setFilteredProjects(projects);

    // Only reset index if we have a NEW project ID
    // This allows same-project updates (like re-shows) to work without resetting or looping
    // And prevents the index from getting stuck if we somehow navigated away
    if (projects[0]?.id !== filteredProjects[0]?.id) {
      setCurrentIndex(0);
      console.log('New project ID detected - resetting index to 0');
    }
  }, [projects]); // Trigger whenever parent passes new projects array

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }
    
    setIsSearching(true);
    // Simple client-side search
    const filtered = projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (p.summary || p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tech_stack || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredProjects(filtered);
    setCurrentIndex(0);
    setIsSearching(false);
  };

  const handleNext = () => {
    console.log('Skip button clicked, current project:', currentProject);
    if (onSkip && currentProject) {
      onSkip(currentProject);
    }
    // Parent handles navigation - do NOT manually increment index
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleConnect = () => {
    console.log('Collaborate button clicked, current project:', currentProject);
    if (onConnect && currentProject) {
      onConnect(currentProject);
    }
    // Parent handles navigation - do NOT manually increment index
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSearchQuery("");
    setFilteredProjects(projects);
  };

  const currentProject = filteredProjects[currentIndex];
  
  console.log('Current project state:', {
    currentProject,
    currentIndex,
    filteredProjectsLength: filteredProjects.length,
    hasProject: !!currentProject
  });

  return (
    <div className={`flex flex-col items-center justify-center h-full relative px-4 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      <div className="relative w-full max-w-md">
        {isLoading ? (
          <div className={`text-center animate-in zoom-in-95 duration-300 p-10 rounded-3xl border backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-zinc-900/50 border-white/5' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading projects...</h3>
            <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>Finding your perfect match</p>
          </div>
        ) : !currentProject ? (
          <div className={`text-center animate-in zoom-in-95 duration-300 p-10 rounded-3xl border backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-zinc-900/50 border-white/5' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
              <CheckCircle2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No projects at current moment</h3>
            <p className={`text-lg ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>please come back later</p>
          </div>
        ) : (
          <>
            <SwipeCard project={currentProject} isDarkMode={isDarkMode} />
            <div className="absolute -bottom-24 left-0 right-0 flex items-center justify-between px-2 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 z-20">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`p-4 rounded-full border backdrop-blur-sm transition-all ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30' 
                    : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50 disabled:opacity-30'
                } disabled:cursor-not-allowed`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleNext} 
                  className={`px-6 py-3 rounded-full border font-medium transition-all ${
                    isDarkMode 
                      ? 'bg-transparent border-white/20 text-white hover:bg-white/5' 
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Skip
                </button>
                <button 
                  onClick={handleConnect}
                  className={`group px-6 py-3 rounded-full font-bold transition-all shadow-lg flex items-center gap-2 ${
                    isDarkMode 
                      ? 'bg-white text-black hover:bg-blue-500 hover:text-white hover:shadow-blue-500/25' 
                      : 'bg-gray-900 text-white hover:bg-blue-600 hover:shadow-blue-500/25'
                  }`}
                >
                  Collaborate <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => onLike && onLike(currentProject)}
                  className={`p-4 rounded-full border backdrop-blur-sm transition-all ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-yellow-400' 
                      : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-yellow-500'
                  }`}
                >
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="h-32 md:h-0"></div>
    </div>
  );
};
