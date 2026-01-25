import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserSettings, upsertUserSettings } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const settings = await getUserSettings(userId);
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({ periodStartDay: 1 });
    }

    return NextResponse.json({
      periodStartDay: settings.periodStartDay,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { periodStartDay } = body;

    if (periodStartDay === undefined) {
      return NextResponse.json(
        { error: 'periodStartDay is required' },
        { status: 400 }
      );
    }

    if (typeof periodStartDay !== 'number' || periodStartDay < 1 || periodStartDay > 31) {
      return NextResponse.json(
        { error: 'periodStartDay must be between 1 and 31' },
        { status: 400 }
      );
    }

    const settings = await upsertUserSettings(userId, {
      periodStartDay,
    });

    return NextResponse.json({
      periodStartDay: settings.periodStartDay,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
