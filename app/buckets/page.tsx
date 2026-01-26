'use client';

import { useState } from 'react';
import { useMonthData } from '@/hooks/useMonthData';
import Sidebar from '@/components/Sidebar';
import BucketManagement from '@/components/BucketManagement';
import BottomNav from '@/components/BottomNav';
import { getCurrentPeriod } from '@/lib/date';
import { useTranslation } from '@/hooks/useTranslation';

export default function BucketsPage() {
  const { t } = useTranslation();
  const [period] = useState(() => {
    // We need to initialize with a period for the hook, but we don't actually use period data here
    return getCurrentPeriod();
  });

  const {
    bucketConfigs,
    isLoading,
    addBucketConfig,
    updateBucketConfig,
    deleteBucketConfig,
    reorderBucketConfigs,
  } = useMonthData(period);

  return (
    <div className="flex min-h-screen bg-accent-50">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Mobile header - sticky, matches Overview */}
          <div className="sticky top-0 z-30 bg-accent-50/95 backdrop-blur-sm border-b border-accent-200 -mx-4 px-4 pb-4 mb-4 lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:mb-6 lg:mx-0 lg:px-0 lg:pb-0 safe-area-top">
            <h1 className="text-2xl sm:text-3xl font-bold text-accent-900 mb-1">{t('buckets.title')}</h1>
            <p className="text-sm sm:text-base text-accent-600 mb-2">{t('buckets.subtitle')}</p>
            <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full" />
          </div>

          {isLoading ? (
            <div className="card">
              {/* Loading progress bar */}
              <div className="mb-6">
                <div className="h-2 bg-accent-100 rounded-full overflow-hidden mb-4 relative">
                  <div className="h-full w-1/3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full animate-loading"></div>
                </div>
                <div className="h-6 bg-accent-100 rounded-lg w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-accent-100 rounded-lg w-64 animate-pulse"></div>
              </div>
              
              {/* Loading skeleton for buckets */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-2 border-accent-200 rounded-xl p-4 bg-gradient-to-br from-white to-primary-50/30 animate-pulse"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-accent-100 rounded w-32"></div>
                        <div className="h-8 bg-accent-100 rounded w-20"></div>
                      </div>
                      <div className="h-10 bg-accent-100 rounded"></div>
                      <div className="h-10 bg-accent-100 rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-9 bg-accent-100 rounded flex-1"></div>
                        <div className="h-9 bg-accent-100 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <BucketManagement
              buckets={bucketConfigs}
              onAdd={addBucketConfig}
              onUpdate={updateBucketConfig}
              onDelete={deleteBucketConfig}
              onReorder={reorderBucketConfigs}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
