'use client';

import { useState, useEffect } from 'react';
import { getCurrentPeriod, PeriodFormat } from '@/lib/date';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import PeriodSelector from '@/components/PeriodSelector';
import PieChart from '@/components/PieChart';
import { formatCurrency } from '@/lib/currency';
import type { SpendingByCategoryItem } from '@/lib/db-helpers';
import { useSettings } from '@/hooks/useSettings';

export default function InsightsPage() {
  const { data: session } = useSession();
  const { settings } = useSettings();
  const [period, setPeriod] = useState<PeriodFormat>(() => {
    if (typeof window === 'undefined') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = '01';
      return `${year}-${month}-${day}` as PeriodFormat;
    }
    return getCurrentPeriod(settings.periodStartDay);
  });

  const [spendingData, setSpendingData] = useState<SpendingByCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.periodStartDay) {
      const currentPeriod = getCurrentPeriod(settings.periodStartDay);
      setPeriod(currentPeriod);
    }
  }, [settings.periodStartDay]);

  useEffect(() => {
    async function fetchSpendingData() {
      if (!session?.user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/insights/spending?period=${period}`);
        if (!response.ok) {
          throw new Error('Failed to fetch spending data');
        }

        const data = await response.json();
        setSpendingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpendingData();
  }, [period, session?.user?.id]);

  const totalSpending = spendingData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex min-h-screen bg-accent-50">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {/* Mobile Header - Sticky (matches Overview) */}
          <div className="sticky top-0 z-30 bg-accent-50/95 backdrop-blur-sm border-b border-accent-200 mb-4 -mx-4 px-4 pb-4 lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:mb-6 lg:mx-0 lg:px-0 lg:pb-0 safe-area-top">
            <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:mb-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-accent-900 mb-2">
                  Insights
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 lg:pt-2 flex-shrink-0">
                <PeriodSelector period={period} onPeriodChange={setPeriod} variant="lightweight" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div>
              {/* Loading progress bar */}
              <div className="mb-6">
                <div className="h-2 bg-accent-100 rounded-full overflow-hidden mb-4 relative">
                  <div className="h-full w-1/3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full animate-loading"></div>
                </div>
              </div>

              {/* Loading skeleton for insights cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart Card Skeleton */}
                <div className="card">
                  <div className="mb-4">
                    <div className="h-6 bg-accent-100 rounded-lg w-48 mb-2 animate-pulse"></div>
                    <div className="h-1 bg-accent-100 rounded-full w-12 animate-pulse"></div>
                  </div>
                  <div className="flex flex-col items-center gap-6">
                    {/* Pie chart skeleton - circular */}
                    <div className="w-60 h-60 rounded-full bg-accent-100 animate-pulse"></div>
                    {/* Legend skeleton */}
                    <div className="w-full space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg animate-pulse">
                          <div className="w-4 h-4 rounded-full bg-accent-100 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-accent-100 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-accent-100 rounded w-16"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Breakdown List Card Skeleton */}
                <div className="card">
                  <div className="mb-4">
                    <div className="h-6 bg-accent-100 rounded-lg w-40 mb-2 animate-pulse"></div>
                    <div className="h-1 bg-accent-100 rounded-full w-12 animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-1.5 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-3 h-3 rounded-full bg-accent-100"></div>
                            <div className="h-4 bg-accent-100 rounded w-24"></div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-3 bg-accent-100 rounded w-12"></div>
                            <div className="h-4 bg-accent-100 rounded w-20"></div>
                          </div>
                        </div>
                        <div className="h-2 bg-accent-100 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                  {/* Total skeleton */}
                  <div className="mt-6 pt-4 border-t border-accent-200 flex justify-between items-center animate-pulse">
                    <div className="h-4 bg-accent-100 rounded w-32"></div>
                    <div className="h-6 bg-accent-100 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="card bg-red-50 border-red-200">
              <div className="text-red-700">{error}</div>
            </div>
          ) : spendingData.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-accent-500 mb-2">No expenses yet for this period</div>
              <div className="text-sm text-accent-400">
                Add expenses in the Overview to see insights
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart Card */}
              <div className="card">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-accent-900 mb-1">Spending by Category</h2>
                  <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <PieChart data={spendingData} size={240} />

                  {/* Legend */}
                  <div className="w-full space-y-2">
                    {spendingData.map((item) => (
                      <div
                        key={item.categoryId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-50 transition-colors"
                      >
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color || '#6B7280' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-accent-800">{item.name}</span>
                            <span className="font-semibold text-sm text-primary-600 ml-2">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                          <div className="text-xs text-accent-500 mt-0.5">
                            {item.percent.toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breakdown List Card */}
              <div className="card">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-accent-900 mb-1">Category Breakdown</h2>
                  <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
                </div>

                <div className="space-y-3">
                  {spendingData.map((item) => (
                    <div key={item.categoryId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color || '#6B7280' }}
                          />
                          <span className="font-medium text-accent-800 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-2">
                          <span className="text-xs text-accent-500">{item.percent.toFixed(1)}%</span>
                          <span className="font-semibold text-primary-600 whitespace-nowrap">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 bg-accent-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percent}%`,
                            backgroundColor: item.color || '#6B7280',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-accent-200 flex justify-between items-center">
                  <span className="font-semibold text-accent-800">Total Spending:</span>
                  <span className="font-bold text-lg text-primary-600">{formatCurrency(totalSpending)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
