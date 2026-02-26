'use client';

import { useState, useEffect, useCallback } from 'react';
import { Debt, DebtPayment } from '@/types';

export function useDebtsData() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    try {
      const res = await fetch('/api/debts', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error('Failed to fetch debts');
      }
      const data = await res.json();
      setDebts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load debts');
      setDebts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const addDebt = useCallback(async (data: Omit<Debt, 'id' | 'payments'> & { order?: number }) => {
    const res = await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        totalAmount: data.totalAmount,
        order: data.order ?? debts.length,
      }),
    });
    if (!res.ok) throw new Error('Failed to create debt');
    const newDebt = await res.json();
    setDebts((prev) => [...prev, newDebt]);
    return newDebt;
  }, [debts.length]);

  const updateDebt = useCallback(async (id: string, updates: Partial<Pick<Debt, 'name' | 'totalAmount'>>) => {
    const res = await fetch(`/api/debts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update debt');
    const updated = await res.json();
    setDebts((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const deleteDebt = useCallback(async (id: string) => {
    const res = await fetch(`/api/debts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete debt');
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addPayment = useCallback(async (debtId: string, amount: number, period?: string) => {
    const res = await fetch(`/api/debts/${debtId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        date: new Date().toISOString().split('T')[0],
        period,
      }),
    });
    if (!res.ok) throw new Error('Failed to add payment');
    const payment: DebtPayment = await res.json();
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const payments = [...(d.payments || []), payment];
        return { ...d, payments };
      })
    );
    return payment;
  }, []);

  const deletePayment = useCallback(async (debtId: string, paymentId: string) => {
    const res = await fetch(`/api/debts/${debtId}/payments/${paymentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete payment');
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const payments = (d.payments || []).filter((p) => p.id !== paymentId);
        return { ...d, payments };
      })
    );
  }, []);

  return {
    debts,
    isLoading,
    error,
    refetch: fetchDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    deletePayment,
  };
}
