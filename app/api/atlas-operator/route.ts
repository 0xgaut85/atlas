import { verifyX402Payment, create402Response } from '../x402/middleware';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify payment
  const verification = await verifyX402Payment(request, '$1.00');

  if (!verification.valid) {
    console.log('Payment verification failed:', verification.error);
    return create402Response(request, '$1.00', 'Autonomous AI operator with x402 access');
  }

  // Payment verified - return Atlas Operator capabilities
  const capabilities = [
    {
      id: 'blockchain-query',
      name: 'Blockchain Queries',
      description: 'Query blockchain data across multiple networks',
      enabled: true,
    },
    {
      id: 'smart-contract-analysis',
      name: 'Smart Contract Analysis',
      description: 'Analyze and explain smart contract code',
      enabled: true,
    },
    {
      id: 'transaction-simulation',
      name: 'Transaction Simulation',
      description: 'Simulate transactions before execution',
      enabled: true,
    },
  ];

  return Response.json({
    success: true,
    agent: {
      name: 'Atlas Operator',
      version: '1.0.0',
      capabilities,
    },
    payment: verification.payment,
    message: 'Atlas Operator access granted',
  }, {
    headers: {
      // CORS for programmatic agent access
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-payment',
    }
  });
}

