import React from 'react';
import { Clock, PlusCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface ExpiredNoticeProps {
  lang: Language;
  onCreateNew: () => void;
  isNotFound?: boolean;
}

export const ExpiredNotice: React.FC<ExpiredNoticeProps> = ({
  lang,
  onCreateNew,
  isNotFound = false,
}) => {
  const t = translations[lang];

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10 text-center space-y-6 transition-colors">
      <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
        <Clock className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {isNotFound ? t.notFoundTitle : t.expiredTitle}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {isNotFound ? t.notFoundDesc : t.expiredDesc}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{t.actionCreateNew}</span>
        </button>
      </div>
    </div>
  );
};
