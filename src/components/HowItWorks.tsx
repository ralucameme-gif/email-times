import React from 'react';
import { Timer, MailCheck, Trash2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const t = translations[lang];

  const steps = [
    {
      icon: Timer,
      title: t.step1Title,
      desc: t.step1Desc,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      icon: MailCheck,
      title: t.step2Title,
      desc: t.step2Desc,
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50',
    },
    {
      icon: Trash2,
      title: t.step3Title,
      desc: t.step3Desc,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50',
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.howItWorksTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${step.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
