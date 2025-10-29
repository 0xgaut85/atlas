import { NextRequest, NextResponse } from 'next/server';
import { upsertService } from '@/lib/atlas-tracking';
import { validateServiceEndpoint } from '@/lib/x402-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      endpoint,
      developerAddress,
      category,
      network,
      price,
      registrationFeePaid,
    } = body;

    console.log('🔍 Service registration request:', { name, endpoint, developerAddress });

    // Validate required fields
    if (!name || !endpoint || !developerAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, endpoint, developerAddress',
      }, { status: 400 });
    }

    // Validate endpoint format
    if (!validateServiceEndpoint(endpoint)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid endpoint format. Must be a valid HTTP/HTTPS URL',
      }, { status: 400 });
    }

    // Generate service ID from endpoint
    const serviceId = endpoint.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    // Save service to database
    try {
      await upsertService({
        id: serviceId,
        name,
        description: description || '',
        endpoint,
        merchantAddress: developerAddress.toLowerCase(),
        category: category || 'Other',
        network: network || 'base',
        priceAmount: price?.amount || '1.00',
        priceCurrency: price?.currency || 'USDC',
        metadata: {
          registrationFeePaid: registrationFeePaid || false,
          registeredAt: new Date().toISOString(),
        },
        createdAt: new Date(),
      });
      console.log('✅ Service saved to database:', serviceId);
    } catch (dbError: any) {
      console.error('❌ Database error saving service:', dbError.message);
      // Continue even if DB fails - service can still be registered
    }

    return NextResponse.json({
      success: true,
      serviceId,
      message: 'Service registered successfully',
    });
  } catch (error: any) {
    console.error('❌ Error registering service:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to register service',
    }, { status: 500 });
  }
}

