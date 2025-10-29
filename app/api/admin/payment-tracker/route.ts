import { NextRequest, NextResponse } from 'next/server';
import { recordPayment } from '@/lib/atlas-tracking';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      txHash,
      network,
      from,
      to,
      amountMicro,
      category,
      service,
      metadata,
    } = body;

    if (!txHash || !network || !from || !to || amountMicro === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: txHash, network, from, to, amountMicro',
      }, { status: 400 });
    }

    // Normalize addresses
    const normalizedFrom = from?.toLowerCase().trim();
    const normalizedTo = to?.toLowerCase().trim();
    
    console.log('💾 Recording payment:', {
      txHash,
      from: normalizedFrom,
      to: normalizedTo,
      network,
      amountMicro,
      category,
      service,
    });

    // Record the payment
    const payment = await recordPayment({
      txHash,
      userAddress: normalizedFrom,
      merchantAddress: normalizedTo,
      network: network === 'base' ? 'base' : 'solana-mainnet',
      amountMicro: typeof amountMicro === 'string' ? parseInt(amountMicro) : amountMicro,
      currency: 'USDC',
      category: category || 'other',
      service: service || null,
      metadata: metadata || null,
    });

    console.log('✅ Payment recorded:', {
      txHash: payment.txHash,
      userAddress: payment.userAddress,
      network: payment.network,
      category: payment.category,
    });

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to record payment',
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const network = searchParams.get('network');
    const category = searchParams.get('category');
    const from = searchParams.get('from');

    const { listPayments } = await import('@/lib/atlas-tracking');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const payments = await listPayments({
      since,
      network: network as any,
      category: category || undefined,
      userAddress: from || undefined,
      limit: 10000,
    });

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error('Error fetching tracked payments:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch payments',
    }, { status: 500 });
  }
}

