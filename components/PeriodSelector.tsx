'use client';

import { useState, useEffect } from 'react';
import { getCurrentPeriod, formatPeriodDisplay, isValidPeriod, getPreviousPeriod, getNextPeriod, PeriodFormat } from '@/lib/date';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';

interface PeriodSelectorProps {
  period: PeriodFormat;
  onPeriodChange: (period: PeriodFormat) => void;
  variant?: 'card' | 'lightweight';
}

export default function PeriodSelector({ period, onPeriodChange, variant = 'card' }: PeriodSelectorProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [isMounted, setIsMounted] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodFormat>(period);
  const [isCurrentPeriod, setIsCurrentPeriod] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const current = getCurrentPeriod(settings.periodStartDay);
    setCurrentPeriod(current);
    setIsCurrentPeriod(period === current);
  }, [period, settings.periodStartDay]);

  const goToCurrentPeriod = () => {
    if (currentPeriod) {
      onPeriodChange(currentPeriod);
    }
  };

  const goToPreviousPeriod = () => {
    onPeriodChange(getPreviousPeriod(period, settings.periodStartDay));
  };

  const goToNextPeriod = () => {
    onPeriodChange(getNextPeriod(period, settings.periodStartDay));
  };

  if (variant === 'lightweight') {
    return (
      <div className="bg-white rounded-xl border border-accent-200 px-4 py-2.5 flex items-center gap-2 hover:bg-white transition-colors duration-150">
        <button
          onClick={goToPreviousPeriod}
          className="p-1.5 rounded-lg hover:bg-accent-100 text-accent-600 hover:text-accent-900 transition-all duration-150 active:scale-[0.98]"
          title={t('periodSelector.previousPeriod')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5 px-1">
          <span className="text-sm font-medium text-accent-800" suppressHydrationWarning>
            {!isMounted ? period : formatPeriodDisplay(period)}
          </span>
          {isMounted && isCurrentPeriod && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-green-700">{t('periodSelector.current')}</span>
            </div>
          )}
        </div>

        <button
          onClick={goToNextPeriod}
          className="p-1.5 rounded-lg hover:bg-accent-100 text-accent-600 hover:text-accent-900 transition-all duration-150 active:scale-[0.98]"
          title={t('periodSelector.nextPeriod')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {!isCurrentPeriod && (
          <button
            onClick={goToCurrentPeriod}
            className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-600 hover:text-primary-700 transition-all duration-150 active:scale-[0.98]"
            title={t('periodSelector.goToCurrentPeriod')}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft-lg border border-accent-100 p-5 h-full flex items-center">
      <div className="flex flex-wrap items-center justify-between gap-4 w-full">
        {/* Left side: Navigation buttons and period display */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousPeriod}
            className="p-2 rounded-lg bg-accent-100 hover:bg-primary-100 text-accent-700 hover:text-primary-700 transition-all duration-200 active:scale-95"
            title={t('periodSelector.previousPeriod')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col items-center min-w-[200px]">
            <div className="text-lg font-bold text-accent-900" suppressHydrationWarning>
              {!isMounted ? period : formatPeriodDisplay(period)}
            </div>
            {isMounted && (
              <div className="text-xs text-accent-500 font-medium">
                {period}
              </div>
            )}
          </div>

          <button
            onClick={goToNextPeriod}
            className="p-2 rounded-lg bg-accent-100 hover:bg-primary-100 text-accent-700 hover:text-primary-700 transition-all duration-200 active:scale-95"
            title={t('periodSelector.nextPeriod')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {isMounted && isCurrentPeriod && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-50 border border-primary-200">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></div>
              <span className="text-xs font-medium text-primary-700">{t('periodSelector.current')}</span>
            </div>
          )}
        </div>

        {/* Right side: Current period button */}
        <div className="flex items-center gap-3">
          {!isCurrentPeriod && (
            <button
              onClick={goToCurrentPeriod}
              className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-700 transition-all duration-200 active:scale-95"
              title={t('periodSelector.goToCurrentPeriod')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
