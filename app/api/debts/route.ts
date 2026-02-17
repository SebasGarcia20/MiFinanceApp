import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserDebts, createDebt } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const debts = await getUserDebts(userId);
    const mapped = debts.map((d) => ({
      id: d.id,
      name: d.name,
      totalAmount: d.totalAmount,
      order: d.order,
      payments: (d.payments || []).map((p) => ({
        id: p.id,
        debtId: p.debtId,
        amount: p.amount,
        date: p.date,
        period: p.period ?? undefined,
      })),
    }));
    return NextResponse.json(mapped);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching debts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { name, totalAmount, order } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Debt name is required' },
        { status: 400 }
      );
    }

    if (typeof totalAmount !== 'number' || totalAmount < 0) {
      return NextResponse.json(
        { error: 'Total amount must be a non-negative number' },
        { status: 400 }
      );
    }

    const debt = await createDebt(userId, {
      name: name.trim(),
      totalAmount: Math.round(totalAmount),
      order: typeof order === 'number' ? order : undefined,
    });

    return NextResponse.json(
      { id: debt.id, name: debt.name, totalAmount: debt.totalAmount, order: debt.order, payments: [] },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating debt:', error);
    return NextResponse.json(
      { error: 'Failed to create debt' },
      { status: 500 }
    );
  }
}
