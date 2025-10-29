import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      merchant: process.env.NEXT_PUBLIC_MERCHANT_URL || 'atlas402.com',
      x402Version: '1.0',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Health check failed',
    }, { status: 500 });
  }
}

