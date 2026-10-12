import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import {
  Language,
  MailtmDomain,
  LIFETIME_OPTIONS,
  LifetimeOption,
} from '../types';
import { translations } from '../i18n/translations';
import { fetchDomains, generateRandomUsername } from '../services/mailtm';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentLifetimeSeconds: number;
  onConfirmChange: (
    mode: 'random' | 'custom',
    customUsername: string,
    domain: string,
    durationSeconds: number
  ) => Promise<void>;
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentLifetimeSeconds,
  onConfirmChange,
}) => {
  const t = translations[lang];
  const [mode, setMode] = useState<'random' | 'custom'>('random');
  const [domains, setDomains] = useState<MailtmDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [customUsername, setCustomUsername] = useState<string>('');
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lifespan chips preselected to current lifetime
  const [selectedOption, setSelectedOption] = useState<LifetimeOption>(() => {
    return (
      LIFETIME_OPTIONS.find((opt) => opt.seconds === currentLifetimeSeconds) ||
      LIFETIME_OPTIONS[2]
    );
  });

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoadingDomains(true);
    fetchDomains()
      .then((domainList) => {
        setDomains(domainList);
        if (domainList.length > 0) {
          setSelectedDomain(domainList[0].domain);
        }
        setLoadingDomains(false);
      })
      .catch((err) => {
        console.error('Failed to load domains:', err);
        setError('Failed to load domains from mail.tm');
        setLoadingDomains(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'custom') {
      const trimmed = customUsername.trim().toLowerCase();
      if (!/^[a-z0-9._-]{6,30}$/.test(trimmed)) {
        setError(t.usernameRequirements);
        return;
      }
      if (!selectedDomain) {
        setError('Please select a domain');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onConfirmChange(
        mode,
        customUsername.trim().toLowerCase(),
        selectedDomain,
        selectedOption.seconds
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.changeEmailTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destructive Warning */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-relaxed">{t.changeEmailWarning}</p>
        </div>

        {/* Tab switcher: Random vs Custom */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setMode('random')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              mode === 'random'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.tabRandom}
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              mode === 'custom'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.tabCustom}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'custom' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.usernamePlaceholder}
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="e.g. alex.dev99"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 tech-ltr"
                />

                <span className="hidden sm:inline text-slate-400 font-bold">@</span>

                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  disabled={loadingDomains || domains.length === 0}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 tech-ltr shrink-0"
                >
                  {domains.map((d) => (
                    <option key={d.id} value={d.domain}>
                      {d.domain}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-400">{t.usernameRequirements}</p>
            </div>
          )}

          {/* Lifetime Options */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              {t.changeLifespanLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {LIFETIME_OPTIONS.map((opt) => {
                const isSelected = selectedOption.id === opt.id;
                const label = lang === 'ar' ? opt.labelAr : opt.labelEn;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-500 shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
              {error}
            </p>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.confirmChange}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.confirmChange}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
