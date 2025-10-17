import React, { useState, useEffect } from 'react';

export const ProjectLikes = ({ onBack, onViewProfile, onApproval }) => {
  const [likes, setLikes] = useState([]);
  const [likerProfiles, setLikerProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchLikes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/matching/my-projects/likes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikes(data);
        
        // Fetch profiles for each liker
        const profilePromises = data.map(async (like) => {
          try {
            const profileResponse = await fetch(`http://localhost:8000/users/${like.liked_by_user_id}`, {
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
      const response = await fetch('http://localhost:8000/matching/approve', {
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

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mt-6">
        <div className="text-center">Loading likes...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Likes</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
        >
          Back
        </button>
      </div>

      {likes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg">No one has liked your projects yet.</p>
          <p className="text-sm">Keep creating great projects!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {likes.map((like) => {
            const likerProfile = likerProfiles[like.liked_by_user_id];
            return (
              <div key={`${like.id}-${like.liked_by_user_id}`} className="border border-gray-200 rounded-lg p-6">
                {/* Project Information */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{like.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{like.summary}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {like.languages?.map((lang, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {lang}
                      </span>
                    ))}
                    {like.frameworks?.map((fw, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Liker Profile Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      {likerProfile?.avatar_url ? (
                        <img 
                          src={likerProfile.avatar_url} 
                          alt={likerProfile.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {likerProfile?.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {likerProfile?.name || 'Loading...'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        @{likerProfile?.username || 'loading...'}
                      </p>
                    </div>
                  </div>
                  
                  {likerProfile?.bio && (
                    <p className="text-sm text-gray-600 mb-3">{likerProfile.bio}</p>
                  )}
                  
                  {likerProfile?.skills && likerProfile.skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {likerProfile.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    💙 Liked your project and wants to collaborate!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onViewProfile(like.liked_by_user_id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View Full Profile
                  </button>
                  <button
                    onClick={() => handleApprove(like.id, like.liked_by_user_id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Approve & Start Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
