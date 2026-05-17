import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    avatar: user?.avatar || ''
  });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.type) setStatus({ type: null, message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const updateData = {};
      if (formData.username && formData.username !== user.username) updateData.username = formData.username;
      if (formData.email && formData.email !== user.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      if (formData.avatar !== user.avatar) updateData.avatar = formData.avatar;

      if (Object.keys(updateData).length === 0) {
        setStatus({ type: 'info', message: 'No changes detected.' });
        setLoading(false);
        return;
      }

      const updatedUser = await userService.updateMe(updateData);
      setUser(updatedUser);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Profile update error:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || error.response?.data?.detail || 'Error updating profile.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-20 pb-20 px-8">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#4ECDC4] flex items-center justify-center text-[14px] font-bold text-[#1A1A24] overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.username} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#E8E8EF] tracking-tight">{user?.username}</h1>
          <p className="text-sm text-[#6B7280]">{user?.email}</p>
        </div>
      </div>

      {/* Status message */}
      {status.message && (
        <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
          status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
          status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
          'bg-[#2A2A3A] text-[#8B8B9A] border border-[#3A3A4A]'
        }`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-0">
        {/* Username */}
        <div className="py-4 border-b border-[#2A2A3A]">
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full bg-transparent border-none p-0 text-[15px] font-medium text-[#E8E8EF] outline-none placeholder:text-[#4B5563]"
            placeholder="Your username"
          />
        </div>

        {/* Email */}
        <div className="py-4 border-b border-[#2A2A3A]">
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-transparent border-none p-0 text-[15px] font-medium text-[#E8E8EF] outline-none placeholder:text-[#4B5563]"
            placeholder="you@example.com"
          />
        </div>

        {/* Avatar URL */}
        <div className="py-4 border-b border-[#2A2A3A]">
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            className="w-full bg-transparent border-none p-0 text-[15px] font-medium text-[#E8E8EF] outline-none placeholder:text-[#4B5563]"
            placeholder="https://example.com/avatar.png"
          />
        </div>

        {/* Password */}
        <div className="py-4 border-b border-[#2A2A3A]">
          <label className="block text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-transparent border-none p-0 text-[15px] font-medium text-[#E8E8EF] outline-none placeholder:text-[#4B5563]"
            placeholder="Leave blank to keep current password"
          />
        </div>

        {/* Save button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#7C6BEF] text-white text-[13px] font-semibold rounded-lg hover:bg-[#9B8AF7] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
