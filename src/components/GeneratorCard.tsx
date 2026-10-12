import React, { useState } from 'react';
import { Mail, Sparkles, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Language, LIFETIME_OPTIONS, LifetimeOption } from '../types';
import { translations } from '../i18n/translations';

interface GeneratorCardProps {
  lang: Language;
  onGenerate: (durationSeconds: number) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const GeneratorCard: React.FC<GeneratorCardProps> = ({
  lang,
  onGenerate,
  isLoading,
  error,
}) => {
  const t = translations[lang];
  // Default to 1 hour (3600 seconds)
  const [selectedOption, setSelectedOption] = useState<LifetimeOption>(
    () => LIFETIME_OPTIONS.find((opt) => opt.id === '1h') || LIFETIME_OPTIONS[2]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onGenerate(selectedOption.seconds);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-8 transition-colors">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.generatorTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.generatorDesc}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t.badgeSecure}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Lifespan Selector */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t.chooseLifespan}
            </label>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t.maxLifespanNote}
            </span>
          </div>

          {/* Lifespan button chips */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {LIFETIME_OPTIONS.map((opt) => {
              const isSelected = selectedOption.id === opt.id;
              const label = lang === 'ar' ? opt.labelAr : opt.labelEn;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOption(opt)}
                  className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-center text-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600 font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70'
                  }`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.creatingButton}</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                <span>{t.createButton}</span>
                <Sparkles className="w-4 h-4 text-indigo-200" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
