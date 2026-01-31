import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserSettings, upsertUserSettings } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const settings = await getUserSettings(userId);
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({ periodStartDay: 1, language: 'es' });
    }

    // Safely access language field - it might not exist if migration hasn't run yet
    // Use type assertion to handle missing field gracefully
    const language = (settings as any).language ?? 'es';
    
    return NextResponse.json({
      periodStartDay: settings.periodStartDay,
      language,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Handle case where language column doesn't exist yet (migration not run)
    // This can happen if Prisma schema was updated but migration hasn't been applied
    if (error.code === 'P2021' || 
        error.message?.includes('column') || 
        error.message?.includes('language') ||
        error.message?.includes('does not exist')) {
      console.warn('Language column may not exist yet. Please run: npx prisma migrate dev');
      
      // Try to get just periodStartDay using a workaround
      try {
        const fallbackUserId = await requireUserId();
        const { prisma } = await import('@/lib/prisma');
        const result = await prisma.$queryRaw<Array<{ periodStartDay: number }>>`
          SELECT "periodStartDay" FROM "UserSettings" WHERE "userId" = ${fallbackUserId} LIMIT 1
        `;
        
        if (result && result.length > 0) {
          return NextResponse.json({
            periodStartDay: result[0].periodStartDay,
            language: 'es', // Default until migration runs
          });
        }
      } catch (fallbackError) {
        // If even the fallback fails, return defaults
        console.error('Fallback query also failed:', fallbackError);
      }
      
      // Return default settings as last resort
      return NextResponse.json({ periodStartDay: 1, language: 'es' });
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
    const { periodStartDay, language } = body;

    // Build update object with only provided fields
    const updates: { periodStartDay?: number; language?: string } = {};

    if (periodStartDay !== undefined) {
      if (typeof periodStartDay !== 'number' || periodStartDay < 1 || periodStartDay > 31) {
        return NextResponse.json(
          { error: 'periodStartDay must be between 1 and 31' },
          { status: 400 }
        );
      }
      updates.periodStartDay = periodStartDay;
    }

    if (language !== undefined) {
      if (language !== 'es' && language !== 'en') {
        return NextResponse.json(
          { error: 'language must be "es" or "en"' },
          { status: 400 }
        );
      }
      updates.language = language;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'At least one field (periodStartDay or language) must be provided' },
        { status: 400 }
      );
    }

    const settings = await upsertUserSettings(userId, updates);

    return NextResponse.json({
      periodStartDay: settings.periodStartDay,
      language: settings.language || 'es',
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
