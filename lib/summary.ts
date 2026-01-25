import { MonthData, MonthSummary, ExpenseBucket, FixedPayment, BucketConfig, SavingsContribution } from '@/types';

export function calculateSummary(
  data: MonthData & { fixedPayments?: FixedPayment[] },
  bucketConfigs: BucketConfig[],
  savingsContributions?: SavingsContribution[]
): MonthSummary {
  const paidFixedPayments = data.paidFixedPayments || [];
  const fixedPayments = data.fixedPayments || [];
  
  // Planned recurring total = sum of ALL recurring payments (paid + unpaid)
  // This value does NOT change when toggling paid status
  const plannedRecurringTotal = fixedPayments.reduce((sum, p) => sum + p.amount, 0);
  
  // Paid recurring total = sum of recurring payments marked as paid
  const paidRecurringTotal = fixedPayments
    .filter(p => paidFixedPayments.includes(p.id))
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Remaining recurring total = planned - paid
  const remainingRecurringTotal = plannedRecurringTotal - paidRecurringTotal;

  const bucketIds = bucketConfigs.map(b => b.id);
  const expensesByBucket: Record<string, number> = bucketIds.reduce((acc, bucketId) => {
    acc[bucketId] = data.expenses
      .filter(e => e.bucket === bucketId)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const expensesTotal = Object.values(expensesByBucket).reduce((sum, total) => sum + total, 0);
  
  // Total expenses = bucket expenses + paid recurring payments
  // Only paid recurring payments count as real expenses (money spent)
  const grandTotal = expensesTotal + paidRecurringTotal;
  
  // Calculate total savings for current period
  // Savings reduce Money Left but do NOT count as expenses
  const currentPeriod = data.month;
  const totalSavings = (savingsContributions || [])
    .filter(c => c.period === currentPeriod)
    .reduce((sum, c) => sum + c.amount, 0);
  
  const salary = data.salary || 0;
  // Money Left = salary - expenses - savings
  // Savings reduce available money but are not expenses
  const remainingFromSalary = salary - grandTotal - totalSavings;
  const remainingFromLimit = data.monthlyLimit - grandTotal;

  return {
    salary,
    fixedPaymentsTotal: remainingRecurringTotal,
    plannedRecurringTotal,
    paidRecurringTotal,
    remainingRecurringTotal,
    expensesByBucket,
    grandTotal,
    totalSavings,
    remainingFromSalary,
    monthlyLimit: data.monthlyLimit,
    remainingFromLimit,
  };
}
