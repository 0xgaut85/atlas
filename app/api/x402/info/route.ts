import { NextRequest, NextResponse } from 'next/server';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';

export async function GET(req: NextRequest) {
  try {
    // Get merchant URL from environment or request headers
    const host = req.headers.get('host') || process.env.NEXT_PUBLIC_MERCHANT_URL || 'atlas402.com';
    const merchantUrl = host.startsWith('http') ? host : `https://${host}`;
    
    // Format according to x402 standard for merchant discovery
    return NextResponse.json({
      name: 'Atlas402',
      description: 'Infrastructure platform for x402 protocol - micropayments for APIs',
      version: '1.0.0',
      services: [
        {
          id: 'service-hub',
          name: 'Service Hub',
          description: 'Discover and access x402-powered services',
          endpoint: `${merchantUrl}/api/service-hub`,
          price: {
            amount: '1.00',
            currency: 'USDC',
            network: 'base',
          },
        },
        {
          id: 'token-indexer',
          name: 'Token Indexer',
          description: 'Index and search x402-enabled tokens',
          endpoint: `${merchantUrl}/api/token-indexer`,
          price: {
            amount: '1.00',
            currency: 'USDC',
            network: 'base',
          },
        },
        {
          id: 'agent',
          name: 'AI Agent',
          description: 'AI agent capabilities and tools',
          endpoint: `${merchantUrl}/api/agent`,
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
      ],
      payment: {
        wallet: X402_CONFIG.payTo,
        networks: X402_CONFIG.supportedNetworks,
        facilitator: X402_CONFIG.facilitatorUrl,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
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

