import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { prisma } from '@/lib/prisma';

/**
 * One-time cleanup: remove duplicate bucket payments (same userId, period, bucketId).
 * Keeps the first row per (period, bucketId) and deletes the rest so totals show correctly.
 * Call once: POST /api/bucket-payments/cleanup (while logged in).
 */
export async function POST() {
  try {
    const userId = await requireUserId();

    const all = await prisma.bucketPayment.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // Group by (period, bucketId); keep first id per group, collect others to delete
    const byKey = new Map<string, string[]>();
    for (const bp of all) {
      const key = `${bp.period}:${bp.bucketId}`;
      if (!byKey.has(key)) {
        byKey.set(key, [bp.id]);
      } else {
        byKey.get(key)!.push(bp.id);
      }
    }

    let removed = 0;
    for (const ids of byKey.values()) {
      if (ids.length <= 1) continue;
      // Keep ids[0], delete ids[1..]
      const toDelete = ids.slice(1);
      await prisma.bucketPayment.deleteMany({
        where: { id: { in: toDelete } },
      });
      removed += toDelete.length;
    }

    return NextResponse.json({
      ok: true,
      removed,
      message: removed > 0
        ? `Removed ${removed} duplicate bucket payment(s). Refresh the page to see correct totals.`
        : 'No duplicate bucket payments found.',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Bucket payments cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
