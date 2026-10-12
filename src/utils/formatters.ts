import { Language } from '../types';

/**
 * Format relative time (e.g. "5m ago" or "منذ 5 دقائق")
 */
export function formatRelativeTime(dateString: string, lang: Language): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 10) {
      return lang === 'ar' ? 'الآن' : 'just now';
    }
    if (diffSec < 60) {
      return lang === 'ar' ? `منذ ${diffSec} ثوانٍ` : `${diffSec}s ago`;
    }
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return lang === 'ar' ? `منذ ${diffMin} د` : `${diffMin}m ago`;
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return lang === 'ar' ? `منذ ${diffHours} س` : `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  } catch {
    return dateString;
  }
}

/**
 * Format full date & time with localized Intl
 */
export function formatFullDateTime(dateString: string, lang: Language): string {
  try {
    const date = new Date(dateString);
    const locale = lang === 'ar' ? 'ar-u-nu-latn' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format bytes to readable size (KB / MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get consistent avatar background color from email/name
 */
export function getAvatarColor(identifier: string): string {
  const colors = [
    'bg-indigo-500 text-white',
    'bg-violet-500 text-white',
    'bg-cyan-600 text-white',
    'bg-emerald-600 text-white',
    'bg-rose-500 text-white',
    'bg-amber-600 text-white',
    'bg-sky-600 text-white',
    'bg-fuchsia-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Extract initial letter for avatar
 */
export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return '?';
  const clean = nameOrEmail.trim().replace(/^["'<]+/, '');
  return clean.charAt(0).toUpperCase() || '?';
}
