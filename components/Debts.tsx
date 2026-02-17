'use client';

import { useState, useRef, useEffect } from 'react';
import { Debt } from '@/types';
import { formatCurrency, parseCurrencyInput } from '@/lib/currency';
import { useTranslation } from '@/hooks/useTranslation';

interface DebtsProps {
  debts: Debt[];
  currentPeriod: string;
  onAddDebt: (data: Omit<Debt, 'id' | 'payments'>) => Promise<Debt>;
  onUpdateDebt: (id: string, updates: Partial<Pick<Debt, 'name' | 'totalAmount'>>) => Promise<Debt>;
  onDeleteDebt: (id: string) => Promise<void>;
  onAddPayment: (debtId: string, amount: number, period?: string) => Promise<unknown>;
}

export default function Debts({
  debts,
  currentPeriod,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  onAddPayment,
}: DebtsProps) {
  const { t } = useTranslation();
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTotal, setNewTotal] = useState('');
  const [addingPaymentFor, setAddingPaymentFor] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const totalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddDebt = async () => {
    if (!newName.trim() || !newTotal) return;
    const total = parseCurrencyInput(newTotal);
    if (total <= 0) return;
    try {
      await onAddDebt({ name: newName.trim(), totalAmount: total, order: debts.length });
      setNewName('');
      setNewTotal('');
      setIsAddingDebt(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPayment = async (debtId: string) => {
    const amount = parseCurrencyInput(paymentAmount);
    if (amount <= 0) return;
    try {
      await onAddPayment(debtId, amount, currentPeriod);
      setPaymentAmount('');
      setAddingPaymentFor(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {isAddingDebt ? (
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-accent-900 mb-3 sm:mb-4">{t('debts.addNewDebt')}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-accent-700 mb-1">{t('debts.debtName')}</label>
              <input
                ref={nameRef}
                type="text"
                placeholder={t('debts.debtNamePlaceholder')}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') totalRef.current?.focus(); }}
                className="input-field w-full text-base sm:text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-accent-700 mb-1">{t('debts.totalAmount')}</label>
              <input
                ref={totalRef}
                type="text"
                placeholder={t('debts.amountPlaceholder')}
                value={newTotal}
                onChange={(e) => setNewTotal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddDebt(); if (e.key === 'Escape') setIsAddingDebt(false); }}
                className="input-field w-full text-base sm:text-sm"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setIsAddingDebt(false); setNewName(''); setNewTotal(''); }} className="btn-secondary flex-1">
                {t('common.cancel')}
              </button>
              <button onClick={handleAddDebt} className="btn-success flex-1">
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingDebt(true)}
          className="btn-primary mb-4 sm:mb-6 w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('debts.addNewDebt')}
        </button>
      )}

      <div className="space-y-3 sm:space-y-4">
        {!isMounted ? (
          <div className="card text-center py-10 sm:py-12 text-accent-500 text-sm sm:text-base">
            {t('debts.loading')}
          </div>
        ) : debts.length === 0 ? (
          <div className="card text-center py-10 sm:py-12 text-accent-500 text-sm sm:text-base">
            {t('debts.noDebtsYet')}
          </div>
        ) : (
          debts.map((debt) => {
            const payments = debt.payments || [];
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = Math.max(0, debt.totalAmount - totalPaid);
            const progress = debt.totalAmount > 0 ? (totalPaid / debt.totalAmount) * 100 : 0;
            const isPaidOff = remaining === 0;
            const isAdding = addingPaymentFor === debt.id;

            return (
              <div key={debt.id} className="card p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-accent-900 mb-1">{debt.name}</h3>
                    <p className="text-sm text-accent-600">
                      {t('debts.totalAmount')}: <span className="font-semibold text-accent-800">{formatCurrency(debt.totalAmount)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!isPaidOff && (
                      <button
                        onClick={() => {
                          if (isAdding) {
                            setAddingPaymentFor(null);
                            setPaymentAmount('');
                          } else {
                            setAddingPaymentFor(debt.id);
                            setPaymentAmount('');
                          }
                        }}
                        className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-medium bg-primary-400 text-white rounded-lg hover:bg-primary-500 active:scale-95 transition-all duration-200"
                      >
                        {isAdding ? t('common.cancel') : `+ ${t('debts.addPayment')}`}
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteDebt(debt.id)}
                      className="flex-1 sm:flex-initial btn-danger text-sm sm:text-xs px-4 sm:px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>

                {isAdding && (
                  <div className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-200">
                    <label className="block text-xs font-medium text-accent-700 mb-2">{t('debts.amountPaid')}</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder={t('debts.amountPlaceholder')}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddPayment(debt.id);
                          if (e.key === 'Escape') { setAddingPaymentFor(null); setPaymentAmount(''); }
                        }}
                        className="input-field flex-1 text-base sm:text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleAddPayment(debt.id)} className="btn-success flex-1 sm:flex-initial min-h-[44px] sm:min-h-0">
                        {t('debts.addPayment')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-accent-600">{t('debts.totalPaid')}</span>
                    <span className="text-base sm:text-lg font-bold text-primary-600">{formatCurrency(totalPaid)}</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-accent-500">{t('debts.progress')}</span>
                      <span className="text-xs font-semibold text-accent-700">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-accent-100 rounded-full h-3 sm:h-3.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPaidOff ? 'bg-green-500' : progress >= 75 ? 'bg-primary-400' : progress >= 50 ? 'bg-yellow-400' : 'bg-orange-400'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-accent-200">
                    <span className="text-sm text-accent-600">{t('debts.remaining')}</span>
                    <span className={`text-sm font-semibold ${isPaidOff ? 'text-green-600' : 'text-accent-800'}`}>
                      {isPaidOff ? t('debts.paidOff') : formatCurrency(remaining)}
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
