import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserSavingsGoals, createSavingsGoal } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const goals = await getUserSavingsGoals(userId);
    const mapped = goals.map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      monthlyTarget: g.monthlyTarget ?? undefined,
      order: g.order,
    }));
    return NextResponse.json(mapped);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching savings goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch savings goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { name, targetAmount, monthlyTarget, order } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Goal name is required' },
        { status: 400 }
      );
    }

    if (typeof targetAmount !== 'number' || targetAmount < 0) {
      return NextResponse.json(
        { error: 'Target amount must be a non-negative number' },
        { status: 400 }
      );
    }

    const goals = await getUserSavingsGoals(userId);
    const newGoal = await createSavingsGoal(userId, {
      name: name.trim(),
      targetAmount: Math.round(targetAmount),
      monthlyTarget:
        typeof monthlyTarget === 'number' && monthlyTarget >= 0
          ? Math.round(monthlyTarget)
          : undefined,
      order: typeof order === 'number' ? order : goals.length,
    });

    return NextResponse.json(
      {
        id: newGoal.id,
        name: newGoal.name,
        targetAmount: newGoal.targetAmount,
        monthlyTarget: newGoal.monthlyTarget ?? undefined,
        order: newGoal.order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to create savings goal' },
      { status: 500 }
    );
  }
}
