import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  confirmText = 'Delete',
  confirmLabel,
  cancelText = 'Cancel',
  cancelLabel,
  onConfirm, 
  onClose,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const finalConfirmText = confirmLabel || confirmText;
  const finalCancelText = cancelLabel || cancelText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0F0F13]/60 animate-in fade-in duration-100"
        onClick={onClose}
      />

      <div className="relative bg-[#252533] border border-[#2A2A3A] rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-[#E8E8EF] tracking-tight mb-3">
          {title}
        </h2>
        <p className="text-sm text-[#8B8B9A] leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-[#6B7280] hover:text-[#E8E8EF] transition-colors"
          >
            {finalCancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all active:scale-95 ${
              variant === 'danger' 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-[#7C6BEF] text-white hover:bg-[#9B8AF7]'
            }`}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
