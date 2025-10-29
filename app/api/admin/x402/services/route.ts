import { NextRequest, NextResponse } from 'next/server';
import { listServices } from '@/lib/atlas-tracking';

export async function GET(req: NextRequest) {
  try {
    const services = await listServices();

    // Format services for the frontend
    const formatted = services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      endpoint: s.endpoint,
      merchantAddress: s.merchantAddress,
      category: s.category,
      network: s.network,
      priceAmount: s.priceAmount,
      priceCurrency: s.priceCurrency,
      metadata: s.metadata,
      createdAt: s.createdAt?.getTime(),
      accepts: s.metadata?.accepts || [],
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch services',
    }, { status: 500 });
  }
}

