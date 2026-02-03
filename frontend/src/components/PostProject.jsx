import React, { useState } from 'react';
import { Loader2, Sparkles, Box, Layout, Code2, Globe, Wrench, BarChart, Users, Github } from 'lucide-react';

export const PostProject = ({ postProject, setPostProject, myProjects, onSubmit, onBack, isDarkMode = true }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiAssistant, setGeminiAssistant] = useState({
    isActive: false,
    questions: [],
    currentStep: 1,
    totalSteps: 4,
    answers: [],
    projectDetails: null,
    isComplete: false
  });

  const [projectTemplate, setProjectTemplate] = useState({
    isGenerating: false,
    template: null,
    showTemplate: false
  });
  
  const startGeminiAssistant = async () => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please log in to use the AI assistant.");
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/ai/project-questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGeminiAssistant(prev => ({
          ...prev, isActive: true, questions: data.questions || [], currentStep: data.current_step || 1, totalSteps: data.total_steps || 4, answers: [], projectDetails: null, isComplete: false
        }));
      } else {
        const errorText = await response.text();
        alert(`Failed to start Gemini assistant: ${errorText}`);
      }
    } catch (error) {
      alert("Failed to start Gemini assistant.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitAnswer = async (answer) => {
    if (!answer.trim()) return;
    const newAnswers = [...geminiAssistant.answers, answer];
    setGeminiAssistant(prev => ({ ...prev, answers: newAnswers }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/ai/process-requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: newAnswers, current_step: geminiAssistant.currentStep })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.is_complete && data.project_details) {
          setPostProject(prev => ({
            ...prev,
            title: data.project_details.title || "",
            summary: data.project_details.summary || "",
            project_type: data.project_details.project_type || "",
            languages: Array.isArray(data.project_details.languages) ? data.project_details.languages.join(', ') : data.project_details.languages || "",
            frameworks: Array.isArray(data.project_details.frameworks) ? data.project_details.frameworks.join(', ') : data.project_details.frameworks || "",
            domains: Array.isArray(data.project_details.domains) ? data.project_details.domains.join(', ') : data.project_details.domains || "",
            skills: Array.isArray(data.project_details.skills) ? data.project_details.skills.join(', ') : data.project_details.skills || "",
            complexity: data.project_details.complexity || "intermediate",
            roles: Array.isArray(data.project_details.roles) ? data.project_details.roles.join(', ') : data.project_details.roles || ""
          }));
          setGeminiAssistant(prev => ({ ...prev, isActive: false, projectDetails: data.project_details, isComplete: true }));
          alert("Project details have been filled!");
        } else {
          setGeminiAssistant(prev => ({
            ...prev, questions: data.questions || [], currentStep: data.current_step || prev.currentStep + 1, totalSteps: data.total_steps || prev.totalSteps
          }));
        }
      } else {
         alert("Failed to process answer.");
      }
    } catch (error) {
      alert("Failed to process answer.");
    }
  };

  const resetAssistant = () => {
    setGeminiAssistant({ isActive: false, questions: [], currentStep: 1, totalSteps: 4, answers: [], projectDetails: null, isComplete: false });
  };

  const generateTemplate = async () => {
    setProjectTemplate(prev => ({ ...prev, isGenerating: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/ai/generate-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          project_type: postProject.project_type || "Web Application",
          complexity: postProject.complexity || "intermediate",
          tech_stack: [
            ...(postProject.languages ? postProject.languages.split(',').map(s => s.trim()) : []),
            ...(postProject.frameworks ? postProject.frameworks.split(',').map(s => s.trim()) : [])
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        setProjectTemplate(prev => ({ ...prev, template: data, showTemplate: true, isGenerating: false }));
      } else {
        alert("Failed to generate template.");
        setProjectTemplate(prev => ({ ...prev, isGenerating: false }));
      }
    } catch (error) {
      setProjectTemplate(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const applyTemplate = () => {
    if (projectTemplate.template) {
      setPostProject(prev => ({
        ...prev,
        title: projectTemplate.template.template.title || prev.title,
        summary: projectTemplate.template.template.description || prev.summary,
        project_type: projectTemplate.template.template.tech_stack?.join(', ') || prev.project_type
      }));
      setProjectTemplate(prev => ({ ...prev, showTemplate: false }));
      alert("Template applied!");
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
    isDarkMode 
      ? 'bg-zinc-900/50 border-white/10 text-white placeholder-zinc-500 focus:border-blue-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-700'}`;
  const cardClass = `rounded-3xl p-8 border backdrop-blur-xl ${
    isDarkMode 
      ? 'bg-[#18181b]/60 border-white/10' 
      : 'bg-white/80 border-gray-200 shadow-sm'
  }`;

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-6 pb-20 mt-6`}>
      {/* Header */}
      <div className={`relative overflow-hidden rounded-3xl p-8 border ${
        isDarkMode 
          ? 'bg-gradient-to-br from-green-900/50 via-emerald-900/30 to-teal-900/20 border-green-500/20' 
          : 'bg-gradient-to-br from-green-500 to-emerald-600 border-transparent text-white'
      }`}>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-white'}`}>Post a Project</h2>
            <p className={`${isDarkMode ? 'text-green-200' : 'text-green-100'}`}>Share your vision and find the perfect team</p>
          </div>
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-xl backdrop-blur-md transition-all ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            ← Back
          </button>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Tools */}
        <div className="space-y-6">
           {/* GitHub Auto-Fill */}
           <div className={cardClass}>
            <div className={`flex items-center gap-3 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               <Github className="w-6 h-6" />
               <h3 className="font-semibold text-lg">GitHub Auto-Fill</h3>
            </div>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
              Paste a repo URL to auto-fill details.
            </p>
            <div className="space-y-3">
              <input
                type="url"
                id="github-repo-url"
                placeholder="https://github.com/..."
                className={inputClass}
              />
              <button
                onClick={async () => {
                   const input = document.getElementById('github-repo-url');
                   const repoUrl = input.value.trim();
                   if (!repoUrl) return alert('Enter URL');
                   setIsAnalyzing(true);
                   try {
                     const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/repo/project/analyze-autofill`, {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                       body: JSON.stringify({ repo_url: repoUrl })
                     });
                     if (response.ok) {
                       const data = await response.json();
                       setPostProject({
                          title: data.title || '', summary: data.summary || '', repo_url: data.repo_url || repoUrl,
                          languages: Array.isArray(data.languages) ? data.languages.join(', ') : '',
                          frameworks: Array.isArray(data.frameworks) ? data.frameworks.join(', ') : '',
                          project_type: data.project_type || '', domains: Array.isArray(data.domains) ? data.domains.join(', ') : '',
                          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
                          complexity: data.complexity || 'intermediate', roles: Array.isArray(data.roles) ? data.roles.join(', ') : ''
                       });
                       alert('Form auto-filled!');
                     } else { alert('Failed to analyze'); }
                   } catch (e) { alert('Error analyzing'); } finally { setIsAnalyzing(false); }
                }}
                disabled={isAnalyzing}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isAnalyzing 
                    ? 'bg-zinc-700 cursor-not-allowed opacity-50' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                }`}
              >
                {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                Auto-Fill
              </button>
            </div>
           </div>

           {/* Gemini Assistant */}
           <div className={cardClass}>
              <div className={`flex items-center gap-3 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                 <Sparkles className="w-6 h-6 text-purple-500" />
                 <h3 className="font-semibold text-lg">AI Assistant</h3>
              </div>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                Let AI help you write the description.
              </p>
              {!geminiAssistant.isActive ? (
                <button
                  onClick={startGeminiAssistant}
                  disabled={isAnalyzing}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                  Start Assistant
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-zinc-500">
                     <span>Step {geminiAssistant.currentStep}/{geminiAssistant.totalSteps}</span>
                     <button onClick={resetAssistant}>Reset</button>
                  </div>
                  {geminiAssistant.questions.map((q, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <p className={`text-sm mb-2 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>{q}</p>
                      <input 
                        type="text" 
                        className={inputClass}
                        placeholder="Type answer..." 
                        onKeyDown={(e) => e.key === 'Enter' && submitAnswer(e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
           </div>

           {/* Templates */}
           <div className={cardClass}>
             <div className={`flex items-center gap-3 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                 <Layout className="w-6 h-6 text-orange-500" />
                 <h3 className="font-semibold text-lg">Templates</h3>
              </div>
              <button
                onClick={generateTemplate}
                disabled={projectTemplate.isGenerating}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium transition-all shadow-lg shadow-orange-500/20 mb-3"
              >
                {projectTemplate.isGenerating ? 'Generating...' : 'Generate New'}
              </button>
              {projectTemplate.template && (
                 <div className={`text-xs p-3 rounded-lg border ${isDarkMode ? 'border-orange-500/20 bg-orange-500/10' : 'bg-orange-50'}`}>
                    <p className={`mb-2 font-medium ${isDarkMode ? 'text-orange-200' : 'text-orange-800'}`}>Template Ready</p>
                    <button onClick={applyTemplate} className="text-orange-400 hover:underline">Apply to Form</button>
                 </div>
              )}
           </div>
        </div>

        {/* Right Column: Main Form */}
        <div className="lg:col-span-2 space-y-6">
           <form onSubmit={onSubmit} className={cardClass}>
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                 Project Details
              </h3>
              <div className="space-y-5">
                 {[
                   { key: 'title', label: 'Project Title', icon: <Box className="w-4 h-4" />, placeholder: 'e.g. EcoTracker App' },
                   { key: 'project_type', label: 'Type', icon: <Layout className="w-4 h-4" />, placeholder: 'Web App, Mobile...' },
                   { key: 'summary', label: 'Summary', icon: <Code2 className="w-4 h-4" />, type: 'textarea', placeholder: 'Describe your project...' },
                   { key: 'languages', label: 'Languages', icon: <Code2 className="w-4 h-4" />, placeholder: 'Python, JS...' },
                   { key: 'frameworks', label: 'Frameworks', icon: <Wrench className="w-4 h-4" />, placeholder: 'React, Django...' },
                   { key: 'domains', label: 'Domains', icon: <Globe className="w-4 h-4" />, placeholder: 'Fintech, Health...' },
                   { key: 'skills', label: 'Required Skills', icon: <Users className="w-4 h-4" />, placeholder: 'UI/UX, DevOps...' },
                   { key: 'complexity', label: 'Complexity', icon: <BarChart className="w-4 h-4" />, placeholder: 'intermediate' },
                   { key: 'roles', label: 'Open Roles', icon: <Users className="w-4 h-4" />, placeholder: 'Developer, Designer...' },
                 ].map((field) => (
                    <div key={field.key}>
                       <label className={labelClass}>
                          <span className="flex items-center gap-2">
                             {field.icon} {field.label} {['title', 'summary'].includes(field.key) && <span className="text-red-500">*</span>}
                          </span>
                       </label>
                       {field.type === 'textarea' ? (
                          <textarea
                            className={`${inputClass} min-h-[120px] resize-none`}
                            value={postProject[field.key]}
                            onChange={(e) => setPostProject({ ...postProject, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            required={['title', 'summary'].includes(field.key)}
                          />
                       ) : (
                          <input
                            className={inputClass}
                            value={postProject[field.key]}
                            onChange={(e) => setPostProject({ ...postProject, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            required={['title', 'summary'].includes(field.key)}
                          />
                       )}
                    </div>
                 ))}
                 
                 <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg shadow-lg shadow-green-500/25 transition-all transform hover:-translate-y-0.5"
                    >
                       Launch Project 🚀
                    </button>
                 </div>
              </div>
           </form>

           {/* My Projects List */}
           <div className={cardClass}>
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                 My Ongoing Projects
              </h3>
              {myProjects.length === 0 ? (
                 <div className={`text-center py-8 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                    <Layout className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No projects yet.</p>
                 </div>
              ) : (
                 <div className="grid gap-4">
                    {myProjects.map(p => (
                       <div key={p.id} className={`p-4 rounded-xl border transition-all hover:bg-white/5 ${isDarkMode ? 'bg-zinc-900/30 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex justify-between">
                             <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.title}</h4>
                             <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{p.complexity}</span>
                          </div>
                          <p className={`text-sm mt-1 line-clamp-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{p.summary}</p>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
