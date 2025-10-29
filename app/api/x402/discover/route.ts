import { NextRequest, NextResponse } from 'next/server';
import { payaiClient } from '@/lib/payai-client';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Discovery request received');
    
    // Use PayAI client to discover services
    const result = await payaiClient.discoverServices();
    
    if (result.success && result.data) {
      console.log(`✅ Returning ${result.data.length} services`);
      return NextResponse.json({
        success: true,
        services: result.data,
        count: result.data.length,
      });
    } else {
      console.error('❌ Discovery failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to discover services',
        services: [],
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Error in discover route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to discover x402 services',
      services: [],
    }, { status: 500 });
  }
}

