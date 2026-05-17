import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout, user } = useAuth();
  
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isProtected = token && !isLanding && !isAuthPage;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (isProtected) {
    return (
      <nav className="h-14 flex-shrink-0 bg-[#1A1A24] border-b border-[#2A2A3A] px-8 flex items-center justify-end z-30">
        <div className="flex items-center gap-6">
          <span className="text-[11px] text-[#6B7280]">{user?.email || user?.username}</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 h-14 z-[100] border-b transition-all duration-300 ${
      isLanding 
        ? 'bg-white border-slate-100' 
        : 'bg-white border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
    }`}>
      <div className="w-full h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link 
            to={token ? "/dashboard" : "/"} 
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 select-none">
              Trellix<span className="text-indigo-600">.</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!token ? (
            <>
              {!isAuthPage && (
                <div className="flex items-center gap-6">
                  <Link 
                    to="/login"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 uppercase tracking-widest transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-indigo-600 text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-slate-500">{user?.email || user?.username}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
