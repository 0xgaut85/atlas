import { verifyX402Payment, create402Response } from '../x402/middleware';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify payment
  const verification = await verifyX402Payment(request, '$1.00');

  if (!verification.valid) {
    console.log('Payment verification failed:', verification.error);
    return create402Response(verification.error);
  }

  // Payment verified - return service hub data
  const services = [
    {
      id: 'token-indexer',
      name: 'Token Indexer',
      description: 'Real-time blockchain token indexing across multiple chains',
      endpoint: '/dapp/token-indexer',
      price: '$1.00',
      status: 'active',
    },
    {
      id: 'ai-agent',
      name: 'AI Agent',
      description: 'Intelligent blockchain assistant powered by AI',
      endpoint: '/dapp/agent',
      price: '$1.00',
      status: 'active',
    },
    {
      id: 'integration-layer',
      name: 'Integration Layer',
      description: 'x402 protocol integration tools and services',
      endpoint: '/dapp/integration-layer',
      price: '$1.00',
      status: 'active',
    },
  ];

  return Response.json({
    success: true,
    services,
    payment: verification.payment,
    message: 'Access granted - payment verified',
  });
}

