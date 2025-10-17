import React from "react";

export const Header = ({ currentUser, onLogout, setView }) => (
  <header className="bg-[#E7ECEF] border-b border-[#A3CEF1] px-6 py-4 shadow-sm">
    <div className="flex justify-between items-center">
      {/* Brand Name */}
      <h1 className="text-2xl font-bold text-[#274C77] tracking-tight">
        Skill Link
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {currentUser && (
          <button
            onClick={() => setView("profile")}
            className="text-[#274C77] hover:text-[#6096BA] font-medium transition-colors"
            title="View Profile"
          >
            {currentUser.name}
          </button>
        )}
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-[#274C77] text-white font-medium rounded-lg hover:bg-[#6096BA] transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
);
