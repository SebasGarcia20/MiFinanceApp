import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { createDebtPayment } from '@/lib/db-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id: debtId } = await params;
    const body = await request.json();
    const { amount, date, period } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const dateStr = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date().toISOString().split('T')[0];

    const payment = await createDebtPayment(userId, {
      debtId,
      amount: Math.round(amount),
      date: dateStr,
      period: period ?? undefined,
    });

    return NextResponse.json(
      {
        id: payment.id,
        debtId: payment.debtId,
        amount: payment.amount,
        date: payment.date,
        period: payment.period ?? undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Debt not found or access denied') {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }
    console.error('Error creating debt payment:', error);
    return NextResponse.json(
      { error: 'Failed to add payment' },
      { status: 500 }
    );
  }
}
