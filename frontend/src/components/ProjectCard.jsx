import React from 'react';

export const ProjectCard = ({ project, ownerUser, onLike, onPass, isSwiping = false }) => (
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e7ecef]">
    <div className="text-xs text-[#8B8C89] mb-1">
      Project ID: <span className="font-mono">{project.id}</span>
      {typeof project.owner_id === "number" && (
        <span className="ml-2 flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center mr-1">
            {ownerUser?.avatar_url ? (
              <img 
                src={ownerUser.avatar_url} 
                alt={ownerUser.name}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-xs font-semibold">
                {ownerUser?.name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          Owner: <span className="font-mono">{ownerUser?.username || "user"} (#{project.owner_id})</span>
        </span>
      )}
    </div>

    <div className="flex justify-between items-center mb-6">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-[#274C77]">{project.title}</h2>
        {project.is_reshow && (
          <div className="flex items-center mt-1">
            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              🔄 Showing again
            </span>
          </div>
        )}
      </div>
      <span className="px-3 py-1 bg-[#274C77] text-white text-sm font-semibold rounded-full uppercase">
        {project.complexity}
      </span>
    </div>

    <p className="text-[#274C77] leading-relaxed mb-6">{project.summary}</p>

    {/* Owner Info Section */}
    {ownerUser && (
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
            {ownerUser.avatar_url ? (
              <img 
                src={ownerUser.avatar_url} 
                alt={ownerUser.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-lg font-semibold">
                {ownerUser.name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#274C77] text-lg">{ownerUser.name}</h4>
            <p className="text-sm text-[#8B8C89]">@{ownerUser.username}</p>
            {ownerUser.bio && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ownerUser.bio}</p>
            )}
          </div>
        </div>
        {ownerUser.skills && ownerUser.skills.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {ownerUser.skills.slice(0, 5).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-[#8B8C89] uppercase tracking-wide mb-2">
          Technologies
        </h4>
        <div className="flex flex-wrap gap-2">
          {project.languages?.map((lang, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-[#E7ECEF] text-[#274C77] text-sm rounded-full border border-[#A3CEF1]"
            >
              {lang}
            </span>
          ))}
          {project.frameworks?.map((fw, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-[#A3CEF1] text-white text-sm rounded-full border border-[#6096BA]"
            >
              {fw}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#8B8C89] uppercase tracking-wide mb-2">
          Skills Needed
        </h4>
        <div className="flex flex-wrap gap-2">
          {project.skills?.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-[#E7ECEF] text-[#274C77] text-sm rounded-full border border-[#A3CEF1]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#8B8C89] uppercase tracking-wide mb-2">
          Roles
        </h4>
        <div className="flex flex-wrap gap-2">
          {project.roles?.map((role, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-[#E7ECEF] text-[#274C77] text-sm rounded-full border border-[#A3CEF1]"
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="flex gap-4 mt-6">
      <button
        className={`flex-1 py-4 px-6 font-bold rounded-2xl transition-all duration-200 transform hover:scale-105 border-2 ${
          isSwiping 
            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400'
        }`}
        onClick={onPass}
        disabled={isSwiping}
      >
        {isSwiping ? '⏳' : '✕'} PASS
      </button>
      <button
        className={`flex-1 py-4 px-6 font-bold rounded-2xl transition-all duration-200 transform hover:scale-105 ${
          isSwiping 
            ? 'bg-red-300 text-red-100 cursor-not-allowed' 
            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
        }`}
        onClick={onLike}
        disabled={isSwiping}
      >
        {isSwiping ? '⏳' : '♥'} LIKE
      </button>
    </div>
  </div>
);
