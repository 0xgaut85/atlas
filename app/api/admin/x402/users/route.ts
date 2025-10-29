import { NextRequest, NextResponse } from 'next/server';
import { listPayments, listUserEvents } from '@/lib/atlas-tracking';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Fetch all payments and events
    const payments = await listPayments({
      since,
      limit: 10000,
    });

    const events = await listUserEvents({
      limit: 10000,
    });

    // Group by user address
    const userMap = new Map<string, {
      address: string;
      txCount: number;
      total: number;
      firstSeen: number;
      lastSeen: number;
      networks: Set<string>;
    }>();

    // Process payments
    payments.forEach(p => {
      if (!p.userAddress) return;
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

    // Convert to array
    const users = Array.from(userMap.values()).map(u => ({
      address: u.address,
      txCount: u.txCount,
      total: u.total,
      firstSeen: u.firstSeen,
      lastSeen: u.lastSeen,
      networks: Array.from(u.networks),
    })).sort((a, b) => b.lastSeen - a.lastSeen);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch users',
    }, { status: 500 });
  }
}

