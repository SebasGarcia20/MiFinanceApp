'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { SavingsGoal, SavingsContribution } from '@/types';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/currency';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/ToastProvider';
import { reportError } from '@/lib/reportError';

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
  const { t } = useTranslation();
  const toast = useToast();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalMonthlyTarget, setNewGoalMonthlyTarget] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [addingToGoal, setAddingToGoal] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [editingNameFor, setEditingNameFor] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [editingTargetFor, setEditingTargetFor] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState('');
  const [editMonthlyValue, setEditMonthlyValue] = useState('');
  const targetRef = useRef<HTMLInputElement>(null);
  const monthlyRef = useRef<HTMLInputElement>(null);
  /** Goal id → contribution list expanded (collapsed by default) */
  const [contributionsExpanded, setContributionsExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddGoal = async () => {
    if (!newGoalName.trim() || !newGoalTarget) return;
    const target = parseCurrencyInput(newGoalTarget);
    const monthlyTarget = newGoalMonthlyTarget ? parseCurrencyInput(newGoalMonthlyTarget) : undefined;
    if (target === 0) return;
    try {
      await onAddGoal({
        name: newGoalName.trim(),
        targetAmount: target,
        monthlyTarget,
      });
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalMonthlyTarget('');
      setIsAddingGoal(false);
    } catch (err) {
      reportError(err, { t, toast, context: 'Add goal' });
    }
  };

  const handleAddSavings = async (goalId: string) => {
    if (!addAmount) return;
    const amount = parseCurrencyInput(addAmount);
    if (amount === 0) return;
    try {
      await onAddContribution({
        goalId,
        amount,
        date: new Date().toISOString().split('T')[0],
        period: currentPeriod,
        source: 'manual',
      });
      setAddAmount('');
      setAddingToGoal(null);
    } catch (err) {
      reportError(err, { t, toast, context: 'Add contribution' });
    }
  };

  const handleUpdateName = async (goalId: string) => {
    const name = editNameValue.trim();
    if (!name) return;
    try {
      await onUpdateGoal(goalId, { name });
      setEditNameValue('');
      setEditingNameFor(null);
    } catch (err) {
      reportError(err, { t, toast, context: 'Update goal name' });
    }
  };

  const handleUpdateTarget = async (goalId: string) => {
    const target = parseCurrencyInput(editTargetValue);
    if (target <= 0) return;
    const monthlyTarget = editMonthlyValue.trim()
      ? parseCurrencyInput(editMonthlyValue)
      : undefined;
    try {
      await onUpdateGoal(goalId, {
        targetAmount: target,
        monthlyTarget: monthlyTarget && monthlyTarget > 0 ? monthlyTarget : undefined,
      });
      setEditTargetValue('');
      setEditMonthlyValue('');
      setEditingTargetFor(null);
    } catch (err) {
      reportError(err, { t, toast, context: 'Update goal target' });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await onDeleteGoal(id);
    } catch (err) {
      reportError(err, { t, toast, context: 'Delete goal' });
    }
  };

  const handleDeleteContribution = async (id: string) => {
    try {
      await onDeleteContribution(id);
    } catch (err) {
      reportError(err, { t, toast, context: 'Delete contribution' });
    }
  };

  const { activeGoals, completedGoals } = useMemo(() => {
    const sorted = [...goals].sort((a, b) => a.order - b.order);
    const active: SavingsGoal[] = [];
    const done: SavingsGoal[] = [];
    for (const g of sorted) {
      const totalSaved = contributions.filter((c) => c.goalId === g.id).reduce((s, c) => s + c.amount, 0);
      const remaining = Math.max(0, g.targetAmount - totalSaved);
      if (remaining === 0) done.push(g);
      else active.push(g);
    }
    return { activeGoals: active, completedGoals: done };
  }, [goals, contributions]);

  const renderGoalCard = (goal: SavingsGoal, variant: 'active' | 'history' = 'active') => {
    const goalContributions = contributions.filter((c) => c.goalId === goal.id);
    const totalSaved = goalContributions.reduce((sum, c) => sum + c.amount, 0);
    const remaining = Math.max(0, goal.targetAmount - totalSaved);
    const progress = goal.targetAmount > 0 ? (totalSaved / goal.targetAmount) * 100 : 0;
    const isComplete = remaining === 0;
    const isAdding = addingToGoal === goal.id;
    const isEditingName = editingNameFor === goal.id;
    const isEditingTarget = editingTargetFor === goal.id;
    const isHistory = variant === 'history';

    return (
      <div
        key={goal.id}
        className={
          isHistory
            ? 'card p-4 sm:p-6 !bg-emerald-50/50 border-emerald-100/90 hover:border-emerald-200/70'
            : 'card p-4 sm:p-6'
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="space-y-2 mb-2">
                <label className="block text-xs font-medium text-accent-700">{t('savings.goalName')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('savings.goalNamePlaceholder')}
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateName(goal.id);
                      if (e.key === 'Escape') { setEditingNameFor(null); setEditNameValue(''); }
                    }}
                    className="input-field flex-1 text-base sm:text-sm"
                    autoFocus
                  />
                  <button type="button" onClick={() => handleUpdateName(goal.id)} className="btn-success flex-shrink-0">
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingNameFor(null); setEditNameValue(''); }}
                    className="btn-secondary flex-shrink-0"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <h3
                className={`text-lg sm:text-xl font-bold mb-1 flex items-center gap-2 ${
                  isHistory ? 'text-emerald-950/90' : 'text-accent-900'
                }`}
              >
                {goal.name}
                <button
                  type="button"
                  onClick={() => {
                    setEditingNameFor(goal.id);
                    setEditNameValue(goal.name);
                    setAddingToGoal(null);
                    setAddAmount('');
                  }}
                  className={
                    isHistory
                      ? 'p-1 rounded text-emerald-600/80 hover:text-emerald-800 hover:bg-emerald-100/70 transition-colors'
                      : 'p-1 rounded hover:bg-accent-100 text-accent-500 hover:text-accent-700 transition-colors'
                  }
                  title={t('common.edit')}
                  aria-label={t('common.edit')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </h3>
            )}
            {isEditingTarget ? (
              <div className="space-y-2 mt-2">
                <div>
                  <label className="block text-xs font-medium text-accent-700 mb-1">{t('savings.targetAmount')}</label>
                  <input
                    type="text"
                    placeholder={t('savings.amountPlaceholder')}
                    value={editTargetValue}
                    onChange={(e) => setEditTargetValue(e.target.value)}
                    className="input-field w-full text-base sm:text-sm"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-accent-700 mb-1">{t('savings.monthlyTarget')}</label>
                  <input
                    type="text"
                    placeholder={t('savings.amountPlaceholder')}
                    value={editMonthlyValue}
                    onChange={(e) => setEditMonthlyValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateTarget(goal.id);
                      if (e.key === 'Escape') {
                        setEditingTargetFor(null);
                        setEditTargetValue('');
                        setEditMonthlyValue('');
                      }
                    }}
                    className="input-field w-full text-base sm:text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleUpdateTarget(goal.id)} className="btn-success flex-shrink-0">
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTargetFor(null);
                      setEditTargetValue('');
                      setEditMonthlyValue('');
                    }}
                    className="btn-secondary flex-shrink-0"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-1 ${
                  isHistory ? 'text-emerald-800/85' : 'text-accent-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {t('savings.target')}{' '}
                  <span className={`font-semibold ${isHistory ? 'text-emerald-950/90' : 'text-accent-800'}`}>
                    {formatCurrency(goal.targetAmount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTargetFor(goal.id);
                      setEditTargetValue(formatCurrencyInput(goal.targetAmount));
                      setEditMonthlyValue(goal.monthlyTarget ? formatCurrencyInput(goal.monthlyTarget) : '');
                      setEditingNameFor(null);
                      setEditNameValue('');
                      setAddingToGoal(null);
                      setAddAmount('');
                    }}
                    className={
                      isHistory
                        ? 'p-1 rounded text-emerald-600/80 hover:text-emerald-800 hover:bg-emerald-100/70 transition-colors'
                        : 'p-1 rounded hover:bg-accent-100 text-accent-500 hover:text-accent-700 transition-colors'
                    }
                    title={t('common.edit')}
                    aria-label={t('common.edit')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </span>
                {goal.monthlyTarget && (
                  <span>
                    {t('savings.monthly')}{' '}
                    <span className={`font-semibold ${isHistory ? 'text-emerald-950/90' : 'text-accent-800'}`}>
                      {formatCurrency(goal.monthlyTarget)}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {!isComplete && (
              <button
                type="button"
                onClick={() => {
                  if (isAdding) {
                    setAddingToGoal(null);
                    setAddAmount('');
                  } else {
                    setAddingToGoal(goal.id);
                    setAddAmount('');
                    setEditingNameFor(null);
                    setEditNameValue('');
                    setEditingTargetFor(null);
                    setEditTargetValue('');
                    setEditMonthlyValue('');
                  }
                }}
                className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-medium bg-primary-400 text-white rounded-lg hover:bg-primary-500 active:scale-95 transition-all duration-200"
              >
                {isAdding ? t('common.cancel') : `+ ${t('savings.add')}`}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDeleteGoal(goal.id)}
              className="flex-1 sm:flex-initial btn-danger text-sm sm:text-xs px-4 sm:px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>

        {isAdding && (
          <div className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-200">
            <label className="block text-xs font-medium text-accent-700 mb-2">{t('savings.amountToAdd')}</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={t('savings.amountPlaceholder')}
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
                type="button"
                onClick={() => handleAddSavings(goal.id)}
                className="btn-success flex-1 sm:flex-initial min-h-[44px] sm:min-h-0"
              >
                {t('savings.add')}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isHistory ? 'text-emerald-800/80' : 'text-accent-600'}`}>{t('savings.totalSaved')}</span>
            <span
              className={`text-base sm:text-lg font-bold ${isHistory ? 'text-emerald-700' : 'text-primary-600'}`}
            >
              {formatCurrency(totalSaved)}
            </span>
          </div>

          {goalContributions.length > 0 && (
            <div className="space-y-1.5">
              <button
                type="button"
                id={`savings-contrib-trigger-${goal.id}`}
                aria-expanded={!!contributionsExpanded[goal.id]}
                aria-controls={`savings-contrib-list-${goal.id}`}
                title={
                  contributionsExpanded[goal.id]
                    ? t('savings.hideContributionList')
                    : t('savings.showContributionList')
                }
                onClick={() =>
                  setContributionsExpanded((prev) => ({
                    ...prev,
                    [goal.id]: !prev[goal.id],
                  }))
                }
                className={
                  isHistory
                    ? 'w-full flex items-center justify-between gap-2 py-2 px-2.5 rounded-xl border border-emerald-200/70 bg-white/50 hover:bg-emerald-100/40 text-left transition-colors'
                    : 'w-full flex items-center justify-between gap-2 py-2 px-2.5 rounded-xl border border-accent-200/80 bg-accent-50/60 hover:bg-accent-100/80 text-left transition-colors'
                }
              >
                <span className={`text-xs font-medium ${isHistory ? 'text-emerald-900/85' : 'text-accent-700'}`}>
                  {t('savings.contributions')}
                  <span className={`font-normal ml-1 ${isHistory ? 'text-emerald-700/70' : 'text-accent-500'}`}>
                    ({goalContributions.length})
                  </span>
                </span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                    isHistory ? 'text-emerald-600/70' : 'text-accent-500'
                  } ${contributionsExpanded[goal.id] ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {contributionsExpanded[goal.id] && (
                <ul
                  id={`savings-contrib-list-${goal.id}`}
                  role="region"
                  aria-labelledby={`savings-contrib-trigger-${goal.id}`}
                  className="space-y-1 max-h-[min(280px,45vh)] overflow-y-auto overscroll-contain pr-0.5"
                >
                  {goalContributions.map((c) => (
                    <li
                      key={c.id}
                      className={
                        isHistory
                          ? 'flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-white/70 border border-emerald-100/50'
                          : 'flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-accent-50'
                      }
                    >
                      <span
                        className={`text-sm min-w-0 ${isHistory ? 'text-emerald-900/90' : 'text-accent-700'}`}
                      >
                        <span className="font-medium">{formatCurrency(c.amount)}</span>
                        <span
                          className={`ml-1.5 text-xs block sm:inline sm:ml-1 ${
                            isHistory ? 'text-emerald-700/65' : 'text-accent-500'
                          }`}
                        >
                          {c.date}
                          {c.period ? ` · ${c.period}` : ''}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteContribution(c.id)}
                        className="p-1.5 rounded text-accent-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                        title={t('savings.removeContribution')}
                        aria-label={t('savings.removeContribution')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-xs ${isHistory ? 'text-emerald-800/70' : 'text-accent-500'}`}>{t('savings.progress')}</span>
              <span className={`text-xs font-semibold ${isHistory ? 'text-emerald-800' : 'text-accent-700'}`}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <div
              className={`w-full rounded-full h-3 sm:h-3.5 overflow-hidden ${
                isHistory ? 'bg-emerald-100/80' : 'bg-accent-100'
              }`}
            >
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
              />
            </div>
          </div>

          <div
            className={`flex justify-between items-center pt-2 border-t ${
              isHistory ? 'border-emerald-200/60' : 'border-accent-200'
            }`}
          >
            <span className={`text-sm ${isHistory ? 'text-emerald-800/80' : 'text-accent-600'}`}>{t('savings.remaining')}</span>
            <span
              className={`text-sm font-semibold ${
                isComplete ? (isHistory ? 'text-emerald-700' : 'text-green-600') : 'text-accent-800'
              }`}
            >
              {isComplete ? t('savings.goalReached') : formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {isAddingGoal ? (
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-accent-900 mb-3 sm:mb-4">{t('savings.addNewGoal')}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-accent-700 mb-1">{t('savings.goalName')}</label>
              <input
                type="text"
                placeholder={t('savings.goalNamePlaceholder')}
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
              <label className="block text-xs font-medium text-accent-700 mb-1">{t('savings.targetAmount')}</label>
              <input
                ref={targetRef}
                type="text"
                placeholder={t('savings.amountPlaceholder')}
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') monthlyRef.current?.focus();
                }}
                className="input-field w-full text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-accent-700 mb-1">{t('savings.monthlyTarget')}</label>
              <input
                ref={monthlyRef}
                type="text"
                placeholder={t('savings.amountPlaceholder')}
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
                {t('common.cancel')}
              </button>
              <button onClick={handleAddGoal} className="btn-success flex-1 sm:flex-initial">
                {t('common.save')}
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
          {t('savings.addNewGoal')}
        </button>
      )}

      <div className="space-y-3 sm:space-y-4">
        {!isMounted ? (
          <div className="card text-center py-10 sm:py-12 text-accent-500 text-sm sm:text-base">
            {t('savings.loadingGoals')}
          </div>
        ) : goals.length === 0 ? (
          <div className="card text-center py-10 sm:py-12 text-accent-500 text-sm sm:text-base">
            {t('savings.noGoalsYet')}
          </div>
        ) : (
          <>
            {activeGoals.length > 0 && (
              <section className="space-y-3 sm:space-y-4" aria-labelledby="savings-active-heading">
                <h2 id="savings-active-heading" className="text-base sm:text-lg font-bold text-accent-900 tracking-tight">
                  {t('savings.activeGoalsSection')}
                </h2>
                {activeGoals.map((goal) => renderGoalCard(goal, 'active'))}
              </section>
            )}
            {completedGoals.length > 0 && (
              <section
                className={
                  activeGoals.length > 0
                    ? 'space-y-3 sm:space-y-4 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-accent-200'
                    : 'space-y-3 sm:space-y-4'
                }
                aria-labelledby="savings-completed-heading"
              >
                <div className="mb-1">
                  <h2
                    id="savings-completed-heading"
                    className="text-base sm:text-lg font-bold text-emerald-900/90 tracking-tight"
                  >
                    {t('savings.completedGoalsSection')}
                  </h2>
                  <p className="text-xs text-emerald-800/60 mt-1 max-w-xl">{t('savings.completedGoalsHint')}</p>
                </div>
                {completedGoals.map((goal) => renderGoalCard(goal, 'history'))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
