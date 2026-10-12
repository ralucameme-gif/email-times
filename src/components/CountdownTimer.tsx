import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { getServerNow } from '../services/api';

interface CountdownTimerProps {
  expiresAt: number;
  totalDurationSeconds: number;
  lang: Language;
  onExpire: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  totalDurationSeconds,
  lang,
  onExpire,
  compact = false,
}) => {
  const t = translations[lang];
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    return Math.max(0, expiresAt - getServerNow());
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = getServerNow();
      const diff = Math.max(0, expiresAt - now);
      setRemainingMs(diff);
      if (diff <= 0) {
        onExpire();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Refresh immediately when document visibility changes (tab wake-up)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateCountdown();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [expiresAt, onExpire]);

  const totalMs = totalDurationSeconds * 1000;
  const progressRatio = Math.max(0, Math.min(1, remainingMs / (totalMs || 1)));

  // Color shift: green -> amber -> red
  let colorClass = 'text-emerald-500 stroke-emerald-500 bg-emerald-500';
  let badgeBorderClass = 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300';

  if (progressRatio <= 0.15 || remainingMs <= 5 * 60 * 1000) {
    colorClass = 'text-rose-500 stroke-rose-500 bg-rose-500';
    badgeBorderClass = 'border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300';
  } else if (progressRatio <= 0.45) {
    colorClass = 'text-amber-500 stroke-amber-500 bg-amber-500';
    badgeBorderClass = 'border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300';
  }

  const secondsTotal = Math.floor(remainingMs / 1000);
  const days = Math.floor(secondsTotal / (3600 * 24));
  const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;

  // SVG Progress Ring calculations
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${badgeBorderClass}`}>
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span className="font-mono tabular-nums tech-ltr font-semibold">
          {days > 0 ? `${days}d ` : ''}
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>{t.timeRemaining}</span>
        </div>

        {/* Small circular ring */}
        <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
          <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-slate-200 dark:stroke-slate-700 fill-none"
              strokeWidth="4"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className={`fill-none transition-all duration-500 ${colorClass.split(' ')[1]}`}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Numerical breakdown with Tabular Figures */}
      <div className="grid grid-cols-4 gap-2 text-center tech-ltr">
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          <span className="block font-mono tabular-nums text-lg font-bold text-slate-900 dark:text-white">
            {String(days).padStart(2, '0')}
          </span>
          <span className="block text-[10px] uppercase font-medium text-slate-400 dark:text-slate-500">
            {t.daysFull}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          <span className="block font-mono tabular-nums text-lg font-bold text-slate-900 dark:text-white">
            {String(hours).padStart(2, '0')}
          </span>
          <span className="block text-[10px] uppercase font-medium text-slate-400 dark:text-slate-500">
            {t.hoursFull}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          <span className="block font-mono tabular-nums text-lg font-bold text-slate-900 dark:text-white">
            {String(minutes).padStart(2, '0')}
          </span>
          <span className="block text-[10px] uppercase font-medium text-slate-400 dark:text-slate-500">
            {t.minutesFull}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          <span className={`block font-mono tabular-nums text-lg font-bold ${colorClass.split(' ')[0]}`}>
            {String(seconds).padStart(2, '0')}
          </span>
          <span className="block text-[10px] uppercase font-medium text-slate-400 dark:text-slate-500">
            {t.secondsFull}
          </span>
        </div>
      </div>

      {/* Linear progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full transition-all duration-500 ${colorClass.split(' ')[2]}`}
          style={{ width: `${Math.round(progressRatio * 100)}%` }}
        />
      </div>
    </div>
  );
};
