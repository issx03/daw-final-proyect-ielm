import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Layout as BoardIcon, Clock, ChevronRight } from 'lucide-react';
import boardService from '../api/boardService';

import CreateBoardModal from '../components/boards/CreateBoardModal';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await boardService.getAll();
        setBoards(data);
      } catch (error) {
        console.error('Error fetching boards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleBoardCreated = (newBoard) => {
    setBoards((prev) => [newBoard, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#1E1E28]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#2A2A3A] border-t-[#7C6BEF] rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#6B7280]">Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 bg-[#1E1E28]">
      <main className="max-w-7xl mx-auto px-6 py-8 reveal-staggered">
        <header className="flex items-center justify-between gap-4 mb-8 reveal-item">
          <div>
            <h1 className="text-2xl font-bold text-[#E8E8EF] tracking-tight">
              Workspace Boards
            </h1>
            <p className="text-xs text-[#6B7280] font-medium">
              Manage your professional projects and workflows.
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#7C6BEF] text-white font-bold text-sm hover:bg-[#9B8AF7] transition-all duration-200 active:scale-95 shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Create Board
          </button>
        </header>

        {boards.length === 0 ? (
          <div className="py-20 bg-[#252533] rounded-2xl border border-[#2A2A3A] flex flex-col items-center justify-center text-center px-6 reveal-item">
            <div className="w-12 h-12 bg-[#1E1E28] rounded-lg flex items-center justify-center mb-4">
              <BoardIcon size={24} className="text-[#4B5563]" />
            </div>
            <h2 className="text-base font-bold text-[#E8E8EF] mb-1">No boards found</h2>
            <p className="text-xs text-[#6B7280] max-w-xs mb-6">
              Get started by creating your first professional board.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-[#7C6BEF] font-semibold text-sm hover:text-[#9B8AF7] transition-colors"
            >
              Create board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {boards.map((board) => (
              <Link 
                key={board.id} 
                to={`/boards/${board.id}`}
                className="group relative bg-[#252533] border border-[#2A2A3A] rounded-2xl p-5 hover:border-[#3A3A4A] hover:shadow-md transition-all duration-300 active:scale-[0.98] reveal-item"
              >
                {/* Color strip */}
                <div 
                  className="h-1.5 w-full rounded-full mb-4 transition-all duration-300 group-hover:scale-[1.02]"
                  style={{ backgroundColor: board.color }}
                />
                
                {/* Title */}
                <h3 className="text-sm font-bold text-[#E8E8EF] truncate mb-1.5 group-hover:text-[#7C6BEF] transition-colors tracking-tight">
                  {board.title}
                </h3>
                
                {/* Date */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] font-medium">
                  <Clock size={11} />
                  <span>{new Date(board.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <CreateBoardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onBoardCreated={handleBoardCreated}
      />
    </div>
  );
};

export default Dashboard;
