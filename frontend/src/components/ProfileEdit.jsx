import React, { useState } from 'react';
import { User, Briefcase, Code, Link, Save, ArrowLeft, Building, FileText } from 'lucide-react';

export const ProfileEdit = ({ currentUser, onSave, onBack, isDarkMode = true }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    bio: currentUser.bio || '',
    skills: currentUser.skills?.join(', ') || '',
    org_type: currentUser.org_type || 'college',
    org_name: currentUser.org_name || '',
    github_profile_url: currentUser.github_profile_url || ''
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
        github_profile_url: formData.github_profile_url.trim()
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/users/${currentUser.id}`, {
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
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
    isDarkMode 
      ? 'bg-zinc-800/50 border-white/10 text-white placeholder-zinc-500 focus:border-blue-500/50' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-700'}`;

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl p-8 shadow-sm border mt-6 backdrop-blur-xl ${
       isDarkMode ? 'bg-[#18181b]/80 border-white/10' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <h2 className={`text-3xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
             <User className="w-6 h-6" />
          </div>
          Edit Profile
        </h2>
        <button
          onClick={onBack}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-medium ${
             isDarkMode 
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className={labelClass}>Full Name</label>
          <div className="relative">
             <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="text"
               className={`${inputClass} pl-10`}
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               required
               placeholder="John Doe"
             />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className={labelClass}>Bio</label>
          <div className="relative">
             <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
             <textarea
               className={`${inputClass} pl-10 min-h-[120px]`}
               value={formData.bio}
               onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
               placeholder="Tell others about yourself, your interests, and what you're looking for..."
             />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className={labelClass}>Skills (comma separated)</label>
          <div className="relative">
             <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="text"
               className={`${inputClass} pl-10`}
               value={formData.skills}
               onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
               placeholder="Python, React, Node.js, etc."
             />
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
             Tip: Listing precise skills improves your match score with projects.
          </p>
        </div>

        {/* Organization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Organization Type</label>
            <div className="relative">
               <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <select
                 className={`${inputClass} pl-10 appearance-none`}
                 value={formData.org_type}
                 onChange={(e) => setFormData({ ...formData, org_type: e.target.value })}
               >
                 <option value="college">College/University</option>
                 <option value="company">Company</option>
               </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Organization Name</label>
            <div className="relative">
               <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type="text"
                 className={`${inputClass} pl-10`}
                 value={formData.org_name}
                 onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                 placeholder="e.g. Stanford University or Google"
               />
            </div>
          </div>
        </div>

        {/* GitHub URL */}
        <div>
          <label className={labelClass}>GitHub Profile URL</label>
          <div className="relative">
             <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="url"
               className={`${inputClass} pl-10`}
               value={formData.github_profile_url}
               onChange={(e) => setFormData({ ...formData, github_profile_url: e.target.value })}
               placeholder="https://github.com/yourusername"
             />
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex gap-3 pt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button
            type="button"
            onClick={onBack}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
               isDarkMode 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
