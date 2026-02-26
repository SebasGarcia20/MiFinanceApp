import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { updateSavingsGoal, deleteSavingsGoal } from '@/lib/db-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { name, targetAmount, monthlyTarget, order } = body;

    const updates: {
      name?: string;
      targetAmount?: number;
      monthlyTarget?: number;
      order?: number;
    } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Goal name cannot be empty' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }
    if (targetAmount !== undefined) {
      if (typeof targetAmount !== 'number' || targetAmount < 0) {
        return NextResponse.json(
          { error: 'Target amount must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.targetAmount = Math.round(targetAmount);
    }
    if (monthlyTarget !== undefined) {
      if (monthlyTarget !== null && (typeof monthlyTarget !== 'number' || monthlyTarget < 0)) {
        return NextResponse.json(
          { error: 'Monthly target must be a non-negative number or null' },
          { status: 400 }
        );
      }
      updates.monthlyTarget =
        monthlyTarget == null ? undefined : Math.round(monthlyTarget);
    }
    if (order !== undefined && typeof order === 'number') {
      updates.order = order;
    }

    const goal = await updateSavingsGoal(userId, id, updates);
    return NextResponse.json({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      monthlyTarget: goal.monthlyTarget ?? undefined,
      order: goal.order,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Savings goal not found or access denied') {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    console.error('Error updating savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to update savings goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteSavingsGoal(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Savings goal not found or access denied') {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    console.error('Error deleting savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete savings goal' },
      { status: 500 }
    );
  }
}
