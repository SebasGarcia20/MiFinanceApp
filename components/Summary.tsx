'use client';

import { useState, useEffect, useMemo } from 'react';
import { MonthSummary, BucketConfig } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { parseCurrencyInput } from '@/lib/currency';

interface SummaryProps {
  summary: MonthSummary;
  bucketConfigs: BucketConfig[];
  onUpdateLimit: (limit: number) => void;
}

export default function Summary({ summary, bucketConfigs, onUpdateLimit }: SummaryProps) {
  const bucketMap = useMemo(() => {
    const map = new Map<string, BucketConfig>();
    bucketConfigs.forEach(b => map.set(b.id, b));
    return map;
  }, [bucketConfigs]);
  
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limit, setLimit] = useState('0');
  const [isMounted, setIsMounted] = useState(false);
  
  // Track when component has mounted to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setLimit(summary.monthlyLimit.toString());
  }, [summary.monthlyLimit]);

  // Memoize the expenses list to ensure consistent ordering
  const expensesList = useMemo(() => {
    if (!isMounted) return [];
    return Object.keys(summary.expensesByBucket)
      .filter((bucketId) => summary.expensesByBucket[bucketId] > 0)
      .sort() // Ensure consistent ordering
      .map((bucketId) => ({
        bucketId,
        total: summary.expensesByBucket[bucketId],
        bucket: bucketMap.get(bucketId),
      }));
  }, [summary.expensesByBucket, bucketMap, isMounted]);

  const handleSaveLimit = () => {
    const limitNum = parseCurrencyInput(limit);
    onUpdateLimit(limitNum);
    setIsEditingLimit(false);
  };

  const handleCancelLimit = () => {
    setLimit(summary.monthlyLimit.toString());
    setIsEditingLimit(false);
  };

  const remainingPercentage = summary.monthlyLimit > 0 
    ? (summary.remainingFromLimit / summary.monthlyLimit) * 100 
    : 0;

  return (
    <div className="card">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-accent-900 mb-1">Summary</h2>
        <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
      </div>

      <div className="space-y-3">

        {/* Totals per bucket */}
        {isMounted && (
          <div>
            <h3 className="font-semibold text-sm mb-2 text-accent-700">Expenses by bucket:</h3>
            <div className="space-y-1.5">
              {expensesList.map(({ bucketId, total, bucket }) => {
                const bucketName = bucket?.name || bucketId;
                return (
                  <div 
                    key={bucketId} 
                    className="flex justify-between text-sm items-center"
                  >
                    <span className="text-accent-600">{bucketName}:</span>
                    <span className="font-semibold text-primary-600">{formatCurrency(total)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Paid bills */}
        <div className="pt-2.5 border-t border-accent-200">
          <div className="flex justify-between text-sm items-center">
            <span className="text-accent-600">Paid bills:</span>
            <span className="font-semibold text-accent-800">{formatCurrency(summary.paidRecurringTotal)}</span>
          </div>
        </div>

        {/* Grand total */}
        <div className="pt-2.5 border-t border-accent-200">
          <div className="flex justify-between font-semibold text-lg items-center">
            <span className="text-accent-800">Total expenses:</span>
            <span className="text-primary-600">{formatCurrency(summary.grandTotal)}</span>
          </div>
        </div>

        {/* Remaining from Salary - Key Metric */}
        {isMounted && summary.salary > 0 && (
          <div className="pt-2.5 border-t border-primary-300 bg-gradient-to-br from-primary-50/50 to-white rounded-lg p-1.5">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-accent-800">Money Left:</span>
              <span
                className={`font-bold text-xl ${
                  summary.remainingFromSalary >= 0 
                    ? 'text-green-600' 
                    : 'text-red-500'
                } animate-bounce-subtle`}
              >
                {formatCurrency(summary.remainingFromSalary)}
              </span>
            </div>
            <div className="text-xs text-accent-500 text-right">
              Available for savings or next period
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
