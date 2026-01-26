import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserExpenses, createExpense, getCategories, getDefaultCategoryId } from '@/lib/db-helpers';

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

    const expenses = await getUserExpenses(userId, period);
    
    // Transform bucketId to bucket for client compatibility
    const transformedExpenses = expenses.map((expense: { id: string; name: string; amount: number; bucketId: string; categoryId: string }) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      bucket: expense.bucketId, // Map bucketId to bucket
      categoryId: expense.categoryId,
    }));

    return NextResponse.json(transformedExpenses);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { period, name, amount, bucketId, categoryId } = body;

    // Validation
    if (!period || typeof period !== 'string') {
      return NextResponse.json(
        { error: 'Period is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Expense name is required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a non-negative number' },
        { status: 400 }
      );
    }

    if (!bucketId || typeof bucketId !== 'string') {
      return NextResponse.json(
        { error: 'Bucket ID is required' },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Resolve client slugs (e.g. default-entertainment from useCategories) to real DB category ids
    let resolvedCategoryId: string | undefined;
    const categories = await getCategories(userId);
    
    if (categories.length === 0) {
      console.error('No categories found for user:', userId);
      return NextResponse.json(
        { error: 'No categories found. Please ensure your account is set up correctly.' },
        { status: 400 }
      );
    }
    
    // First, check if categoryId is a real database ID
    const categoryById = categories.find((c: { id: string }) => c.id === categoryId);
    if (categoryById) {
      resolvedCategoryId = categoryId;
    } else {
      // If not found by ID, try to resolve slug to category name and find by name
      // Slugs are like "default-entertainment" -> "Entertainment"
      let categoryName: string | null = null;
      if (categoryId.startsWith('default-')) {
        // Map known slugs to their actual category names
        const slugToNameMap: Record<string, string> = {
          'default-fixed-essentials': 'Fixed/Essentials',
          'default-debt-card-payment': 'Debt/Card Payment',
          'default-food': 'Food',
          'default-transport': 'Transport',
          'default-entertainment': 'Entertainment',
          'default-health': 'Health',
          'default-other': 'Other',
        };
        
        categoryName = slugToNameMap[categoryId];
        
        // If not in map, try to convert: "default-xyz" -> "Xyz"
        if (!categoryName) {
          const slugName = categoryId.replace('default-', '');
          // Capitalize first letter: "entertainment" -> "Entertainment"
          categoryName = slugName.charAt(0).toUpperCase() + slugName.slice(1);
        }
      }
      
      // Try to find category by name (user-specific or fallback to any)
      const categoryByName = categoryName 
        ? categories.find((c: { name: string }) => c.name.toLowerCase() === categoryName.toLowerCase())
        : null;
      
      if (categoryByName) {
        resolvedCategoryId = categoryByName.id;
      } else {
        // Fallback to "Other" category
        const otherCategory = categories.find((c: { name: string }) => c.name.toLowerCase() === 'other');
        if (otherCategory) {
          resolvedCategoryId = otherCategory.id;
        } else {
          // Last resort: try to get default "Other" category
          try {
            resolvedCategoryId = await getDefaultCategoryId();
          } catch (e) {
            return NextResponse.json(
              { error: 'Category not found. Please ensure categories are set up correctly.' },
              { status: 400 }
            );
          }
        }
      }
    }
    
    // Ensure we have a valid category ID
    if (!resolvedCategoryId) {
      console.error('Failed to resolve category ID:', { 
        categoryId, 
        categoriesCount: categories.length,
        categoryNames: categories.map((c: { name: string }) => c.name)
      });
      return NextResponse.json(
        { error: `Failed to resolve category "${categoryId}". Please ensure categories are set up correctly.` },
        { status: 400 }
      );
    }

    try {
      const expense = await createExpense(userId, {
        period,
        name: name.trim(),
        amount: Math.round(amount), // Ensure integer (cents)
        bucketId,
        categoryId: resolvedCategoryId,
      });

      // Transform bucketId to bucket for client compatibility
      return NextResponse.json({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        bucket: expense.bucketId,
        categoryId: expense.categoryId,
      }, { status: 201 });
    } catch (dbError: any) {
      // Handle Prisma foreign key constraint errors
      if (dbError.code === 'P2003') {
        console.error('Foreign key constraint error:', dbError);
        return NextResponse.json(
          { error: 'Invalid bucket or category. Please refresh the page and try again.' },
          { status: 400 }
        );
      }
      // Re-throw to be caught by outer catch
      throw dbError;
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating expense:', error);
    const message = typeof error?.message === 'string' ? error.message : 'Failed to create expense';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
