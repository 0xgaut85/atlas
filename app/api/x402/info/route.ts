import { NextRequest, NextResponse } from 'next/server';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';

export async function GET(req: NextRequest) {
  try {
    // Get merchant URL from environment or request headers
    // For api.atlas402.com subdomain, use it directly
    const host = req.headers.get('host') || process.env.NEXT_PUBLIC_MERCHANT_URL || 'api.atlas402.com';
    
    // Ensure we use https://api.atlas402.com format
    let merchantUrl: string;
    if (host.startsWith('http')) {
      merchantUrl = host;
    } else if (host.includes('api.atlas402.com')) {
      merchantUrl = `https://${host}`;
    } else if (host.includes('atlas402.com')) {
      // If main domain, use api subdomain
      merchantUrl = 'https://api.atlas402.com';
    } else {
      merchantUrl = `https://${host}`;
    }
    
    // Format according to x402 standard for merchant discovery
    return NextResponse.json({
      name: 'Atlas402',
      description: 'Infrastructure platform for x402 protocol - micropayments for APIs',
      version: '1.0.0',
      merchant: merchantUrl,
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
