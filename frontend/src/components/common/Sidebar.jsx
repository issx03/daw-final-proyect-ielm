import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, User, Plus, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import boardService from '../../api/boardService';


const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await boardService.getAll();
        setBoards(data);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainMenuItems = [
    { icon: Layout, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#1A1A24] border-r border-[#2A2A3A] z-40 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4">
        <span className="text-lg font-bold tracking-tight text-[#E8E8EF]">
          Trellix<span className="text-[#4ECDC4]">.</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-5 px-4 py-4 overflow-hidden">
        {/* Main Menu */}
        <div>
          <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-[0.12em] px-3 mb-2.5">Your Workspaces</p>
          <nav className="flex flex-col gap-0.5">
            {mainMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-medium ${
                    isActive
                      ? 'bg-[#2A2A3A] text-[#7C6BEF]'
                      : 'text-[#9CA3AF] hover:bg-[#2A2A3A] hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Boards */}
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={16} className="animate-spin text-[#4B5563]" />
            </div>
          ) : boards.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[11px] text-[#4B5563]">No boards yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar pr-1">
              {boards.map((board) => {
                const isActive = location.pathname === `/boards/${board.id}`;
                return (
                  <button
                    key={board.id}
                    onClick={() => navigate(`/boards/${board.id}`)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-[13px] font-medium ${
                      isActive
                        ? 'bg-[#2A2A3A] text-[#7C6BEF]'
                        : 'text-[#9CA3AF] hover:bg-[#2A2A3A] hover:text-white'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: board.color }}
                    />
                    <span className="truncate">{board.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: User Info — clickable to profile */}
      <div className="px-4 py-4 border-t border-[#2A2A3A]">
        <div className="flex items-center justify-between">
          <Link 
            to="/profile" 
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#2A2A3A] flex items-center justify-center text-[11px] font-bold text-[#E8E8EF] overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-[#E8E8EF] leading-tight">{user?.username || 'User'}</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 text-[#4B5563] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
