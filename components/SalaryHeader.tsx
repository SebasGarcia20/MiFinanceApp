'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';
import { parseCurrencyInput } from '@/lib/currency';

interface SalaryHeaderProps {
  salary: number;
  grandTotal: number;
  onUpdateSalary: (salary: number) => void;
}

export default function SalaryHeader({ salary, grandTotal, onUpdateSalary }: SalaryHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [salaryInput, setSalaryInput] = useState(salary.toString());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSalaryInput(salary.toString());
  }, [salary]);

  const handleSave = () => {
    const salaryNum = parseCurrencyInput(salaryInput);
    onUpdateSalary(salaryNum);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSalaryInput(salary.toString());
    setIsEditing(false);
  };

  const handleSetSalary = () => {
    setIsEditing(true);
  };

  const handleRemoveSalary = () => {
    onUpdateSalary(0);
  };

  const salaryPercentage = salary > 0 
    ? (grandTotal / salary) * 100 
    : 0;

  const remainingFromSalary = salary - grandTotal;

  if (!isMounted) {
    return (
      <div className="card bg-gradient-to-br from-primary-50/30 to-white border-primary-200/50 h-full min-h-[150px] flex flex-col p-5">
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs text-accent-600 font-medium">Monthly Salary</div>
          <div className="text-xl font-bold text-primary-600">$0</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-primary-50/30 to-white border-primary-200/50 h-full min-h-[150px] flex flex-col p-5">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-accent-900 mb-1 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Monthly Salary
        </h2>
        <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isEditing ? (
          // Editing salary
          <div className="px-3 py-2.5 bg-white/60 rounded-lg border border-primary-200/50">
            <div className="flex items-center gap-2 justify-end">
              <input
                type="text"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="input-field text-sm w-28 text-right"
                autoFocus
                placeholder="0"
              />
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
        ) : salary === 0 ? (
          // No salary set - show "Set Salary" button
          <div className="px-3 py-2.5 bg-white/60 rounded-lg border border-primary-200/50 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-accent-800 mb-0.5">
                No salary set yet
              </p>
              <p className="text-xs text-accent-500 leading-relaxed">
                Set your monthly salary to track spending
              </p>
            </div>
            <button
              onClick={handleSetSalary}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-lg transition-all duration-200 active:scale-95"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Set Salary
            </button>
          </div>
        ) : (
          // Displaying salary
          <div className="px-3 py-2.5 bg-white/60 rounded-lg border border-primary-200/50 hover:border-primary-300/50 transition-all duration-200">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-accent-800 mb-1">
                  {formatCurrency(salary)}
                </div>
                <div className="text-xs text-accent-600">
                  <span className={`font-medium ${
                    remainingFromSalary >= 0 
                      ? 'text-green-700' 
                      : 'text-red-600'
                  }`}>
                    {remainingFromSalary >= 0 ? 'Left: ' : 'Over: '}
                    {formatCurrency(Math.abs(remainingFromSalary))}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-1.5 py-0.5 text-xs bg-primary-400 text-white rounded-lg hover:bg-primary-500 active:scale-95 transition-all duration-200"
                  title="Edit salary"
                >
                  ✎
                </button>
                <button
                  onClick={handleRemoveSalary}
                  className="px-1.5 py-0.5 text-xs bg-accent-100 text-accent-600 rounded-lg hover:bg-accent-200 active:scale-95 transition-all duration-200"
                  title="Remove salary"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full mt-2">
              <div className="w-full bg-accent-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    salaryPercentage <= 50
                      ? 'bg-green-400'
                      : salaryPercentage <= 75
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, salaryPercentage))}%` }}
                ></div>
              </div>
              <div className="text-xs text-accent-500 text-right mt-0.5">
                {salaryPercentage.toFixed(1)}% used
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
