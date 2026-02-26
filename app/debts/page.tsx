'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Debts from '@/components/Debts';
import BottomNav from '@/components/BottomNav';
import { useDebtsData } from '@/hooks/useDebtsData';
import { useSettings } from '@/hooks/useSettings';
import { getCurrentPeriod, type PeriodFormat } from '@/lib/date';
import { useTranslation } from '@/hooks/useTranslation';

export default function DebtsPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [period, setPeriod] = useState<PeriodFormat>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = '01';
    return `${year}-${month}-${day}` as PeriodFormat;
  });

  useEffect(() => {
    const startDay = settings.periodStartDay ?? 1;
    setPeriod(getCurrentPeriod(startDay));
  }, [settings.periodStartDay]);

  const { debts, isLoading, addDebt, updateDebt, deleteDebt, addPayment, deletePayment } = useDebtsData();

  return (
    <div className="flex min-h-screen bg-accent-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="sticky top-0 z-30 bg-accent-50/95 backdrop-blur-sm border-b border-accent-200 -mx-4 px-4 pb-4 mb-4 lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:mb-6 lg:mx-0 lg:px-0 lg:pb-0 safe-area-top">
            <h1 className="text-2xl sm:text-3xl font-bold text-accent-900 mb-1">{t('debts.title')}</h1>
            <p className="text-sm sm:text-base text-accent-600 mb-2">{t('debts.subtitle')}</p>
            <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full" />
          </div>

          {isLoading ? (
            <div className="card text-center py-10 text-accent-500">{t('debts.loading')}</div>
          ) : (
            <Debts
              debts={debts}
              currentPeriod={period}
              onAddDebt={addDebt}
              onUpdateDebt={updateDebt}
              onDeleteDebt={deleteDebt}
              onAddPayment={addPayment}
              onDeletePayment={deletePayment}
            />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
