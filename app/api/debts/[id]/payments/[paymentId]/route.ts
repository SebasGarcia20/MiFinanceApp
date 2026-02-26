import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { deleteDebtPayment } from '@/lib/db-helpers';

interface RouteParams {
  params: Promise<{ id: string; paymentId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id: debtId, paymentId } = await params;
    await deleteDebtPayment(userId, debtId, paymentId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Payment not found or access denied') {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    console.error('Error deleting debt payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
