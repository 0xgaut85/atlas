import { NextRequest, NextResponse } from 'next/server';
import { listPayments } from '@/lib/atlas-tracking';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Fetch all payments from tracking system
    const payments = await listPayments({
      since,
      limit: 10000,
    });

    // Calculate totals by network
    const totals = {
      base: 0,
      solana: 0,
      combined: 0,
    };

    // Calculate by category
    const categories = {
      access: 0,
      registration: 0,
      mint: 0,
      service: 0,
      other: 0,
    };

    payments.forEach(p => {
      const amount = p.amountMicro / 1_000_000; // Convert from micro to USDC
      totals.combined += amount;
      
      if (p.network === 'base') {
        totals.base += amount;
      } else if (p.network === 'solana-mainnet') {
        totals.solana += amount;
      }

      const cat = p.category.toLowerCase();
      if (cat === 'access') categories.access += amount;
      else if (cat === 'registration') categories.registration += amount;
      else if (cat === 'mint' || cat === 'token_minted') categories.mint += amount;
      else if (cat === 'service') categories.service += amount;
      else categories.other += amount;
    });

    // Get stats (placeholder for now)
    const stats = {
      uniqueUsers: new Set(payments.map(p => p.userAddress).filter(Boolean)).size,
      servicesAdded: 0, // Would need to query services table
      since: since.toISOString(),
      sampleSize: payments.length,
    };

    // Placeholder balances (would fetch from on-chain in production)
    const balances = {
      baseUSDC: '0.0',
      solUSDC: '0.0',
    };

    return NextResponse.json({
      success: true,
      data: {
        totals,
        categories,
        stats,
        balances,
      },
    });
  } catch (error: any) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch revenue',
    }, { status: 500 });
  }
}

