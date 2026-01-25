'use client';

import { useState, useEffect } from 'react';
import { SavingsGoal, SavingsContribution } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface SavingsSuggestionsProps {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  currentPeriod: string;
  onSaveNow: (goalId: string, amount: number) => void;
}

export default function SavingsSuggestions({
  goals,
  contributions,
  currentPeriod,
  onSaveNow,
}: SavingsSuggestionsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter goals that have monthly targets
  const goalsWithMonthlyTarget = goals.filter(g => g.monthlyTarget && g.monthlyTarget > 0);

  if (!isMounted || goalsWithMonthlyTarget.length === 0) {
    return null;
  }

  // Calculate how much has been saved this period for each goal
  const getSavedThisPeriod = (goalId: string): number => {
    return contributions
      .filter(c => c.goalId === goalId && c.period === currentPeriod)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  return (
    <div className="mt-4 pt-4 border-t-2 border-green-200 bg-gradient-to-br from-green-50/50 to-white rounded-lg p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-accent-700 mb-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Suggested savings this month
        </h3>
        <p className="text-xs text-accent-500">Optional - save toward your goals</p>
      </div>

      <div className="space-y-2">
        {goalsWithMonthlyTarget.map((goal) => {
          const savedThisPeriod = getSavedThisPeriod(goal.id);
          const remaining = Math.max(0, (goal.monthlyTarget || 0) - savedThisPeriod);
          const progress = goal.monthlyTarget ? (savedThisPeriod / goal.monthlyTarget) * 100 : 0;

          return (
            <div
              key={goal.id}
              className="px-3 py-2.5 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-accent-800 truncate">{goal.name}</span>
                    {savedThisPeriod > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                        Saved: {formatCurrency(savedThisPeriod)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-accent-600">
                    <span>Monthly target: <span className="font-semibold text-accent-800">{formatCurrency(goal.monthlyTarget || 0)}</span></span>
                    {remaining > 0 && (
                      <span className="text-accent-500">• Remaining: <span className="font-semibold">{formatCurrency(remaining)}</span></span>
                    )}
                  </div>
                  {goal.monthlyTarget && goal.monthlyTarget > 0 && (
                    <div className="mt-1.5">
                      <div className="w-full bg-green-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onSaveNow(goal.id, remaining)}
                  disabled={remaining === 0}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
                    remaining === 0
                      ? 'bg-green-100 text-green-600 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                  }`}
                >
                  {remaining === 0 ? '✓ Complete' : 'Save now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
