'use client';

import { useState } from 'react';
import { useMonthData } from '@/hooks/useMonthData';
import Sidebar from '@/components/Sidebar';
import BucketManagement from '@/components/BucketManagement';
import BottomNav from '@/components/BottomNav';
import { getCurrentPeriod } from '@/lib/date';

export default function BucketsPage() {
  const [period] = useState(() => {
    // We need to initialize with a period for the hook, but we don't actually use period data here
    return getCurrentPeriod();
  });

  const {
    bucketConfigs,
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
            <h1 className="text-2xl sm:text-3xl font-bold text-accent-900 mb-1">Bucket Management</h1>
            <p className="text-sm sm:text-base text-accent-600 mb-2">Configure your expense buckets (cash or credit cards)</p>
            <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full" />
          </div>

          <BucketManagement
            buckets={bucketConfigs}
            onAdd={addBucketConfig}
            onUpdate={updateBucketConfig}
            onDelete={deleteBucketConfig}
            onReorder={reorderBucketConfigs}
          />
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
