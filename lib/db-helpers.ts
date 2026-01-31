import { prisma } from './prisma';

/**
 * Helper functions for user-scoped database queries
 * All functions automatically filter by the current user's ID
 */

// Fixed Payments
export async function getUserFixedPayments(userId: string) {
  return await prisma.fixedPayment.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createFixedPayment(userId: string, data: {
  name: string;
  amount: number;
  dueDate?: string;
  dueDay?: number;
  categoryId?: string;
}) {
  return await prisma.fixedPayment.create({
    data: {
      userId,
      name: data.name,
      amount: data.amount,
      dueDate: data.dueDate,
      dueDay: data.dueDay,
      categoryId: data.categoryId,
    },
  });
}

export async function updateFixedPayment(userId: string, id: string, data: {
  name?: string;
  amount?: number;
  dueDate?: string;
  dueDay?: number;
  categoryId?: string;
}) {
  // Ensure the payment belongs to the user
  const existing = await prisma.fixedPayment.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Fixed payment not found or access denied');
  }
  
  return await prisma.fixedPayment.update({
    where: { id },
    data,
  });
}

export async function deleteFixedPayment(userId: string, id: string) {
  // Ensure the payment belongs to the user
  const existing = await prisma.fixedPayment.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Fixed payment not found or access denied');
  }
  
  return await prisma.fixedPayment.delete({
    where: { id },
  });
}

// Bucket Configs
export async function getUserBucketConfigs(userId: string) {
  return await prisma.bucketConfig.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
  });
}

export async function createBucketConfig(userId: string, data: {
  name: string;
  type: 'cash' | 'credit_card';
  paymentDay?: number;
  order: number;
}) {
  return await prisma.bucketConfig.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      paymentDay: data.paymentDay,
      order: data.order,
    },
  });
}

export async function updateBucketConfig(userId: string, id: string, data: {
  name?: string;
  type?: 'cash' | 'credit_card';
  paymentDay?: number;
  order?: number;
}) {
  const existing = await prisma.bucketConfig.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Bucket config not found or access denied');
  }
  
  return await prisma.bucketConfig.update({
    where: { id },
    data,
  });
}

export async function deleteBucketConfig(userId: string, id: string) {
  // Check if bucket has expenses
  const expenseCount = await prisma.expense.count({
    where: { bucketId: id, userId },
  });
  
  if (expenseCount > 0) {
    throw new Error('Cannot delete bucket with existing expenses');
  }
  
  const existing = await prisma.bucketConfig.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Bucket config not found or access denied');
  }
  
  return await prisma.bucketConfig.delete({
    where: { id },
  });
}

// Expenses
export async function getUserExpenses(userId: string, period: string) {
  return await prisma.expense.findMany({
    where: { userId, period },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createExpense(userId: string, data: {
  period: string;
  name: string;
  amount: number;
  bucketId: string;
  categoryId: string;
}) {
  return await prisma.expense.create({
    data: {
      userId,
      period: data.period,
      name: data.name,
      amount: data.amount,
      bucketId: data.bucketId,
      categoryId: data.categoryId,
    },
  });
}

export async function updateExpense(userId: string, id: string, data: {
  name?: string;
  amount?: number;
  bucketId?: string;
  categoryId?: string;
}) {
  const existing = await prisma.expense.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Expense not found or access denied');
  }
  
  return await prisma.expense.update({
    where: { id },
    data,
  });
}

export async function deleteExpense(userId: string, id: string) {
  const existing = await prisma.expense.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Expense not found or access denied');
  }
  
  return await prisma.expense.delete({
    where: { id },
  });
}

// Month Data
export async function getUserMonthData(userId: string, period: string) {
  return await prisma.monthData.findUnique({
    where: { userId_period: { userId, period } },
  });
}

export async function upsertMonthData(userId: string, period: string, data: {
  salary?: number;
  monthlyLimit?: number;
  paidFixedPaymentIds?: string[];
}) {
  return await prisma.monthData.upsert({
    where: { userId_period: { userId, period } },
    update: data,
    create: {
      userId,
      period,
      salary: data.salary ?? 0,
      monthlyLimit: data.monthlyLimit ?? 0,
      paidFixedPaymentIds: data.paidFixedPaymentIds ?? [],
    },
  });
}

// Savings Goals
export async function getUserSavingsGoals(userId: string) {
  return await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
  });
}

export async function createSavingsGoal(userId: string, data: {
  name: string;
  targetAmount: number;
  monthlyTarget?: number;
  order: number;
}) {
  return await prisma.savingsGoal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      monthlyTarget: data.monthlyTarget,
      order: data.order,
    },
  });
}

export async function updateSavingsGoal(userId: string, id: string, data: {
  name?: string;
  targetAmount?: number;
  monthlyTarget?: number;
  order?: number;
}) {
  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Savings goal not found or access denied');
  }
  
  return await prisma.savingsGoal.update({
    where: { id },
    data,
  });
}

export async function deleteSavingsGoal(userId: string, id: string) {
  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Savings goal not found or access denied');
  }
  
  // Delete associated contributions
  await prisma.savingsContribution.deleteMany({
    where: { goalId: id, userId },
  });
  
  return await prisma.savingsGoal.delete({
    where: { id },
  });
}

// Savings Contributions
export async function getUserSavingsContributions(userId: string, period?: string) {
  return await prisma.savingsContribution.findMany({
    where: period ? { userId, period } : { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createSavingsContribution(userId: string, data: {
  goalId: string;
  amount: number;
  date: string;
  period: string;
  source: 'manual' | 'recurring';
}) {
  return await prisma.savingsContribution.create({
    data: {
      userId,
      goalId: data.goalId,
      amount: data.amount,
      date: data.date,
      period: data.period,
      source: data.source,
    },
  });
}

export async function deleteSavingsContribution(userId: string, id: string) {
  const existing = await prisma.savingsContribution.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Savings contribution not found or access denied');
  }
  
  return await prisma.savingsContribution.delete({
    where: { id },
  });
}

// User Settings
export async function getUserSettings(userId: string) {
  return await prisma.userSettings.findUnique({
    where: { userId },
  });
}

export async function upsertUserSettings(userId: string, data: {
  periodStartDay?: number;
  language?: string;
}) {
  try {
    return await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        periodStartDay: data.periodStartDay ?? 1,
        language: data.language ?? 'es',
      },
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    const message = (err as { message?: string })?.message ?? '';
    const isMissingLanguageColumn =
      code === 'P2022' ||
      /column.*does not exist/i.test(message) ||
      /language/i.test(message);

    if (!isMissingLanguageColumn) throw err;

    // Fallback when DB has no `language` column (migration not applied)
    const periodStartDay = data.periodStartDay ?? 1;
    const existing = await prisma.$queryRaw<Array<{ periodStartDay: number }>>`
      SELECT "periodStartDay" FROM "UserSettings" WHERE "userId" = ${userId} LIMIT 1
    `;

    if (existing.length > 0) {
      await prisma.$executeRaw`
        UPDATE "UserSettings"
        SET "periodStartDay" = ${periodStartDay}, "updatedAt" = now()
        WHERE "userId" = ${userId}
      `;
    } else {
      const { randomUUID } = await import('crypto');
      await prisma.$executeRaw`
        INSERT INTO "UserSettings" ("id", "userId", "periodStartDay", "createdAt", "updatedAt")
        VALUES (${randomUUID()}, ${userId}, ${periodStartDay}, now(), now())
      `;
    }

    return { userId, periodStartDay } as Awaited<ReturnType<typeof prisma.userSettings.upsert>>;
  }
}

// Categories
export async function getCategories(userId?: string) {
  // Get user-specific categories + global defaults (userId = null)
  return await prisma.category.findMany({
    where: {
      OR: [
        { userId: userId || null },
        { userId: null }, // Global defaults
      ],
    },
    orderBy: { order: 'asc' },
  });
}

export async function getDefaultCategoryId(): Promise<string> {
  // Get the "Other" category ID (global default)
  const otherCategory = await prisma.category.findFirst({
    where: {
      userId: null,
      name: 'Other',
    },
  });
  
  if (!otherCategory) {
    throw new Error('Default "Other" category not found. Please run seed script.');
  }
  
  return otherCategory.id;
}

export async function createCategory(userId: string, data: {
  name: string;
  color?: string;
  order: number;
}) {
  return await prisma.category.create({
    data: {
      userId,
      name: data.name,
      color: data.color,
      order: data.order,
    },
  });
}

export async function updateCategory(userId: string, id: string, data: {
  name?: string;
  color?: string;
  order?: number;
}) {
  // Can only update user's own categories, not global defaults
  const existing = await prisma.category.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Category not found or access denied (cannot modify global defaults)');
  }
  
  return await prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(userId: string, id: string) {
  // Can only delete user's own categories, not global defaults
  const existing = await prisma.category.findFirst({
    where: { id, userId },
  });
  
  if (!existing) {
    throw new Error('Category not found or access denied (cannot delete global defaults)');
  }
  
  // Check if category is used in expenses
  const expenseCount = await prisma.expense.count({
    where: { categoryId: id, userId },
  });
  
  if (expenseCount > 0) {
    throw new Error('Cannot delete category with existing expenses');
  }
  
  return await prisma.category.delete({
    where: { id },
  });
}

// Spending Analytics
export interface SpendingByCategoryItem {
  categoryId: string;
  name: string;
  color: string | null;
  total: number;
  percent: number;
}

export async function getSpendingByCategory(
  userId: string,
  period: string,
  bucketId?: string
): Promise<SpendingByCategoryItem[]> {
  // Get expenses for the period, optionally filtered by bucket
  const whereClause: any = {
    userId,
    period,
  };
  
  if (bucketId) {
    whereClause.bucketId = bucketId;
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    include: {
      category: true,
    },
  });

  if (expenses.length === 0) {
    return [];
  }

  // Calculate total spending
  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (totalSpending === 0) {
    return [];
  }

  // Group by category
  const categoryMap = new Map<string, { name: string; color: string | null; total: number }>();

  expenses.forEach((expense) => {
    const categoryId = expense.categoryId;
    const category = expense.category;
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        name: category?.name || 'Other',
        color: category?.color || null,
        total: 0,
      });
    }
    
    const entry = categoryMap.get(categoryId)!;
    entry.total += expense.amount;
  });

  // Convert to array and calculate percentages
  let result: SpendingByCategoryItem[] = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
    categoryId,
    name: data.name,
    color: data.color,
    total: data.total,
    percent: (data.total / totalSpending) * 100,
  }));

  // Sort by total descending
  result.sort((a, b) => b.total - a.total);

  // Group categories with < 5% into "Other" (unless only 1-2 categories total)
  if (result.length > 2) {
    const threshold = 5; // 5%
    const smallCategories = result.filter((item) => item.percent < threshold);
    const largeCategories = result.filter((item) => item.percent >= threshold);

    if (smallCategories.length > 0) {
      const otherTotal = smallCategories.reduce((sum, item) => sum + item.total, 0);
      const otherPercent = (otherTotal / totalSpending) * 100;

      // Find or create "Other" category
      let otherCategory = largeCategories.find((item) => item.name.toLowerCase() === 'other');
      
      if (otherCategory) {
        // Add to existing "Other"
        otherCategory.total += otherTotal;
        otherCategory.percent = (otherCategory.total / totalSpending) * 100;
      } else {
        // Create new "Other" entry
        const otherCategoryId = smallCategories[0].categoryId; // Use first small category's ID
        otherCategory = {
          categoryId: otherCategoryId,
          name: 'Other',
          color: '#6B7280', // Gray
          total: otherTotal,
          percent: otherPercent,
        };
        largeCategories.push(otherCategory);
      }

      result = largeCategories;
      result.sort((a, b) => b.total - a.total);
    }
  }

  return result;
}
