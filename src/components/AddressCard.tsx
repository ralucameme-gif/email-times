import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  RefreshCw,
  Trash2,
  Link,
  ShieldAlert,
} from 'lucide-react';
import { Language, MailboxAccount } from '../types';
import { translations } from '../i18n/translations';
import { CountdownTimer } from './CountdownTimer';

interface AddressCardProps {
  mailbox: MailboxAccount;
  lang: Language;
  onOpenChangeEmail: () => void;
  onOpenShare: () => void;
  onOpenDelete: () => void;
  onExpire: () => void;
  onToast: (msg: string) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  mailbox,
  lang,
  onOpenChangeEmail,
  onOpenShare,
  onOpenDelete,
  onExpire,
  onToast,
}) => {
  const t = translations[lang];
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(mailbox.address);
      setCopiedAddress(true);
      onToast(t.copiedToast);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/${lang}/inbox/${mailbox.slug}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      onToast(t.linkCopiedToast);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none p-5 sm:p-7 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left / Primary Column: Email Address Display & Quick Copy */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.activeAddressLabel}
            </span>
          </div>

          {/* Large Address Box with 1-click Copy */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex-1 px-3 py-2 text-slate-900 dark:text-white font-mono text-base sm:text-xl font-bold tracking-tight select-all truncate tech-ltr">
              {mailbox.address}
            </div>

            <button
              onClick={handleCopyAddress}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all duration-150 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={t.copyAddress}
            >
              {copiedAddress ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{t.actionCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.actionCopy}</span>
                </>
              )}
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={onOpenChangeEmail}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.actionChangeEmail}</span>
            </button>

            <button
              onClick={onOpenShare}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.actionShare}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Link className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{copiedLink ? t.actionCopied : t.actionCopyLink}</span>
            </button>

            <button
              onClick={onOpenDelete}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 transition-colors flex items-center gap-1.5 ms-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.actionDeleteNow}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Countdown Progress Card */}
        <div className="lg:col-span-5">
          <CountdownTimer
            expiresAt={mailbox.expiresAt}
            totalDurationSeconds={mailbox.durationSeconds}
            lang={lang}
            onExpire={onExpire}
          />
        </div>
      </div>

      {/* Security note */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>{t.privateLinkWarning}</span>
      </div>
    </div>
  );
};
