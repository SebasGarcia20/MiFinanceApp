import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { getUserMonthData, upsertMonthData } from '@/lib/db-helpers';
import { getUserExpenses } from '@/lib/db-helpers';
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

    // Get month data
    const monthData = await getUserMonthData(userId, period);
    
    // Get expenses for this period
    const expenses = await getUserExpenses(userId, period);
    
    // Get bucket payments (from BucketPayment model)
    const bucketPayments = await prisma.bucketPayment.findMany({
      where: { userId, period },
      orderBy: { createdAt: 'asc' },
    });

    // Transform data to match client-side MonthData format
    const transformedExpenses = expenses.map(expense => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      bucket: expense.bucketId, // Map bucketId to bucket
      categoryId: expense.categoryId,
    }));

    const transformedBucketPayments = bucketPayments.map(bp => ({
      id: bp.id,
      bucket: bp.bucketId, // Map bucketId to bucket
      amount: bp.amount,
      paid: bp.paid,
      dueDate: bp.dueDate || undefined,
    }));

    const response = {
      month: period,
      expenses: transformedExpenses,
      bucketPayments: transformedBucketPayments,
      paidFixedPaymentIds: monthData?.paidFixedPaymentIds || [], // Keep for API compatibility
      paidFixedPayments: monthData?.paidFixedPaymentIds || [], // Also include for client compatibility
      salary: monthData?.salary || 0,
      monthlyLimit: monthData?.monthlyLimit || 0,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching month data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch month data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { period, salary, monthlyLimit, paidFixedPaymentIds } = body;

    if (!period || typeof period !== 'string') {
      return NextResponse.json(
        { error: 'Period is required' },
        { status: 400 }
      );
    }

    const updates: any = {};

    if (salary !== undefined) {
      if (typeof salary !== 'number' || salary < 0) {
        return NextResponse.json(
          { error: 'Salary must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.salary = Math.round(salary);
    }

    if (monthlyLimit !== undefined) {
      if (typeof monthlyLimit !== 'number' || monthlyLimit < 0) {
        return NextResponse.json(
          { error: 'Monthly limit must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.monthlyLimit = Math.round(monthlyLimit);
    }

    if (paidFixedPaymentIds !== undefined) {
      if (!Array.isArray(paidFixedPaymentIds)) {
        return NextResponse.json(
          { error: 'paidFixedPaymentIds must be an array' },
          { status: 400 }
        );
      }
      updates.paidFixedPaymentIds = paidFixedPaymentIds;
    }

    const monthData = await upsertMonthData(userId, period, updates);
    return NextResponse.json(monthData);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error upserting month data:', error);
    return NextResponse.json(
      { error: 'Failed to save month data' },
      { status: 500 }
    );
  }
}
