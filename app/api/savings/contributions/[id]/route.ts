import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { deleteSavingsContribution } from '@/lib/db-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteSavingsContribution(userId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Savings contribution not found or access denied') {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }
    console.error('Error deleting savings contribution:', error);
    return NextResponse.json(
      { error: 'Failed to delete savings contribution' },
      { status: 500 }
    );
  }
}
