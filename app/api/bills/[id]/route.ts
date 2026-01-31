import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { updateFixedPayment, deleteFixedPayment } from '@/lib/db-helpers';

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
    const { name, amount, dueDate, dueDay, categoryId } = body;

    const updates: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Bill name cannot be empty' },
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

    if (dueDate !== undefined) {
      if (dueDate === null) {
        updates.dueDate = null;
      } else if (typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        updates.dueDate = dueDate;
      } else {
        return NextResponse.json(
          { error: 'Due date must be in YYYY-MM-DD format' },
          { status: 400 }
        );
      }
    }

    if (dueDay !== undefined) {
      if (dueDay === null) {
        updates.dueDay = null;
      } else {
        const d = Number(dueDay);
        if (!Number.isInteger(d) || d < 1 || d > 31) {
          return NextResponse.json(
            { error: 'Due day must be a number between 1 and 31' },
            { status: 400 }
          );
        }
        updates.dueDay = Math.min(31, Math.max(1, Math.round(d)));
      }
    }

    if (categoryId !== undefined) {
      updates.categoryId = categoryId || null;
    }

    const bill = await updateFixedPayment(userId, id, updates);
    return NextResponse.json(bill);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Fixed payment not found or access denied') {
      return NextResponse.json(
        { error: 'Bill not found or access denied' },
        { status: 404 }
      );
    }
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: 'Failed to update bill' },
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

    await deleteFixedPayment(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Fixed payment not found or access denied') {
      return NextResponse.json(
        { error: 'Bill not found or access denied' },
        { status: 404 }
      );
    }
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
}
