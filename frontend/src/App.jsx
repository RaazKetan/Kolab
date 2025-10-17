import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthForm } from './components/Authform';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
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
  const isLoadingRef = useRef(false);
  const isLoadingNotificationsRef = useRef(false);


  const fetchNextProject = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || isLoadingRef.current) return; // Prevent multiple simultaneous calls
    
    isLoadingRef.current = true;
    
    try {
      const res = await fetch(`${API_BASE}/matching/discover`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
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
        setView("discover");
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
          password,
          skills: [] // Default empty skills, user can update later
        })
      });
  
      if (res.ok) {
        alert("Registration successful! Welcome to Skill Link!");
        // Auto-login after successful registration
        await handleLogin(email, password);
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
        setView("discover");
        fetchNextProject();
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
    const interval = setInterval(fetchNotifications, 10000); // Every 10 seconds
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
        
        // Fetch owner data for each match
        const ownerPromises = matchesData.map(async (project) => {
          try {
            const ownerResponse = await fetch(`${API_BASE}/users/${project.owner_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (ownerResponse.ok) {
              const ownerData = await ownerResponse.json();
              return { projectId: project.id, owner: ownerData };
            }
          } catch (error) {
            console.error(`Error fetching owner for project ${project.id}:`, error);
          }
          return { projectId: project.id, owner: null };
        });
        
        const ownerData = await Promise.all(ownerPromises);
        const ownerMap = {};
        ownerData.forEach(({ projectId, owner }) => {
          ownerMap[projectId] = owner;
        });
        setMatchOwners(ownerMap);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  }, []); // No dependencies since it only uses token from localStorage

  const fetchProjectLikes = useCallback(async () => {
    // This function is called when navigating to project likes view
    // The ProjectLikes component will handle its own data fetching
  }, []); // No dependencies since it only uses token from localStorage

  const handleSwipe = async (isLike) => {
    if (!currentProject || currentProject.id == null) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/matching/swipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project_id: Number(currentProject.id),
        is_like: Boolean(isLike),
      }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      if (errorData.detail === "Already swiped on this project") {
        // If already swiped, just move to next project
        console.log("Project already swiped, moving to next...");
        await fetchNextProject();
        return;
      }
      console.error("swipe error:", errorData);
      return;
    }
    await fetchNextProject();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        setView={setView} 
      />

      <Navigation 
        view={view} 
        setView={setView} 
        matchesCount={matches.length}
        notificationsCount={notifications.length}
        currentUser={currentUser}
        onProfileEdit={() => setView("profileEdit")}
        onDiscover={() => {
          setView("discover");
          fetchNextProject();
        }}
        onMatches={() => {
          setView("matches");
          fetchMatches();
        }}
        onPostProject={() => {
          setView("postProject");
          fetchMyProjects();
        }}
        onMyProjects={() => {
          setView("myProjects");
          fetchMyProjects();
        }}
        onProjectLikes={() => {
          setView("projectLikes");
          fetchProjectLikes();
        }}
        onRequirements={() => {
          setView("requirements");
        }}
      />

      <main className="p-6 flex justify-center">
        {view === "discover" && (
          <div className="w-full max-w-lg">
            {/* Intelligent Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects... (e.g., 'React beginner projects', 'AI mobile apps')"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              
              {/* Search Suggestions */}
              {searchSuggestions.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">💡 Search Tips:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {searchSuggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Search Results</h3>
                  <div className="space-y-3">
                    {searchResults.map((result, index) => (
                      <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h4 className="font-medium text-gray-800">{result.title || 'Project'}</h4>
                        <p className="text-sm text-gray-600 mt-1">{result.description || result.summary}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.technologies?.map((tech, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isShowingReshown && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">🔄</span>
                  <p className="text-sm text-yellow-800">
                    You've seen all new projects! Showing projects you passed earlier.
                  </p>
                </div>
              </div>
            )}
            {currentProject ? (
              <ProjectCard 
                project={currentProject}
                ownerUser={ownerUser}
                onLike={() => handleSwipe(true)}
                onPass={() => handleSwipe(false)}
              />
            ) : (
              <div className="text-center text-gray-700 py-12">
                <h2 className="text-3xl font-bold mb-4">
                  No more projects to discover!
                </h2>
                <p className="text-xl text-gray-600">
                  Check back later for new projects or create your own.
                </p>
              </div>
            )}
          </div>
        )}

        {view === "matches" && (
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Your Matches
            </h2>
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((project) => {
                  const notification = notifications.find(n => n.project_id === project.id);
                  const messageNotification = messageNotifications[project.id] || 0;
                  const totalNotifications = (notification?.message_count || 0) + messageNotification;
                  
                  return (
                    <MatchCard 
                      key={project.id}
                      project={project}
                      onChat={openChat}
                      onViewProject={viewProject}
                      onViewOwner={viewOwner}
                      notificationCount={totalNotifications}
                      ownerUser={matchOwners[project.id]}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-700 py-12">
                <p className="text-xl">
                  No matches yet.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Like projects and wait for project owners to approve your likes to start chatting!
                </p>
                <p className="text-sm text-gray-400 mt-1">
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
          />
        )}

        {view === "postProject" && (
          <PostProject 
            postProject={postProject}
            setPostProject={setPostProject}
            myProjects={myProjects}
            onSubmit={handlePostProject}
            onBack={() => setView("discover")}
          />
        )}

        {view === "profile" && (
          <ProfileView 
            currentUser={currentUser}
            onBack={() => setView("discover")}
            onEdit={() => setView("profileEdit")}
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
          />
        )}
      </main>
    </div>
  );
}

export default App; 