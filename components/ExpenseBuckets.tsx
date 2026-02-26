'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Expense, ExpenseBucket, BucketConfig, Category } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { parseCurrencyInput } from '@/lib/currency';
import CategorySelector from '@/components/CategorySelector';
import { useTranslation } from '@/hooks/useTranslation';

interface ExpenseBucketsProps {
  expenses: Expense[];
  bucketConfigs: BucketConfig[];
  categories: Category[];
  defaultCategoryId: string;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function ExpenseBuckets({
  expenses,
  bucketConfigs,
  categories,
  defaultCategoryId,
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false,
}: ExpenseBucketsProps) {
  const { t } = useTranslation();
  const sortedBuckets = useMemo(() => {
    return [...bucketConfigs].sort((a, b) => a.order - b.order);
  }, [bucketConfigs]);

  const [activeTab, setActiveTab] = useState<ExpenseBucket>(
    sortedBuckets.length > 0 ? sortedBuckets[0].id : ''
  );

  const bucketMap = useMemo(() => {
    const map = new Map<string, BucketConfig>();
    sortedBuckets.forEach(b => map.set(b.id, b));
    return map;
  }, [sortedBuckets]);

  const expensesByBucket = useMemo(() => {
    const result: Record<string, Expense[]> = {};
    sortedBuckets.forEach(bucket => {
      result[bucket.id] = expenses.filter(e => e.bucket === bucket.id);
    });
    return result;
  }, [expenses, sortedBuckets]);

  // Calculate grid columns for desktop based on number of buckets
  const desktopGridCols = useMemo(() => {
    const bucketCount = sortedBuckets.length;
    if (bucketCount === 1) return 'md:grid-cols-1';
    if (bucketCount === 2) return 'md:grid-cols-2';
    // 3 or more buckets
    return 'md:grid-cols-3';
  }, [sortedBuckets.length]);

  // Show loading skeleton when loading
  if (isLoading) {
    return (
      <div className="card">
        <div className="mb-6">
          {/* Loading progress bar */}
          <div className="mb-4">
            <div className="h-2 bg-accent-100 rounded-full overflow-hidden mb-4 relative">
              <div className="h-full w-1/3 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full animate-loading"></div>
            </div>
            <div className="h-6 bg-accent-100 rounded-lg w-48 mb-2 animate-pulse"></div>
            <div className="h-0.5 w-12 bg-accent-100 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading skeleton for expense buckets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-2 border-accent-200 rounded-xl p-4 bg-gradient-to-br from-white to-primary-50/30 animate-pulse">
              <div className="space-y-3">
                {/* Bucket header */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-100"></div>
                  <div className="h-4 bg-accent-100 rounded w-24"></div>
                </div>
                
                {/* Quick add form skeleton */}
                <div className="p-2.5 bg-accent-50 rounded-lg border border-accent-200 space-y-2.5">
                  <div className="flex gap-2">
                    <div className="h-10 bg-accent-100 rounded flex-1"></div>
                    <div className="h-10 bg-accent-100 rounded w-24"></div>
                  </div>
                  <div className="h-9 bg-accent-100 rounded"></div>
                  <div className="h-9 bg-accent-100 rounded"></div>
                </div>
                
                {/* Expenses list skeleton */}
                <div className="space-y-1">
                  {[1, 2].map((j) => (
                    <div key={j} className="px-2 py-1 bg-accent-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-accent-200 rounded w-32"></div>
                        <div className="h-4 bg-accent-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total skeleton */}
                <div className="pt-2 border-t border-accent-100 flex justify-between">
                  <div className="h-4 bg-accent-100 rounded w-12"></div>
                  <div className="h-4 bg-accent-100 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-accent-900 mb-1">{t('overview.currentMonthExpenses')}</h2>
        <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
      </div>

      {sortedBuckets.length === 0 ? (
        <div className="text-center py-8 text-accent-400">
          {t('buckets.noBucketsConfigured')}
        </div>
      ) : (
        <>
          {/* Mobile: Tabs */}
          <div className="md:hidden mb-4">
            <div className="flex overflow-x-auto space-x-2 pb-2 border-b-2 border-accent-100 scrollbar-hide">
              {sortedBuckets.map((bucket) => {
                const bucketExpenses = expensesByBucket[bucket.id] || [];
                const bucketTotal = bucketExpenses.reduce((sum, e) => sum + e.amount, 0);
                return (
                  <button
                    key={bucket.id}
                    onClick={() => setActiveTab(bucket.id)}
                    className={`px-4 py-2 text-sm whitespace-nowrap rounded-t-lg font-medium transition-all duration-200 ${
                      activeTab === bucket.id
                        ? 'bg-primary-400 text-white shadow-soft'
                        : 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                    }`}
                  >
                    {bucket.name}
                    {bucketExpenses.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                        {bucketExpenses.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop: Columns, Mobile: Active tab */}
          <div className={`grid grid-cols-1 ${desktopGridCols} gap-4`}>
            {sortedBuckets.map((bucket) => {
              const bucketExpenses = expensesByBucket[bucket.id] || [];
              return (
                <div
                  key={bucket.id}
                  className={`md:block ${activeTab === bucket.id ? 'block' : 'hidden'}`}
                >
                  <ExpenseBucket
                    bucket={bucket.id}
                    label={bucket.name}
                    expenses={bucketExpenses}
                    bucketConfigs={bucketConfigs}
                    categories={categories}
                    defaultCategoryId={defaultCategoryId}
                    onAdd={onAdd}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface ExpenseBucketProps {
  bucket: ExpenseBucket;
  label: string;
  expenses: Expense[];
  bucketConfigs: BucketConfig[];
  categories: Category[];
  defaultCategoryId: string;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
  onDelete: (id: string) => void;
}

function ExpenseBucket({
  bucket,
  label,
  expenses,
  bucketConfigs,
  categories,
  defaultCategoryId,
  onAdd,
  onUpdate,
  onDelete,
}: ExpenseBucketProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || !amount) return;
    if (isAdding) return; // Prevent double/triple submit (click or Enter)

    const amountNum = parseCurrencyInput(amount);
    if (amountNum === 0) return;

    setIsAdding(true);
    try {
      await onAdd({
        name: name.trim(),
        amount: amountNum,
        bucket,
        categoryId: selectedCategoryId,
      });
      setAmount('');
      setName('');
      setTimeout(() => {
        const nameInput = document.querySelector(`#bucket-${bucket}-name`) as HTMLInputElement;
        nameInput?.focus();
      }, 0);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create expense');
    } finally {
      setIsAdding(false);
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="border-2 border-accent-200 rounded-xl p-3 bg-gradient-to-br from-white to-primary-50/30 hover:border-primary-300 transition-all duration-300">
      <h3 className="font-bold mb-2 text-xs text-accent-800 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
        {label}
      </h3>

      {/* Quick add form */}
      <div className="mb-3 p-2.5 bg-gradient-to-br from-accent-50 to-white rounded-lg border border-accent-200">
        <div className="space-y-2.5">
          {/* Name and Amount row */}
          <div className="flex gap-2">
            <input
              id={`bucket-${bucket}-name`}
              type="text"
              placeholder="Expense name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const amountInput = e.currentTarget.parentElement?.querySelector('input[type="text"]:nth-of-type(2)') as HTMLInputElement;
                  amountInput?.focus();
                }
              }}
              className="input-field flex-1 min-w-0 text-base sm:text-xs h-11 sm:h-10"
            />
            <input
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              className="input-field w-24 sm:w-24 flex-shrink-0 text-base sm:text-xs h-11 sm:h-10"
            />
          </div>
          
          {/* Category selector */}
          <div>
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
              defaultCategoryId={defaultCategoryId}
            />
          </div>
          
          {/* Add button - disabled while submitting to prevent duplicate expenses */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim() || !amount || isAdding}
            className="w-full py-2 px-3 bg-primary-400 text-white rounded-lg font-semibold text-xs hover:bg-primary-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-400 flex items-center justify-center gap-1.5 shadow-soft"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('overview.addExpense')}</span>
          </button>
        </div>
      </div>

      {/* Expenses list */}
      <div className="space-y-1 mb-2 max-h-48 overflow-y-auto scrollbar-hide">
        {expenses.map((expense, index) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              bucketConfigs={bucketConfigs}
              categories={categories}
              defaultCategoryId={defaultCategoryId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              index={index}
            />
        ))}
        {expenses.length === 0 && (
          <div className="text-center py-2 text-accent-400 text-xs">
            {t('overview.noExpensesYet')}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="pt-2 border-t border-accent-100 font-semibold text-xs flex justify-between items-center">
        <span className="text-accent-600">{t('common.total')}:</span>
        <span className="text-primary-600">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

interface ExpenseRowProps {
  expense: Expense;
  bucketConfigs: BucketConfig[];
  categories: Category[];
  defaultCategoryId: string;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
  onDelete: (id: string) => void;
  index: number;
}

function ExpenseRow({ expense, bucketConfigs, categories, defaultCategoryId, onUpdate, onDelete, index }: ExpenseRowProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [categoryId, setCategoryId] = useState(expense.categoryId || defaultCategoryId);

  const handleSave = () => {
    const amountNum = parseCurrencyInput(amount);
    if (name.trim() && amountNum > 0) {
      onUpdate(expense.id, {
        name: name.trim(),
        amount: amountNum,
        categoryId,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(expense.name);
    setAmount(expense.amount.toString());
    setCategoryId(expense.categoryId || defaultCategoryId);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!showDeleteConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDeleteConfirm(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showDeleteConfirm]);

  if (isEditing) {
    return (
      <div className="px-2 py-1.5 bg-white rounded-lg border-2 border-primary-400 space-y-1.5 animate-scale-in">
        <div className="flex gap-1.5 items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const amountInput = e.currentTarget.parentElement?.querySelector('input[type="text"]:nth-of-type(2)') as HTMLInputElement;
                amountInput?.focus();
              }
            }}
            className="input-field flex-1 min-w-0 text-sm border-primary-300 focus:border-primary-400 h-9 sm:h-10"
            autoFocus
          />
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="input-field w-20 flex-shrink-0 text-sm border-primary-300 focus:border-primary-400 h-9 sm:h-10"
          />
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={handleSave}
              className="btn-success text-sm px-2 py-1.5 h-9 min-w-[36px] rounded-lg flex items-center justify-center"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary text-sm px-2 py-1.5 h-9 min-w-[36px] rounded-lg flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
        <CategorySelector
          categories={categories}
          selectedCategoryId={categoryId}
          onSelect={setCategoryId}
          defaultCategoryId={defaultCategoryId}
        />
      </div>
    );
  }

  const expenseCategory = categories.find(c => c.id === expense.categoryId) || 
    categories.find(c => c.id === defaultCategoryId);

  return (
    <div 
      className="px-2 py-1.5 sm:py-1 bg-white rounded-lg border border-accent-200 hover:border-primary-300 hover:shadow-soft flex items-center group text-xs transition-all duration-200 relative"
    >
      {/* Content: full width; on mobile reserve space for overlay buttons (amount must stay visible) */}
      <div className="flex items-center gap-2 flex-1 min-w-0 pr-20 sm:pr-0">
        {expenseCategory?.color && (
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: expenseCategory.color }}
          />
        )}
        <div className="font-medium truncate text-accent-800 flex-1 min-w-0">{expense.name}</div>
        <div className="text-primary-600 font-semibold whitespace-nowrap flex-shrink-0">{formatCurrency(expense.amount)}</div>
      </div>
      {/* Edit/Delete: overlay, no layout space; always visible on touch, show on hover on desktop */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pl-4 bg-gradient-to-r from-transparent via-white/95 to-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1.5 flex items-center justify-center bg-primary-400 text-white rounded-md hover:bg-primary-500 active:scale-95 transition-all duration-200 touch-manipulation"
          title="Edit"
          aria-label="Edit expense"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="p-1.5 flex items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all duration-200 touch-manipulation"
          title="Delete"
          aria-label="Delete expense"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-expense-title"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg border border-accent-200 p-4 sm:p-5 w-full max-w-sm animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-expense-title" className="text-lg font-bold text-accent-900 mb-1">
              {t('overview.deleteExpenseConfirmTitle')}
            </h3>
            <p className="text-sm text-accent-600 mb-3">
              {t('overview.deleteExpenseConfirmMessage')}
            </p>
            <div className="bg-accent-50 rounded-lg px-3 py-2 mb-4">
              <p className="font-medium text-accent-900 truncate">{expense.name}</p>
              <p className="text-sm text-primary-600 font-semibold">{formatCurrency(expense.amount)}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary text-sm px-4 py-2"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(expense.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

