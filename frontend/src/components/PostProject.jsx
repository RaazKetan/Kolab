import React, { useState } from 'react';

export const PostProject = ({ postProject, setPostProject, myProjects, onSubmit, onBack }) => {
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

      console.log("Starting Gemini assistant...");
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/ai/project-questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Received data:", data);
        
        setGeminiAssistant(prev => ({
          ...prev,
          isActive: true,
          questions: data.questions || [],
          currentStep: data.current_step || 1,
          totalSteps: data.total_steps || 4,
          answers: [],
          projectDetails: null,
          isComplete: false
        }));
        
        console.log("Gemini assistant started successfully");
      } else {
        const errorText = await response.text();
        console.error("Failed to start assistant:", errorText);
        alert(`Failed to start Gemini assistant: ${errorText}`);
      }
    } catch (error) {
      console.error("Failed to start Gemini assistant:", error);
      alert("Failed to start Gemini assistant. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitAnswer = async (answer) => {
    if (!answer.trim()) {
      alert("Please enter an answer before submitting.");
      return;
    }

    const newAnswers = [...geminiAssistant.answers, answer];
    setGeminiAssistant(prev => ({ ...prev, answers: newAnswers }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please log in to use the AI assistant.");
        return;
      }

      console.log("Submitting answer:", answer);
      console.log("All answers:", newAnswers);
      console.log("Current step:", geminiAssistant.currentStep);

      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/ai/process-requirements`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          answers: newAnswers,
          current_step: geminiAssistant.currentStep
        })
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Received response data:", data);
        
        if (data.is_complete && data.project_details) {
          console.log("Project details generated:", data.project_details);
          
          // Fill the form with generated details
          setPostProject(prev => ({
            ...prev,
            title: data.project_details.title || "",
            summary: data.project_details.summary || "",
            project_type: data.project_details.project_type || "",
            languages: Array.isArray(data.project_details.languages) 
              ? data.project_details.languages.join(', ') 
              : data.project_details.languages || "",
            frameworks: Array.isArray(data.project_details.frameworks) 
              ? data.project_details.frameworks.join(', ') 
              : data.project_details.frameworks || "",
            domains: Array.isArray(data.project_details.domains) 
              ? data.project_details.domains.join(', ') 
              : data.project_details.domains || "",
            skills: Array.isArray(data.project_details.skills) 
              ? data.project_details.skills.join(', ') 
              : data.project_details.skills || "",
            complexity: data.project_details.complexity || "intermediate",
            roles: Array.isArray(data.project_details.roles) 
              ? data.project_details.roles.join(', ') 
              : data.project_details.roles || ""
          }));

          setGeminiAssistant(prev => ({
            ...prev,
            isActive: false,
            projectDetails: data.project_details,
            isComplete: true
          }));
          
          alert("Project details have been filled! Please review and submit.");
        } else {
          console.log("Continuing with more questions:", data.questions);
          // Continue with more questions
          setGeminiAssistant(prev => ({
            ...prev,
            questions: data.questions || [],
            currentStep: data.current_step || prev.currentStep + 1,
            totalSteps: data.total_steps || prev.totalSteps
          }));
        }
      } else {
        const errorText = await response.text();
        console.error("Failed to process answer:", errorText);
        alert(`Failed to process answer: ${errorText}`);
      }
    } catch (error) {
      console.error("Failed to process answer:", error);
      alert("Failed to process answer. Please check your connection and try again.");
    }
  };

  const resetAssistant = () => {
    setGeminiAssistant({
      isActive: false,
      questions: [],
      currentStep: 1,
      totalSteps: 4,
      answers: [],
      projectDetails: null,
      isComplete: false
    });
  };

  const generateTemplate = async () => {
    setProjectTemplate(prev => ({ ...prev, isGenerating: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/ai/generate-template`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
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
        setProjectTemplate(prev => ({
          ...prev,
          template: data,
          showTemplate: true,
          isGenerating: false
        }));
      } else {
        alert("Failed to generate template. Please try again.");
        setProjectTemplate(prev => ({ ...prev, isGenerating: false }));
      }
    } catch (error) {
      console.error("Failed to generate template:", error);
      alert("Failed to generate template. Please try again.");
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
      alert("Template applied to your project form!");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Post a Project</h2>
            <p className="text-green-100">Share your project and find collaborators</p>
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
        {/* GitHub Repo Auto-Fill Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-100">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-3xl mr-3">🔗</span>
            Auto-Fill from GitHub
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Paste your GitHub repository URL and let our AI analyze the code to automatically fill out all project details.
          </p>
          
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="https://github.com/username/repository"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              id="github-repo-url"
            />
            <button
              onClick={async () => {
                const input = document.getElementById('github-repo-url');
                const repoUrl = input.value.trim();
                
                if (!repoUrl) {
                  alert('Please enter a GitHub repository URL');
                  return;
                }
                
                if (!repoUrl.includes('github.com')) {
                  alert('Please enter a valid GitHub URL');
                  return;
                }
                
                setIsAnalyzing(true);
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/repo/project/analyze-autofill`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ repo_url: repoUrl })
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    
                    // Auto-fill the form
                    setPostProject({
                      title: data.title || '',
                      summary: data.summary || '',
                      repo_url: data.repo_url || repoUrl,
                      languages: Array.isArray(data.languages) ? data.languages.join(', ') : '',
                      frameworks: Array.isArray(data.frameworks) ? data.frameworks.join(', ') : '',
                      project_type: data.project_type || '',
                      domains: Array.isArray(data.domains) ? data.domains.join(', ') : '',
                      skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
                      complexity: data.complexity || 'intermediate',
                      roles: Array.isArray(data.roles) ? data.roles.join(', ') : ''
                    });
                    
                    alert('✅ Form auto-filled successfully! Please review and submit.');
                    input.value = '';
                  } else {
                    const error = await response.text();
                    alert(`Failed to analyze repository: ${error}`);
                  }
                } catch (error) {
                  console.error('Error analyzing repo:', error);
                  alert('Failed to analyze repository. Please try again.');
                } finally {
                  setIsAnalyzing(false);
                }
              }}
              disabled={isAnalyzing}
              className={`px-8 py-3 rounded-xl font-semibold transition-all text-white ${
                isAnalyzing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-95'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </div>
              ) : (
                '✨ Auto-Fill'
              )}
            </button>
          </div>
        </div>

        {/* Gemini Assistant Section */}
        <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            AI Project Assistant
          </h3>
          <p className="text-gray-600 mb-4">
            Let our AI assistant help you create a detailed project description by asking you questions about your requirements.
          </p>
          
          {!geminiAssistant.isActive ? (
            <button
              onClick={startGeminiAssistant}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Assistant...
                </>
              ) : (
                <>
                  <span className="mr-2">🤖</span>
                  Start AI Assistant
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Step {geminiAssistant.currentStep} of {geminiAssistant.totalSteps}</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(geminiAssistant.currentStep / geminiAssistant.totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Questions */}
              {geminiAssistant.questions.map((question, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">{question}</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Your answer..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          submitAnswer(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        if (input.value.trim()) {
                          submitAnswer(input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ))}

              {/* Reset Button */}
              <div className="flex justify-end">
                <button
                  onClick={resetAssistant}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset Assistant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Smart Project Templates Section */}
        <div className="bg-orange-50 rounded-xl p-6 mb-8 border border-orange-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Smart Project Templates
          </h3>
          <p className="text-gray-600 mb-4">
            Generate a detailed project template with structure, milestones, and resources based on your project type and tech stack.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={generateTemplate}
              disabled={projectTemplate.isGenerating}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {projectTemplate.isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Template...
                </>
              ) : (
                <>
                  <span className="mr-2">📋</span>
                  Generate Template
                </>
              )}
            </button>
            
            {projectTemplate.template && (
              <button
                onClick={() => setProjectTemplate(prev => ({ ...prev, showTemplate: !prev.showTemplate }))}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {projectTemplate.showTemplate ? 'Hide Template' : 'View Template'}
              </button>
            )}
          </div>

          {/* Template Display */}
          {projectTemplate.showTemplate && projectTemplate.template && (
            <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Generated Template</h4>
                <button
                  onClick={applyTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply to Form
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Template Info */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Project Details</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Title:</span> {projectTemplate.template.template.title}</p>
                    <p><span className="font-medium">Description:</span> {projectTemplate.template.template.description}</p>
                    <p><span className="font-medium">Duration:</span> {projectTemplate.template.template.estimated_duration}</p>
                    <p><span className="font-medium">Team Size:</span> {projectTemplate.template.template.team_size}</p>
                    <p><span className="font-medium">Tech Stack:</span> {projectTemplate.template.template.tech_stack?.join(', ')}</p>
                  </div>
                </div>

                {/* Project Structure */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Project Structure</h5>
                  <ul className="space-y-1 text-sm">
                    {projectTemplate.template.structure?.map((phase, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                          {index + 1}
                        </span>
                        {phase}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Milestones */}
              <div className="mt-6">
                <h5 className="font-medium text-gray-700 mb-2">Key Milestones</h5>
                <ul className="space-y-1 text-sm">
                  {projectTemplate.template.milestones?.map((milestone, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className="mt-6">
                <h5 className="font-medium text-gray-700 mb-2">Recommended Resources</h5>
                <ul className="space-y-1 text-sm">
                  {projectTemplate.template.resources?.map((resource, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Project Form */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">📝</span>
            Project Details
          </h3>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={onSubmit}
          >
            {[
              { key: 'title', placeholder: 'Project Title', required: true, icon: '🏷️' },
              { key: 'project_type', placeholder: 'Project Type (e.g., Web Application, Mobile App)', icon: '📱' },
              { key: 'summary', placeholder: 'Project Summary - Describe what your project does', type: 'textarea', required: true, icon: '📄' },
              { key: 'languages', placeholder: 'Programming Languages (e.g., Python, JavaScript, Java)', icon: '💻' },
              { key: 'frameworks', placeholder: 'Frameworks & Libraries (e.g., React, Django, Express)', icon: '⚡' },
              { key: 'domains', placeholder: 'Domains (e.g., E-commerce, Healthcare, Education)', icon: '🌐' },
              { key: 'skills', placeholder: 'Skills Needed (e.g., Frontend Development, UI/UX, DevOps)', icon: '🛠️' },
              { key: 'complexity', placeholder: 'Complexity Level (beginner/intermediate/advanced)', icon: '📊' },
              { key: 'roles', placeholder: 'Roles Needed (e.g., Developer, Designer, Tester)', icon: '👥' },
            ].map((field, index) =>
              field.type === 'textarea' ? (
                <div key={index} className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="mr-2">{field.icon}</span>
                    {field.placeholder}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder={field.placeholder}
                    value={postProject[field.key]}
                    onChange={(e) => setPostProject({ ...postProject, [field.key]: e.target.value })}
                    required={field.required}
                    rows={4}
                  />
                </div>
              ) : (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="mr-2">{field.icon}</span>
                    {field.placeholder}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={field.placeholder}
                    value={postProject[field.key]}
                    onChange={(e) => setPostProject({ ...postProject, [field.key]: e.target.value })}
                    required={field.required}
                  />
                </div>
              )
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-lg font-medium"
              >
                <span>🚀</span>
                Post Project
              </button>
            </div>
          </form>
        </div>

        {/* My Projects Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">📚</span>
            My Projects
          </h3>
          {myProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-lg">No projects yet.</p>
              <p className="text-sm">Create your first project above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{p.title}</h4>
                    <span className="text-xs text-gray-500 font-mono">#{p.id}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{p.summary}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.languages?.slice(0, 3).map((lang, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {lang}
                      </span>
                    ))}
                    {p.languages?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{p.languages.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
