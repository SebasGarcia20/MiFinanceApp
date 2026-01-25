import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getSpendingByCategory } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period');
    const bucketId = searchParams.get('bucketId') || undefined;

    if (!period) {
      return NextResponse.json({ error: 'Period is required' }, { status: 400 });
    }

    const spendingData = await getSpendingByCategory(session.user.id, period, bucketId);

    return NextResponse.json(spendingData);
  } catch (error) {
    console.error('Error fetching spending data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending data' },
      { status: 500 }
    );
  }
}
