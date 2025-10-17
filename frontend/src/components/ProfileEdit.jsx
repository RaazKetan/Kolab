import React, { useState } from 'react';

export const ProfileEdit = ({ currentUser, onSave, onBack }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    bio: currentUser.bio || '',
    skills: currentUser.skills?.join(', ') || '',
    org_type: currentUser.org_type || 'college',
    org_name: currentUser.org_name || '',
    github_profile_url: currentUser.github_profile_url || '',
    github_selected_repos: currentUser.github_selected_repos?.map(r => r.url).join('\n') || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        org_type: formData.org_type,
        org_name: formData.org_name.trim(),
        github_profile_url: formData.github_profile_url.trim(),
        github_selected_repos: formData.github_selected_repos.split('\n').map(r => r.trim()).filter(Boolean)
      };

      const response = await fetch(`http://localhost:8000/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onSave(updatedUser);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#ffffff] rounded-3xl p-8 shadow-sm border border-[#e7ecef] mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#274C77]">Edit Profile</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 bg-[#e7ecef] hover:bg-[#a3cef1] text-[#274C77] rounded-lg transition-colors"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#8b8c89] mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-[#8b8c89] rounded bg-[#e7ecef] text-[#274C77] focus:outline-none focus:ring-2 focus:ring-[#6096ba]"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-[#8b8c89] mb-1">Bio</label>
          <textarea
            className="w-full px-3 py-2 border border-[#8b8c89] rounded bg-[#e7ecef] text-[#274C77] focus:outline-none focus:ring-2 focus:ring-[#6096ba]"
            rows="3"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell others about yourself..."
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-[#8b8c89] mb-1">Skills (comma separated)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-[#8b8c89] rounded bg-[#e7ecef] text-[#274C77] focus:outline-none focus:ring-2 focus:ring-[#6096ba]"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            placeholder="Python, React, Node.js, etc."
          />
        </div>

        {/* Organization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#8b8c89] mb-1">Organization Type</label>
            <select
              className="w-full px-3 py-2 border border-[#8b8c89] rounded bg-[#e7ecef] text-[#274C77] focus:outline-none focus:ring-2 focus:ring-[#6096ba]"
              value={formData.org_type}
              onChange={(e) => setFormData({ ...formData, org_type: e.target.value })}
            >
              <option value="college">College/University</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8b8c89] mb-1">Organization Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-[#8b8c89] rounded bg-[#e7ecef] text-[#274C77] focus:outline-none focus:ring-2 focus:ring-[#6096ba]"
              value={formData.org_name}
              onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
              placeholder="Your college or company name"
            />
          </div>
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm font-medium text-[#8b8c89] mb-1">GitHub Profile URL</label>
          <input
            type="url"
            className="w-full px-3 py-2 border border-[#8b8c89] rounded bg-[#e7ecef] text-[#274C77] focus:outline-none focus:ring-2 focus:ring-[#6096ba]"
            value={formData.github_profile_url}
            onChange={(e) => setFormData({ ...formData, github_profile_url: e.target.value })}
            placeholder="https://github.com/yourusername"
          />
        </div>

        {/* Repositories */}
        <div>
          <label className="block text-sm font-medium text-[#8b8c89] mb-1">
            GitHub Repositories (one per line, max 5)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-[#8b8c89] rounded bg-[#e7ecef] text-[#274C77] focus:outline-none focus:ring-2 focus:ring-[#6096ba]"
            rows="5"
            value={formData.github_selected_repos}
            onChange={(e) => setFormData({ ...formData, github_selected_repos: e.target.value })}
            placeholder="https://github.com/yourusername/project1&#10;https://github.com/yourusername/project2"
          />
          <p className="text-xs text-[#8b8c89] mt-1">
            These repositories will be analyzed to enhance your profile.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 bg-[#274C77] text-white rounded hover:bg-[#6096ba] transition-colors"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-[#e7ecef] text-[#274C77] rounded hover:bg-[#a3cef1] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
