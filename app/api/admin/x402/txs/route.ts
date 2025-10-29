import { NextRequest, NextResponse } from 'next/server';
import { listPayments } from '@/lib/atlas-tracking';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    console.log('🔍 Fetching transactions:', { days, since: since.toISOString() });

    // Fetch all payments from tracking system (no user filter - all platform transactions)
    let payments;
    try {
      payments = await listPayments({
        since,
        limit: 10000,
      });
      console.log(`✅ Loaded ${payments.length} payments from database`);
      if (payments.length > 0) {
        console.log('📋 Sample transaction:', {
          txHash: payments[0].txHash,
          userAddress: payments[0].userAddress,
          category: payments[0].category,
          amountMicro: payments[0].amountMicro,
          network: payments[0].network,
        });
      }
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError.message);
      console.error('❌ Stack:', dbError.stack);
      payments = [];
    }

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

    console.log(`✅ Returning ${txs.length} transactions`);

    return NextResponse.json({
      success: true,
      data: txs,
    });
  } catch (error: any) {
    console.error('❌ Error fetching transactions:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch transactions',
    }, { status: 500 });
  }
}
