import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get merchant URL - prioritize environment variable, then request headers
    let merchantUrl: string;
    
    if (process.env.NEXT_PUBLIC_MERCHANT_URL) {
      merchantUrl = process.env.NEXT_PUBLIC_MERCHANT_URL.startsWith('http') 
        ? process.env.NEXT_PUBLIC_MERCHANT_URL 
        : `https://${process.env.NEXT_PUBLIC_MERCHANT_URL}`;
    } else {
      const host = req.headers.get('host') || 'api.atlas402.com';
      merchantUrl = host.startsWith('http') ? host : `https://${host}`;
    }
    
    // Extract domain name for merchant field
    const merchantDomain = merchantUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      merchant: merchantDomain,
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
