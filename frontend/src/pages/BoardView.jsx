import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useBoardStore from '../store/boardStore';
import ListCard from '../components/board/ListCard';

const BoardView = () => {
  const { id } = useParams();
  const { board, lists, fetchBoard, loading, error, createList } = useBoardStore();
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBoard(id);
    }
  }, [id, fetchBoard]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    await createList(id, newListTitle);
    setNewListTitle('');
    setIsCreatingList(false);
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
      <h3 className="font-semibold mb-2">Error loading board</h3>
      <p>{error}</p>
    </div>
  );
  
  if (!board) return null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{board.title}</h1>
        {board.description && (
          <p className="mt-2 text-slate-600 max-w-2xl">{board.description}</p>
        )}
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex items-start gap-6 h-full px-1">
          {lists.map(list => (
            <ListCard key={list.id} list={list} />
          ))}

          {/* Create List Button / Form */}
          <div className="w-80 shrink-0">
            {!isCreatingList ? (
              <button
                onClick={() => setIsCreatingList(true)}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add another list
              </button>
            ) : (
              <form onSubmit={handleCreateList} className="bg-slate-100 p-3 rounded-xl border border-slate-200 shadow-sm">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Enter list title..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm mb-3"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Add list
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingList(false);
                      setNewListTitle('');
                    }}
                    className="p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
