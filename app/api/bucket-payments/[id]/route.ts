import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { prisma } from '@/lib/prisma';

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
    const { amount, paid, dueDate } = body;

    // Check ownership
    const existing = await prisma.bucketPayment.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Bucket payment not found or access denied' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount < 0) {
        return NextResponse.json(
          { error: 'Amount must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.amount = Math.round(amount);
    }

    if (paid !== undefined) {
      if (typeof paid !== 'boolean') {
        return NextResponse.json(
          { error: 'Paid must be a boolean' },
          { status: 400 }
        );
      }
      updates.paid = paid;
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

    const bucketPayment = await prisma.bucketPayment.update({
      where: { id },
      data: updates,
    });

    // Transform bucketId to bucket for client compatibility
    return NextResponse.json({
      id: bucketPayment.id,
      bucket: bucketPayment.bucketId,
      amount: bucketPayment.amount,
      paid: bucketPayment.paid,
      dueDate: bucketPayment.dueDate || undefined,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating bucket payment:', error);
    return NextResponse.json(
      { error: 'Failed to update bucket payment' },
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

    // Check ownership
    const existing = await prisma.bucketPayment.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Bucket payment not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.bucketPayment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting bucket payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete bucket payment' },
      { status: 500 }
    );
  }
}
