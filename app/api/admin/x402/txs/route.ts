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

    // Format as transaction rows
    const txs = payments.map(p => {
      const explorer = p.network === 'base' && p.txHash
        ? `https://basescan.org/tx/${p.txHash}`
        : p.txHash && p.network === 'solana-mainnet'
        ? `https://solscan.io/tx/${p.txHash}`
        : '#';

      return {
        network: p.network === 'base' ? 'base' : 'solana-mainnet',
        time: p.createdAt.getTime(),
        user: p.userAddress || 'unknown',
        amount: p.amountMicro / 1_000_000, // Convert from micro to USDC
        category: p.category,
        explorer,
        service: p.service || p.metadata?.serviceName || null,
        metadata: p.metadata || {},
      };
    }).sort((a, b) => b.time - a.time);

    return NextResponse.json({
      success: true,
      data: txs,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch transactions',
    }, { status: 500 });
  }
}

