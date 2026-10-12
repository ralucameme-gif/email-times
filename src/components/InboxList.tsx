import React, { useEffect, useState } from 'react';
import {
  RotateCw,
  Mail,
  Paperclip,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Language, MailtmMessageSummary } from '../types';
import { translations } from '../i18n/translations';
import {
  formatRelativeTime,
  getAvatarColor,
  getInitials,
} from '../utils/formatters';

interface InboxListProps {
  messages: MailtmMessageSummary[];
  selectedMessageId: string | null;
  onSelectMessage: (msg: MailtmMessageSummary) => void;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdatedTime: number;
  totalMessages: number;
  onLoadMore?: () => void;
  lang: Language;
}

export const InboxList: React.FC<InboxListProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
  isLoading,
  onRefresh,
  lastUpdatedTime,
  totalMessages,
  onLoadMore,
  lang,
}) => {
  const t = translations[lang];
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

  // Unread count
  const unreadCount = messages.filter((m) => !m.seen).length;

  // Counter for "Last updated Xs ago"
  useEffect(() => {
    const updateElapsed = () => {
      if (lastUpdatedTime > 0) {
        setSecondsSinceUpdate(Math.max(0, Math.floor((Date.now() - lastUpdatedTime) / 1000)));
      }
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [lastUpdatedTime]);

  // Format updated string
  const formatUpdatedStr = () => {
    if (lastUpdatedTime === 0) return '';
    if (secondsSinceUpdate < 5) return t.justNow;
    if (secondsSinceUpdate < 60) return `${secondsSinceUpdate}${t.secondsAgo}`;
    const mins = Math.floor(secondsSinceUpdate / 60);
    return `${mins}${t.minutesAgo}`;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/20 dark:shadow-none overflow-hidden transition-colors">
      {/* Inbox Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Mail className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.inboxTitle}
          </h3>

          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-600 text-white font-mono tabular-nums">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastUpdatedTime > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>
                {t.lastUpdated} {formatUpdatedStr()}
              </span>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:opacity-50"
            aria-label={t.refreshButton}
            title={t.refreshButton}
          >
            <RotateCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}
            />
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[580px] min-h-[340px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[340px]">
            {/* Animated Pulse Envelope */}
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                <Mail className="w-8 h-8 animate-pulse text-indigo-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 animate-ping opacity-75" />
            </div>

            <h4 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {t.emptyInboxTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
              {t.emptyInboxDesc}
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.sendTestTip}</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelected = selectedMessageId === msg.id;
            const senderDisplay = msg.from.name || msg.from.address || t.noSender;
            const avatarColor = getAvatarColor(msg.from.address || senderDisplay);
            const initials = getInitials(senderDisplay);
            const subjectDisplay = msg.subject ? msg.subject.trim() : t.noSubject;

            return (
              <button
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className={`w-full text-start p-4 transition-all duration-150 flex items-start gap-3.5 cursor-pointer focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/60 ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-s-4 border-indigo-600'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                } ${!msg.seen ? 'font-medium' : ''}`}
              >
                {/* Avatar with Sender Initial */}
                <div
                  className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-2xs ${avatarColor}`}
                >
                  {initials}
                </div>

                {/* Content summary */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-xs sm:text-sm truncate ${
                        !msg.seen
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-normal text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {senderDisplay}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {msg.hasAttachments && (
                        <Paperclip className="w-3 h-3 text-slate-400" />
                      )}
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular-nums tech-ltr">
                        {formatRelativeTime(msg.createdAt, lang)}
                      </span>
                      {!msg.seen && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Subject line */}
                  <h4
                    className={`text-xs sm:text-sm truncate mb-0.5 ${
                      !msg.seen
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {subjectDisplay}
                  </h4>

                  {/* Intro snippet */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 break-words">
                    {msg.intro || '...'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalMessages > messages.length && onLoadMore && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <button
            onClick={onLoadMore}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t.loadMore}
          </button>
        </div>
      )}
    </div>
  );
};
