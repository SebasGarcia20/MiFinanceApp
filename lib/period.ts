/**
 * Period helper utilities
 * Period format: "YYYY-MM-DD__YYYY-MM-DD" (start date __ end date)
 */

export interface PeriodInfo {
  periodKey: string;
  start: Date;
  end: Date;
}

/**
 * Get current period based on periodStartDay
 * @param periodStartDay Day of month (1-31) when the period starts
 * @returns Period info with periodKey, start, and end dates
 */
export function getCurrentPeriod(periodStartDay: number): PeriodInfo {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  
  // If current day is before period start day, period started last month
  let periodMonth = month;
  let periodYear = year;
  
  if (day < periodStartDay) {
    periodMonth = month - 1;
    periodYear = year;
    if (periodMonth < 1) {
      periodMonth = 12;
      periodYear = year - 1;
    }
  }
  
  return getPeriodForMonth(periodYear, periodMonth, periodStartDay);
}

/**
 * Get period info for a specific month
 * @param year Year (e.g., 2026)
 * @param month Month (1-12)
 * @param periodStartDay Day of month (1-31) when the period starts
 * @returns Period info with periodKey, start, and end dates
 */
export function getPeriodForMonth(
  year: number,
  month: number,
  periodStartDay: number
): PeriodInfo {
  // Calculate start date
  const daysInStartMonth = new Date(year, month, 0).getDate();
  const startDay = Math.min(periodStartDay, daysInStartMonth);
  const start = new Date(year, month - 1, startDay);
  
  // Calculate end date (day before next period starts)
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);
  
  // Format period key: "YYYY-MM-DD__YYYY-MM-DD"
  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  
  const periodKey = `${formatDate(start)}__${formatDate(end)}`;
  
  return { periodKey, start, end };
}

/**
 * Parse a period key into PeriodInfo
 * @param periodKey Period key in format "YYYY-MM-DD__YYYY-MM-DD"
 * @returns Period info with periodKey, start, and end dates
 */
export function parsePeriodKey(periodKey: string): PeriodInfo {
  const [startStr, endStr] = periodKey.split('__');
  
  if (!startStr || !endStr) {
    throw new Error(`Invalid period key format: ${periodKey}`);
  }
  
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error(`Invalid date in period key: ${periodKey}`);
  }
  
  return { periodKey, start, end };
}

/**
 * Convert old period format (YYYY-MM-DD) to new format (YYYY-MM-DD__YYYY-MM-DD)
 * @param oldPeriod Old period format (just start date)
 * @param periodStartDay Day of month when period starts
 * @returns New period key format
 */
export function migratePeriodFormat(oldPeriod: string, periodStartDay: number): string {
  const [year, month, day] = oldPeriod.split('-').map(Number);
  const periodInfo = getPeriodForMonth(year, month, periodStartDay);
  return periodInfo.periodKey;
}
