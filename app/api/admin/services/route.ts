import { NextRequest, NextResponse } from 'next/server';
import { upsertService } from '@/lib/atlas-tracking';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      description,
      endpoint,
      merchantAddress,
      category,
      network,
      priceAmount,
      priceCurrency,
      metadata,
    } = body;

    if (!id || !name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, name',
      }, { status: 400 });
    }

    console.log('💾 Upserting service:', { id, name, category, network });

    // Upsert the service
    const service = await upsertService({
      id,
      name,
      description: description || null,
      endpoint: endpoint || null,
      merchantAddress: merchantAddress || null,
      category: category || null,
      network: network || null,
      priceAmount: priceAmount || null,
      priceCurrency: priceCurrency || null,
      metadata: metadata || null,
      createdAt: new Date(),
    });

    console.log('✅ Service upserted:', service.id);

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error: any) {
    console.error('Error upserting service:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to upsert service',
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { listServices } = await import('@/lib/atlas-tracking');
    const services = await listServices();

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch services',
    }, { status: 500 });
  }
}

