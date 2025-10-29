import { NextRequest, NextResponse } from 'next/server';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';

export async function GET(req: NextRequest) {
  try {
    // Get merchant URL - prioritize environment variable, then request headers
    let merchantUrl: string;
    
    if (process.env.NEXT_PUBLIC_MERCHANT_URL) {
      // Use environment variable if set (most reliable)
      merchantUrl = process.env.NEXT_PUBLIC_MERCHANT_URL.startsWith('http') 
        ? process.env.NEXT_PUBLIC_MERCHANT_URL 
        : `https://${process.env.NEXT_PUBLIC_MERCHANT_URL}`;
    } else {
      // Fallback to request host header
      const host = req.headers.get('host') || 'api.atlas402.com';
      merchantUrl = host.startsWith('http') ? host : `https://${host}`;
    }
    
    // Format according to x402 standard for merchant discovery
    return NextResponse.json({
      name: 'Atlas402',
      description: 'Infrastructure platform for x402 protocol - micropayments for APIs',
      version: '1.0.0',
      merchant: merchantUrl,
      services: [
        {
          id: 'atlas-index',
          name: 'Atlas Index',
          description: 'Discover and test x402 services across categories',
          endpoint: `${merchantUrl}/api/atlas-index`,
          price: {
            amount: '1.00',
            currency: 'USDC',
            network: 'base',
          },
        },
        {
          id: 'atlas-operator',
          name: 'Atlas Operator',
          description: 'Autonomous AI operator with x402 access',
          endpoint: `${merchantUrl}/api/chat`,
          price: {
            amount: '1.00',
            currency: 'USDC',
            network: 'base',
          },
        },
        {
          id: 'atlas-foundry',
          name: 'Atlas Foundry',
          description: 'Create and deploy x402-protected tokens',
          endpoint: `${merchantUrl}/api/token/create`,
          price: {
            amount: '10.00',
            currency: 'USDC',
            network: 'base',
          },
        },
        {
          id: 'atlas-mesh',
          name: 'Atlas Mesh',
          description: 'Register x402 services for discovery',
          endpoint: `${merchantUrl}/api/mesh/register`,
          price: {
            amount: '50.00',
            currency: 'USDC',
            network: 'base',
          },
        },
      ],
      payment: {
        wallet: X402_CONFIG.payTo,
        networks: X402_CONFIG.supportedNetworks,
        facilitator: X402_CONFIG.facilitatorUrl,
      },
      discovery: {
        x402scan: 'https://www.x402scan.com',
        facilitator: X402_CONFIG.facilitatorUrl,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error: any) {
    console.error('Error in info route:', error);
    return NextResponse.json({
      error: error.message || 'Failed to get service info',
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
