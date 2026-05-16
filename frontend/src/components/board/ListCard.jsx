import React, { useState } from 'react';
import useBoardStore from '../../store/boardStore';
import CardItem from './CardItem';
import ConfirmModal from '../common/ConfirmModal';

const ListCard = ({ list, onCardClick }) => {
  const cards = useBoardStore(state => state.cards[list.id] || []);
  const createCard = useBoardStore(state => state.createCard);
  const updateList = useBoardStore(state => state.updateList);
  const deleteList = useBoardStore(state => state.deleteList);

  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(list.title);
  const [editError, setEditError] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    await createCard(list.id, newCardTitle);
    setNewCardTitle('');
    setIsCreatingCard(false);
  };

  const handleSaveTitle = async () => {
    if (!titleValue.trim() || titleValue === list.title) {
      setIsEditingTitle(false);
      setTitleValue(list.title);
      return;
    }
    setEditError('');
    try {
      await updateList(list.id, { title: titleValue.trim() });
      setIsEditingTitle(false);
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update list.');
      // keep editing mode open on error
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    }
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleValue(list.title);
      setEditError('');
    }
  };

  const handleDelete = async () => {
    await deleteList(list.id);
  };

  return (
    <div className="w-80 shrink-0 bg-slate-100 rounded-2xl flex flex-col max-h-full border border-slate-200/60 shadow-sm">
      {/* List Header */}
      <div className="p-4 flex items-center justify-between group">
        <div className="flex-1 min-w-0 mr-2">
          {isEditingTitle ? (
            <div>
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              {editError && (
                <p className="text-red-500 text-xs mt-1">{editError}</p>
              )}
            </div>
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="font-bold text-slate-700 text-sm cursor-text hover:bg-white/60 rounded-lg px-2 -mx-2 py-1 transition-colors truncate"
            >
              {list.title}
            </h3>
          )}
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200 shrink-0"
          title="Delete list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* Cards Container */}
      <div className="px-3 pb-2 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
        {cards.map(card => (
          <CardItem key={card.id} card={card} onClick={() => onCardClick?.(card.id, list.id)} />
        ))}

        {/* Create Card Form */}
        {isCreatingCard && (
          <form onSubmit={handleCreateCard} className="mt-1">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none shadow-sm"
              rows={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreateCard(e);
                }
              }}
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCard(false);
                  setNewCardTitle('');
                }}
                className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Add Card Button */}
      {!isCreatingCard && (
        <div className="p-2">
          <button
            onClick={() => setIsCreatingCard(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add a card
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete list?"
        message={`Are you sure you want to delete "${list.title}"? All cards inside will be permanently deleted.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default ListCard;
