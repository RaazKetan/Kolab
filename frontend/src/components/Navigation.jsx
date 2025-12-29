import React from 'react';

export const Navigation = ({
  view,
  matchesCount,
  notificationsCount,
  onDiscover,
  onMatches,
  onPostProject,
  onMyProjects,
  onProjectLikes,
  onRequirements,
  onSearchTalent,
  currentUser,
  onProfileEdit
}) => (
  <nav className="bg-[#e7ecef] px-6 py-4 border-b border-[#8b8c89]/30 shadow-sm">
    {/* Profile Completion Prompt */}
    {currentUser && (!currentUser.skills || currentUser.skills.length === 0) && (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-sm text-blue-700">
          💡 <strong>Complete your profile</strong> to get better project matches! 
          <button 
            onClick={onProfileEdit}
            className="ml-2 text-blue-600 underline hover:text-blue-800"
          >
            Add your skills
          </button>
        </p>
      </div>
    )}
    
    <div className="flex justify-center gap-4 flex-wrap">
      {[
        { name: "Discover", key: "discover", onClick: onDiscover },
        { name: `Matches (${matchesCount})`, key: "matches", onClick: onMatches },
        { name: "Post Project", key: "postProject", onClick: onPostProject },
        { name: "My Projects", key: "myProjects", onClick: onMyProjects },
        { name: "Project Likes", key: "projectLikes", onClick: onProjectLikes },
        { name: "Find Collaborators", key: "requirements", onClick: onRequirements },
        { name: "Search Talent", key: "searchTalent", onClick: onSearchTalent }
      ].map((item) => (
        <button
          key={item.key}
          onClick={item.onClick}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border ${
            view === item.key
              ? "bg-[#274c77] text-white border-[#274c77]"
              : "bg-white text-[#274c77] border-[#8b8c89]/30 hover:bg-[#a3cef1]/60 hover:border-[#6096ba]"
          }`}
        >
          {item.name}
          {item.key === "matches" && notificationsCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {notificationsCount}
            </span>
          )}
        </button>
      ))}
    </div>
  </nav>
);
