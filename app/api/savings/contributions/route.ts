import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserSavingsContributions, createSavingsContribution } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') ?? undefined;
    const contributions = await getUserSavingsContributions(userId, period);
    const mapped = contributions.map((c) => ({
      id: c.id,
      goalId: c.goalId,
      amount: c.amount,
      date: c.date,
      period: c.period,
      source: c.source as 'manual' | 'recurring',
    }));
    return NextResponse.json(mapped);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching savings contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch savings contributions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { goalId, amount, date, period, source } = body;

    if (!goalId || typeof goalId !== 'string') {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!period || typeof period !== 'string') {
      return NextResponse.json(
        { error: 'Period is required' },
        { status: 400 }
      );
    }

    const dateStr =
      typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : new Date().toISOString().split('T')[0];

    const contribution = await createSavingsContribution(userId, {
      goalId,
      amount: Math.round(amount),
      date: dateStr,
      period,
      source: source === 'recurring' ? 'recurring' : 'manual',
    });

    return NextResponse.json(
      {
        id: contribution.id,
        goalId: contribution.goalId,
        amount: contribution.amount,
        date: contribution.date,
        period: contribution.period,
        source: contribution.source as 'manual' | 'recurring',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating savings contribution:', error);
    return NextResponse.json(
      { error: 'Failed to create savings contribution' },
      { status: 500 }
    );
  }
}
