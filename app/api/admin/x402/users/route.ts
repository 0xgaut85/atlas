import { NextRequest, NextResponse } from 'next/server';
import { listPayments, listUserEvents } from '@/lib/atlas-tracking';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    console.log('🔍 Fetching users:', { days, since: since.toISOString() });

    // Fetch all payments (all platform users, filtered by date)
    let payments;
    
    try {
      payments = await listPayments({
        since,
        limit: 10000,
      });
      console.log(`✅ Loaded ${payments.length} payments from database`);
      
      // Log unique users found
      const uniqueAddrs = new Set(payments.map(p => p.userAddress).filter(Boolean));
      console.log(`📊 Found ${uniqueAddrs.size} unique users`);
      if (uniqueAddrs.size > 0) {
        const sampleAddrs = Array.from(uniqueAddrs).slice(0, 3);
        console.log('📋 Sample user addresses:', sampleAddrs);
      }
    } catch (dbError: any) {
      console.error('❌ Database error loading payments:', dbError.message);
      console.error('❌ Stack:', dbError.stack);
      payments = [];
    }

    // Group by user address (all platform users)
    const userMap = new Map<string, {
      address: string;
      txCount: number;
      total: number;
      firstSeen: number;
      lastSeen: number;
      networks: Set<string>;
    }>();

    // Process payments - include ALL payments, not filtered by user
    payments.forEach(p => {
      if (!p.userAddress) {
        console.warn('⚠️ Payment without userAddress:', p.txHash);
        return;
      }
      const addr = p.userAddress.toLowerCase();
      const amount = p.amountMicro / 1_000_000;
      const time = p.createdAt.getTime();

      if (!userMap.has(addr)) {
        userMap.set(addr, {
          address: addr,
          txCount: 0,
          total: 0,
          firstSeen: time,
          lastSeen: time,
          networks: new Set(),
        });
      }

      const user = userMap.get(addr)!;
      user.txCount++;
      user.total += amount;
      user.firstSeen = Math.min(user.firstSeen, time);
      user.lastSeen = Math.max(user.lastSeen, time);
      user.networks.add(p.network);
    });

    // Convert to array and sort by last seen (most recent first)
    const users = Array.from(userMap.values()).map(u => ({
      address: u.address,
      txCount: u.txCount,
      total: u.total,
      firstSeen: u.firstSeen,
      lastSeen: u.lastSeen,
      networks: Array.from(u.networks),
    })).sort((a, b) => b.lastSeen - a.lastSeen);

    console.log(`✅ Returning ${users.length} users`);
    if (users.length > 0) {
      console.log('📋 Sample user:', {
        address: users[0].address,
        txCount: users[0].txCount,
        total: users[0].total,
        networks: users[0].networks,
      });
    }

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch users',
    }, { status: 500 });
  }
}
