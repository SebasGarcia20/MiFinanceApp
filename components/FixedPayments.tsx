'use client';

import { useState, useEffect, useMemo } from 'react';
import { BucketPayment, ExpenseBucket, FixedPayment, BucketConfig } from '@/types';
import { formatCurrency, parseCurrencyInput } from '@/lib/currency';
import { getPreviousPeriod, formatPeriodDisplay, PeriodFormat } from '@/lib/date';
import { useTranslation } from '@/hooks/useTranslation';

interface FixedPaymentsProps {
  currentPeriod: PeriodFormat;
  fixedPayments: FixedPayment[];
  paidFixedPayments: string[];
  bucketPayments: BucketPayment[];
  previousMonthExpenses: Partial<Record<ExpenseBucket, number>>;
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
  fixedPayments,
  paidFixedPayments,
  bucketPayments,
  previousMonthExpenses,
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
  const [newDueDate, setNewDueDate] = useState('');
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
  
  // Track when component has mounted to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setPrevPeriod(getPreviousPeriod(currentPeriod));
  }, [currentPeriod]);

  // Initialize bucket payments from previous month expenses if they don't exist
  useEffect(() => {
    bucketConfigs.forEach(bucketConfig => {
      const bucketId = bucketConfig.id;
      const amount = previousMonthExpenses[bucketId] || 0;
      if (amount > 0) {
        const existing = bucketPayments.find(bp => bp.bucket === bucketId);
        if (!existing) {
          // Calculate due date for credit cards based on payment day
          // The due date is the payment day of the current period being viewed
          let dueDate: string | undefined;
          if (bucketConfig.type === 'credit_card' && bucketConfig.paymentDay) {
            const [year, month] = currentPeriod.split('-').map(Number);
            // Use the last valid day of the month if payment day exceeds month length
            const daysInMonth = new Date(year, month, 0).getDate();
            const paymentDay = Math.min(bucketConfig.paymentDay, daysInMonth);
            
            // Format as YYYY-MM-DD
            dueDate = `${year}-${String(month).padStart(2, '0')}-${String(paymentDay).padStart(2, '0')}`;
          }
          
          onAddBucketPayment({
            bucket: bucketId,
            amount,
            paid: false,
            dueDate,
          });
        }
      }
    });
  }, [previousMonthExpenses, bucketPayments, bucketConfigs, onAddBucketPayment, currentPeriod]);

  const handleAddFixed = () => {
    if (!newName.trim() || !newAmount) return;
    
    const amount = parseCurrencyInput(newAmount);
    if (amount === 0) return;

    onAddFixedPayment({
      name: newName.trim(),
      amount,
      dueDate: newDueDate || undefined,
    });

    setNewName('');
    setNewAmount('');
    setNewDueDate('');
    setIsAddingFixed(false);
  };

  const handleTogglePaid = (id: string, paid: boolean) => {
    onUpdateBucketPayment(id, { paid });
  };

  const bucketTotal = bucketPayments.reduce((sum, bp) => sum + (bp.paid ? 0 : bp.amount), 0);
  const totalUnpaid = bucketPayments.filter(bp => !bp.paid).length;

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
                    setNewDueDate('');
                  }
                }}
                className="input-field text-sm"
              />
              <input
                type="date"
                placeholder="Due date (optional)"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="input-field text-sm"
              />
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
                  setNewDueDate('');
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
          ) : bucketPayments.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-xs text-accent-400">
                {t('overview.noPaymentsFromPreviousPeriod')}
              </p>
            </div>
          ) : (
            bucketPayments.map((payment) => (
              <BucketPaymentRow
                key={payment.id}
                payment={payment}
                bucketConfigs={bucketConfigs}
                onTogglePaid={handleTogglePaid}
              />
            ))
          )}
        </div>

        {isMounted && bucketPayments.length > 0 && (
          <div className="mt-3 pt-2 border-t border-accent-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-accent-600">{t('overview.unpaidFromPreviousPeriod')}</span>
              <span className="font-semibold text-primary-600">{formatCurrency(bucketTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface RecurringPaymentRowProps {
  payment: FixedPayment;
  isPaid: boolean;
  onUpdate: (id: string, updates: Partial<FixedPayment>) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string, paid: boolean) => void;
}

function RecurringPaymentRow({ payment, isPaid, onUpdate, onDelete, onTogglePaid }: RecurringPaymentRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(payment.name);
  const [amount, setAmount] = useState(payment.amount.toString());
  const [dueDate, setDueDate] = useState(payment.dueDate || '');
  const [isOverdue, setIsOverdue] = useState(false);

  // Calculate overdue status only on client to avoid hydration mismatch
  useEffect(() => {
    if (payment.dueDate) {
      const due = new Date(payment.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      setIsOverdue(due < today && !isPaid);
    }
  }, [payment.dueDate, isPaid]);

  const handleSave = () => {
    const amountNum = parseCurrencyInput(amount);
    if (name.trim() && amountNum > 0) {
      onUpdate(payment.id, {
        name: name.trim(),
        amount: amountNum,
        dueDate: dueDate || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(payment.name);
    setAmount(payment.amount.toString());
    setDueDate(payment.dueDate || '');
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
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input-field text-xs"
        />
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
      className={`px-2 py-1.5 border-2 rounded-lg bg-white flex items-center group transition-all duration-200 relative ${
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
        <div className="flex-1 min-w-0">
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
        </div>
        <div className={`text-xs font-bold whitespace-nowrap ml-2 flex-shrink-0 ${isPaid ? 'text-accent-400' : 'text-primary-600'}`}>
          {formatCurrency(payment.amount)}
        </div>
        {payment.dueDate && (
          <div className="flex items-center gap-1.5 whitespace-nowrap ml-3 flex-shrink-0">
            <span className="text-xs text-accent-500">
              {new Date(payment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {isOverdue && !isPaid && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                Overdue
              </span>
            )}
          </div>
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
