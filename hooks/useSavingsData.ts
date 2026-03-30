'use client';

import { useState, useEffect, useCallback } from 'react';
import { SavingsGoal, SavingsContribution } from '@/types';
import { useToast } from '@/components/ToastProvider';
import { useTranslation } from '@/hooks/useTranslation';

export function useSavingsData() {
  const toast = useToast();
  const { t } = useTranslation();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [contributions, setContributions] = useState<SavingsContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/savings/goals', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error('Failed to fetch savings goals');
      }
      const data = await res.json();
      setGoals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load savings goals');
      setGoals([]);
    }
  }, []);

  const fetchContributions = useCallback(async () => {
    try {
      const res = await fetch('/api/savings/contributions', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error('Failed to fetch savings contributions');
      }
      const data = await res.json();
      setContributions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load savings contributions');
      setContributions([]);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchGoals(), fetchContributions()]);
    setIsLoading(false);
  }, [fetchGoals, fetchContributions]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addGoal = useCallback(
    async (goalData: Omit<SavingsGoal, 'id' | 'order'>) => {
      const res = await fetch('/api/savings/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goalData.name,
          targetAmount: goalData.targetAmount,
          monthlyTarget: goalData.monthlyTarget,
          order: goals.length,
        }),
      });
      if (!res.ok) throw new Error('Failed to create savings goal');
      const newGoal = await res.json();
      setGoals((prev) => [...prev, newGoal]);
      toast.success(t('common.saved'));
    },
    [goals.length, toast, t]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<SavingsGoal>) => {
      const res = await fetch(`/api/savings/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update savings goal');
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      toast.success(t('common.saved'));
    },
    [toast, t]
  );

  const deleteGoal = useCallback(async (id: string) => {
    const res = await fetch(`/api/savings/goals/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete savings goal');
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setContributions((prev) => prev.filter((c) => c.goalId !== id));
    toast.success(t('common.deleted'));
  }, [toast, t]);

  const addContribution = useCallback(
    async (contributionData: Omit<SavingsContribution, 'id'>) => {
      const res = await fetch('/api/savings/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contributionData),
      });
      if (!res.ok) throw new Error('Failed to add contribution');
      const newContribution = await res.json();
      setContributions((prev) => [...prev, newContribution]);
      toast.success(t('common.saved'));
    },
    [toast, t]
  );

  const deleteContribution = useCallback(async (id: string) => {
    const res = await fetch(`/api/savings/contributions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete contribution');
    setContributions((prev) => prev.filter((c) => c.id !== id));
    toast.success(t('common.deleted'));
  }, [toast, t]);

  return {
    goals,
    contributions,
    isLoading,
    error,
    refetch: fetchAll,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
  };
}
