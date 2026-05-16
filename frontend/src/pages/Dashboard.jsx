import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Layout as BoardIcon, Clock, LogOut, Pencil, Trash2 } from 'lucide-react';
import boardService from '../api/boardService';
import CreateBoardModal from '../components/boards/CreateBoardModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Inline edit state
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deletingBoard, setDeletingBoard] = useState(null);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startEdit = (board) => {
    setEditingBoardId(board.id);
    setEditTitle(board.title);
    setEditDescription(board.description || '');
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingBoardId(null);
    setEditTitle('');
    setEditDescription('');
    setEditError('');
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    setEditLoading(true);
    setEditError('');
    try {
      const updateData = {};
      const original = boards.find(b => b.id === id);
      if (editTitle.trim() !== original.title) updateData.title = editTitle.trim();
      if (editDescription !== (original.description || '')) updateData.description = editDescription;

      if (Object.keys(updateData).length === 0) {
        cancelEdit();
        return;
      }

      const updated = await boardService.update(id, updateData);
      setBoards(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
      setEditingBoardId(null);
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update board.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await boardService.delete(id);
    setBoards(prev => prev.filter(b => b.id !== id));
    setDeletingBoard(null);
  };

  if (loading) {
    return (
      <div className="pt-32 px-6 text-center text-slate-500 animate-pulse font-serif text-xl">
        Loading your projects...
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-serif text-slate-900 font-medium">My Boards</h1>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
          <p className="text-slate-500">Manage your projects with the style they deserve.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-soft hover:bg-slate-800 transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          New Board
        </button>
      </header>

      {boards.length === 0 ? (
        <div className="py-24 bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 shadow-editorial">
          <BoardIcon size={64} className="mb-6 opacity-20" />
          <p className="text-xl font-serif text-slate-800 mb-2">It seems you don't have any boards yet</p>
          <p className="text-sm mb-8">Start by creating a new one above!</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-slate-900 font-semibold hover:underline"
          >
            Create my first board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {boards.map((board) => (
            <div
              key={board.id}
              className="relative group"
            >
              {editingBoardId === board.id ? (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-editorial flex flex-col h-64">
                  <div className="space-y-4 flex-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-2xl font-serif text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="Board title"
                      autoFocus
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                      placeholder="Description (optional)"
                      rows={3}
                    />
                    {editError && (
                      <p className="text-red-500 text-xs">{editError}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => saveEdit(board.id)}
                      disabled={editLoading || !editTitle.trim()}
                      className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {editLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  to={`/boards/${board.id}`}
                  className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-editorial hover:shadow-soft transition-all duration-500 group flex flex-col h-64"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundColor: board.color || '#F1F5F9' }}
                    >
                      <BoardIcon size={24} className="text-white opacity-80" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-slate-400 font-bold">
                      <Clock size={12} />
                      <span>{new Date(board.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-serif text-slate-800 mb-3 group-hover:text-slate-600 transition-colors">
                    {board.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {board.description || 'No detailed description.'}
                  </p>
                </Link>
              )}

              {/* Hover actions - only when not editing */}
              {editingBoardId !== board.id && (
                <div className="absolute bottom-6 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEdit(board);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Edit board"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletingBoard(board);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete board"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateBoardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onBoardCreated={handleBoardCreated}
      />

      <ConfirmModal
        isOpen={!!deletingBoard}
        title="Delete board?"
        message={deletingBoard ? `Are you sure you want to delete "${deletingBoard.title}"? All lists and cards inside will be permanently deleted.` : ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => handleDelete(deletingBoard?.id)}
        onClose={() => setDeletingBoard(null)}
      />
    </div>
  );
};

export default Dashboard;
