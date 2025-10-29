import { NextRequest, NextResponse } from 'next/server';
import { listPayments } from '@/lib/atlas-tracking';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    console.log('🔍 Fetching activity series:', { days, since: since.toISOString() });

    // Fetch all payments (all platform transactions)
    let payments: Awaited<ReturnType<typeof listPayments>>;
    try {
      payments = await listPayments({
        since,
        limit: 10000,
      });
      console.log(`✅ Loaded ${payments.length} payments from database`);
      if (payments.length > 0) {
        console.log('📋 Sample payment:', {
          txHash: payments[0].txHash,
          userAddress: payments[0].userAddress,
          category: payments[0].category,
          amountMicro: payments[0].amountMicro,
        });
      }
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError.message);
      console.error('❌ Stack:', dbError.stack);
      payments = [] as Awaited<ReturnType<typeof listPayments>>;
    }

    // Group by day
    const dayMap = new Map<string, {
      day: string;
      revenue: number;
      revenueBase: number;
      revenueSol: number;
      txCount: number;
      users: Set<string>;
    }>();

    payments.forEach(p => {
      const day = p.createdAt.toISOString().split('T')[0];
      const amount = p.amountMicro / 1_000_000;

      if (!dayMap.has(day)) {
        dayMap.set(day, {
          day,
          revenue: 0,
          revenueBase: 0,
          revenueSol: 0,
          txCount: 0,
          users: new Set(),
        });
      }

      const dayData = dayMap.get(day)!;
      dayData.revenue += amount;
      dayData.txCount++;
      if (p.userAddress) dayData.users.add(p.userAddress);

      if (p.network === 'base') {
        dayData.revenueBase += amount;
      } else if (p.network === 'solana-mainnet') {
        dayData.revenueSol += amount;
      }
    });

    // Convert to array and sort by day
    const series = Array.from(dayMap.values())
      .map(d => ({
        day: d.day,
        revenue: d.revenue,
        revenueBase: d.revenueBase,
        revenueSol: d.revenueSol,
        txCount: d.txCount,
        users: d.users.size,
      }))
      .sort((a, b) => a.day.localeCompare(b.day));

    console.log(`✅ Returning ${series.length} days of activity`);

    return NextResponse.json({
      success: true,
      data: series,
    });
  } catch (error: any) {
    console.error('❌ Error fetching activity:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch activity',
    }, { status: 500 });
  }
}
