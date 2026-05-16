import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { User, Mail, Shield, Save, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: ''
  });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

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
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to update profile.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    await userService.deleteMe({ password: deletePassword });
    logout();
    navigate('/login');
  };

  return (
    <div className="pt-24 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-serif font-bold text-primary mb-3">Account Settings</h1>
        <p className="text-secondary text-lg">Manage your personal information and security.</p>
      </div>

      <div className="bg-surface-lowest rounded-3xl p-8 sm:p-10 shadow-editorial border border-border overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="relative space-y-8">
          {/* User Brief Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-surface-low rounded-2xl border border-border/40 shadow-sm">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-serif shadow-lg rotate-3">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                <h2 className="text-2xl font-serif font-bold text-primary">{user?.username}</h2>
                <span className="px-3 py-1 bg-primary text-white text-[10px] uppercase tracking-[0.2em] font-black rounded-full">
                  {user?.role}
                </span>
              </div>
              <p className="text-secondary font-medium">{user?.email}</p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                <div className={`w-2 h-2 rounded-full ${user?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-secondary/60">
                  {user?.is_active ? 'Active Account' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Notifications */}
          {status.message && (
            <div className={`p-5 rounded-2xl flex items-center gap-4 text-sm animate-in zoom-in-95 duration-500 ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
              status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
              'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              <div className={`p-2 rounded-full ${
                status.type === 'success' ? 'bg-green-100' :
                status.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </div>
              <span className="font-medium">{status.message}</span>
            </div>
          )}

          {/* Form Sections */}
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 flex items-center gap-2 ml-1">
                  <User size={12} className="text-accent" /> Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-surface-low/50 border border-border/50 rounded-2xl px-5 py-4 text-primary focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent/30 outline-none transition-all duration-300 placeholder:text-secondary/30"
                  placeholder="Change your username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 flex items-center gap-2 ml-1">
                  <Mail size={12} className="text-accent" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-low/50 border border-border/50 rounded-2xl px-5 py-4 text-primary focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent/30 outline-none transition-all duration-300 placeholder:text-secondary/30"
                  placeholder="Update your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 flex items-center gap-2 ml-1">
                <Shield size={12} className="text-accent" /> New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-surface-low/50 border border-border/50 rounded-2xl px-5 py-4 text-primary focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent/30 outline-none transition-all duration-300 placeholder:text-secondary/30"
                placeholder="Enter new password (optional)"
              />
              <p className="text-[10px] text-secondary/50 font-medium italic ml-1">
                Minimum 8 characters. Leave empty if you don't want to change it.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-3 py-5 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-bold tracking-tight">Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-4 flex items-center gap-2">
            <Trash2 size={14} /> Danger Zone
          </h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-red-200 text-red-600 rounded-2xl font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-300"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-secondary/40 text-xs font-medium">
          Member since {new Date().getFullYear()} • Trellix Premium Account
        </p>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete your account?"
        message="This action is permanent. All your boards, lists, and cards will be permanently deleted and cannot be recovered."
        confirmLabel="Delete Account"
        variant="danger"
        onConfirm={handleDeleteAccount}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletePassword('');
        }}
      >
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 block">
            Enter your password to confirm
          </label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Your password"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            autoFocus
          />
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Profile;
