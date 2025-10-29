import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get('host') || process.env.NEXT_PUBLIC_MERCHANT_URL || 'api.atlas402.com';
    const merchantUrl = host.startsWith('http') ? host : `https://${host}`;
    
    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      merchant: merchantUrl.includes('api.atlas402.com') ? 'api.atlas402.com' : merchantUrl,
      x402Version: '1.0',
      endpoints: {
        info: `${merchantUrl}/api/x402/info`,
        health: `${merchantUrl}/api/x402/health`,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Health check failed',
    }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
