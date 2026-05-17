import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import boardService from '../../api/boardService';

const COLORS = [
  { name: 'Slate', value: '#64748B' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#A855F7' },
];

const CreateBoardModal = ({ isOpen, onClose, onBoardCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      const newBoard = await boardService.create({
        title,
        description,
        color: selectedColor,
      });
      onBoardCreated(newBoard);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Error creating board:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Error creating board. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F0F13]/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#252533] w-full max-w-md rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.4)] p-10 animate-in fade-in zoom-in-95 duration-200 border border-[#2A2A3A]">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-[#E8E8EF] tracking-tight">New Board</h2>
            <p className="text-[#6B7280] text-xs font-medium mt-1">Create a new workspace for your team.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#6B7280] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-red-400" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] ml-1">Board Title</label>
            <input 
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My new board"
              className="w-full bg-[#1E1E28] border border-[#2A2A3A] rounded-xl px-4 py-3 text-sm font-medium text-[#E8E8EF] focus:ring-2 focus:ring-[#7C6BEF]/5 focus:border-[#7C6BEF]/40 outline-none transition-all placeholder:text-[#4B5563]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] ml-1">Identity Color</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${
                    selectedColor === color.value 
                      ? 'ring-2 ring-white scale-110 shadow-lg' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.value && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-4 bg-[#7C6BEF] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#9B8AF7] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Board'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-[11px] font-bold text-[#6B7280] hover:text-[#E8E8EF] transition-colors uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
