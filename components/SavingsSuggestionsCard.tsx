'use client';

import { useState, useEffect, useMemo } from 'react';
import { SavingsGoal, SavingsContribution } from '@/types';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface SavingsSuggestionsCardProps {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  currentPeriod: string;
  onSaveNow: (goalId: string, amount: number) => void;
}

export default function SavingsSuggestionsCard({
  goals,
  contributions,
  currentPeriod,
  onSaveNow,
}: SavingsSuggestionsCardProps) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter goals that have monthly targets
  const goalsWithMonthlyTarget = useMemo(() => {
    return goals.filter(g => g.monthlyTarget && g.monthlyTarget > 0);
  }, [goals]);

  // Calculate how much has been saved this period for each goal
  const getSavedThisPeriod = (goalId: string): number => {
    return contributions
      .filter(c => c.goalId === goalId && c.period === currentPeriod)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  // Calculate progress for each goal and sort by relevance (closest to completion)
  const goalsWithProgress = useMemo(() => {
    return goalsWithMonthlyTarget.map(goal => {
      const saved = getSavedThisPeriod(goal.id);
      const target = goal.monthlyTarget || 0;
      const progress = target > 0 ? (saved / target) * 100 : 0;
      const remaining = Math.max(0, target - saved);
      return {
        goal,
        saved,
        target,
        progress,
        remaining,
        isComplete: remaining === 0,
      };
    }).sort((a, b) => {
      // Sort by: incomplete first, then by progress (highest first)
      if (a.isComplete && !b.isComplete) return 1;
      if (!a.isComplete && b.isComplete) return -1;
      return b.progress - a.progress;
    });
  }, [goalsWithMonthlyTarget, contributions, currentPeriod]);

  // Set initial index to most relevant goal (already sorted, so index 0)
  useEffect(() => {
    if (goalsWithProgress.length > 0 && currentIndex >= goalsWithProgress.length) {
      setCurrentIndex(0);
    }
  }, [goalsWithProgress.length, currentIndex]);

  if (!isMounted) {
    return null;
  }

  // Empty state: no goals with monthly targets
  if (goalsWithProgress.length === 0) {
    return (
      <div className="card bg-gradient-to-br from-green-50/30 to-white border-green-200/50 h-full min-h-[150px] flex flex-col p-5">
        <div className="mb-2">
          <h2 className="text-lg font-bold text-accent-900 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('overview.suggestedSavings')}
          </h2>
          <div className="h-0.5 w-12 bg-green-400 rounded-full"></div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="px-3 py-2.5 bg-white/60 rounded-lg border border-green-200/50 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-accent-800 mb-0.5">
                {t('overview.noSavingsGoalsYet')}
              </p>
              <p className="text-xs text-accent-500 leading-relaxed">
                {t('overview.addSavingsGoalDescription')}
              </p>
            </div>
            <Link
              href="/savings"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-all duration-200 active:scale-95"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('overview.addGoal')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentGoalData = goalsWithProgress[currentIndex];
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < goalsWithProgress.length - 1;

  const goToPrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="card bg-gradient-to-br from-green-50/30 to-white border-green-200/50 h-full min-h-[150px] flex flex-col p-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-accent-900 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('overview.suggestedSavings')}
          </h2>
          <div className="h-0.5 w-12 bg-green-400 rounded-full"></div>
        </div>
        {goalsWithProgress.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={`p-1 rounded-lg transition-all duration-200 ${
                canGoPrevious
                  ? 'hover:bg-green-100 text-green-700 active:scale-95'
                  : 'text-green-300 cursor-not-allowed'
              }`}
              title={t('overview.previousGoal')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-accent-600 font-medium min-w-[2.5rem] text-center">
              {currentIndex + 1}/{goalsWithProgress.length}
            </span>
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`p-1 rounded-lg transition-all duration-200 ${
                canGoNext
                  ? 'hover:bg-green-100 text-green-700 active:scale-95'
                  : 'text-green-300 cursor-not-allowed'
              }`}
              title={t('overview.nextGoal')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="px-3 py-2.5 bg-white/60 rounded-lg border border-green-200/50 hover:border-green-300/50 transition-all duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-accent-800 mb-1 truncate">
                {currentGoalData.goal.name}
              </div>
              <div className="text-xs text-accent-600">
                <span className="font-medium text-green-700">{formatCurrency(currentGoalData.saved)}</span>
                <span className="text-accent-500"> / </span>
                <span className="text-accent-600">{formatCurrency(currentGoalData.target)}</span>
              </div>
            </div>
            <button
              onClick={() => onSaveNow(currentGoalData.goal.id, currentGoalData.remaining)}
              disabled={currentGoalData.isComplete}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
                currentGoalData.isComplete
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
              }`}
            >
              {currentGoalData.isComplete ? t('overview.completeWithCheck') : t('overview.complete')}
            </button>
          </div>
        </div>

        {goalsWithProgress.length > 1 && (
          <div className="mt-2 pt-2 border-t border-green-200/50">
            <Link
              href="/savings"
              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 transition-colors"
            >
              {t('overview.viewAllGoals')}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
