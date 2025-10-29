import { NextRequest, NextResponse } from 'next/server';
import { listPayments, listUserEvents } from '@/lib/atlas-tracking';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');
    const solAddress = searchParams.get('solAddress');
    
    if (!address && !solAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address or solAddress required' 
      }, { status: 400 });
    }

    console.log('🔍 Fetching user activity:', { address, solAddress });

    // Normalize addresses
    const userAddress = address?.toLowerCase();
    const userSolAddress = solAddress?.toLowerCase();

    // Fetch payments from tracking system
    let payments;
    let events;
    
    try {
      payments = await listPayments({
        userAddress: userAddress || undefined,
        limit: 1000,
      });
      console.log(`✅ Loaded ${payments.length} payments`);
    } catch (dbError: any) {
      console.error('❌ Database error loading payments:', dbError.message);
      payments = [];
    }

    try {
      events = await listUserEvents({
        userAddress: userAddress || userSolAddress || undefined,
        limit: 1000,
      });
      console.log(`✅ Loaded ${events.length} events`);
    } catch (dbError: any) {
      console.error('❌ Database error loading events:', dbError.message);
      events = [];
    }

    // Combine and format activity
    const activity = [
      // Payments as activity items
      ...payments.map(p => ({
        network: p.network === 'base' ? 'base' : 'solana-mainnet' as const,
        kind: p.category as any,
        amount: (p.amountMicro / 1_000_000).toFixed(6),
        timestamp: p.createdAt.getTime(),
        txHash: p.txHash,
        signature: p.txHash, // For Solana compatibility
        merchant: p.service ? { name: p.service, endpoint: p.metadata?.endpoint || '' } : undefined,
        metadata: p.metadata || {},
      })),
      // User events as activity items
      ...events.map(e => ({
        network: (e.network || 'base') === 'base' ? 'base' : 'solana-mainnet' as const,
        kind: e.eventType as any,
        amount: e.amountMicro ? (e.amountMicro / 1_000_000).toFixed(6) : '0',
        timestamp: e.createdAt.getTime(),
        txHash: e.metadata?.txHash,
        signature: e.metadata?.signature || e.metadata?.txHash,
        merchant: e.metadata?.serviceName ? { name: e.metadata.serviceName, endpoint: e.metadata.endpoint || '' } : undefined,
        metadata: e.metadata || {},
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    console.log(`✅ Returning ${activity.length} activity items`);

    return NextResponse.json({ 
      success: true, 
      data: activity 
    });
  } catch (error: any) {
    console.error('❌ Error fetching user activity:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch activity' 
    }, { status: 500 });
  }
}
