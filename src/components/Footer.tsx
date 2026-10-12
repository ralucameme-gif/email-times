import React from 'react';
import { Mail, Clock, ExternalLink, Sun, Moon } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../i18n/translations';
import { LegalModalType } from './LegalModals';

interface FooterProps {
  lang: Language;
  theme: Theme;
  onOpenLegal: (type: LegalModalType) => void;
  onSelectLang: (lang: Language) => void;
  onSelectTheme: (theme: Theme) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  theme,
  onOpenLegal,
  onSelectLang,
  onSelectTheme,
}) => {
  const t = translations[lang];

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          {/* Brand & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-start">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-xs">
              <Mail className="w-4 h-4 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <Clock className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {t.brand}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.footerTagline}
              </p>
            </div>
          </div>

          {/* Legal and Support Links, Theme Switcher & Language Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {t.privacyPolicy}
            </button>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {t.termsOfService}
            </button>
            <button
              onClick={() => onOpenLegal('contact')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {t.contact}
            </button>

            {/* Day / Night Mode in Footer */}
            <div className="flex items-center gap-2 border-s border-slate-200 dark:border-slate-700 ps-4">
              <button
                onClick={() => onSelectTheme('light')}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'font-bold text-amber-600 dark:text-amber-400'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title={lang === 'ar' ? 'وضع النهار' : 'Day mode'}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'ar' ? 'النهار' : 'Day'}</span>
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                onClick={() => onSelectTheme('dark')}
                className={`flex items-center gap-1 transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'font-bold text-indigo-500 dark:text-indigo-400'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title={lang === 'ar' ? 'وضع الليل' : 'Night mode'}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'ar' ? 'الليل' : 'Night'}</span>
              </button>
            </div>

            {/* Direct Language Links */}
            <div className="flex items-center gap-2 border-s border-slate-200 dark:border-slate-700 ps-4">
              <button
                onClick={() => onSelectLang('ar')}
                className={`transition-colors cursor-pointer ${
                  lang === 'ar'
                    ? 'font-bold text-indigo-600 dark:text-indigo-400'
                    : 'hover:text-indigo-600'
                }`}
              >
                العربية
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                onClick={() => onSelectLang('en')}
                className={`transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'font-bold text-indigo-600 dark:text-indigo-400'
                    : 'hover:text-indigo-600'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row with mandatory mail.tm attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} {t.brand}. All rights reserved.</p>

          {/* Mandatory visible link back to mail.tm per API Terms of Use */}
          <a
            href="https://mail.tm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>{t.poweredBy}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
