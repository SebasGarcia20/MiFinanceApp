'use client';

import { useState, useRef, useEffect } from 'react';

interface MonthSelectorProps {
  month: string;
  onMonthChange: (month: string) => void;
}

// Helper functions for month format (YYYY-MM)
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatMonthDisplay(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function isValidMonth(month: string): boolean {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(month)) return false;
  const [year, monthNum] = month.split('-').map(Number);
  return year >= 2000 && year <= 2100 && monthNum >= 1 && monthNum <= 12;
}

function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  let prevYear = year;
  let prevMonth = monthNum - 1;
  
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear = year - 1;
  }
  
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}

function getNextMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  let nextYear = year;
  let nextMonth = monthNum + 1;
  
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = year + 1;
  }
  
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthSelector({ month, onMonthChange }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => parseInt(month.split('-')[0]));
  const [viewMonth, setViewMonth] = useState(() => parseInt(month.split('-')[1]) - 1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentMonth = getCurrentMonth();
  const isCurrentMonth = month === currentMonth;
  const [selectedYear, selectedMonthNum] = month.split('-').map(Number);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMonthSelect = (year: number, monthIndex: number) => {
    const selectedMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    onMonthChange(selectedMonth);
    setIsOpen(false);
  };

  const goToCurrentMonth = () => {
    onMonthChange(currentMonth);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    onMonthChange(getPreviousMonth(month));
  };

  const goToNextMonth = () => {
    onMonthChange(getNextMonth(month));
  };

  const handleYearChange = (delta: number) => {
    setViewYear(prev => prev + delta);
  };

  const isSelected = (year: number, monthIndex: number) => {
    return year === selectedYear && monthIndex + 1 === selectedMonthNum;
  };

  const isToday = (year: number, monthIndex: number) => {
    const [currentYear, currentMonthNum] = currentMonth.split('-').map(Number);
    return year === currentYear && monthIndex + 1 === currentMonthNum;
  };

  return (
    <div className="bg-white rounded-xl shadow-soft-lg border border-accent-100 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side: Navigation buttons and month display */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg bg-accent-100 hover:bg-primary-100 text-accent-700 hover:text-primary-700 transition-all duration-200 active:scale-95"
            title="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col items-center min-w-[140px]">
            <div className="text-lg font-bold text-accent-900">
              {formatMonthDisplay(month)}
            </div>
            <div className="text-xs text-accent-500 font-medium">
              {month}
            </div>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg bg-accent-100 hover:bg-primary-100 text-accent-700 hover:text-primary-700 transition-all duration-200 active:scale-95"
            title="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {isCurrentMonth && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-50 border border-primary-200">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></div>
              <span className="text-xs font-medium text-primary-700">Current</span>
            </div>
          )}
        </div>

        {/* Right side: Month picker and current month button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 transition-all duration-200 active:scale-95 border border-primary-200"
              title="Select month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Select Month</span>
            </button>

            {/* Custom Calendar Dropdown */}
            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-soft-lg border border-accent-100 p-4 z-50 animate-scale-in"
                style={{ animationDelay: '0s' }}
              >
                {/* Year Selector */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-accent-100">
                  <button
                    onClick={() => handleYearChange(-1)}
                    className="p-1.5 rounded-lg hover:bg-accent-100 text-accent-600 hover:text-accent-800 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-lg font-bold text-accent-900">{viewYear}</span>
                  <button
                    onClick={() => handleYearChange(1)}
                    className="p-1.5 rounded-lg hover:bg-accent-100 text-accent-600 hover:text-accent-800 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {MONTHS.map((monthName, index) => {
                    const isSelectedMonth = isSelected(viewYear, index);
                    const isTodayMonth = isToday(viewYear, index);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleMonthSelect(viewYear, index)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isSelectedMonth
                            ? 'bg-primary-400 text-white shadow-soft'
                            : isTodayMonth
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'bg-accent-50 text-accent-700 hover:bg-accent-100 border border-transparent'
                          }
                          hover:scale-105 active:scale-95
                        `}
                      >
                        {monthName.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="pt-3 border-t border-accent-100">
                  <button
                    onClick={goToCurrentMonth}
                    className="w-full px-3 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Go to Current Month
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isCurrentMonth && (
            <button
              onClick={goToCurrentMonth}
              className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-700 transition-all duration-200 active:scale-95"
              title="Go to current month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
