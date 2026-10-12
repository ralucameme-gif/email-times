import React, { useState, useEffect, useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Trash2,
  Paperclip,
  Download,
  Copy,
  Check,
  FileText,
  Code2,
  Info,
} from 'lucide-react';
import {
  Language,
  MailtmMessageDetail,
  MailtmMessageSummary,
} from '../types';
import { translations } from '../i18n/translations';
import {
  fetchMessage,
  markMessageSeen,
  deleteMessage,
  downloadAttachment,
  extractVerificationCodes,
} from '../services/mailtm';

interface MessageViewerProps {
  messageSummary: MailtmMessageSummary | null;
  token: string;
  lang: Language;
  onBack: () => void;
  onDeleted: (id: string) => void;
  onToast: (msg: string) => void;
}

export const MessageViewer: React.FC<MessageViewerProps> = ({
  messageSummary,
  token,
  lang,
  onBack,
  onDeleted,
  onToast,
}) => {
  const t = translations[lang];
  const [detail, setDetail] = useState<MailtmMessageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(750);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load message detail when selected
  useEffect(() => {
    if (!messageSummary) {
      setDetail(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchMessage(messageSummary.id, token)
      .then((data) => {
        if (!isMounted) return;
        setDetail(data);
        setLoading(false);

        // Mark as seen if not yet seen
        if (!messageSummary.seen) {
          markMessageSeen(messageSummary.id, token).catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Failed to load message detail:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [messageSummary, token]);

  // Extract OTP verification codes (with subject prioritization to eliminate postal address 1601)
  const verificationCodes = useMemo(() => {
    if (!detail) return [];
    return extractVerificationCodes(detail.text, detail.html, detail.subject || messageSummary?.subject);
  }, [detail, messageSummary?.subject]);

  // 1-Click pure code copy with whitespace trimming
  const handleCopyCode = async (code: string) => {
    try {
      const cleanCode = code.trim();
      await navigator.clipboard.writeText(cleanCode);
      setCopiedCode(cleanCode);
      onToast(t.codeCopiedToast || t.actionCopied);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleDeleteMessage = async () => {
    if (!detail || deleting) return;
    setDeleting(true);
    try {
      await deleteMessage(detail.id, token);
      onToast(t.messageDeletedToast);
      onDeleted(detail.id);
    } catch {
      onToast(t.errorGeneric);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (attachment: {
    downloadUrl: string;
    filename: string;
    contentType: string;
  }) => {
    try {
      await downloadAttachment(
        attachment.downloadUrl,
        attachment.filename,
        attachment.contentType,
        token
      );
    } catch {
      onToast(t.errorGeneric);
    }
  };

  // Clean raw bracket URLs like [https://static.xx.fbcdn.net...] from plain text
  const cleanedText = useMemo(() => {
    if (!detail?.text) return '';
    return detail.text
      .replace(/\[https?:\/\/[^\]]+\]/g, '') // remove raw bracket URLs
      .replace(/ +/g, ' ') // normalize non-breaking spaces
      .replace(/\n{3,}/g, '\n\n') // normalize multiple newlines
      .trim();
  }, [detail?.text]);

  // Prepare sanitized HTML string with automatic image and font rendering
  const sanitizedHtmlDoc = useMemo(() => {
    if (!detail) return '';
    const rawHtml = Array.isArray(detail.html) ? detail.html.join('') : detail.html || '';
    if (!rawHtml.trim()) return '';

    // Sanitize with DOMPurify
    const clean = DOMPurify.sanitize(rawHtml, {
      WHOLE_DOCUMENT: false,
      ADD_TAGS: ['style'],
      ADD_ATTR: ['target', 'rel', 'style'],
    });

    // Content Security Policy: allow images, styles, and fonts for full rendering
    const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src * data: blob: https: http:; style-src 'unsafe-inline' *; font-src * data:; frame-src 'none';">`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="referrer" content="no-referrer">
          <base target="_blank">
          ${csp}
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 16px;
              line-height: 1.6;
              font-size: 14px;
              word-break: break-word;
              direction: auto;
            }
            a { color: #4f46e5; text-decoration: underline; }
            img { max-width: 100%; height: auto; }
            html, body {
              overflow: visible !important;
              height: auto !important;
              min-height: 100%;
            }
            table { max-width: 100% !important; }
            @media (prefers-color-scheme: dark) {
              body { color: #f1f5f9; background: #0f172a; }
              a { color: #818cf8; }
            }
          </style>
        </head>
        <body>${clean}</body>
      </html>
    `;
  }, [detail]);

  // Adjust iframe height dynamically so the full message is always completely visible
  const handleIframeLoad = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const doc = iframeRef.current.contentWindow.document;
        if (doc) {
          const updateHeight = () => {
            const h = Math.max(
              doc.body?.scrollHeight || 0,
              doc.documentElement?.scrollHeight || 0,
              doc.body?.offsetHeight || 0,
              doc.documentElement?.offsetHeight || 0,
              650
            );
            setIframeHeight(h + 30);
          };

          updateHeight();
          setTimeout(updateHeight, 250);
          setTimeout(updateHeight, 700);
          setTimeout(updateHeight, 1800);

          if (doc.body && typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => {
              updateHeight();
            });
            ro.observe(doc.body);
          }
        }
      }
    } catch {
      // Fallback
    }
  };

  if (!messageSummary) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs">
          {t.noMessageSelected}
        </p>
      </div>
    );
  }

  const senderDisplay =
    detail?.from.name || detail?.from.address || messageSummary.from.name || messageSummary.from.address || t.noSender;
  const avatarColor = getAvatarColor(detail?.from.address || senderDisplay);
  const initials = getInitials(senderDisplay);
  const subjectDisplay = detail?.subject || messageSummary.subject || t.noSubject;
  const hasHtml = !!(detail?.html && detail.html.length > 0 && detail.html.join('').trim());

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/20 dark:shadow-none overflow-hidden transition-colors">
      {/* Viewer Header / Toolbar (Cleaned without Rich HTML tab) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          {/* Mobile Back Button */}
          <button
            onClick={onBack}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            aria-label={t.backToInbox}
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {/* Delete Message Action */}
        <button
          onClick={handleDeleteMessage}
          disabled={deleting}
          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
          title={t.deleteMessage}
          aria-label={t.deleteMessage}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Metadata & Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
        {/* Subject */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white break-words">
          {subjectDisplay}
        </h3>

        {/* Sender & Recipient Information */}
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-2xs ${avatarColor}`}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="truncate">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {senderDisplay}
                </span>
                {detail?.from.address && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 ms-1.5 tech-ltr font-mono">
                    &lt;{detail.from.address}&gt;
                  </span>
                )}
              </div>

              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums tech-ltr shrink-0">
                {formatFullDateTime(detail?.createdAt || messageSummary.createdAt, lang)}
              </span>
            </div>

            {detail?.to && detail.to.length > 0 && (
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                <span>{t.to}: </span>
                <span className="tech-ltr font-mono">{detail.to.map((rcp) => rcp.address).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Code Detector Chip with Instagram/Meta Registration Guidance */}
        {verificationCodes.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  {t.verificationCodeDetected}:
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {verificationCodes.map((code) => {
                  const isCopied = copiedCode === code;
                  return (
                    <button
                      key={code}
                      onClick={() => handleCopyCode(code)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-mono font-bold text-sm tracking-widest flex items-center gap-2 shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      title={t.copyCode}
                    >
                      <span>{code}</span>
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-indigo-200" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Media Sign-up Guidance (Why Instagram throws 'An error occurred') */}
            <div className="flex items-start gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900/85 dark:text-indigo-300/85 leading-relaxed">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p>{t.socialCodeTip}</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Body Pane (Clean rendering without Rich HTML tab) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[250px]">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <span className="text-sm">{t.refreshing}</span>
          </div>
        ) : hasHtml ? (
          <iframe
            ref={iframeRef}
            srcDoc={sanitizedHtmlDoc}
            title={subjectDisplay}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
            className="w-full border-0 rounded-2xl bg-transparent transition-all min-h-[650px]"
            style={{ height: `${Math.max(650, iframeHeight)}px` }}
            onLoad={handleIframeLoad}
          />
        ) : (
          <div className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words" dir="auto">
            {cleanedText || '(Empty body)'}
          </div>
        )}
      </div>

      {/* Attachments Section */}
      {detail?.attachments && detail.attachments.length > 0 && (
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <Paperclip className="w-3.5 h-3.5" />
            <span>
              {t.attachmentsTitle} ({detail.attachments.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {detail.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={att.filename}>
                    {att.filename}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {formatFileSize(att.size)}
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(att)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
                  title={t.download}
                  aria-label={`${t.download} ${att.filename}`}
                >
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helpers for Sender Initials and Avatar Colors
function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return '?';
  const clean = nameOrEmail.replace(/<.*>/, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function getAvatarColor(key: string): string {
  const colors = [
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFullDateTime(timestampOrIso: number | string, lang: Language): string {
  const date = typeof timestampOrIso === 'number' ? new Date(timestampOrIso) : new Date(timestampOrIso);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
