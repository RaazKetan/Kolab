import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [matches, setMatches] = useState([]);
  const [view, setView] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    name: '', 
    email: '', 
    password: '', 
    skills: '', 
    bio: '' 
  });

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        await fetchCurrentUser();
        setView('discover');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Register function
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = registerData.skills.split(',').map(s => s.trim()).filter(s => s);
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registerData,
          skills: skillsArray
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Registration successful! Please login.');
        setView('login');
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Fetch next project to discover
  const fetchNextProject = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/matching/discover`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const project = await response.json();
        setCurrentProject(project);
      } else if (response.status === 404) {
        setCurrentProject(null);
        alert('No more projects to discover!');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  // Fetch matches
  const fetchMatches = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE}/matching/matches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(matchesData);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  // Swipe function
  const handleSwipe = async (isLike) => {
    if (!currentProject) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/matching/swipe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: currentProject.id,
          is_like: isLike
        })
      });
      
      if (response.ok) {
        await fetchNextProject();
      }
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentProject(null);
    setMatches([]);
    setView('login');
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser().then(() => {
        setView('discover');
        fetchNextProject();
      });
    }
  }, []);

  // Login/Register Form
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">CollabFoundry</h1>
            <p className="text-xl text-purple-100">Connect with developers and discover amazing projects</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex mb-6 bg-white/10 rounded-xl p-1">
              <button 
                className={`flex-1 py-3 px-6 rounded-lg transition-all duration-300 ${
                  view === 'login' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setView('login')}
              >
                Login
              </button>
              <button 
                className={`flex-1 py-3 px-6 rounded-lg transition-all duration-300 ${
                  view === 'register' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setView('register')}
              >
                Register
              </button>
            </div>

            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Login
                </button>
                <p className="text-center text-white/80 text-sm mt-4">
                  Demo credentials:<br/>
                  alex@example.com / password123<br/>
                  sarah@example.com / password123
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <input
                  type="text"
                  placeholder="Skills (comma separated)"
                  value={registerData.skills}
                  onChange={(e) => setRegisterData({...registerData, skills: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
                <textarea
                  placeholder="Bio"
                  value={registerData.bio}
                  onChange={(e) => setRegisterData({...registerData, bio: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 h-20 resize-none"
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">CollabFoundry</h1>
          <div className="flex items-center gap-4 text-white">
            <span>Welcome, {currentUser?.name}</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white/5 backdrop-blur-sm px-6 py-4">
        <div className="flex justify-center gap-8">
          <button 
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              view === 'discover' 
                ? 'bg-white/20 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => {
              setView('discover');
              fetchNextProject();
            }}
          >
            Discover
          </button>
          <button 
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              view === 'matches' 
                ? 'bg-white/20 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => {
              setView('matches');
              fetchMatches();
            }}
          >
            Matches ({matches.length})
          </button>
        </div>
      </nav>

      <main className="p-6 flex justify-center">
        {view === 'discover' && (
          <div className="w-full max-w-lg">
            {currentProject ? (
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{currentProject.title}</h2>
                  <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-semibold rounded-full uppercase">
                    {currentProject.complexity}
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed mb-6">{currentProject.summary}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.languages?.map((lang, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {lang}
                          </span>
                        ))}
                        {currentProject.frameworks?.map((fw, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Skills Needed</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.skills?.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Roles</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.roles?.map((role, i) => (
                          <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleSwipe(false)}
                  >
                    ✕ Pass
                  </button>
                  <button 
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => handleSwipe(true)}
                  >
                    ♥ Like
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-white py-12">
                <h2 className="text-3xl font-bold mb-4">No more projects to discover!</h2>
                <p className="text-xl text-purple-100">Check back later for new projects or create your own.</p>
              </div>
            )}
          </div>
        )}

        {view === 'matches' && (
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Your Matches</h2>
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((project) => (
                  <div key={project.id} className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{project.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.languages?.map((lang, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white py-12">
                <p className="text-xl">No matches yet. Start swiping to find projects you like!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;