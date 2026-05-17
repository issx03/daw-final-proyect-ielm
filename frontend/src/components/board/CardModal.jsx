import React, { useState, useEffect } from 'react';
import { X, AlignLeft, Trash2, Layout as BoardIcon } from 'lucide-react';
import useBoardStore from '../../store/boardStore';
import ConfirmModal from '../common/ConfirmModal';

const CardModal = ({ card, listId, isOpen, onClose }) => {
  const updateCard = useBoardStore(state => state.updateCard);
  const deleteCard = useBoardStore(state => state.deleteCard);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
    }
  }, [card]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await updateCard(card.id, { title, description });
      onClose();
    } catch (error) {
      console.error('Failed to update card:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCard(card.id, listId);
      onClose();
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 flex items-start justify-center pt-16 px-4 pb-4 overflow-y-auto">
        <div
          className="fixed inset-0 bg-[#0F0F13]/70 backdrop-blur-[3px] animate-in fade-in duration-100"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div className="relative bg-[#252533] border border-[#2A2A3A] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-98 duration-100">

          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-8 pb-4 border-b border-[#2A2A3A]">
            <div className="flex-1 flex gap-3 items-start">
              <BoardIcon size={20} className="text-[#6B7280] mt-1 flex-shrink-0" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title"
                className="flex-1 bg-transparent border border-[#2A2A3A] hover:border-[#3A3A4A] focus:border-[#7C6BEF]/50 focus:ring-2 focus:ring-[#7C6BEF]/5 rounded-xl px-4 py-2.5 text-lg font-bold text-[#E8E8EF] placeholder:text-[#4B5563] outline-none leading-snug transition-all"
              />
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-[#6B7280] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-8 px-8 py-6">

            {/* Main Content Column */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <AlignLeft size={16} className="text-[#6B7280]" />
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Description</h3>
                </div>
                <div className="pl-7">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="w-full bg-[#1E1E28] border border-[#2A2A3A] hover:border-[#3A3A4A] focus:border-[#7C6BEF]/50 focus:ring-2 focus:ring-[#7C6BEF]/5 rounded-xl px-4 py-3 text-sm min-h-[120px] resize-none leading-relaxed text-[#E8E8EF] transition-all outline-none placeholder:text-[#4B5563]"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-4 pt-1">
              <div>
                <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Actions</h4>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-8 py-5 bg-[#1E1E28] border-t border-[#2A2A3A]">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-[#6B7280] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2.5 bg-[#7C6BEF] text-white text-sm font-bold rounded-xl hover:bg-[#9B8AF7] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete card?"
        message={`"${card.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
        confirmText="Delete"
      />
    </>
  );
};

export default CardModal;
