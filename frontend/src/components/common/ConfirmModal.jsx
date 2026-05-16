import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
  children
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError('');
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (loading) return;
    setError('');
    onClose();
  }, [loading, onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmBg = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-slate-900 hover:bg-slate-800';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-editorial p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-xl font-serif text-slate-800">{title}</h2>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          {message}
        </p>

        {children && (
          <div className="mb-6">
            {children}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 text-slate-500 font-medium hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`${confirmBg} text-white px-6 py-2.5 rounded-xl font-medium shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
