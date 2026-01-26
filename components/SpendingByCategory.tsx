'use client';

import { useMemo } from 'react';
import type { Expense, Category } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { useTranslation } from '@/hooks/useTranslation';

interface SpendingByCategoryProps {
  expenses: Expense[];
  categories: Category[];
}

export default function SpendingByCategory({
  expenses,
  categories,
}: SpendingByCategoryProps) {
  const { t } = useTranslation();
  const spendingByCategory = useMemo(() => {
    const result: Record<string, { amount: number; count: number }> = {};
    
    expenses.forEach((expense) => {
      const categoryId = expense.categoryId || 'other';
      if (!result[categoryId]) {
        result[categoryId] = { amount: 0, count: 0 };
      }
      result[categoryId].amount += expense.amount;
      result[categoryId].count += 1;
    });
    
    return result;
  }, [expenses]);

  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

  const sortedCategories = useMemo(() => {
    return Object.entries(spendingByCategory)
      .map(([categoryId, data]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          category: category || { id: categoryId, name: 'Other', color: '#6B7280', order: 999 },
          ...data,
          percentage: totalSpending > 0 ? (data.amount / totalSpending) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [spendingByCategory, categories, totalSpending]);

  if (expenses.length === 0) {
    return (
      <div className="card">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-accent-900 mb-1">{t('overview.spendingByCategory')}</h2>
          <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
        </div>
        <div className="text-center py-8 text-accent-400 text-sm">
          {t('overview.noExpensesYet')}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-accent-900 mb-1">{t('overview.spendingByCategory')}</h2>
        <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
      </div>

      <div className="space-y-3">
        {sortedCategories.map(({ categoryId, category, amount, count, percentage }) => (
          <div key={categoryId} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {category.color && (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span className="font-medium text-accent-800">{category.name}</span>
                <span className="text-xs text-accent-500">({count})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-accent-500">{percentage.toFixed(1)}%</span>
                <span className="font-semibold text-primary-600">{formatCurrency(amount)}</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-accent-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: category.color || '#6B7280',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-accent-200 flex justify-between items-center">
        <span className="font-semibold text-accent-800">{t('common.total')}:</span>
        <span className="font-bold text-lg text-primary-600">{formatCurrency(totalSpending)}</span>
      </div>
    </div>
  );
}
