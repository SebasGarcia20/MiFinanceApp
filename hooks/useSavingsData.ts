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
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: goals.length,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    saveSavingsGoals(updated);
  }, [goals]);

  const updateGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    setGoals(updated);
    saveSavingsGoals(updated);
  }, [goals]);

  const deleteGoal = useCallback((id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    saveSavingsGoals(updated);
    // Also remove contributions for this goal
    const updatedContributions = contributions.filter(c => c.goalId !== id);
    setContributions(updatedContributions);
    saveSavingsContributions(updatedContributions);
  }, [goals, contributions]);

  const addContribution = useCallback((contributionData: Omit<SavingsContribution, 'id'>) => {
    const newContribution: SavingsContribution = {
      ...contributionData,
      id: `contribution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const updated = [...contributions, newContribution];
    setContributions(updated);
    saveSavingsContributions(updated);
  }, [contributions]);

  const deleteContribution = useCallback((id: string) => {
    const updated = contributions.filter(c => c.id !== id);
    setContributions(updated);
    saveSavingsContributions(updated);
  }, [contributions]);

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
