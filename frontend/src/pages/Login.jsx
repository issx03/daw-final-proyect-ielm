import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, Shield, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();

  if (token) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Invalid credentials or server error. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex bg-white">
      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Trellix<span className="text-indigo-600">.</span>
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-['Outfit'] mb-2">
              Welcome back.
            </h2>
            <p className="text-slate-500 font-medium">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2 animate-shake">
                <Shield size={14} />
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Account Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  placeholder="e.g. jdoe_trellix"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end ml-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-100 group"
            >
              {loading ? 'Signing in...' : 'Sign In to Workspace'}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            New to Trellix?{' '}
            <Link to="/register" className="text-slate-900 font-bold hover:underline">
              Create a workspace
            </Link>
          </p>
        </div>
      </div>

      {/* Visual Section */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden auth-panel-gradient">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-slate-300/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-md text-center px-12 reveal-up">
           <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
             Fast. Focused. Yours.
           </h3>
           <p className="text-slate-500 font-medium leading-relaxed">
             Log in and pick up right where you left off. No distractions, no learning curve.
           </p>
         </div>
      </div>
    </div>
  );
};

export default Login;
