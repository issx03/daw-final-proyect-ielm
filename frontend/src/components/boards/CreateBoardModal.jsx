import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import boardService from '../../api/boardService';

const COLORS = [
  { name: 'Charcoal', value: '#2C2B29' },
  { name: 'Slate', value: '#52504C' },
  { name: 'Sage', value: '#7D8471' },
  { name: 'Taupe', value: '#8C7D6B' },
  { name: 'Sand', value: '#B4A697' },
  { name: 'Terracotta', value: '#A67C6A' },
];

const CreateBoardModal = ({ isOpen, onClose, onBoardCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
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
    } catch (error) {
      console.error('Error creating board:', error);
      alert('Error al crear el tablero. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-editorial p-10 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-serif text-slate-800">Nuevo Tablero</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block ml-1">Título</label>
            <input 
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Proyecto Rediseño"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 focus:outline-none focus:border-slate-300 transition-all text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block ml-1">Descripción</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿De qué trata este espacio?"
              rows={3}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 focus:outline-none focus:border-slate-300 transition-all resize-none text-slate-800"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700 block ml-1">Color de Identidad</label>
            <div className="flex flex-wrap gap-4">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    selectedColor === color.value ? 'ring-2 ring-offset-4 ring-slate-900 scale-110 shadow-lg' : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.value && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 bg-slate-900 text-white rounded-xl shadow-soft hover:bg-slate-800 transition-all font-medium disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Tablero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
