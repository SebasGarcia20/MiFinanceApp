import { useState, useEffect, useCallback } from 'react';
import { MonthData, FixedPayment, Expense, ExpenseBucket, BucketPayment, BucketConfig } from '@/types';
import { getCurrentPeriod, isValidPeriod, getPreviousPeriod, PeriodFormat } from '@/lib/date';
import { loadSettings } from '@/lib/settings';

// Keep localStorage functions for backward compatibility and migration
const STORAGE_PREFIX = 'monthData:';
const RECURRING_PAYMENTS_KEY = 'recurringPayments';
const BUCKET_CONFIGS_KEY = 'bucketConfigs';

function getStorageKey(period: string): string {
  return `${STORAGE_PREFIX}${period}`;
}

export function useMonthData(period: PeriodFormat) {
  const [data, setData] = useState<MonthData>(() => ({
    month: period,
    expenses: [],
    bucketPayments: [],
    paidFixedPayments: [],
    salary: 0,
    monthlyLimit: 0,
  }));
  const [recurringPayments, setRecurringPayments] = useState<FixedPayment[]>([]);
  const [bucketConfigs, setBucketConfigs] = useState<BucketConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from API
  const loadData = useCallback(async () => {
    if (!isValidPeriod(period)) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load month data
      const monthDataRes = await fetch(`/api/month-data?period=${encodeURIComponent(period)}`);
      if (!monthDataRes.ok) {
        if (monthDataRes.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to load month data');
      }
      const monthData = await monthDataRes.json();
      // Map paidFixedPaymentIds to paidFixedPayments for client compatibility
      setData({
        ...monthData,
        paidFixedPayments: monthData.paidFixedPayments || monthData.paidFixedPaymentIds || [],
      });

      // Load recurring payments (bills)
      const billsRes = await fetch('/api/bills');
      if (!billsRes.ok) {
        if (billsRes.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to load bills');
      }
      const bills = await billsRes.json();
      setRecurringPayments(bills);

      // Load bucket configs
      const bucketsRes = await fetch('/api/buckets');
      if (!bucketsRes.ok) {
        if (bucketsRes.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to load buckets');
      }
      const buckets = await bucketsRes.json();
      setBucketConfigs(buckets);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  // Load data on mount and when period changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fixed Payments (Bills)
  const addFixedPayment = useCallback(async (payment: Omit<FixedPayment, 'id'>) => {
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      if (!response.ok) {
        throw new Error('Failed to create bill');
      }

      const newPayment = await response.json();
      setRecurringPayments(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err: any) {
      console.error('Error adding fixed payment:', err);
      throw err;
    }
  }, []);

  const updateFixedPayment = useCallback(async (id: string, updates: Partial<FixedPayment>) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update bill');
      }

      const updated = await response.json();
      setRecurringPayments(prev =>
        prev.map(p => p.id === id ? updated : p)
      );
      return updated;
    } catch (err: any) {
      console.error('Error updating fixed payment:', err);
      throw err;
    }
  }, []);

  const deleteFixedPayment = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }

      setRecurringPayments(prev => prev.filter(p => p.id !== id));
      // Also remove from paidFixedPayments in current month
      setData(prev => ({
        ...prev,
        paidFixedPayments: prev.paidFixedPayments.filter((pid: string) => pid !== id),
      }));
    } catch (err: any) {
      console.error('Error deleting fixed payment:', err);
      throw err;
    }
  }, []);

  // Expenses
  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          name: expense.name,
          amount: expense.amount,
          bucketId: expense.bucket, // Map bucket to bucketId
          categoryId: expense.categoryId || 'default-other',
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg = typeof body?.error === 'string' ? body.error : `Failed to create expense (${response.status})`;
        if (process.env.NODE_ENV === 'development') {
          console.error('[addExpense] API error:', response.status, body);
        }
        throw new Error(msg);
      }

      const newExpense = await response.json();
      setData(prev => ({
        ...prev,
        expenses: [...prev.expenses, newExpense],
      }));
      return newExpense;
    } catch (err: any) {
      console.error('Error adding expense:', err);
      throw err;
    }
  }, [period]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    try {
      const updatePayload: any = {};
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.amount !== undefined) updatePayload.amount = updates.amount;
      if (updates.bucket !== undefined) updatePayload.bucketId = updates.bucket;
      if (updates.categoryId !== undefined) updatePayload.categoryId = updates.categoryId;

      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      const updated = await response.json();
      setData(prev => ({
        ...prev,
        expenses: prev.expenses.map(e => e.id === id ? updated : e),
      }));
      return updated;
    } catch (err: any) {
      console.error('Error updating expense:', err);
      throw err;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      setData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id),
      }));
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  }, []);

  const moveExpense = useCallback(async (id: string, newBucket: ExpenseBucket) => {
    await updateExpense(id, { bucket: newBucket });
  }, [updateExpense]);

  // Month Data Updates
  const updateMonthlyLimit = useCallback(async (limit: number) => {
    try {
      const response = await fetch('/api/month-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          monthlyLimit: limit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update monthly limit');
      }

      setData(prev => ({ ...prev, monthlyLimit: limit }));
    } catch (err: any) {
      console.error('Error updating monthly limit:', err);
      throw err;
    }
  }, [period]);

  const updateSalary = useCallback(async (salary: number) => {
    try {
      const response = await fetch('/api/month-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          salary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update salary');
      }

      setData(prev => ({ ...prev, salary }));
    } catch (err: any) {
      console.error('Error updating salary:', err);
      throw err;
    }
  }, [period]);

  const toggleFixedPaymentPaid = useCallback(async (fixedPaymentId: string, paid: boolean) => {
    try {
      const paidList = data.paidFixedPayments || [];
      let newPaidList: string[];

      if (paid) {
        if (!paidList.includes(fixedPaymentId)) {
          newPaidList = [...paidList, fixedPaymentId];
        } else {
          return; // Already paid
        }
      } else {
        newPaidList = paidList.filter((id: string) => id !== fixedPaymentId);
      }

      const response = await fetch('/api/month-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          paidFixedPaymentIds: newPaidList, // API uses paidFixedPaymentIds
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update paid status');
      }

      setData(prev => ({
        ...prev,
        paidFixedPayments: newPaidList,
      }));
    } catch (err: any) {
      console.error('Error toggling paid status:', err);
      throw err;
    }
  }, [period, data.paidFixedPayments]);

  // Bucket Payments
  const updateBucketPayment = useCallback(async (id: string, updates: Partial<BucketPayment>) => {
    try {
      const updatePayload: any = {};
      if (updates.amount !== undefined) updatePayload.amount = updates.amount;
      if (updates.paid !== undefined) updatePayload.paid = updates.paid;
      if (updates.dueDate !== undefined) updatePayload.dueDate = updates.dueDate;
      if (updates.bucket !== undefined) {
        // Note: bucket payments shouldn't change bucket, but handle it if needed
        console.warn('Changing bucket for bucket payment is not supported');
      }

      const response = await fetch(`/api/bucket-payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update bucket payment');
      }

      const updated = await response.json();
      setData(prev => ({
        ...prev,
        bucketPayments: (prev.bucketPayments || []).map(bp =>
          bp.id === id ? updated : bp
        ),
      }));
      return updated;
    } catch (err: any) {
      console.error('Error updating bucket payment:', err);
      throw err;
    }
  }, []);

  const addBucketPayment = useCallback(async (payment: Omit<BucketPayment, 'id'>) => {
    try {
      const response = await fetch('/api/bucket-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          bucketId: payment.bucket, // Map bucket to bucketId
          amount: payment.amount,
          paid: payment.paid || false,
          dueDate: payment.dueDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bucket payment');
      }

      const newPayment = await response.json();
      setData(prev => ({
        ...prev,
        bucketPayments: [...(prev.bucketPayments || []), newPayment],
      }));
      return newPayment;
    } catch (err: any) {
      console.error('Error adding bucket payment:', err);
      throw err;
    }
  }, [period]);

  // Get previous month expenses (for bucket payments)
  const getPreviousMonthExpenses = useCallback(async (currentPeriod: PeriodFormat): Promise<Partial<Record<ExpenseBucket, number>>> => {
    try {
      const prevPeriod = getPreviousPeriod(currentPeriod);
      const response = await fetch(`/api/expenses?period=${encodeURIComponent(prevPeriod)}`);

      if (!response.ok) {
        return {};
      }

      const expenses = await response.json();
      const expensesByBucket: Partial<Record<ExpenseBucket, number>> = {};

      expenses.forEach((expense: Expense) => {
        if (!expensesByBucket[expense.bucket]) {
          expensesByBucket[expense.bucket] = 0;
        }
        expensesByBucket[expense.bucket]! += expense.amount;
      });

      return expensesByBucket;
    } catch (err) {
      console.error('Error fetching previous month expenses:', err);
      return {};
    }
  }, []);

  // Export/Import (keep for backward compatibility)
  const exportData = useCallback((): string => {
    return JSON.stringify({
      monthData: data,
      recurringPayments: recurringPayments,
    }, null, 2);
  }, [data, recurringPayments]);

  const importData = useCallback((json: string) => {
    // Import functionality can be implemented later if needed
    throw new Error('Import functionality not yet implemented with API');
  }, []);

  // Bucket configuration management
  const addBucketConfig = useCallback(async (config: Omit<BucketConfig, 'id' | 'order'> & { order?: number }) => {
    try {
      const response = await fetch('/api/buckets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          type: config.type,
          paymentDay: config.paymentDay,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bucket');
      }

      const newBucket = await response.json();
      setBucketConfigs(prev => [...prev, newBucket].sort((a, b) => a.order - b.order));
      return newBucket;
    } catch (err: any) {
      console.error('Error adding bucket config:', err);
      throw err;
    }
  }, []);

  const updateBucketConfig = useCallback(async (id: string, updates: Partial<BucketConfig>) => {
    try {
      const updatePayload: any = {};
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.type !== undefined) updatePayload.type = updates.type;
      if (updates.paymentDay !== undefined) updatePayload.paymentDay = updates.paymentDay;
      if (updates.order !== undefined) updatePayload.order = updates.order;

      const response = await fetch(`/api/buckets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update bucket');
      }

      const updated = await response.json();
      setBucketConfigs(prev =>
        prev.map(b => b.id === id ? updated : b).sort((a, b) => a.order - b.order)
      );
      return updated;
    } catch (err: any) {
      console.error('Error updating bucket config:', err);
      throw err;
    }
  }, []);

  const deleteBucketConfig = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/buckets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete bucket');
      }

      setBucketConfigs(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      console.error('Error deleting bucket config:', err);
      throw err;
    }
  }, []);

  const reorderBucketConfigs = useCallback(async (configs: BucketConfig[]) => {
    try {
      // Update order for all buckets
      const updates = configs.map((config, index) =>
        updateBucketConfig(config.id, { order: index })
      );
      await Promise.all(updates);
      setBucketConfigs(configs);
    } catch (err: any) {
      console.error('Error reordering buckets:', err);
      throw err;
    }
  }, [updateBucketConfig]);

  // Merge recurring payments with month data
  const dataWithRecurring: MonthData & { fixedPayments: FixedPayment[] } = {
    ...data,
    fixedPayments: recurringPayments,
  };

  return {
    data: dataWithRecurring,
    bucketConfigs,
    isLoading,
    error,
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
    // Bucket management
    addBucketConfig,
    updateBucketConfig,
    deleteBucketConfig,
    reorderBucketConfigs,
  };
}
