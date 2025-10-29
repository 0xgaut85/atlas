import { verifyX402Payment, create402Response } from '../x402/middleware';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify payment
  const verification = await verifyX402Payment(request, '$1.00');

  if (!verification.valid) {
    console.log('Payment verification failed:', verification.error);
    return create402Response(request, '$1.00', verification.error);
  }

  // Payment verified - return Atlas Index token data
  const tokens = [
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      chain: 'base',
      price: '$1.00',
      volume24h: '$24.5M',
      holders: 125000,
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      chain: 'base',
      price: '$3,456.78',
      volume24h: '$89.2M',
      holders: 89000,
    },
  ];

  return Response.json({
    success: true,
    tokens,
    payment: verification.payment,
    message: 'Token data access granted',
  }, {
    headers: {
      // CORS for programmatic agent access
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-payment',
    }
  });
}

