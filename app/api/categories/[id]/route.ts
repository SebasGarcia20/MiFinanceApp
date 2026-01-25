import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateCategory, deleteCategory } from '@/lib/db-helpers';

type Context = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  { params }: Context
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, color, order } = body;

    const updates: { name?: string; color?: string | null; order?: number } = {};
    if (name !== undefined) updates.name = name.trim();
    if (color !== undefined) updates.color = color || null;
    if (order !== undefined) updates.order = order;

    const category = await updateCategory(session.user.id, id, updates);
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteCategory(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 400 }
    );
  }
}
