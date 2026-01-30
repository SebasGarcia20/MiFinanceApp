import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    if (!period) {
      return NextResponse.json(
        { error: 'Period query parameter is required' },
        { status: 400 }
      );
    }

    const raw = await prisma.bucketPayment.findMany({
      where: { userId, period },
      orderBy: { createdAt: 'asc' },
    });
    // One row per bucket: dedupe by bucketId (keep first, don't sum) so duplicates show correct amount until cleanup runs
    const byBucket = new Map<string, { id: string; bucketId: string; amount: number; paid: boolean; dueDate: string | null }>();
    for (const bp of raw) {
      const key = bp.bucketId;
      if (!byBucket.has(key)) {
        byBucket.set(key, { id: bp.id, bucketId: bp.bucketId, amount: bp.amount, paid: bp.paid, dueDate: bp.dueDate });
      }
    }
    const transformed = Array.from(byBucket.values()).map(bp => ({
      id: bp.id,
      bucket: bp.bucketId,
      amount: bp.amount,
      paid: bp.paid,
      dueDate: bp.dueDate || undefined,
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching bucket payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bucket payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { period, bucketId, amount, paid, dueDate } = body;

    // Validation
    if (!period || typeof period !== 'string') {
      return NextResponse.json(
        { error: 'Period is required' },
        { status: 400 }
      );
    }

    if (!bucketId || typeof bucketId !== 'string') {
      return NextResponse.json(
        { error: 'Bucket ID is required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a non-negative number' },
        { status: 400 }
      );
    }

    // One bucket payment per (userId, period, bucketId). Update if exists so we never duplicate when user navigates back/forth.
    const existing = await prisma.bucketPayment.findFirst({
      where: { userId, period, bucketId },
    });

    const payload = {
      amount: Math.round(amount),
      paid: paid ?? existing?.paid ?? false,
      dueDate: dueDate ?? existing?.dueDate ?? null,
    };

    const bucketPayment = existing
      ? await prisma.bucketPayment.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.bucketPayment.create({
          data: {
            userId,
            period,
            bucketId,
            ...payload,
          },
        });

    // Transform bucketId to bucket for client compatibility
    return NextResponse.json({
      id: bucketPayment.id,
      bucket: bucketPayment.bucketId,
      amount: bucketPayment.amount,
      paid: bucketPayment.paid,
      dueDate: bucketPayment.dueDate || undefined,
    }, existing ? 200 : 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating bucket payment:', error);
    return NextResponse.json(
      { error: 'Failed to create bucket payment' },
      { status: 500 }
    );
  }
}
