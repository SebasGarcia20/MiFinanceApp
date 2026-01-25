import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserExpenses, createExpense, getCategories, getDefaultCategoryId } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    if (!period) {
      return NextResponse.json(
        { error: 'Period query parameter is required' },
        { status: 400 }
      );
    }

    const expenses = await getUserExpenses(userId, period);
    
    // Transform bucketId to bucket for client compatibility
    const transformedExpenses = expenses.map((expense: { id: string; name: string; amount: number; bucketId: string; categoryId: string }) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      bucket: expense.bucketId, // Map bucketId to bucket
      categoryId: expense.categoryId,
    }));

    return NextResponse.json(transformedExpenses);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { period, name, amount, bucketId, categoryId } = body;

    // Validation
    if (!period || typeof period !== 'string') {
      return NextResponse.json(
        { error: 'Period is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Expense name is required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a non-negative number' },
        { status: 400 }
      );
    }

    if (!bucketId || typeof bucketId !== 'string') {
      return NextResponse.json(
        { error: 'Bucket ID is required' },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Resolve client slugs (e.g. default-other from useCategories) to real DB category ids
    let resolvedCategoryId: string;
    const categories = await getCategories(userId);
    const categoryExists = categories.some((c: { id: string }) => c.id === categoryId);
    if (categoryExists) {
      resolvedCategoryId = categoryId;
    } else {
      try {
        resolvedCategoryId = await getDefaultCategoryId();
      } catch (e) {
        return NextResponse.json(
          { error: 'Default "Other" category not found. Run: npm run db:seed' },
          { status: 503 }
        );
      }
    }

    const expense = await createExpense(userId, {
      period,
      name: name.trim(),
      amount: Math.round(amount), // Ensure integer (cents)
      bucketId,
      categoryId: resolvedCategoryId,
    });

    // Transform bucketId to bucket for client compatibility
    return NextResponse.json({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      bucket: expense.bucketId,
      categoryId: expense.categoryId,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating expense:', error);
    const message = typeof error?.message === 'string' ? error.message : 'Failed to create expense';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
