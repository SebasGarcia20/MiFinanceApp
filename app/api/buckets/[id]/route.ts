import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { updateBucketConfig, deleteBucketConfig } from '@/lib/db-helpers';
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
    const { name, type, paymentDay, order } = body;

    const updates: any = {};
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Bucket name cannot be empty' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (type !== undefined) {
      if (type !== 'cash' && type !== 'credit_card') {
        return NextResponse.json(
          { error: 'Bucket type must be "cash" or "credit_card"' },
          { status: 400 }
        );
      }
      updates.type = type;
    }

    if (paymentDay !== undefined) {
      if (type === 'credit_card') {
        if (typeof paymentDay !== 'number' || paymentDay < 1 || paymentDay > 31) {
          return NextResponse.json(
            { error: 'Payment day must be between 1 and 31' },
            { status: 400 }
          );
        }
        updates.paymentDay = paymentDay;
      } else {
        updates.paymentDay = null;
      }
    }

    if (order !== undefined) {
      if (typeof order !== 'number' || order < 0) {
        return NextResponse.json(
          { error: 'Order must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.order = order;
    }

    const bucket = await updateBucketConfig(userId, id, updates);
    return NextResponse.json(bucket);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Bucket config not found or access denied') {
      return NextResponse.json(
        { error: 'Bucket not found or access denied' },
        { status: 404 }
      );
    }
    console.error('Error updating bucket:', error);
    return NextResponse.json(
      { error: 'Failed to update bucket' },
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

    // Check if bucket has expenses
    const expenseCount = await prisma.expense.count({
      where: { bucketId: id, userId },
    });

    if (expenseCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bucket with existing expenses' },
        { status: 409 }
      );
    }

    await deleteBucketConfig(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Bucket config not found or access denied') {
      return NextResponse.json(
        { error: 'Bucket not found or access denied' },
        { status: 404 }
      );
    }
    if (error.message === 'Cannot delete bucket with existing expenses') {
      return NextResponse.json(
        { error: 'Cannot delete bucket with existing expenses' },
        { status: 409 }
      );
    }
    console.error('Error deleting bucket:', error);
    return NextResponse.json(
      { error: 'Failed to delete bucket' },
      { status: 500 }
    );
  }
}
