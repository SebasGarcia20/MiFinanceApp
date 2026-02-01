'use client';

import { useState, useEffect, useMemo } from 'react';
import { BucketPayment, ExpenseBucket, FixedPayment, BucketConfig } from '@/types';
import { formatCurrency, parseCurrencyInput } from '@/lib/currency';
import { getPreviousPeriod, formatPeriodDisplay, PeriodFormat } from '@/lib/date';
import { useTranslation } from '@/hooks/useTranslation';

/** Ordinal for day: 1st, 2nd, 3rd, 4th, ... */
function ordinalDay(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

/** Due date in the viewed period's month (from period string YYYY-MM-DD). Used so overdue is correct when viewing next month. */
function getDueDateInPeriodMonth(period: string, dueDay: number): Date {
  const [y, m] = period.split('-').map(Number);
  const year = y;
  const month = m - 1; // JS months 0-indexed
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  return new Date(year, month, day);
}

interface FixedPaymentsProps {
  currentPeriod: PeriodFormat;
  periodStartDay?: number; // e.g. 15 for 15th–14th periods; used so "From previous period" shows the correct range
  fixedPayments: FixedPayment[];
  paidFixedPayments: string[];
  bucketPayments: BucketPayment[];
  previousMonthExpenses: Partial<Record<ExpenseBucket, number>>;
  /** When this equals currentPeriod, previousMonthExpenses is for the previous of current period (so safe to sync bucket payments). */
  previousExpensesLoadedForPeriod?: PeriodFormat | null;
  /** When false, month-data for current period is loaded so bucketPayments in state won't be overwritten after we sync. */
  isMonthDataLoaded?: boolean;
  bucketConfigs: BucketConfig[];
  plannedRecurringTotal: number;
  paidRecurringTotal: number;
  remainingRecurringTotal: number;
  onAddFixedPayment: (payment: Omit<FixedPayment, 'id'>) => void;
  onUpdateFixedPayment: (id: string, updates: Partial<FixedPayment>) => void;
  onDeleteFixedPayment: (id: string) => void;
  onToggleFixedPaymentPaid: (id: string, paid: boolean) => void;
  onUpdateBucketPayment: (id: string, updates: Partial<BucketPayment>) => void;
  onAddBucketPayment: (payment: Omit<BucketPayment, 'id'>) => void;
}

export default function FixedPayments({
  currentPeriod,
  periodStartDay,
  fixedPayments,
  paidFixedPayments,
  bucketPayments,
  previousMonthExpenses,
  previousExpensesLoadedForPeriod,
  isMonthDataLoaded = true,
  bucketConfigs,
  plannedRecurringTotal,
  paidRecurringTotal,
  remainingRecurringTotal,
  onAddFixedPayment,
  onUpdateFixedPayment,
  onDeleteFixedPayment,
  onToggleFixedPaymentPaid,
  onUpdateBucketPayment,
  onAddBucketPayment,
}: FixedPaymentsProps) {
  const { t } = useTranslation();
  const bucketMap = useMemo(() => {
    const map = new Map<string, BucketConfig>();
    bucketConfigs.forEach(b => map.set(b.id, b));
    return map;
  }, [bucketConfigs]);
  const [isAddingFixed, setIsAddingFixed] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDay, setNewDueDay] = useState('');
  const [newDueDayError, setNewDueDayError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  // Initialize with a consistent default to ensure server and client match initially
  // Use the same default pattern as OverviewPage (day 1 of current month)
  const [prevPeriod, setPrevPeriod] = useState<PeriodFormat>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = '01'; // Use day 1 as default to avoid hydration mismatch
    return `${year}-${month}-${day}` as PeriodFormat;
  });
  
  // Compute previous period using your period start day. Derive from currentPeriod (e.g. "2026-01-15" → 15) when not passed so "From previous period" always matches the period you selected (15–14, not 1–31).
  const effectivePeriodStartDay = periodStartDay ?? (() => {
    const [, , day] = currentPeriod.split('-').map(Number);
    return day >= 1 && day <= 31 ? day : 1;
  })();
  useEffect(() => {
    setIsMounted(true);
    setPrevPeriod(getPreviousPeriod(currentPeriod, effectivePeriodStartDay));
  }, [currentPeriod, effectivePeriodStartDay]);

  // Create or sync bucket payments only when (1) we have fresh previous-period totals and (2) month-data is loaded so we won't be overwritten
  const canSyncBucketPayments = previousExpensesLoadedForPeriod === currentPeriod && isMonthDataLoaded;
  useEffect(() => {
    if (!canSyncBucketPayments) return;
    let cancelled = false;
    (async () => {
      for (const bucketConfig of bucketConfigs) {
        if (cancelled) return;
        const bucketId = bucketConfig.id;
        const amount = previousMonthExpenses[bucketId] || 0;
        const existing = bucketPayments.find(bp => bp.bucket === bucketId);
        if (existing) {
          if (existing.amount !== amount) {
            try {
              await onUpdateBucketPayment(existing.id, { amount });
            } catch (err) {
              console.error('Error updating bucket payment:', err);
            }
          }
          continue;
        }
        if (amount <= 0) continue;
        // Calculate due date for credit cards based on payment day
        let dueDate: string | undefined;
        if (bucketConfig.type === 'credit_card' && bucketConfig.paymentDay) {
          const [year, month] = currentPeriod.split('-').map(Number);
          const daysInMonth = new Date(year, month, 0).getDate();
          const paymentDay = Math.min(bucketConfig.paymentDay, daysInMonth);
          dueDate = `${year}-${String(month).padStart(2, '0')}-${String(paymentDay).padStart(2, '0')}`;
        }
        try {
          await onAddBucketPayment({
            bucket: bucketId,
            amount,
            paid: false,
            dueDate,
          });
        } catch (err) {
          console.error('Error creating bucket payment:', err);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [canSyncBucketPayments, previousMonthExpenses, bucketPayments, bucketConfigs, onAddBucketPayment, onUpdateBucketPayment, currentPeriod]);

  const handleAddFixed = () => {
    if (!newName.trim() || !newAmount) return;
    
    const amount = parseCurrencyInput(newAmount);
    if (amount === 0) return;

    if (newDueDay.trim()) {
      const n = Number(newDueDay);
      if (Number.isNaN(n) || n < 1 || n > 31) {
        setNewDueDayError(t('overview.dueDayError'));
        return;
      }
    }
    setNewDueDayError(null);

    const dueDayNum = newDueDay.trim() ? Math.min(31, Math.max(1, Math.round(Number(newDueDay)))) : undefined;
    onAddFixedPayment({
      name: newName.trim(),
      amount,
      dueDay: dueDayNum,
    });

    setNewName('');
    setNewAmount('');
    setNewDueDay('');
    setNewDueDayError(null);
    setIsAddingFixed(false);
  };

  const handleTogglePaid = (id: string, paid: boolean) => {
    onUpdateBucketPayment(id, { paid });
  };

  // Only count bucket payments with amount > 0 (hide "previous period" rows when that period had no expenses, e.g. December)
  const bucketPaymentsWithAmount = bucketPayments.filter(bp => bp.amount > 0);
  const totalUnpaidFromPrevious = bucketPaymentsWithAmount.reduce((sum, bp) => sum + (bp.paid ? 0 : bp.amount), 0);
  const totalPaidFromPrevious = bucketPaymentsWithAmount.reduce((sum, bp) => sum + (bp.paid ? bp.amount : 0), 0);
  const totalUnpaid = bucketPaymentsWithAmount.filter(bp => !bp.paid).length;
  // Total spent in the previous period (all buckets)
  const totalSpentInPreviousPeriod = Object.values(previousMonthExpenses).reduce((s: number, a) => s + (a ?? 0), 0);
  // Combined total: recurring bills (planned) + from previous period
  const totalRecurringAndPrevious = plannedRecurringTotal + totalSpentInPreviousPeriod;

  return (
    <div className="card">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-accent-900">{t('overview.bills')} ({t('overview.planned')})</h2>
        <div className="h-0.5 w-12 bg-primary-400 rounded-full mt-1"></div>
      </div>

      {/* Recurring Fixed Payments Section */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-accent-700">{t('overview.recurringPayments')}</h3>
          {!isAddingFixed && (
            <button
              onClick={() => setIsAddingFixed(true)}
              className="btn-primary text-xs px-2 py-1"
            >
              + {t('common.add')}
            </button>
          )}
        </div>

        {isAddingFixed && (
          <div className="mb-3 p-3 bg-gradient-to-br from-primary-50 to-white rounded-lg border-2 border-primary-200">
            <div className="grid grid-cols-1 gap-2 mb-2">
              <input
                type="text"
                placeholder="Name (e.g., Water Bill)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const amountInput = e.currentTarget.parentElement?.querySelector('input[type="text"]:nth-of-type(2)') as HTMLInputElement;
                    amountInput?.focus();
                  }
                }}
                className="input-field text-sm"
                autoFocus
              />
              <input
                type="text"
                placeholder="Amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddFixed();
                  }
                  if (e.key === 'Escape') {
                    setIsAddingFixed(false);
                    setNewName('');
                    setNewAmount('');
                    setNewDueDay('');
                    setNewDueDayError(null);
                  }
                }}
                className="input-field text-sm"
              />
              <input
                type="number"
                min={1}
                max={31}
                placeholder={t('overview.dueDayLabel')}
                value={newDueDay}
                onChange={(e) => {
                  setNewDueDay(e.target.value);
                  if (newDueDayError) setNewDueDayError(null);
                }}
                className={`input-field text-sm ${newDueDayError ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {newDueDayError && (
                <p className="text-xs text-red-600" role="alert">
                  {newDueDayError}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddFixed}
                className="btn-success text-xs px-2 py-1"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setIsAddingFixed(false);
                  setNewName('');
                  setNewAmount('');
                  setNewDueDay('');
                  setNewDueDayError(null);
                }}
                className="btn-secondary text-xs px-2 py-1"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1 mb-3 max-h-[400px] overflow-y-auto pr-1">
          {!isMounted ? (
            // Render empty state during SSR to match initial client render
            <div className="text-xs text-accent-400 text-center py-2">No recurring payments</div>
          ) : fixedPayments.length === 0 && !isAddingFixed ? (
            <div className="text-xs text-accent-400 text-center py-2">No recurring payments</div>
          ) : (
            fixedPayments.map((payment) => (
              <RecurringPaymentRow
                key={payment.id}
                payment={payment}
                isPaid={paidFixedPayments.includes(payment.id)}
                viewedPeriod={currentPeriod}
                onUpdate={onUpdateFixedPayment}
                onDelete={onDeleteFixedPayment}
                onTogglePaid={onToggleFixedPaymentPaid}
              />
            ))
          )}
        </div>

        {isMounted && fixedPayments.length > 0 && (
          <div className="space-y-1.5 mb-2 pb-2 border-b border-accent-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-accent-600 font-medium">{t('overview.planned')}:</span>
              <span className="font-semibold text-accent-800">{formatCurrency(plannedRecurringTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-accent-600">{t('overview.paidBills').replace(':', '')}:</span>
              <span className="font-semibold text-green-600">{formatCurrency(paidRecurringTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-accent-600">{t('common.remaining') || 'Remaining'}:</span>
              <span className="font-semibold text-primary-600">{formatCurrency(remainingRecurringTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bucket Payments from Previous Month Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-accent-700">{t('overview.fromPreviousPeriod')}</h3>
            <p className="text-xs text-accent-500" suppressHydrationWarning>
              {!isMounted ? prevPeriod : formatPeriodDisplay(prevPeriod)}
            </p>
          </div>
        </div>

        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
          {!isMounted ? (
            <div className="text-center py-2">
              <p className="text-xs text-accent-400">
                {t('overview.noPaymentsFromPreviousPeriod')}
              </p>
            </div>
          ) : bucketPaymentsWithAmount.length === 0 ? (
            <div className="text-center py-3 space-y-1">
              <p className="text-xs text-accent-400">
                {t('overview.noPaymentsFromPreviousPeriod')}
              </p>
              <p className="text-xs text-accent-400/80">
                {t('overview.bucketPaymentsEmptyHint')}
              </p>
            </div>
          ) : (
            bucketPaymentsWithAmount.map((payment) => (
              <BucketPaymentRow
                key={payment.id}
                payment={payment}
                bucketConfigs={bucketConfigs}
                onTogglePaid={handleTogglePaid}
              />
            ))
          )}
        </div>

        {isMounted && bucketPaymentsWithAmount.length > 0 && (
          <div className="mt-3 pt-2 border-t border-accent-100 space-y-1">
            {totalPaidFromPrevious > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-accent-600">{t('overview.paidFromPreviousPeriod')}</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalPaidFromPrevious)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-accent-600">{t('overview.unpaidFromPreviousPeriod')}</span>
              <span className="font-semibold text-primary-600">{formatCurrency(totalUnpaidFromPrevious)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card footer: combined total = recurring (planned) + from previous period */}
      {isMounted && totalRecurringAndPrevious > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-accent-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-accent-600">{t('overview.totalRecurringAndPreviousPeriod')}</span>
            <span className="font-semibold text-accent-800">{formatCurrency(totalRecurringAndPrevious)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface RecurringPaymentRowProps {
  payment: FixedPayment;
  isPaid: boolean;
  /** Viewed period (YYYY-MM-DD) so overdue uses that month, not "today's" month. */
  viewedPeriod: PeriodFormat;
  onUpdate: (id: string, updates: Partial<FixedPayment>) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string, paid: boolean) => void;
}

function RecurringPaymentRow({ payment, isPaid, viewedPeriod, onUpdate, onDelete, onTogglePaid }: RecurringPaymentRowProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(payment.name);
  const [amount, setAmount] = useState(payment.amount.toString());
  const [dueDate, setDueDate] = useState(payment.dueDate || '');
  const [dueDay, setDueDay] = useState(payment.dueDay != null ? String(payment.dueDay) : '');
  const [dueDayError, setDueDayError] = useState<string | null>(null);
  const [isOverdue, setIsOverdue] = useState(false);

  // Overdue: when dueDay is set, use viewed period's month so next month doesn't show overdue until that month's due date passes
  useEffect(() => {
    if (payment.dueDay != null && payment.dueDay >= 1 && payment.dueDay <= 31) {
      const dueInViewedMonth = getDueDateInPeriodMonth(viewedPeriod, payment.dueDay);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueInViewedMonth.setHours(0, 0, 0, 0);
      setIsOverdue(dueInViewedMonth < today && !isPaid);
    } else if (payment.dueDate) {
      const due = new Date(payment.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      setIsOverdue(due < today && !isPaid);
    } else {
      setIsOverdue(false);
    }
  }, [payment.dueDate, payment.dueDay, isPaid, viewedPeriod]);

  const handleSave = () => {
    const amountNum = parseCurrencyInput(amount);
    if (!name.trim() || amountNum <= 0) return;

    if (dueDay.trim()) {
      const n = Number(dueDay);
      if (Number.isNaN(n) || n < 1 || n > 31) {
        setDueDayError(t('overview.dueDayError'));
        return;
      }
    }
    setDueDayError(null);

    const dueDayNum = dueDay.trim() ? Math.min(31, Math.max(1, Math.round(Number(dueDay)))) : undefined;
    onUpdate(payment.id, {
      name: name.trim(),
      amount: amountNum,
      dueDate: dueDate || undefined,
      dueDay: dueDayNum,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(payment.name);
    setAmount(payment.amount.toString());
    setDueDate(payment.dueDate || '');
    setDueDay(payment.dueDay != null ? String(payment.dueDay) : '');
    setDueDayError(null);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="px-2 py-1.5 bg-gradient-to-br from-primary-50 to-white rounded-lg border-2 border-primary-200 grid grid-cols-1 gap-1.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field text-xs"
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
          className="input-field text-xs"
        />
        <input
          type="number"
          min={1}
          max={31}
          placeholder={t('overview.dueDayLabel')}
          value={dueDay}
          onChange={(e) => {
            setDueDay(e.target.value);
            if (dueDayError) setDueDayError(null);
          }}
          className={`input-field text-xs ${dueDayError ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
        {dueDayError && (
          <p className="text-xs text-red-600" role="alert">
            {dueDayError}
          </p>
        )}
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="btn-success text-xs px-2 py-1"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="btn-secondary text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`px-2 py-1 border-2 rounded-lg bg-white flex items-center group transition-all duration-200 relative ${
        isPaid
          ? 'border-green-200 bg-green-50/30 opacity-75'
          : isOverdue
          ? 'border-red-200 bg-red-50/30'
          : 'border-accent-200 hover:border-primary-300 hover:shadow-soft'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 w-full">
        <input
          type="checkbox"
          checked={isPaid}
          onChange={(e) => onTogglePaid(payment.id, e.target.checked)}
          className="w-4 h-4 rounded border-accent-300 text-primary-400 focus:ring-primary-400 focus:ring-1 cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0 leading-tight">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold truncate ${isPaid ? 'line-through text-accent-400' : 'text-accent-800'}`}>
              {payment.name}
            </span>
            {isPaid && (
              <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded-full font-medium flex-shrink-0">
                Paid
              </span>
            )}
          </div>
          {(payment.dueDay != null && payment.dueDay >= 1 && payment.dueDay <= 31) ? (
            <p className="text-[10px] text-accent-500 mt-0 truncate leading-tight" title={`${t('overview.dueOnTheDay')} ${ordinalDay(payment.dueDay)}`}>
              {ordinalDay(payment.dueDay)}
            </p>
          ) : payment.dueDate ? (
            <p className="text-[10px] text-accent-500 mt-0 truncate leading-tight">
              {new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          ) : null}
        </div>
        <div className={`text-xs font-bold whitespace-nowrap ml-2 flex-shrink-0 ${isPaid ? 'text-accent-400' : 'text-primary-600'}`}>
          {formatCurrency(payment.amount)}
        </div>
        {isOverdue && !isPaid && (
          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1">
            Overdue
          </span>
        )}
      </div>
      {/* Absolutely positioned overlay for Edit/Delete buttons - appears on hover */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto bg-white/95 backdrop-blur-sm px-1 py-0.5 rounded shadow-sm">
        <button
          onClick={() => setIsEditing(true)}
          className="px-2 py-1 text-xs bg-primary-400 text-white rounded-lg hover:bg-primary-500 active:scale-95 transition-all duration-200"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(payment.id)}
          className="btn-danger text-xs px-2 py-1"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

interface BucketPaymentRowProps {
  payment: BucketPayment;
  bucketConfigs: BucketConfig[];
  onTogglePaid: (id: string, paid: boolean) => void;
}

function BucketPaymentRow({ payment, bucketConfigs, onTogglePaid }: BucketPaymentRowProps) {
  const [isOverdue, setIsOverdue] = useState(false);

  const bucketMap = useMemo(() => {
    const map = new Map<string, BucketConfig>();
    bucketConfigs.forEach(b => map.set(b.id, b));
    return map;
  }, [bucketConfigs]);

  const bucketConfig = bucketMap.get(payment.bucket);
  const isCreditCard = bucketConfig?.type === 'credit_card';
  const paymentDay = bucketConfig?.paymentDay;

  // Calculate overdue status only on client to avoid hydration mismatch
  useEffect(() => {
    if (payment.dueDate && !payment.paid) {
      const due = new Date(payment.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      setIsOverdue(due < today);
    } else {
      setIsOverdue(false);
    }
  }, [payment.dueDate, payment.paid]);

  return (
    <div 
      className={`px-2 py-1.5 border-2 rounded-lg bg-white flex items-center justify-between group transition-all duration-200 ${
        payment.paid 
          ? 'border-green-200 bg-green-50/30 opacity-75' 
          : isOverdue
          ? 'border-red-200 bg-red-50/30'
          : 'border-accent-200 hover:border-primary-300 hover:shadow-soft'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={payment.paid}
          onChange={(e) => onTogglePaid(payment.id, e.target.checked)}
          className="w-4 h-4 rounded border-accent-300 text-primary-400 focus:ring-primary-400 focus:ring-1 cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold truncate ${payment.paid ? 'line-through text-accent-400' : 'text-accent-800'}`}>
              {bucketConfig?.name || payment.bucket}
            </span>
            {isOverdue && !payment.paid && (
              <span className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded-full font-medium flex-shrink-0">
                Overdue
              </span>
            )}
            {payment.paid && (
              <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded-full font-medium flex-shrink-0">
                Paid
              </span>
            )}
          </div>
        </div>
        <div className={`text-xs font-bold whitespace-nowrap ml-2 ${payment.paid ? 'text-accent-400' : 'text-primary-600'}`}>
          {formatCurrency(payment.amount)}
        </div>
        {isCreditCard && paymentDay && (
          <div className="text-xs text-accent-500 whitespace-nowrap ml-3">
            Pay day: {paymentDay}
          </div>
        )}
      </div>
    </div>
  );
}
