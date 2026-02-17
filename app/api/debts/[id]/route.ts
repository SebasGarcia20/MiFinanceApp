import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserDebts, updateDebt, deleteDebt } from '@/lib/db-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const debts = await getUserDebts(userId);
    const debt = debts.find((d) => d.id === id);
    if (!debt) {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: debt.id,
      name: debt.name,
      totalAmount: debt.totalAmount,
      order: debt.order,
      payments: (debt.payments || []).map((p) => ({
        id: p.id,
        debtId: p.debtId,
        amount: p.amount,
        date: p.date,
        period: p.period ?? undefined,
      })),
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching debt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debt' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await request.json();
    const { name, totalAmount } = body;

    const updates: { name?: string; totalAmount?: number } = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Debt name cannot be empty' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }
    if (totalAmount !== undefined) {
      if (typeof totalAmount !== 'number' || totalAmount < 0) {
        return NextResponse.json(
          { error: 'Total amount must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.totalAmount = Math.round(totalAmount);
    }

    const debt = await updateDebt(userId, id, updates);
    const debts = await getUserDebts(userId);
    const full = debts.find((d) => d.id === debt.id);
    return NextResponse.json({
      id: debt.id,
      name: debt.name,
      totalAmount: debt.totalAmount,
      order: debt.order,
      payments: (full?.payments || []).map((p) => ({
        id: p.id,
        debtId: p.debtId,
        amount: p.amount,
        date: p.date,
        period: p.period ?? undefined,
      })),
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Debt not found or access denied') {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }
    console.error('Error updating debt:', error);
    return NextResponse.json(
      { error: 'Failed to update debt' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteDebt(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Debt not found or access denied') {
      return NextResponse.json({ error: 'Debt not found' }, { status: 404 });
    }
    console.error('Error deleting debt:', error);
    return NextResponse.json(
      { error: 'Failed to delete debt' },
      { status: 500 }
    );
  }
}
