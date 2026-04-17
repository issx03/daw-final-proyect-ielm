import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Layout as BoardIcon, Clock, LogOut } from 'lucide-react';
import boardService from '../api/boardService';
import CreateBoardModal from '../components/boards/CreateBoardModal';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const data = await boardService.getAll();
        setBoards(data);
      } catch (error) {
        console.error('Error fetching boards:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [navigate]);

  const handleBoardCreated = (newBoard) => {
    setBoards((prev) => [newBoard, ...prev]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="pt-32 px-6 text-center text-slate-500 animate-pulse font-serif text-xl">
        Cargando tus proyectos...
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-serif text-slate-900 font-medium">Mis Tableros</h1>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
          <p className="text-slate-500">Gestioná tus proyectos con el estilo que merecen.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-soft hover:bg-slate-800 transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Nuevo Tablero
        </button>
      </header>

      {boards.length === 0 ? (
        <div className="py-24 bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 shadow-editorial">
          <BoardIcon size={64} className="mb-6 opacity-20" />
          <p className="text-xl font-serif text-slate-800 mb-2">Parece que no tenés tableros todavía</p>
          <p className="text-sm mb-8">¡Empezá creando uno nuevo arriba!</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-slate-900 font-semibold hover:underline"
          >
            Crear mi primer tablero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {boards.map((board) => (
            <Link 
              key={board.id} 
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
                {board.description || 'Sin descripción detallada.'}
              </p>
            </Link>
          ))}
        </div>
      )}

      <CreateBoardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onBoardCreated={handleBoardCreated}
      />
    </div>
  );
};

export default Dashboard;
