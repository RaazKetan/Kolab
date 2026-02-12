import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AuthForm } from './components/Authform';
import { Header } from './components/Header';
import { SideNav, BottomNav } from './components/Navigation';
import { ProjectCard } from './components/ProjectCard';
import { MatchCard } from './components/MatchCard';
import { ChatView } from './components/ChatView';
import { ProjectDetails } from './components/ProjectDetails';
import { UserDetails } from './components/UserDetails';
import { PostProject } from './components/PostProject';
import { ProfileView } from './components/ProfileView';
import { RequirementsPage } from './components/RequirementsPage';
import { MyProjects } from './components/MyProjects';
import { ProfileEdit } from './components/ProfileEdit';
import { ProjectLikes } from './components/ProjectLikes';
import { LandingPage } from './components/LandingPage';
import { TalentSearch } from './components/TalentSearch';
import { Discover } from './components/Discover';
import { ProfileSetup } from './components/ProfileSetup';
import { Jobs } from './components/Jobs';
const API_BASE = "http://localhost:8000";

export function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [matches, setMatches] = useState([]);
  const [view, setView] = useState("login");
  const [selectedProject, setSelectedProject] = useState(null);
  const [inspectedProject, setInspectedProject] = useState(null);
  const [inspectedUser, setInspectedUser] = useState(null);
  const [ownerUser, setOwnerUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [postProject, setPostProject] = useState({
    title: "",
    summary: "",
    repo_url: "",
    languages: "",
    frameworks: "",
    project_type: "",
    domains: "",
    skills: "",
    complexity: "intermediate",
    roles: ""
  });
  const [myProjects, setMyProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isShowingReshown, setIsShowingReshown] = useState(false);
  const [matchOwners, setMatchOwners] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [messageNotifications, setMessageNotifications] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [discoverProjects, setDiscoverProjects] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const isLoadingRef = useRef(false);
  const isLoadingNotificationsRef = useRef(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };


  const fetchNextProject = useCallback(async (excludeId = null) => {
    const token = localStorage.getItem("token");
    if (!token || isLoadingRef.current) return; // Prevent multiple simultaneous calls
    
    isLoadingRef.current = true;
    setIsDiscoverLoading(true);
    
    try {
      let url = `${API_BASE}/matching/discover`;
      if (excludeId) {
        url += `?exclude_project_id=${excludeId}`;
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        ('fetchNextProject: Setting new project:', data);
        
        // Loop protection: If backend still returns the same project, force null
        if (excludeId && data.id === excludeId) {
           console.warn("Backend returned excluded project ID. Breaking loop.");
           setCurrentProject(null);
           setIsShowingReshown(false);
        } else {
           setCurrentProject(data);
           setIsShowingReshown(data.is_reshow || false);
           try {
             if (data && typeof data.owner_id === "number") {
               const u = await fetch(`${API_BASE}/users/${data.owner_id}`);
               if (u.ok) setOwnerUser(await u.json()); else setOwnerUser(null);
             } else {
               setOwnerUser(null);
             }
           } catch (error) { 
             console.error("Error fetching owner user:", error);
             setOwnerUser(null); 
           }
        }
      } else if (res.status === 404) {
        setCurrentProject(null);
        setIsShowingReshown(false);
      } else {
        console.error("discover error:", await res.text());
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoadingRef.current = false;
      setIsDiscoverLoading(false);
    }
  }, []); // No dependencies - use ref for loading state


  const fetchMyProjects = useCallback(async () => {
    if (!currentUser) return;
    try {
      const r = await fetch(`${API_BASE}/projects/`);
      if (r.ok) {
        const all = await r.json();
        setMyProjects((all || []).filter(p => p.owner_id === currentUser.id));
      }
    } catch (error) {
      console.error("Error fetching my projects:", error);
    }
  }, [currentUser]);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser || isLoadingNotificationsRef.current) return; // Prevent multiple simultaneous calls
    
    isLoadingNotificationsRef.current = true;
    
    try {
      const token = localStorage.getItem('token');
      const r = await fetch(`${API_BASE}/chat/notifications/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.ok) {
        setNotifications(await r.json());
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      isLoadingNotificationsRef.current = false;
    }
  }, [currentUser]); // Only depend on currentUser

  const checkProfileCompletion = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const res = await fetch(`${API_BASE}/profile-setup/check-completion`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        return data.profile_completed;
      }
      return false;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  };

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        await fetchCurrentUser();
        
        // Check if profile is completed
        const isComplete = await checkProfileCompletion();
        if (isComplete) {
          setView("discover");
        } else {
          setView("profileSetup");
        }
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setIsLoading(true);
    try {
      // Generate username from email (before @ symbol)
      const username = email.split('@')[0];
      
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username,
          name, 
          email, 
          password
        })
      });
  
      if (res.ok) {
        alert("Registration successful! Let's set up your profile.");
        // Auto-login after successful registration
        await handleLogin(email, password);
        // Will redirect to profile setup in checkProfileCompletion
      } else {
        const msg = await res.text();
        console.error("register error:", msg);
        alert(`Registration failed: ${msg}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = async (project) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSelectedProject(project);
    
    // Clear message notifications for this project
    setMessageNotifications(prev => {
      const newNotifications = { ...prev };
      delete newNotifications[project.id];
      return newNotifications;
    });
    
    try {
      const res = await fetch(`${API_BASE}/chat/${project.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const messages = await res.json();
        setChatMessages(messages);
        
        // Determine who the other person is and fetch their details
        if (messages.length > 0) {
          // Find a message from someone other than current user
          const otherMessage = messages.find(msg => msg.from_user_id !== currentUser?.id);
          if (otherMessage) {
            try {
              const otherUserRes = await fetch(`${API_BASE}/users/${otherMessage.from_user_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (otherUserRes.ok) {
                const otherUserData = await otherUserRes.json();
                setOwnerUser(otherUserData);
              }
            } catch (error) {
              console.error("Error fetching other user:", error);
            }
          } else {
            // If no other messages, use project owner
            try {
              const ownerRes = await fetch(`${API_BASE}/users/${project.owner_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (ownerRes.ok) {
                const ownerData = await ownerRes.json();
                setOwnerUser(ownerData);
              }
            } catch (error) {
              console.error("Error fetching owner:", error);
            }
          }
        } else {
          // If no messages yet, use the project owner as the other person
          try {
            const ownerRes = await fetch(`${API_BASE}/users/${project.owner_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (ownerRes.ok) {
              const ownerData = await ownerRes.json();
              setOwnerUser(ownerData);
            }
          } catch (error) {
            console.error("Error fetching owner:", error);
          }
        }
        
        setView("chat");
        
        // Mark messages as read
        try {
          await fetch(`${API_BASE}/chat/${project.id}/mark-read`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      } else if (res.status === 403) {
        alert("You don't have permission to chat on this project. You need to like the project and be approved by the owner first.");
      } else {
        console.error("Failed to open chat:", await res.text());
        alert("Failed to open chat. Please try again.");
      }
    } catch (e) {
      console.error("chat open error:", e);
      alert("Error opening chat. Please try again.");
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !selectedProject) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: selectedProject.id,
          to_user_id: selectedProject.owner_id,
          content: chatInput.trim()
        })
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages((prev) => [...prev, msg]);
        setChatInput("");
        
        // Show notification for the recipient
        const recipientId = selectedProject.owner_id === currentUser.id 
          ? ownerUser?.id 
          : selectedProject.owner_id;
        
        if (recipientId) {
          setMessageNotifications(prev => ({
            ...prev,
            [selectedProject.id]: (prev[selectedProject.id] || 0) + 1
          }));
        }
        
        // Refresh notifications after sending message
        await fetchNotifications();
      } else if (res.status === 403) {
        alert("You don't have permission to send messages on this project.");
      } else {
        console.error("Failed to send message:", await res.text());
        alert("Failed to send message. Please try again.");
      }
    } catch (e) {
      console.error("send chat error:", e);
      alert("Error sending message. Please try again.");
    }
  };

  const viewProject = async (projectId) => {
    try {
      const r = await fetch(`${API_BASE}/projects/${projectId}`);
      if (r.ok) {
        const p = await r.json();
        setInspectedProject(p);
        setView("projectDetails");
      }
    } catch (err) { console.error(err); }
  };

  const viewOwner = async (ownerId) => {
    try {
      const r = await fetch(`${API_BASE}/users/${ownerId}`);
      if (r.ok) {
        const u = await r.json();
        setInspectedUser(u);
        setView("userDetails");
      }
    } catch (err) { console.error(err); }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem("token");
        setCurrentUser(null);
        return false;
      }
      const user = await res.json();
      setCurrentUser(user);
      return true;
    } catch { return false; }
  };
  
  useEffect(() => {
    (async () => {
      const ok = await fetchCurrentUser();
      if (ok) {
        // Check profile completion
        const isComplete = await checkProfileCompletion();
        if (isComplete) {
          setView("discover");
          fetchNextProject();
        } else {
          setView("profileSetup");
        }
        // fetchNotifications will be called by the other useEffect when currentUser is set
      } else {
        setView("login");
      }
    })();
  }, [fetchNextProject]); // Include fetchNextProject since it's now stable

  // Refresh notifications periodically
  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch notifications immediately when currentUser is set
    fetchNotifications();
    
    // Then set up the interval for periodic updates
    // Optimize: Poll every 30s instead of 10s, and only if tab is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications();
      }
    }, 30000); 
    
    return () => clearInterval(interval);
  }, [currentUser, fetchNotifications]);

  const fetchMatches = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/matching/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(matchesData);
        
        // Fetch liker user data for each match (the person who matched)
        const likerPromises = matchesData.map(async (match) => {
          try {
            const likerResponse = await fetch(`${API_BASE}/users/${match.liker_user_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (likerResponse.ok) {
              const likerData = await likerResponse.json();
              return { projectId: match.id, liker: likerData };
            }
          } catch (error) {
            console.error(`Error fetching liker for project ${match.id}:`, error);
          }
          return { projectId: match.id, liker: null };
        });
        
        const likerData = await Promise.all(likerPromises);
        const likerMap = {};
        likerData.forEach(({ projectId, liker }) => {
          likerMap[projectId] = liker;
        });
        setMatchOwners(likerMap); // Keep same state name for now to avoid breaking other code
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  }, []); // No dependencies since it only uses token from localStorage

  const fetchProjectLikes = useCallback(async () => {
    // This function is called when navigating to project likes view
    // The ProjectLikes component will handle its own data fetching
  }, []); // No dependencies since it only uses token from localStorage

  const handleSwipe = async (isLike, projectId = null) => {
    const targetId = projectId || (currentProject && currentProject.id);
    
    if (!targetId) {
      ("No current project to swipe on");
      return;
    }
    
    if (isSwiping) {
      ("Already swiping, please wait...");
      return;
    }
    
    (`Swiping ${isLike ? 'like' : 'pass'} on project ${targetId}`);
    setIsSwiping(true);
    
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      alert("Please log in to swipe on projects");
      setIsSwiping(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/matching/swipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: Number(targetId),
          is_like: Boolean(isLike),
        }),
      });
      
      (`Swipe response status: ${res.status}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        ("Swipe error response:", errorData);
        
        if (errorData.detail === "Already swiped on this project") {
          // If already swiped, just move to next project
          ("Project already swiped, moving to next...");
          // Pass excludeId to force backend to give us a different project
          await fetchNextProject(targetId);
          return;
        }
        console.error("swipe error:", errorData);
        alert(`Swipe failed: ${errorData.detail || 'Unknown error'}`);
        return;
      }
      
      const swipeResult = await res.json();
      ("Swipe successful:", swipeResult);
      
      // Show success message
      if (isLike) {
        ("✅ Project liked successfully!");
      } else {
        ("❌ Project passed successfully!");
      }
      
      // Move to next project after successful swipe
      ("Moving to next project after successful swipe...");
      // Pass excludeId to prevent Reshow of the same project
      await fetchNextProject(targetId);
      ("Next project fetched, current project:", currentProject);
    } catch (error) {
      console.error("Swipe request failed:", error);
      alert("Failed to swipe. Please check your connection and try again.");
    } finally {
      setIsSwiping(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setCurrentProject(null);
    setMatches([]);
    setView("login");
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/ai/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          query: query,
          filters: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setSearchSuggestions(data.suggestions || []);
      } else {
        console.error("Search failed:", await response.text());
        setSearchResults([]);
        setSearchSuggestions([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  };


  const handlePostProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    const toList = (s) => s.split(",").map(x=>x.trim()).filter(Boolean);
    const payload = {
      title: (postProject.title||"").trim(),
      summary: (postProject.summary||"").trim(),
      repo_url: (postProject.repo_url||"").trim() || null,
      languages: toList(postProject.languages||""),
      frameworks: toList(postProject.frameworks||""),
      project_type: (postProject.project_type||"Web Application").trim(),
      domains: toList(postProject.domains||""),
      skills: toList(postProject.skills||""),
      complexity: (postProject.complexity||"intermediate").trim(),
      roles: toList(postProject.roles||"")
    };
    try {
      const res = await fetch(`${API_BASE}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPostProject({ title:"", summary:"", repo_url:"", languages:"", frameworks:"", project_type:"", domains:"", skills:"", complexity:"intermediate", roles:"" });
        await fetchMyProjects();
        alert("Project posted! It will appear in Discover for others.");
      } else {
        console.error("post project error:", await res.text());
        alert("Failed to post project. Check console.");
      }
    } catch (e2) { console.error(e2); }
  };

  if (!currentUser) {
    return (
      <LandingPage 
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
      />
    );
  }

  // Show profile setup if not completed
  if (view === "profileSetup") {
    return (
      <ProfileSetup 
        onComplete={async () => {
          // Refresh user data and redirect to discover
          await fetchCurrentUser();
          setView("discover");
          fetchNextProject();
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans flex ${isDarkMode ? 'bg-[#0a0a0a] text-slate-50' : 'bg-gray-50 text-gray-900'}`}>
      <SideNav 
        currentView={view} 
        setView={(newView) => {
          setView(newView);
          // Handle view-specific logic
          if (newView === 'discover') {
            setIsDiscoverLoading(true);
            setTimeout(() => {
              fetchNextProject();
              setIsDiscoverLoading(false);
            }, 2000);
          } else if (newView === 'matches') {
            fetchMatches();
          } else if (newView === 'postProject' || newView === 'myProjects') {
            fetchMyProjects();
          } else if (newView === 'projectLikes') {
            fetchProjectLikes();
          }
        }}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className={`flex-1 md:ml-20 overflow-y-auto min-h-screen relative ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        {/* Top mobile header */}
        <div className={`md:hidden h-16 flex items-center justify-between px-6 border-b ${isDarkMode ? 'border-white/5 bg-[#0f0f11]' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>origin</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleLogout}
              className={`text-sm transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="pb-24 md:pb-0 p-6 flex justify-center">
        {view === "discover" && (
          <Discover 
            key={currentProject?.id || 'no-project'}
            projects={currentProject ? [currentProject] : []}
            onConnect={(project) => handleSwipe(true, project.id)}
            onLike={(project) => handleSwipe(true, project.id)}
            onSkip={(project) => handleSwipe(false, project.id)}
            isDarkMode={isDarkMode}
            isLoading={isDiscoverLoading}
          />
        )}

        {view === "jobs" && (
          <Jobs isDarkMode={isDarkMode} />
        )}

        {view === "matches" && (
          <div className="w-full max-w-6xl">
            <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Your Matches
            </h2>
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  // Group matches by liker_user_id
                  const groupedMatches = matches.reduce((acc, match) => {
                    const key = match.liker_user_id;
                    if (!acc[key]) {
                      acc[key] = {
                        likerUserId: key,
                        projects: []
                      };
                    }
                    acc[key].projects.push(match);
                    return acc;
                  }, {});

                  // Convert to array and render
                  return Object.values(groupedMatches).map((group) => {
                    // Calculate total notifications for all projects from this user
                    const totalNotifications = group.projects.reduce((sum, project) => {
                      const notification = notifications.find(n => n.project_id === project.id);
                      const messageNotification = messageNotifications[project.id] || 0;
                      return sum + (notification?.message_count || 0) + messageNotification;
                    }, 0);
                    
                    return (
                      <MatchCard 
                        key={group.likerUserId}
                        projects={group.projects}
                        onChat={openChat}
                        onViewProject={viewProject}
                        onViewOwner={viewOwner}
                        notificationCount={totalNotifications}
                        likerUser={matchOwners[group.projects[0].id]}
                        isDarkMode={isDarkMode}
                      />
                    );
                  });
                })()}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDarkMode ? 'text-zinc-400' : 'text-gray-700'}`}>
                <p className="text-xl">
                  No matches yet.
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                  Like projects and wait for project owners to approve your likes to start chatting!
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                  Once approved, you'll be able to chat about the project here.
                </p>
              </div>
            )}
          </div>
        )}

        {view === "chat" && selectedProject && (
          <ChatView 
            selectedProject={selectedProject}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSend={sendChat}
            onBack={() => setView("matches")}
            currentUser={currentUser}
            otherPerson={ownerUser}
          />
        )}

        {view === "projectDetails" && inspectedProject && (
          <ProjectDetails 
            project={inspectedProject}
            onBack={() => setView("matches")}
            ownerUser={ownerUser}
          />
        )}

        {view === "userDetails" && inspectedUser && (
          <UserDetails 
            user={inspectedUser}
            onBack={() => setView("matches")}
            isDarkMode={isDarkMode}
          />
        )}

        {view === "postProject" && (
          <PostProject 
            postProject={postProject}
            setPostProject={setPostProject}
            myProjects={myProjects}
            onSubmit={handlePostProject}
            onBack={() => setView("discover")}
            isDarkMode={isDarkMode}
          />
        )}

        {view === "profile" && (
          <ProfileView 
            currentUser={currentUser}
            onBack={() => setView("discover")}
            onEdit={() => setView("profileEdit")}
            isDarkMode={isDarkMode}
          />
        )}

        {view === "profileEdit" && (
          <ProfileEdit 
            currentUser={currentUser}
            onSave={(updatedUser) => {
              setCurrentUser(updatedUser);
              setView("profile");
            }}
            onBack={() => setView("profile")}
            isDarkMode={isDarkMode}
          />
        )}

        {view === "myProjects" && (
          <MyProjects 
            projects={myProjects}
            onRefresh={fetchMyProjects}
            onEdit={(project) => {
              setInspectedProject(project);
              setView("projectEdit");
            }}
            onDelete={fetchMyProjects}
            isDarkMode={isDarkMode}
          />
        )}

        {view === "projectLikes" && (
          <ProjectLikes 
            onBack={() => setView("discover")}
            onViewProfile={(userId) => {
              viewOwner(userId);
            }}
            onApproval={() => {
              fetchMatches(); // Refresh matches when approval happens
            }}
            isDarkMode={isDarkMode}
          />
        )}

        {view === "requirements" && (
          <RequirementsPage 
            onBack={() => setView("discover")}
            onGetRecommendations={(user, isMessage = false) => {
              if (isMessage) {
                // Find a project to message about
                const userProject = myProjects.find(p => p.owner_id === user.id);
                if (userProject) {
                  openChat(userProject);
                } else {
                  alert("No project found to message about");
                }
              } else {
                setInspectedUser(user);
                setView("userDetails");
              }
            }}
            isDarkMode={isDarkMode}
          />
        )}

        {view === "searchTalent" && (
          <TalentSearch 
            onBack={() => setView("discover")}
            isDarkMode={isDarkMode}
          />
        )}
        </div>
      </main>
      
      <BottomNav currentView={view} setView={setView} currentUser={currentUser} />
    </div>
  );
}

export default App;