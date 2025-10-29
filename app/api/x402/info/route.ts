import { NextRequest, NextResponse } from 'next/server';
import { X402_CONFIG } from '@/lib/x402-config';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      name: 'Atlas402',
      description: 'Infrastructure platform for x402 protocol - micropayments for APIs',
      version: '1.0.0',
      services: [
        {
          id: 'service-hub',
          name: 'Service Hub',
          description: 'Discover and access x402-powered services',
          endpoint: '/api/service-hub',
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
          endpoint: '/api/token-indexer',
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
          endpoint: '/api/agent',
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
          endpoint: '/api/chat',
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
    });
  } catch (error: any) {
    console.error('Error in info route:', error);
    return NextResponse.json({
      error: error.message || 'Failed to get service info',
    }, { status: 500 });
  }
}

