import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserBucketConfigs, createBucketConfig } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const buckets = await getUserBucketConfigs(userId);
    
    return NextResponse.json(buckets);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching buckets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buckets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { name, type, paymentDay } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'cash' && type !== 'credit_card')) {
      return NextResponse.json(
        { error: 'Bucket type must be "cash" or "credit_card"' },
        { status: 400 }
      );
    }

    if (type === 'credit_card' && paymentDay !== undefined) {
      if (typeof paymentDay !== 'number' || paymentDay < 1 || paymentDay > 31) {
        return NextResponse.json(
          { error: 'Payment day must be between 1 and 31' },
          { status: 400 }
        );
      }
    }

    // Get current buckets to determine next order
    const existingBuckets = await getUserBucketConfigs(userId);
    const maxOrder = existingBuckets.length > 0
      ? Math.max(...existingBuckets.map(b => b.order))
      : -1;
    const nextOrder = maxOrder + 1;

    const bucket = await createBucketConfig(userId, {
      name: name.trim(),
      type,
      paymentDay: type === 'credit_card' ? paymentDay : undefined,
      order: nextOrder,
    });

    return NextResponse.json(bucket, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating bucket:', error);
    return NextResponse.json(
      { error: 'Failed to create bucket' },
      { status: 500 }
    );
  }
}
