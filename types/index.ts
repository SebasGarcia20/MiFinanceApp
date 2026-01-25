// These types will map 1:1 to a database schema later

export type ExpenseBucket = string; // Now dynamic - uses bucket ID

export type BucketType = 'cash' | 'credit_card';

export interface BucketConfig {
  id: string;
  name: string;
  type: BucketType;
  paymentDay?: number; // Day of month (1-31) for credit cards, undefined for cash
  order: number; // Display order
}

export interface FixedPayment {
  id: string;
  name: string;
  amount: number; // stored as integer (cents)
  dueDate?: string; // YYYY-MM-DD format
  categoryId?: string; // Optional category
}

export interface Category {
  id: string;
  userId?: string | null; // null for global defaults
  name: string;
  color?: string; // Hex color code (optional)
  order: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number; // stored as integer (cents)
  bucket: ExpenseBucket;
  categoryId: string; // Required category
}

export interface BucketPayment {
  id: string;
  bucket: ExpenseBucket;
  amount: number; // stored as integer (cents)
  paid: boolean;
  dueDate?: string; // YYYY-MM-DD format
}

export interface MonthData {
  month: string; // Period format: YYYY-MM-DD (start date of period)
  expenses: Expense[];
  bucketPayments: BucketPayment[]; // Payments from previous month by bucket
  paidFixedPayments: string[]; // IDs of fixed payments paid this month
  salary: number; // stored as integer (cents), default 0
  monthlyLimit: number; // stored as integer (cents), default 0
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number; // stored as integer (cents)
  monthlyTarget?: number; // stored as integer (cents), optional
  order: number; // Display order
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number; // stored as integer (cents)
  date: string; // YYYY-MM-DD format
  period: string; // Period format: YYYY-MM-DD (start date of period)
  source: 'manual' | 'recurring'; // How the savings was added
}

export interface MonthSummary {
  salary: number;
  fixedPaymentsTotal: number; // Deprecated: use remainingRecurringTotal instead, kept for backward compatibility
  plannedRecurringTotal: number; // Sum of ALL recurring payments (paid + unpaid) - never changes during month
  paidRecurringTotal: number; // Sum of recurring payments marked as paid
  remainingRecurringTotal: number; // plannedRecurringTotal - paidRecurringTotal
  expensesByBucket: Record<string, number>; // Changed from Record<ExpenseBucket, number>
  grandTotal: number; // expensesTotal + paidRecurringTotal (only paid recurring payments count as expenses)
  totalSavings: number; // Sum of all savings contributions (reduces Money Left but not expenses)
  remainingFromSalary: number; // salary - grandTotal - totalSavings
  monthlyLimit: number;
  remainingFromLimit: number; // monthlyLimit - grandTotal
}
