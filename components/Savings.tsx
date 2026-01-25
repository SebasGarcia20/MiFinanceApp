'use client';

import { useState, useEffect, useRef } from 'react';
import { SavingsGoal, SavingsContribution } from '@/types';
import { formatCurrency, parseCurrencyInput } from '@/lib/currency';

interface SavingsProps {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  currentPeriod: string;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'order'>) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onAddContribution: (contribution: Omit<SavingsContribution, 'id'>) => void;
  onDeleteContribution: (id: string) => void;
}

export default function Savings({
  goals,
  contributions,
  currentPeriod,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddContribution,
  onDeleteContribution,
}: SavingsProps) {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalMonthlyTarget, setNewGoalMonthlyTarget] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [addingToGoal, setAddingToGoal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const targetRef = useRef<HTMLInputElement>(null);
  const monthlyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddGoal = () => {
    if (!newGoalName.trim() || !newGoalTarget) return;
    
    const target = parseCurrencyInput(newGoalTarget);
    const monthlyTarget = newGoalMonthlyTarget ? parseCurrencyInput(newGoalMonthlyTarget) : undefined;
    
    if (target === 0) return;

    onAddGoal({
      name: newGoalName.trim(),
      targetAmount: target,
      monthlyTarget,
    });

    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalMonthlyTarget('');
    setIsAddingGoal(false);
  };

  const handleAddSavings = (goalId: string) => {
    if (!addAmount) return;
    
    const amount = parseCurrencyInput(addAmount);
    if (amount === 0) return;

    onAddContribution({
      goalId,
      amount,
      date: new Date().toISOString().split('T')[0],
      period: currentPeriod,
      source: 'manual',
    });

    setAddAmount('');
    setAddingToGoal(null);
  };

  const sortedGoals = [...goals].sort((a, b) => a.order - b.order);

  return (
    <div>
      {isAddingGoal ? (
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-accent-900 mb-3 sm:mb-4">Add New Goal</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-accent-700 mb-1">Goal name</label>
              <input
                type="text"
                placeholder="e.g., Apto, Trip"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') targetRef.current?.focus();
                }}
                className="input-field w-full text-base sm:text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-accent-700 mb-1">Target amount</label>
              <input
                ref={targetRef}
                type="text"
                placeholder="Amount"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') monthlyRef.current?.focus();
                }}
                className="input-field w-full text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-accent-700 mb-1">Monthly target (optional)</label>
              <input
                ref={monthlyRef}
                type="text"
                placeholder="Amount"
                value={newGoalMonthlyTarget}
                onChange={(e) => setNewGoalMonthlyTarget(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddGoal();
                  if (e.key === 'Escape') {
                    setIsAddingGoal(false);
                    setNewGoalName('');
                    setNewGoalTarget('');
                    setNewGoalMonthlyTarget('');
                  }
                }}
                className="input-field w-full text-base sm:text-sm"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
              <button
                onClick={() => {
                  setIsAddingGoal(false);
                  setNewGoalName('');
                  setNewGoalTarget('');
                  setNewGoalMonthlyTarget('');
                }}
                className="btn-secondary flex-1 sm:flex-initial"
              >
                Cancel
              </button>
              <button onClick={handleAddGoal} className="btn-success flex-1 sm:flex-initial">
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingGoal(true)}
          className="btn-primary mb-4 sm:mb-6 w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Goal
        </button>
      )}

      <div className="space-y-3 sm:space-y-4">
        {!isMounted ? (
          <div className="card text-center py-10 sm:py-12 text-accent-500 text-sm sm:text-base">
            Loading savings goals...
          </div>
        ) : sortedGoals.length === 0 ? (
          <div className="card text-center py-10 sm:py-12 text-accent-500 text-sm sm:text-base">
            No savings goals yet. Tap &quot;Add New Goal&quot; to get started.
          </div>
        ) : (
          sortedGoals.map((goal) => {
            const goalContributions = contributions.filter(c => c.goalId === goal.id);
            const totalSaved = goalContributions.reduce((sum, c) => sum + c.amount, 0);
            const remaining = Math.max(0, goal.targetAmount - totalSaved);
            const progress = goal.targetAmount > 0 ? (totalSaved / goal.targetAmount) * 100 : 0;
            const isAdding = addingToGoal === goal.id;

            return (
              <div key={goal.id} className="card p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-accent-900 mb-1">{goal.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-accent-600">
                      <span>Target: <span className="font-semibold text-accent-800">{formatCurrency(goal.targetAmount)}</span></span>
                      {goal.monthlyTarget && (
                        <span>Monthly: <span className="font-semibold text-accent-800">{formatCurrency(goal.monthlyTarget)}</span></span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (isAdding) {
                          setAddingToGoal(null);
                          setAddAmount('');
                        } else {
                          setAddingToGoal(goal.id);
                          setAddAmount('');
                        }
                      }}
                      className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-medium bg-primary-400 text-white rounded-lg hover:bg-primary-500 active:scale-95 transition-all duration-200"
                    >
                      {isAdding ? 'Cancel' : '+ Add'}
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="flex-1 sm:flex-initial btn-danger text-sm sm:text-xs px-4 sm:px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isAdding && (
                  <div className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-200">
                    <label className="block text-xs font-medium text-accent-700 mb-2">Amount to add</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Amount"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSavings(goal.id);
                          if (e.key === 'Escape') {
                            setAddingToGoal(null);
                            setAddAmount('');
                          }
                        }}
                        className="input-field flex-1 text-base sm:text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddSavings(goal.id)}
                        className="btn-success flex-1 sm:flex-initial min-h-[44px] sm:min-h-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-accent-600">Total saved:</span>
                    <span className="text-base sm:text-lg font-bold text-primary-600">{formatCurrency(totalSaved)}</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-accent-500">Progress</span>
                      <span className="text-xs font-semibold text-accent-700">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-accent-100 rounded-full h-3 sm:h-3.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 100
                            ? 'bg-green-500'
                            : progress >= 75
                            ? 'bg-primary-400'
                            : progress >= 50
                            ? 'bg-yellow-400'
                            : 'bg-orange-400'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-accent-200">
                    <span className="text-sm text-accent-600">Remaining:</span>
                    <span className={`text-sm font-semibold ${remaining === 0 ? 'text-green-600' : 'text-accent-800'}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
