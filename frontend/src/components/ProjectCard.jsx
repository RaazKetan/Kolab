import React from 'react';

export const ProjectCard = ({ project, ownerUser, onLike, onPass }) => (
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#e7ecef]">
    <div className="text-xs text-[#8B8C89] mb-1">
      Project ID: <span className="font-mono">{project.id}</span>
      {typeof project.owner_id === "number" && (
        <span className="ml-2">
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
        className="flex-1 py-3 px-6 bg-green-100 hover:bg-green-300 text-green-800 font-semibold rounded-2xl transition-colors"
        onClick={onPass}
      >
        ✕ Pass
      </button>
      <button
        className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-2xl transition-colors"
        onClick={onLike}
      >
        ♥ Like
      </button>
    </div>
  </div>
);
