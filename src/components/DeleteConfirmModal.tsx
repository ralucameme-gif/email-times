import React from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  lang,
  onConfirm,
  isDeleting,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.deleteTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Content */}
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs sm:text-sm text-rose-800 dark:text-rose-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-relaxed">{t.deleteWarning}</p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.confirmDelete}...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{t.confirmDelete}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
