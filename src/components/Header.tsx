import React from 'react';
import { Mail, Clock, Sun, Moon } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  theme: Theme;
  onSelectLang: (lang: Language) => void;
  onSelectTheme: (theme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  theme,
  onSelectLang,
  onSelectTheme,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark with Envelope + Clock Logo */}
        <a
          href={`/${lang}`}
          className="flex items-center gap-2.5 text-slate-900 dark:text-white group select-none whitespace-nowrap shrink-0"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Mail className="w-5 h-5 text-white" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <Clock className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-slate-200 bg-clip-text text-transparent">
            {t.brand}
          </span>
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#how-it-works"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t.howItWorksTitle}
          </a>
          <a
            href="#features"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t.featuresTitle}
          </a>
          <a
            href="#faq"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t.faqTitle}
          </a>
        </nav>

        {/* Zone 3: Language & Day/Night (النهار والليل) Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Day / Night Mode Segmented Control (وضع النهار والليل) */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onSelectTheme('light')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-amber-600 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
              title={lang === 'ar' ? 'وضع النهار (فاتح)' : 'Day mode (Light)'}
              aria-label={lang === 'ar' ? 'وضع النهار' : 'Day mode'}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'النهار' : 'Day'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTheme('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900 text-indigo-300 shadow-xs ring-1 ring-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
              title={lang === 'ar' ? 'وضع الليل (داكن)' : 'Night mode (Dark)'}
              aria-label={lang === 'ar' ? 'وضع الليل' : 'Night mode'}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'ar' ? 'الليل' : 'Night'}</span>
            </button>
          </div>

          {/* Bilingual Language Switcher (العربية / English) */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onSelectLang('ar')}
              className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'ar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="التبديل إلى اللغة العربية"
            >
              <span>العربية</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectLang('en')}
              className={`flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="Switch to English"
            >
              <span>English</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
