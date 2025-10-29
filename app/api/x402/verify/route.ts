import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment } from '../middleware';
import { X402_CONFIG } from '@/lib/x402-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentHeader, price } = body;

    // Create a mock request with the payment header
    const mockRequest = new Request('http://localhost', {
      headers: {
        'x-payment': paymentHeader || '',
      },
    });

    const verification = await verifyX402Payment(mockRequest, price || '1.00');

    if (verification.valid) {
      return NextResponse.json({
        success: true,
        valid: true,
        payment: verification.payment,
      });
    } else {
      return NextResponse.json({
        success: false,
        valid: false,
        error: verification.error,
      }, { status: 402 });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({
      success: false,
      valid: false,
      error: error.message || 'Payment verification failed',
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Return payment configuration for clients
  return NextResponse.json({
    payTo: X402_CONFIG.payTo,
    payToSol: X402_CONFIG.payToSol,
    networks: X402_CONFIG.supportedNetworks,
    facilitator: X402_CONFIG.facilitatorUrl,
    price: X402_CONFIG.price,
  });
}

