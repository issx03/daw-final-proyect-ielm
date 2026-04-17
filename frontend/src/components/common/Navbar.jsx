import React from 'react';
import { Layout, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-50 z-[90] px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-slate-900 p-2 rounded-xl group-hover:rotate-6 transition-transform duration-300">
            <Layout size={18} className="text-white" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-slate-900">Trellix</span>
        </Link>

        {!isAuthPage && token && (
          <div className="flex items-center gap-6">
            <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <User size={18} />
              <span className="hidden sm:inline font-serif">Mi Espacio</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline font-serif">Salir</span>
            </button>
          </div>
        )}

        {!token && !isAuthPage && (
          <Link 
            to="/login"
            className="text-sm font-semibold text-slate-900 hover:underline font-serif"
          >
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
