import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { updateExpense, deleteExpense } from '@/lib/db-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { name, amount, bucketId, categoryId } = body;

    const updates: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Expense name cannot be empty' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount < 0) {
        return NextResponse.json(
          { error: 'Amount must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.amount = Math.round(amount);
    }

    if (bucketId !== undefined) {
      if (typeof bucketId !== 'string') {
        return NextResponse.json(
          { error: 'Bucket ID must be a string' },
          { status: 400 }
        );
      }
      updates.bucketId = bucketId;
    }

    if (categoryId !== undefined) {
      if (typeof categoryId !== 'string') {
        return NextResponse.json(
          { error: 'Category ID must be a string' },
          { status: 400 }
        );
      }
      updates.categoryId = categoryId;
    }

    const expense = await updateExpense(userId, id, updates);

    // Transform bucketId to bucket for client compatibility
    return NextResponse.json({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      bucket: expense.bucketId,
      categoryId: expense.categoryId,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Expense not found or access denied') {
      return NextResponse.json(
        { error: 'Expense not found or access denied' },
        { status: 404 }
      );
    }
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    await deleteExpense(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Expense not found or access denied') {
      return NextResponse.json(
        { error: 'Expense not found or access denied' },
        { status: 404 }
      );
    }
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
