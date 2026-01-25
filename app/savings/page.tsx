'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Savings from '@/components/Savings';
import BottomNav from '@/components/BottomNav';
import { useSavingsData } from '@/hooks/useSavingsData';
import { getCurrentPeriod } from '@/lib/date';

export default function SavingsPage() {
  const [period] = useState(() => {
    if (typeof window === 'undefined') {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;
    }
    return getCurrentPeriod();
  });

  const {
    goals,
    contributions,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
  } = useSavingsData();

  return (
    <div className="flex min-h-screen bg-accent-50">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Mobile header - sticky (matches Buckets / Overview) */}
          <div className="sticky top-0 z-30 bg-accent-50/95 backdrop-blur-sm border-b border-accent-200 -mx-4 px-4 pb-4 mb-4 lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:mb-6 lg:mx-0 lg:px-0 lg:pb-0 safe-area-top">
            <h1 className="text-2xl sm:text-3xl font-bold text-accent-900 mb-1">Savings</h1>
            <p className="text-sm sm:text-base text-accent-600 mb-2">Track your progress toward your savings goals</p>
            <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full" />
          </div>

          <Savings
            goals={goals}
            contributions={contributions}
            currentPeriod={period}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
            onAddContribution={addContribution}
            onDeleteContribution={deleteContribution}
          />
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
