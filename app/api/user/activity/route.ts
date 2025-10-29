import { NextRequest, NextResponse } from 'next/server';
import { listPayments, listUserEvents } from '@/lib/atlas-tracking';

type ActivityKind =
  | 'payment'
  | 'mint'
  | 'token_minted'
  | 'inbound'
  | 'outbound'
  | 'registration'
  | 'service'
  | 'service_registered'
  | 'access_granted'
  | 'operator_action'
  | 'other';

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

    // Fetch payments from tracking system - try both addresses
    let payments: Awaited<ReturnType<typeof listPayments>> = [];
    let events: Awaited<ReturnType<typeof listUserEvents>> = [];
    
    // Fetch payments for EVM address
    if (userAddress) {
      try {
        const evmPayments = await listPayments({
          userAddress: userAddress,
          limit: 1000,
        });
        payments.push(...evmPayments);
        console.log(`✅ Loaded ${evmPayments.length} EVM payments`);
      } catch (dbError: any) {
        console.error('❌ Database error loading EVM payments:', dbError.message);
      }
    }
    
    // Fetch payments for Solana address (if different from EVM)
    if (userSolAddress && userSolAddress !== userAddress) {
      try {
        const solPayments = await listPayments({
          userAddress: userSolAddress,
          limit: 1000,
        });
        payments.push(...solPayments);
        console.log(`✅ Loaded ${solPayments.length} Solana payments`);
      } catch (dbError: any) {
        console.error('❌ Database error loading Solana payments:', dbError.message);
      }
    }

    // Fetch user events
    try {
      const allEvents = await Promise.all([
        userAddress ? listUserEvents({ userAddress: userAddress, limit: 1000 }) : Promise.resolve([]),
        userSolAddress && userSolAddress !== userAddress ? listUserEvents({ userAddress: userSolAddress, limit: 1000 }) : Promise.resolve([]),
      ]);
      events = allEvents.flat();
      console.log(`✅ Loaded ${events.length} events`);
    } catch (dbError: any) {
      console.error('❌ Database error loading events:', dbError.message);
    }

    // Map category to dashboard kind
    const mapCategoryToKind = (category: string): ActivityKind => {
      switch (category) {
        case 'access': return 'payment';
        case 'registration': return 'registration';
        case 'mint': return 'mint';
        case 'service': return 'service';
        case 'token_minted': return 'token_minted';
        case 'service_registered': return 'service_registered';
        case 'access_granted': return 'access_granted';
        case 'operator_action': return 'operator_action';
        default: return 'other';
      }
    };

    // Combine and format activity
    const activity = [
      // Payments as activity items
      ...payments.map(p => ({
        network: p.network === 'base' ? 'base' : 'solana-mainnet' as const,
        kind: mapCategoryToKind(p.category),
        amount: (p.amountMicro / 1_000_000).toFixed(6),
        timestamp: p.createdAt.getTime(),
        txHash: p.txHash,
        signature: p.txHash, // For Solana compatibility
        merchant: p.service ? { 
          name: p.service, 
          endpoint: p.metadata?.endpoint || p.metadata?.serviceId || '' 
        } : undefined,
        metadata: {
          ...p.metadata,
          serviceName: p.service,
          serviceId: p.metadata?.serviceId,
        },
      })),
      // User events as activity items
      ...events.map(e => ({
        network: (e.network || 'base') === 'base' ? 'base' : 'solana-mainnet' as const,
        kind: mapCategoryToKind(e.eventType),
        amount: e.amountMicro ? (e.amountMicro / 1_000_000).toFixed(6) : '0',
        timestamp: e.createdAt.getTime(),
        txHash: e.metadata?.txHash,
        signature: e.metadata?.signature || e.metadata?.txHash,
        merchant: e.metadata?.serviceName ? { 
          name: e.metadata.serviceName, 
          endpoint: e.metadata.endpoint || '' 
        } : undefined,
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
