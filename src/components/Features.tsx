import React from 'react';
import { UserX, Link2, ShieldCheck, Languages } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface FeaturesProps {
  lang: Language;
}

export const Features: React.FC<FeaturesProps> = ({ lang }) => {
  const t = translations[lang];

  const items = [
    {
      icon: UserX,
      title: t.feature1Title,
      desc: t.feature1Desc,
    },
    {
      icon: Link2,
      title: t.feature2Title,
      desc: t.feature2Desc,
    },
    {
      icon: ShieldCheck,
      title: t.feature3Title,
      desc: t.feature3Desc,
    },
    {
      icon: Languages,
      title: t.feature4Title,
      desc: t.feature4Desc,
    },
  ];

  return (
    <section id="features" className="py-12 sm:py-16 bg-slate-100/50 dark:bg-slate-900/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.featuresTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
