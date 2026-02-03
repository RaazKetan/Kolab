import React, { useState, useEffect } from 'react';
import { Heart, User, CheckCircle2, MessageCircle, X } from 'lucide-react';

export const ProjectLikes = ({ onBack, onViewProfile, onApproval, isDarkMode = true }) => {
  const [likes, setLikes] = useState([]);
  const [likerProfiles, setLikerProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchLikes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/matching/my-projects/likes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikes(data);
        
        // Fetch profiles for each liker
        const profilePromises = data.map(async (like) => {
          try {
            const profileResponse = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/users/${like.liked_by_user_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              return { userId: like.liked_by_user_id, profile };
            }
          } catch (error) {
            console.error(`Error fetching profile for user ${like.liked_by_user_id}:`, error);
          }
          return null;
        });
        
        const profiles = await Promise.all(profilePromises);
        const profileMap = {};
        profiles.forEach(profileData => {
          if (profileData) {
            profileMap[profileData.userId] = profileData.profile;
          }
        });
        setLikerProfiles(profileMap);
      } else {
        console.error('Failed to fetch likes');
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId, likerUserId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/matching/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: projectId,
          liker_user_id: likerUserId
        })
      });

      if (response.ok) {
        alert('Like approved! You can now chat about this project.');
        fetchLikes(); // Refresh the list
        if (onApproval) {
          onApproval(); // Notify parent to refresh matches
        }
      } else {
        alert('Failed to approve like');
      }
    } catch (error) {
      console.error('Error approving like:', error);
      alert('Error approving like');
    }
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  const cardClass = `rounded-2xl border p-6 transition-all ${
    isDarkMode 
      ? 'bg-[#18181b]/40 border-white/5 hover:border-purple-500/30' 
      : 'bg-white border-gray-200 hover:border-purple-200 shadow-sm'
  }`;

  if (loading) {
    return (
      <div className={`w-full max-w-4xl mx-auto rounded-3xl p-12 mt-6 flex items-center justify-center ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
        <span className="ml-3 font-medium">Loading likes...</span>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-5xl mx-auto rounded-3xl p-8 shadow-lg backdrop-blur-xl border mt-6 ${
       isDarkMode ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          Project Likes
          <span className={`text-sm py-1 px-3 rounded-full font-normal ${
            isDarkMode ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-100 text-pink-600'
          }`}>
            {likes.length}
          </span>
        </h2>
        <button
          onClick={onBack}
          className={`px-4 py-2 rounded-xl transition-colors ${
            isDarkMode 
              ? 'bg-white/5 hover:bg-white/10 text-white border border-white/5' 
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          ← Back
        </button>
      </div>

      {likes.length === 0 ? (
        <div className={`text-center py-20 rounded-2xl border border-dashed flex flex-col items-center justify-center ${
           isDarkMode ? 'border-zinc-800' : 'border-gray-200'
        }`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse ${
             isDarkMode ? 'bg-pink-500/10' : 'bg-pink-50'
          }`}>
             <Heart className="w-10 h-10 text-pink-500/50" />
          </div>
          <p className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No likes yet</p>
          <p className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>When someone likes your project, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {likes.map((like) => {
            const likerProfile = likerProfiles[like.liked_by_user_id];
            return (
              <div key={`${like.id}-${like.liked_by_user_id}`} className={cardClass}>
                <div className="grid md:grid-cols-2 gap-8">
                   {/* Project Info */}
                   <div>
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Project</h3>
                      <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{like.title}</h4>
                      <p className={`text-sm line-clamp-2 mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{like.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {like.languages?.slice(0,3).map((lang, idx) => (
                           <span key={idx} className={`px-2 py-1 text-xs rounded border ${
                              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-gray-100 border-gray-200 text-gray-600'
                           }`}>
                              {lang}
                           </span>
                        ))}
                      </div>
                   </div>

                   {/* Liker Profile */}
                   <div>
                      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Interested Talent</h3>
                      <div className={`rounded-xl p-4 flex gap-4 ${
                         isDarkMode ? 'bg-zinc-900/50' : 'bg-gray-50'
                      }`}>
                         <div className="flex-shrink-0">
                           {likerProfile?.avatar_url ? (
                              <img src={likerProfile.avatar_url} alt={likerProfile.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10" />
                           ) : (
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                 isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-600'
                              }`}>
                                 {likerProfile?.name?.charAt(0) || '?'}
                              </div>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                               {likerProfile?.name || 'Loading...'}
                            </h4>
                             <p className={`text-xs mb-2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                                @{likerProfile?.username || 'loading...'}
                             </p>
                             <p className={`text-sm line-clamp-2 mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                                {likerProfile?.bio || "No bio available"}
                             </p>
                             
                             <div className="flex gap-2">
                                <button
                                   onClick={() => onViewProfile(like.liked_by_user_id)}
                                   className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                      isDarkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                   }`}
                                >
                                   View Profile
                                </button>
                                <button
                                   onClick={() => handleApprove(like.id, like.liked_by_user_id)}
                                   className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                                >
                                   Accept
                                </button>
                             </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
