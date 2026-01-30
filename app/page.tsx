'use client';

import { useState, useEffect } from 'react';
import { getCurrentPeriod, PeriodFormat } from '@/lib/date';
import { calculateSummary } from '@/lib/summary';
import { useMonthData } from '@/hooks/useMonthData';
import { useSavingsData } from '@/hooks/useSavingsData';
import { useCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
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
import OnboardingModal from '@/components/OnboardingModal';

export default function OverviewPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [period, setPeriod] = useState<PeriodFormat>(() => {
    // Always use day 1 as initial value to ensure server and client match
    // We'll update to the actual period after mount
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = '01'; // Use day 1 as default to avoid hydration mismatch
    return `${year}-${month}-${day}` as PeriodFormat;
  });

  // Update to actual current period after mount and when settings change
  useEffect(() => {
    const startDay = settings.periodStartDay || 1;
    const currentPeriod = getCurrentPeriod(startDay);
    setPeriod(currentPeriod);
  }, [settings.periodStartDay]);

  const {
    data,
    bucketConfigs,
    isLoading: isLoadingMonthData,
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
  const { categories, defaultCategoryId, isLoading: isLoadingCategories } = useCategories();
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState<Partial<Record<ExpenseBucket, number>>>({});
  const [previousExpensesLoadedForPeriod, setPreviousExpensesLoadedForPeriod] = useState<PeriodFormat | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Combined loading state - show loading if any data is still loading
  const isLoading = isLoadingMonthData || isLoadingCategories;

  // Check if user needs onboarding
  useEffect(() => {
    setIsMounted(true);
    
    // Check if onboarding was already completed
    const onboardingCompleted = localStorage.getItem('flowly-onboarding-completed');
    if (onboardingCompleted === 'true') {
      return;
    }

    // Check if user has default settings (needs onboarding)
    const hasDefaultPeriod = settings.periodStartDay === 1; // Default from userDefaults
    const hasDefaultBuckets = bucketConfigs.length === 3 && 
      bucketConfigs.some(b => b.name === 'Cash') &&
      bucketConfigs.some(b => b.name === 'Bank') &&
      bucketConfigs.some(b => b.name === 'Credit Card' && b.paymentDay === 20);

    // Show onboarding if user has defaults and hasn't completed it
    if (hasDefaultPeriod && hasDefaultBuckets) {
      setShowOnboarding(true);
    }
  }, [settings.periodStartDay, bucketConfigs]);

  // Track initial load completion to ensure loading state is visible for at least 300ms
  useEffect(() => {
    if (initialLoad && !isLoadingMonthData && !isLoadingCategories) {
      // Add a small delay to ensure loading state is visible even if data loads quickly
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingMonthData, isLoadingCategories, initialLoad]);

  // Load previous month expenses (use settings.periodStartDay so previous period matches your period, e.g. 15→15).
  // Clear first when period changes so we never sync bucket payments with stale previous-period data.
  useEffect(() => {
    setPreviousMonthExpenses({});
    setPreviousExpensesLoadedForPeriod(null);
    const startDay = settings.periodStartDay ?? 1;
    getPreviousMonthExpenses(period, startDay).then((data) => {
      setPreviousMonthExpenses(data);
      setPreviousExpensesLoadedForPeriod(period);
    });
  }, [period, getPreviousMonthExpenses, settings.periodStartDay]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('flowly-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

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
      {/* Onboarding Modal */}
      {isMounted && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Sidebar - Hidden on mobile */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {/* Mobile Header - Sticky */}
          <div className="sticky top-0 z-30 bg-accent-50/95 backdrop-blur-sm border-b border-accent-200 mb-4 -mx-4 px-4 pb-4 lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:mb-6 lg:mx-0 lg:px-0 lg:pb-0 safe-area-top">
            <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:mb-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-accent-900 mb-2" suppressHydrationWarning>
                  {t('overview.title')}
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
              {isLoadingMonthData || initialLoad ? (
                <div className="card">
                  {/* Loading progress bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-accent-100 rounded-full overflow-hidden mb-4 relative">
                      <div className="h-full w-1/3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full animate-loading"></div>
                    </div>
                    <div className="h-5 bg-accent-100 rounded-lg w-40 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-accent-100 rounded-lg w-56 animate-pulse"></div>
                  </div>
                  {/* Loading skeleton for fixed payments */}
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="border border-accent-200 rounded-lg p-3 bg-gradient-to-br from-white to-primary-50/30 animate-pulse">
                        <div className="h-4 bg-accent-100 rounded w-32 mb-2"></div>
                        <div className="h-10 bg-accent-100 rounded mb-2"></div>
                        <div className="h-8 bg-accent-100 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <FixedPayments
                  currentPeriod={period}
                  periodStartDay={settings.periodStartDay ?? 1}
                  fixedPayments={data.fixedPayments ?? []}
                  paidFixedPayments={data.paidFixedPayments ?? []}
                  bucketPayments={data.bucketPayments ?? []}
                  previousMonthExpenses={previousMonthExpenses}
                  previousExpensesLoadedForPeriod={previousExpensesLoadedForPeriod}
                  isMonthDataLoaded={!isLoadingMonthData}
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
              )}
              <div className="order-5 lg:order-2">
                {isLoadingMonthData || initialLoad ? (
                  <div className="card">
                    {/* Loading progress bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-accent-100 rounded-full overflow-hidden mb-4 relative">
                        <div className="h-full w-1/3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full animate-loading"></div>
                      </div>
                      <div className="h-5 bg-accent-100 rounded-lg w-32 mb-2 animate-pulse"></div>
                    </div>
                    {/* Loading skeleton for summary */}
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="h-4 bg-accent-100 rounded w-24 animate-pulse"></div>
                          <div className="h-4 bg-accent-100 rounded w-20 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Summary
                    summary={summary}
                    bucketConfigs={bucketConfigs}
                    onUpdateLimit={updateMonthlyLimit}
                  />
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Top row (Savings + Salary), then Expenses */}
            <div className="lg:col-span-1 space-y-6 order-4 lg:order-2">
              {/* Top row: Suggested Savings and Monthly Salary side-by-side, same height */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="lg:col-span-1 order-2 lg:order-1 h-full">
                  {isLoadingMonthData || initialLoad ? (
                    <div className="card h-full">
                      {/* Loading progress bar */}
                      <div className="mb-4">
                        <div className="h-2 bg-accent-100 rounded-full overflow-hidden mb-4 relative">
                          <div className="h-full w-1/3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full animate-loading"></div>
                        </div>
                        <div className="h-5 bg-accent-100 rounded-lg w-40 mb-2 animate-pulse"></div>
                      </div>
                      {/* Loading skeleton for savings */}
                      <div className="space-y-3">
                        <div className="h-16 bg-accent-100 rounded-lg animate-pulse"></div>
                        <div className="h-16 bg-accent-100 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <SavingsSuggestionsCard
                      goals={savingsGoals}
                      contributions={savingsContributions}
                      currentPeriod={period}
                      onSaveNow={handleSaveNow}
                    />
                  )}
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2 h-full">
                  {isLoadingMonthData || initialLoad ? (
                    <div className="card h-full">
                      {/* Loading progress bar */}
                      <div className="mb-4">
                        <div className="h-2 bg-accent-100 rounded-full overflow-hidden mb-4 relative">
                          <div className="h-full w-1/3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full animate-loading"></div>
                        </div>
                        <div className="h-5 bg-accent-100 rounded-lg w-36 mb-2 animate-pulse"></div>
                      </div>
                      {/* Loading skeleton for salary */}
                      <div className="space-y-3">
                        <div className="h-12 bg-accent-100 rounded-lg animate-pulse"></div>
                        <div className="h-8 bg-accent-100 rounded-lg w-32 animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <SalaryHeader
                      salary={summary.salary}
                      grandTotal={summary.grandTotal}
                      onUpdateSalary={updateSalary}
                    />
                  )}
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
                  isLoading={isLoadingMonthData || isLoadingCategories || initialLoad}
                />
              </div>

              {/* Spending by Category */}
              <div className="order-5 lg:order-4">
                {isLoadingMonthData || isLoadingCategories || initialLoad ? (
                  <div className="card">
                    {/* Loading progress bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-accent-100 rounded-full overflow-hidden mb-4 relative">
                        <div className="h-full w-1/3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full animate-loading"></div>
                      </div>
                      <div className="h-5 bg-accent-100 rounded-lg w-40 mb-2 animate-pulse"></div>
                    </div>
                    {/* Loading skeleton for spending by category */}
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-1.5 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-accent-100"></div>
                              <div className="h-4 bg-accent-100 rounded w-24"></div>
                            </div>
                            <div className="h-4 bg-accent-100 rounded w-20"></div>
                          </div>
                          <div className="h-2 bg-accent-100 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <SpendingByCategory
                    expenses={data.expenses}
                    categories={categories}
                  />
                )}
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
