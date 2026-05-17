import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2, Plus, X, Check, MoreHorizontal } from 'lucide-react';
import useBoardStore from '../../store/boardStore';
import CardItem from './CardItem';
import ConfirmModal from '../common/ConfirmModal';

const ListCard = React.memo(({ list }) => {
  const cards = useBoardStore(state => state.cards[list.id] || []);
  const createCard = useBoardStore(state => state.createCard);
  const updateList = useBoardStore(state => state.updateList);
  const deleteList = useBoardStore(state => state.deleteList);

  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const createCardRef = useRef(null);
  const editTitleRef = useRef(null);
  const menuRef = useRef(null);

  const { setNodeRef } = useDroppable({ id: `list-${list.id}` });

  useEffect(() => {
    if (!isCreatingCard) return;
    const handleClickOutside = (e) => {
      if (createCardRef.current && !createCardRef.current.contains(e.target)) {
        setIsCreatingCard(false);
        setNewCardTitle('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCreatingCard]);

  useEffect(() => {
    if (!isEditingTitle) return;
    const handleClickOutside = (e) => {
      if (editTitleRef.current && !editTitleRef.current.contains(e.target)) {
        setEditTitle(list.title);
        setIsEditingTitle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditingTitle, list.title]);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleCreateCard = async (e) => {
    if (e) e.preventDefault();
    if (!newCardTitle.trim()) return;
    await createCard(list.id, newCardTitle);
    setNewCardTitle('');
    setIsCreatingCard(false);
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) {
      setEditTitle(list.title);
      setIsEditingTitle(false);
      return;
    }
    if (editTitle !== list.title) {
      await updateList(list.id, { title: editTitle });
    }
    setIsEditingTitle(false);
  };

  const handleDeleteList = async () => {
    await deleteList(list.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="w-80 shrink-0 bg-[#252533] rounded-2xl border border-[#2A2A3A] flex flex-col h-fit max-h-[calc(100vh-180px)]">
      {/* ── List Header ── */}
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#2A2A3A]">
        {isEditingTitle ? (
          <div ref={editTitleRef} className="flex-1 flex items-center gap-2">
            <input
              autoFocus
              className="flex-1 bg-[#1E1E28] border border-[#7C6BEF]/30 rounded-lg text-[13px] font-semibold px-3 py-1.5 outline-none text-[#E8E8EF] placeholder:text-[#4B5563] focus:border-[#7C6BEF]/50 transition-colors"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') { setEditTitle(list.title); setIsEditingTitle(false); }
              }}
            />
            <button onClick={handleSaveTitle} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all">
              <Check size={14} />
            </button>
            <button onClick={() => { setEditTitle(list.title); setIsEditingTitle(false); }} className="p-1.5 text-[#6B7280] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-lg transition-all">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#7C6BEF] flex-shrink-0" />
            <h3
              onClick={() => { setEditTitle(list.title); setIsEditingTitle(true); }}
              className="text-[13px] font-semibold text-[#E8E8EF] uppercase tracking-wider cursor-pointer truncate hover:text-[#7C6BEF] transition-colors"
            >
              {list.title}
            </h3>
            <span className="inline-flex items-center justify-center bg-[#2A2A3A] text-[#9CA3AF] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {cards.length}
            </span>
          </div>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-[#4B5563] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-lg transition-all"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-[#252533] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-[#2A2A3A] py-1 z-50">
              <button
                onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 size={14} />
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Cards Area ── */}
      <div ref={setNodeRef} className="px-3 pb-2 pt-2 flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
        <SortableContext items={cards.map(c => `card-${c.id}`)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <CardItem key={card.id} card={card} listId={list.id} />
          ))}
        </SortableContext>

        {cards.length === 0 && !isCreatingCard && (
          <div className="flex flex-col items-center justify-center py-8 gap-1.5">
            <p className="text-[11px] text-[#4B5563]">No tasks yet</p>
          </div>
        )}

        {isCreatingCard && (
          <form ref={createCardRef} onSubmit={handleCreateCard} className="animate-in fade-in zoom-in-95 duration-200">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-[#1E1E28] border border-[#2A2A3A] rounded-xl text-[13px] p-3 min-h-[80px] resize-none leading-relaxed outline-none text-[#E8E8EF] placeholder:text-[#4B5563] focus:border-[#7C6BEF]/30 focus:ring-2 focus:ring-[#7C6BEF]/5 transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateCard(e); }
                if (e.key === 'Escape') { setIsCreatingCard(false); setNewCardTitle(''); }
              }}
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="submit"
                className="bg-[#7C6BEF] text-white flex-1 text-[11px] font-semibold py-2 rounded-lg hover:bg-[#9B8AF7] transition-all active:scale-95"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => { setIsCreatingCard(false); setNewCardTitle(''); }}
                className="p-2 text-[#6B7280] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Add Card Trigger ── */}
      {!isCreatingCard && (
        <div className="px-3 py-3 flex justify-center border-t border-[#2A2A3A]">
          <button
            onClick={() => setIsCreatingCard(true)}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold text-[#6B7280] hover:text-[#7C6BEF] uppercase tracking-wider transition-all duration-200 group"
          >
            <Plus size={14} className="transition-transform group-hover:rotate-90" />
            Add Task
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete list?"
        message={`"${list.title}" and all its cards will be permanently deleted.`}
        confirmText="Delete"
        onConfirm={handleDeleteList}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
});

export default ListCard;
