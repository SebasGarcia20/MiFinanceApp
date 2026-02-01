import { useState, useEffect, useCallback } from 'react';
import { SavingsGoal, SavingsContribution } from '@/types';

const SAVINGS_GOALS_KEY = 'savingsGoals';
const SAVINGS_CONTRIBUTIONS_KEY = 'savingsContributions';

function loadSavingsGoals(): SavingsGoal[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(SAVINGS_GOALS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored) as SavingsGoal[];
  } catch {
    return [];
  }
}

function saveSavingsGoals(goals: SavingsGoal[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(goals));
}

function loadSavingsContributions(): SavingsContribution[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(SAVINGS_CONTRIBUTIONS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored) as SavingsContribution[];
  } catch {
    return [];
  }
}

function saveSavingsContributions(contributions: SavingsContribution[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVINGS_CONTRIBUTIONS_KEY, JSON.stringify(contributions));
}

export function useSavingsData() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [contributions, setContributions] = useState<SavingsContribution[]>([]);

  useEffect(() => {
    setGoals(loadSavingsGoals());
    setContributions(loadSavingsContributions());
  }, []);

  const addGoal = useCallback((goalData: Omit<SavingsGoal, 'id' | 'order'>) => {
    setGoals(prev => {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        order: prev.length,
      };
      const updated = [...prev, newGoal];
      saveSavingsGoals(updated);
      return updated;
    });
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      saveSavingsGoals(updated);
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      saveSavingsGoals(updated);
      return updated;
    });
    setContributions(prev => {
      const updated = prev.filter(c => c.goalId !== id);
      saveSavingsContributions(updated);
      return updated;
    });
  }, []);

  const addContribution = useCallback((contributionData: Omit<SavingsContribution, 'id'>) => {
    const newContribution: SavingsContribution = {
      ...contributionData,
      id: `contribution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setContributions(prev => {
      const updated = [...prev, newContribution];
      saveSavingsContributions(updated);
      return updated;
    });
  }, []);

  const deleteContribution = useCallback((id: string) => {
    setContributions(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveSavingsContributions(updated);
      return updated;
    });
  }, []);

  return {
    goals,
    contributions,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
  };
}
