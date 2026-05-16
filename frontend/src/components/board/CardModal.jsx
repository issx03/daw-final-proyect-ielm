import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2 } from 'lucide-react';
import cardService from '../../api/cardService';
import useBoardStore from '../../store/boardStore';
import ConfirmModal from '../common/ConfirmModal';

const CardModal = ({ cardId, listId, onClose }) => {
  const updateCard = useBoardStore(state => state.updateCard);
  const deleteCard = useBoardStore(state => state.deleteCard);

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchCard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cardService.getById(cardId);
      setCard(data);
      setTitleValue(data.title);
      setDescValue(data.description || '');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load card details.');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    if (cardId) fetchCard();
  }, [cardId, fetchCard]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSaveTitle = async () => {
    if (!titleValue.trim() || titleValue === card.title) {
      setIsEditingTitle(false);
      setTitleValue(card.title);
      return;
    }
    setSaveError('');
    try {
      const updated = await updateCard(cardId, { title: titleValue.trim() });
      setCard(prev => ({ ...prev, ...updated }));
      setIsEditingTitle(false);
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Failed to update title.');
    }
  };

  const handleSaveDescription = async () => {
    if (descValue === (card.description || '')) {
      setIsEditingDesc(false);
      return;
    }
    setSaveError('');
    try {
      const updated = await updateCard(cardId, { description: descValue });
      setCard(prev => ({ ...prev, ...updated }));
      setIsEditingDesc(false);
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Failed to update description.');
    }
  };

  const handleDelete = async () => {
    await deleteCard(cardId, listId);
    onClose();
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    }
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleValue(card.title);
    }
  };

  const handleDescKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSaveDescription();
    }
    if (e.key === 'Escape') {
      setIsEditingDesc(false);
      setDescValue(card.description || '');
    }
  };

  if (!cardId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-editorial p-8 sm:p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 min-w-0 mr-4">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="w-full text-2xl font-serif text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl font-serif text-slate-800 cursor-text hover:bg-slate-50 rounded-xl px-2 -mx-2 py-1 transition-colors"
              >
                {card?.title || 'Untitled'}
              </h2>
            )}
            {card?.created_at && (
              <p className="text-xs text-slate-400 mt-2">
                Created {new Date(card.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {saveError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {saveError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={fetchCard}
              className="mt-4 text-slate-600 hover:text-slate-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Description</h3>
              {isEditingDesc ? (
                <textarea
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  onBlur={handleSaveDescription}
                  onKeyDown={handleDescKeyDown}
                  autoFocus
                  rows={5}
                  placeholder="Add a more detailed description..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                />
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className={`text-sm leading-relaxed rounded-xl px-4 py-3 cursor-text transition-colors ${
                    card?.description
                      ? 'text-slate-600 hover:bg-slate-50'
                      : 'text-slate-400 italic hover:bg-slate-50 bg-slate-50/50'
                  }`}
                >
                  {card?.description || 'Add a more detailed description...'}
                </div>
              )}
              {isEditingDesc && (
                <p className="text-xs text-slate-400 mt-2">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">Enter</kbd> to save
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                Delete card
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete card?"
        message={`Are you sure you want to delete "${card?.title || 'this card'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default CardModal;
