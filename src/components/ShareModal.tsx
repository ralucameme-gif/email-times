import React, { useState } from 'react';
import { X, Copy, Check, Share2, ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  slug: string;
  onToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  lang,
  slug,
  onToast,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/${lang}/inbox/${slug}`;
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onToast(t.linkCopiedToast);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.brand,
          text: t.tagline,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.shareTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t.shareSubtitle}
        </p>

        {/* Private Link Display & Copy */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-700 dark:text-slate-300 tech-ltr outline-none select-all truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t.actionCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.actionCopy}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native share button if available */}
        {hasNativeShare && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>{t.nativeShare}</span>
          </button>
        )}

        {/* Warning Note */}
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>{t.privateLinkWarning}</p>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
