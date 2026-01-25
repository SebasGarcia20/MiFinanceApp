'use client';

import { useState, useEffect } from 'react';
import { getCurrentPeriod, PeriodFormat } from '@/lib/date';
import { calculateSummary } from '@/lib/summary';
import { useMonthData } from '@/hooks/useMonthData';
import { useSavingsData } from '@/hooks/useSavingsData';
import { useCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';
import type { ExpenseBucket } from '@/types';
import Sidebar from '@/components/Sidebar';
import PeriodSelector from '@/components/PeriodSelector';
import ExportImport from '@/components/ExportImport';
import FixedPayments from '@/components/FixedPayments';
import ExpenseBuckets from '@/components/ExpenseBuckets';
import Summary from '@/components/Summary';
import SalaryHeader from '@/components/SalaryHeader';
import SavingsSuggestionsCard from '@/components/SavingsSuggestionsCard';
import SpendingByCategory from '@/components/SpendingByCategory';
import BottomNav from '@/components/BottomNav';

export default function OverviewPage() {
  const { settings } = useSettings();
  const [period, setPeriod] = useState<PeriodFormat>(() => {
    // During SSR, use a safe default that won't cause hydration mismatch
    // We'll update to the actual period after mount
    if (typeof window === 'undefined') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = '01'; // Use day 1 as default to avoid issues
      return `${year}-${month}-${day}` as PeriodFormat;
    }
    return getCurrentPeriod(settings.periodStartDay);
  });

  // Update to actual current period after mount and when settings change
  useEffect(() => {
    if (settings.periodStartDay) {
      const currentPeriod = getCurrentPeriod(settings.periodStartDay);
      setPeriod(currentPeriod);
    }
  }, [settings.periodStartDay]);

  const {
    data,
    bucketConfigs,
    addFixedPayment,
    updateFixedPayment,
    deleteFixedPayment,
    addExpense,
    updateExpense,
    deleteExpense,
    moveExpense,
    updateMonthlyLimit,
    updateSalary,
    toggleFixedPaymentPaid,
    updateBucketPayment,
    addBucketPayment,
    getPreviousMonthExpenses,
    exportData,
    importData,
  } = useMonthData(period);

  const { goals: savingsGoals, contributions: savingsContributions, addContribution } = useSavingsData();
  const { categories, defaultCategoryId } = useCategories();
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState<Partial<Record<ExpenseBucket, number>>>({});

  // Load previous month expenses
  useEffect(() => {
    getPreviousMonthExpenses(period).then(setPreviousMonthExpenses);
  }, [period, getPreviousMonthExpenses]);

  const summary = calculateSummary(data, bucketConfigs, savingsContributions);

  const handleSaveNow = (goalId: string, amount: number) => {
    addContribution({
      goalId,
      amount,
      date: new Date().toISOString().split('T')[0],
      period,
      source: 'manual',
    });
  };

  return (
    <div className="flex min-h-screen bg-accent-50">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {/* Mobile Header - Sticky */}
          <div className="sticky top-0 z-30 bg-accent-50/95 backdrop-blur-sm border-b border-accent-200 mb-4 -mx-4 px-4 pb-4 lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:mb-6 lg:mx-0 lg:px-0 lg:pb-0 safe-area-top">
            <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:mb-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-accent-900 mb-2">
                  Overview
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 lg:pt-2 flex-shrink-0">
                <PeriodSelector period={period} onPeriodChange={setPeriod} variant="lightweight" />
                {/* <ExportImport onExport={exportData} onImport={importData} /> */}
              </div>
            </div>
          </div>

          {/* Main Grid: Mobile 1-column, Desktop 2-column layout (30% left, 70% right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-4 sm:gap-6">
            {/* LEFT COLUMN: Bills and Summary stacked */}
            <div className="lg:col-span-1 space-y-6 order-3 lg:order-1">
              <FixedPayments
                currentPeriod={period}
                fixedPayments={data.fixedPayments ?? []}
                paidFixedPayments={data.paidFixedPayments ?? []}
                bucketPayments={data.bucketPayments ?? []}
                previousMonthExpenses={previousMonthExpenses}
                bucketConfigs={bucketConfigs}
                plannedRecurringTotal={summary.plannedRecurringTotal}
                paidRecurringTotal={summary.paidRecurringTotal}
                remainingRecurringTotal={summary.remainingRecurringTotal}
                onAddFixedPayment={addFixedPayment}
                onUpdateFixedPayment={updateFixedPayment}
                onDeleteFixedPayment={deleteFixedPayment}
                onToggleFixedPaymentPaid={toggleFixedPaymentPaid}
                onUpdateBucketPayment={updateBucketPayment}
                onAddBucketPayment={addBucketPayment}
              />
              <div className="order-5 lg:order-2">
                <Summary
                  summary={summary}
                  bucketConfigs={bucketConfigs}
                  onUpdateLimit={updateMonthlyLimit}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Top row (Savings + Salary), then Expenses */}
            <div className="lg:col-span-1 space-y-6 order-4 lg:order-2">
              {/* Top row: Suggested Savings and Monthly Salary side-by-side, same height */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="lg:col-span-1 order-2 lg:order-1 h-full">
                  <SavingsSuggestionsCard
                    goals={savingsGoals}
                    contributions={savingsContributions}
                    currentPeriod={period}
                    onSaveNow={handleSaveNow}
                  />
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2 h-full">
                  <SalaryHeader
                    salary={summary.salary}
                    grandTotal={summary.grandTotal}
                    onUpdateSalary={updateSalary}
                  />
                </div>
              </div>

              {/* Current Month Expenses: Full width of right column */}
              <div className="order-4 lg:order-3">
                <ExpenseBuckets
                  expenses={data.expenses}
                  bucketConfigs={bucketConfigs}
                  categories={categories}
                  defaultCategoryId={defaultCategoryId}
                  onAdd={addExpense}
                  onUpdate={updateExpense}
                  onDelete={deleteExpense}
                />
              </div>

              {/* Spending by Category */}
              <div className="order-5 lg:order-4">
                <SpendingByCategory
                  expenses={data.expenses}
                  categories={categories}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
