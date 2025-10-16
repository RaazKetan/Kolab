import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000";

function App() {
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
  const fetchMyProjects = async () => {
    try {
      const r = await fetch(`${API_BASE}/projects/`);
      if (r.ok) {
        const all = await r.json();
        setMyProjects((all || []).filter(p => p.owner_id === currentUser?.id));
      }
    } catch (_) {}
  };
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    skills: "",
    bio: "",
  });

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
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
    }
  };

  // Open chat for a matched project
  const openChat = async (project) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSelectedProject(project);
    try {
      const res = await fetch(`${API_BASE}/chat/${project.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setChatMessages(await res.json());
      setView("chat");
    } catch (e) {
      console.error("chat open error:", e);
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
      }
    } catch (e) {
      console.error("send chat error:", e);
    }
  };

  // View helpers
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

  // Register function
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = registerData.skills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...registerData, skills: skillsArray })
      });
  
      if (res.ok) {
        alert("Registration successful! Please login.");
        setView("login"); // switch back to login
      } else {
        const msg = await res.text();
        console.error("register error:", msg);
        alert(`Registration failed: ${msg}`);
        // keep user on auth screen
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Check console for details.");
    }
  };

  // Fetch current user
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
  
  // on mount, show login unless auth passes
  useEffect(() => {
    (async () => {
      const ok = await fetchCurrentUser();
      if (ok) {
        setView("discover");
        fetchNextProject();
      } else {
        setView("login");
      }
    })();
  }, []);

  // Fetch next project to discover
  const fetchNextProject = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/matching/discover`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json(); // object, not array
        setCurrentProject(data);
        try {
          if (data && typeof data.owner_id === "number") {
            const u = await fetch(`${API_BASE}/users/${data.owner_id}`);
            if (u.ok) setOwnerUser(await u.json()); else setOwnerUser(null);
          } else {
            setOwnerUser(null);
          }
        } catch (_) { setOwnerUser(null); }
      } else if (res.status === 404) {
        setCurrentProject(null);
      } else {
        console.error("discover error:", await res.text());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch matches
  const fetchMatches = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/matching/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(matchesData);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  // Swipe function
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
      console.error("swipe error:", await res.text());
      return;
    }
    await fetchNextProject();
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setCurrentProject(null);
    setMatches([]);
    setView("login");
  };

  // (removed duplicate initial effect)

  // Login/Register Form
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
              CollabFoundry
            </h1>
            <p className="text-xl text-purple-100">
              Connect with developers and discover amazing projects
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex mb-6 bg-white/10 rounded-xl p-1">
              <button
                className={`flex-1 py-3 px-6 rounded-lg transition-all duration-300 ${
                  view === "login"
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setView("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-3 px-6 rounded-lg transition-all duration-300 ${
                  view === "register"
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setView("register")}
              >
                Register
              </button>
            </div>

            {view === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <button
                  type="submit"
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Login
                </button>
                <p className="text-center text-white/80 text-sm mt-4">
                  Demo credentials:
                  <br />
                  alex@example.com / password123
                  <br />
                  sarah@example.com / password123
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={registerData.username}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="text"
                  placeholder="Skills (comma separated)"
                  value={registerData.skills}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, skills: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <textarea
                  placeholder="Bio"
                  value={registerData.bio}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, bio: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 h-20 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">CollabFoundry</h1>
          <div className="flex items-center gap-4 text-white">
            <button
              onClick={() => setView("profile")}
              className="underline decoration-white/50 hover:decoration-white"
              title="View Profile"
            >
              {currentUser?.name}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {currentUser && (
        <nav className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex justify-center gap-8">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              view === "discover"
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setView("discover");
              fetchNextProject();
            }}
          >
            Discover
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              view === "matches"
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setView("matches");
              fetchMatches();
            }}
          >
            Matches ({matches.length})
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              view === "postProject"
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              setView("postProject");
              fetchMyProjects();
            }}
          >
            Post Project
          </button>
        </div>
        </nav>
        )}

{currentUser && (
<main className="p-6 flex justify-center">
        {view === "discover" && (
          <div className="w-full max-w-lg">
            {currentProject ? (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">
                  Project ID: <span className="font-mono">{currentProject.id}</span>
                  {typeof currentProject.owner_id === "number" && (
                    <span className="ml-2">Owner: <span className="font-mono">{ownerUser?.username || "user"} (#{currentProject.owner_id})</span></span>
                  )}
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentProject.title}
                  </h2>
                  <span className="px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded-full uppercase">
                    {currentProject.complexity}
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {currentProject.summary}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.languages?.map((lang, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                        {currentProject.frameworks?.map((fw, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                          >
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Skills Needed
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.skills?.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Roles
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.roles?.map((role, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl"
                    onClick={() => handleSwipe(false)}
                  >
                    ✕ Pass
                  </button>
                  <button
                    className="flex-1 py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl"
                    onClick={() => handleSwipe(true)}
                  >
                    ♥ Like
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-white py-12">
                <h2 className="text-3xl font-bold mb-4">
                  No more projects to discover!
                </h2>
                <p className="text-xl text-purple-100">
                  Check back later for new projects or create your own.
                </p>
              </div>
            )}
          </div>
        )}

        {view === "matches" && (
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Your Matches
            </h2>
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition"
                    role="button"
                    onClick={() => openChat(project)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {project.title}
                      </h3>
                      <span className="text-xs text-gray-500 font-mono">ID: {project.id}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {project.summary}
                    </p>
                    <div className="text-xs text-gray-500 mb-2">
                      Owner: <span className="font-mono">{project.owner_id}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.languages?.map((lang, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        onClick={(e) => { e.stopPropagation(); openChat(project); }}
                      >Chat</button>
                      <button
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        onClick={(e) => { e.stopPropagation(); viewProject(project.id); }}
                      >View Project</button>
                      <button
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                        onClick={(e) => { e.stopPropagation(); viewOwner(project.owner_id); }}
                      >View Owner</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white py-12">
                <p className="text-xl">
                  No matches yet. Start swiping to find projects you like!
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      )}
      {view === "chat" && selectedProject && (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Chat - {selectedProject.title}</h2>
              <div className="text-xs text-gray-500">
                Project ID: <span className="font-mono">{selectedProject.id}</span> · Owner: <span className="font-mono">{selectedProject.owner_id}</span>
              </div>
            </div>
            <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg" onClick={()=>setView("matches")}>
              Back
            </button>
          </div>
          <div className="border border-gray-200 rounded p-3 h-72 overflow-y-auto bg-white">
            {chatMessages.length === 0 ? (
              <div className="text-gray-500 text-sm">No messages yet.</div>
            ) : (
              chatMessages.map((m) => (
                <div key={m.id} className="mb-2">
                  <div className="text-xs text-gray-500">from: <span className="font-mono">{m.from_user_id}</span> → to: <span className="font-mono">{m.to_user_id}</span></div>
                  <div className="text-gray-800">{m.content}</div>
                </div>
              ))
            )}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e)=>{e.preventDefault(); sendChat();}}>
            <input className="flex-1 px-3 py-2 border border-gray-300 rounded" placeholder="Type a message..." value={chatInput} onChange={(e)=>setChatInput(e.target.value)} />
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Send</button>
          </form>
        </div>
      )}

      {view === "projectDetails" && inspectedProject && (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Project #{inspectedProject.id} — {inspectedProject.title}</h2>
            <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg" onClick={()=>setView("matches")}>
              Back
            </button>
          </div>
          <div className="text-gray-700 mb-4">{inspectedProject.summary}</div>
          <div className="text-xs text-gray-500 mb-3">Owner: <span className="font-mono">{inspectedProject.owner_id}</span></div>
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {(inspectedProject.languages||[]).map((x,i)=>(<span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{x}</span>))}
              {(inspectedProject.frameworks||[]).map((x,i)=>(<span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">{x}</span>))}
            </div>
          </div>
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {(inspectedProject.skills||[]).map((x,i)=>(<span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{x}</span>))}
            </div>
          </div>
          <div className="text-sm text-gray-600">Complexity: {inspectedProject.complexity} · Type: {inspectedProject.project_type}</div>
        </div>
      )}

      {view === "userDetails" && inspectedUser && (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">User #{inspectedUser.id} — {inspectedUser.name}</h2>
            <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg" onClick={()=>setView("matches")}>
              Back
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-gray-700">
              <div><span className="font-medium">Username:</span> {inspectedUser.username}</div>
              <div><span className="font-medium">Email:</span> {inspectedUser.email}</div>
              {inspectedUser.org_type && (
                <div><span className="font-medium">Affiliation:</span> {inspectedUser.org_type}{inspectedUser.org_name?` · ${inspectedUser.org_name}`:""}</div>
              )}
            </div>
            <div className="text-gray-700">
              <div className="mb-2"><span className="font-medium">Skills:</span></div>
              <div className="flex flex-wrap gap-2">
                {(inspectedUser.skills||[]).map((x,i)=>(<span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{x}</span>))}
              </div>
            </div>
          </div>
        </div>
      )}
      {view === "postProject" && currentUser && (
        <div className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Post a Project</h2>
            <button
              onClick={() => setView("discover")}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
            >
              Back
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">GitHub Repo URL (optional)</label>
              <input
                className="w-full px-3 py-2 border rounded"
                placeholder="https://github.com/owner/repo"
                value={postProject.repo_url}
                onChange={(e)=>setPostProject({...postProject, repo_url:e.target.value})}
              />
            </div>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={async ()=>{
                const url = (postProject.repo_url||"").trim();
                if (!url) return;
                try {
                  const res = await fetch(`${API_BASE}/repo/project/analyze`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ repo_url: url })
                  });
                  if (res.ok) {
                    const ai = await res.json();
                    setPostProject({
                      ...postProject,
                      title: ai.title || postProject.title,
                      summary: ai.summary || postProject.summary,
                      languages: (ai.languages||[]).join(", "),
                      frameworks: (ai.frameworks||[]).join(", "),
                      project_type: ai.project_type || postProject.project_type,
                      domains: (ai.domains||[]).join(", "),
                      skills: (ai.skills||[]).join(", "),
                      complexity: ai.complexity || postProject.complexity,
                      roles: (ai.roles||[]).join(", ")
                    });
                  }
                } catch (err) { console.error(err); }
              }}
            >Analyze Repo</button>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={async (e) => {
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
            }}
          >
            <input className="px-3 py-2 border rounded" placeholder="Title"
              value={postProject.title} onChange={(e)=>setPostProject({...postProject, title:e.target.value})} required />
            <input className="px-3 py-2 border rounded" placeholder="Project Type (e.g., Web Application)"
              value={postProject.project_type} onChange={(e)=>setPostProject({...postProject, project_type:e.target.value})} />
            <textarea className="px-3 py-2 border rounded md:col-span-2" placeholder="Summary"
              value={postProject.summary} onChange={(e)=>setPostProject({...postProject, summary:e.target.value})} required />
            <input className="px-3 py-2 border rounded" placeholder="Languages (comma separated)"
              value={postProject.languages} onChange={(e)=>setPostProject({...postProject, languages:e.target.value})} />
            <input className="px-3 py-2 border rounded" placeholder="Frameworks (comma separated)"
              value={postProject.frameworks} onChange={(e)=>setPostProject({...postProject, frameworks:e.target.value})} />
            <input className="px-3 py-2 border rounded" placeholder="Domains (comma separated)"
              value={postProject.domains} onChange={(e)=>setPostProject({...postProject, domains:e.target.value})} />
            <input className="px-3 py-2 border rounded" placeholder="Skills Needed (comma separated)"
              value={postProject.skills} onChange={(e)=>setPostProject({...postProject, skills:e.target.value})} />
            <input className="px-3 py-2 border rounded" placeholder="Complexity (beginner/intermediate/advanced)"
              value={postProject.complexity} onChange={(e)=>setPostProject({...postProject, complexity:e.target.value})} />
            <input className="px-3 py-2 border rounded" placeholder="Roles (comma separated)"
              value={postProject.roles} onChange={(e)=>setPostProject({...postProject, roles:e.target.value})} />
            <div className="md:col-span-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Post Project
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">My Projects</h3>
            {myProjects.length === 0 ? (
              <div className="text-gray-600">No projects yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {myProjects.map(p => (
                  <div key={p.id} className="bg-white/95 rounded-xl p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-800">{p.title}</div>
                      <span className="text-xs text-gray-500 font-mono">ID: {p.id}</span>
                    </div>
                    <div className="text-gray-600 text-sm mt-1">{p.summary}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {view === "profile" && currentUser && (
  <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
      <button
        onClick={() => setView("discover")}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
      >
        Back
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Basic Info
        </h4>
        <div className="space-y-1 text-gray-700">
          <p><span className="font-medium">Name:</span> {currentUser.name}</p>
          <p><span className="font-medium">Username:</span> {currentUser.username}</p>
          <p><span className="font-medium">Email:</span> {currentUser.email}</p>
          {currentUser.org_type && (
            <p><span className="font-medium">Affiliation:</span> {currentUser.org_type} {currentUser.org_name ? `· ${currentUser.org_name}` : ""}</p>
          )}
          {currentUser.github_profile_url && (
            <p>
              <span className="font-medium">GitHub:</span>{" "}
              <a className="text-blue-600 underline" href={currentUser.github_profile_url} target="_blank" rel="noreferrer">
                {currentUser.github_profile_url}
              </a>
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Bio
        </h4>
        <p className="text-gray-700 leading-relaxed">{currentUser.bio || "—"}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {(currentUser.skills || []).map((s, i) => (
            <span key={i} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">{s}</span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Languages · Frameworks
        </h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {(currentUser.top_languages || []).map((l, i) => (
            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{l}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(currentUser.top_frameworks || []).map((f, i) => (
            <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">{f}</span>
          ))}
        </div>
      </div>

      {Array.isArray(currentUser.github_selected_repos) && currentUser.github_selected_repos.length > 0 && (
        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Selected Repositories
          </h4>
          <ul className="list-disc list-inside text-blue-700">
            {currentUser.github_selected_repos.map((r, i) => (
              <li key={i}>
                <a className="underline" href={(r && r.url) || r} target="_blank" rel="noreferrer">
                  {(r && r.url) || String(r)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
}

export default App;
