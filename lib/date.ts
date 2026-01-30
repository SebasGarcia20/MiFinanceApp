/**
 * Date utilities for period selection and formatting
 * Supports custom periods (e.g., 15th to 15th) instead of calendar months
 */

import { loadSettings } from './settings';

export type PeriodFormat = string; // Format: "YYYY-MM-DD" (start date of period)

/**
 * Get the current period based on periodStartDay
 */
export function getCurrentPeriod(periodStartDay?: number): PeriodFormat {
  // If periodStartDay is provided, use it; otherwise fallback to localStorage
  const startDay = periodStartDay ?? loadSettings().periodStartDay;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  
  // If current day is before period start day, period started last month
  if (day < startDay) {
    let periodMonth = month - 1;
    let periodYear = year;
    if (periodMonth < 1) {
      periodMonth = 12;
      periodYear = year - 1;
    }
    return formatPeriodStart(periodYear, periodMonth, startDay);
  }
  
  return formatPeriodStart(year, month, startDay);
}

/**
 * Format period start date as YYYY-MM-DD
 */
function formatPeriodStart(year: number, month: number, day: number): PeriodFormat {
  // Ensure day doesn't exceed month length
  const daysInMonth = new Date(year, month, 0).getDate();
  const validDay = Math.min(day, daysInMonth);
  return `${year}-${String(month).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
}

/**
 * Check if period format is valid
 */
export function isValidPeriod(period: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(period)) return false;
  
  const [year, month, day] = period.split('-').map(Number);
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Check if day is valid for the month
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Format period for display (e.g., "Jan 15 - Feb 14, 2026")
 */
export function formatPeriodDisplay(period: PeriodFormat): string {
  const [year, month, day] = period.split('-').map(Number);
  const startDate = new Date(year, month - 1, day);
  
  // Calculate end date (day before next period starts)
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const endDay = endDate.getDate();
  const periodYear = startDate.getFullYear();
  
  // If same month, show differently
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startMonth} ${startDay} - ${endDay}, ${periodYear}`;
  }
  
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${periodYear}`;
}

/** Derive period start day from period string (e.g. "2026-01-15" → 15) so 15–14 stays 15–14 when settings aren't passed. */
function getStartDayFromPeriod(period: PeriodFormat): number | undefined {
  const parts = period.split('-').map(Number);
  const day = parts[2];
  return day >= 1 && day <= 31 ? day : undefined;
}

/**
 * Get previous period. Uses periodStartDay if provided; otherwise derives from period (e.g. "2026-01-15" → 15) so 15–14 stays 15–14.
 */
export function getPreviousPeriod(period: PeriodFormat, periodStartDay?: number): PeriodFormat {
  const [year, month, day] = period.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() - 1);
  
  const startDay = periodStartDay ?? getStartDayFromPeriod(period) ?? loadSettings().periodStartDay;
  return formatPeriodStart(date.getFullYear(), date.getMonth() + 1, startDay);
}

/**
 * Get next period. Uses periodStartDay if provided; otherwise derives from period (e.g. "2026-01-15" → 15) so 15–14 stays 15–14.
 */
export function getNextPeriod(period: PeriodFormat, periodStartDay?: number): PeriodFormat {
  const [year, month, day] = period.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + 1);
  
  const startDay = periodStartDay ?? getStartDayFromPeriod(period) ?? loadSettings().periodStartDay;
  return formatPeriodStart(date.getFullYear(), date.getMonth() + 1, startDay);
}

/**
 * Get period start and end dates
 */
export function getPeriodDates(period: PeriodFormat): { start: Date; end: Date } {
  const [year, month, day] = period.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);
  
  return { start, end };
}

/**
 * Migrate old calendar month format (YYYY-MM) to period format (YYYY-MM-DD)
 */
export function migrateMonthToPeriod(oldMonth: string, periodStartDay: number): PeriodFormat {
  const [year, month] = oldMonth.split('-').map(Number);
  return formatPeriodStart(year, month, periodStartDay);
}

/**
 * Check if a date falls within a period
 */
export function isDateInPeriod(date: Date, period: PeriodFormat): boolean {
  const { start, end } = getPeriodDates(period);
  return date >= start && date <= end;
}
