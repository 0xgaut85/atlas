import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '../middleware';
import { recordPayment } from '@/lib/atlas-tracking';
import { X402_CONFIG } from '@/lib/x402-config';

/**
 * Service Payment Endpoint
 * x402-protected endpoint for variable service payments
 * This ensures service payments are tracked on x402scan
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body to get payment amount
    const body = await req.json();
    const { amount, serviceName, serviceId, endpoint, category = 'service' } = body;

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({
        success: false,
        error: 'Amount is required',
      }, { status: 400 });
    }

    const paymentAmount = parseFloat(amount);

    // Verify x402 payment
    const verification = await verifyX402Payment(req, paymentAmount.toString());

    if (!verification.valid) {
      // Return 402 Payment Required - Base-only for x402scan compatibility
      return create402Response(req, `$${paymentAmount.toFixed(2)}`, `Payment for ${serviceName || 'service'}`, ['base']);
    }

    console.log('✅ Service payment verified:', {
      amount: paymentAmount,
      txHash: verification.payment?.transactionHash,
      userAddress: verification.payment?.from,
      serviceName,
    });

    // Record service payment
    try {
      await recordPayment({
        txHash: verification.payment?.transactionHash || 'unknown',
        userAddress: verification.payment?.from?.toLowerCase() || '',
        merchantAddress: X402_CONFIG.payTo,
        network: 'base',
        amountMicro: Math.round(paymentAmount * 1_000_000),
        currency: 'USDC',
        category: category as any,
        service: serviceName || 'Service Payment',
        metadata: {
          serviceId,
          endpoint,
          amount: paymentAmount,
        },
      });
    } catch (dbError: any) {
      console.error('Failed to record service payment:', dbError.message);
      // Continue even if DB recording fails
    }

    return NextResponse.json({
      success: true,
      message: `Payment of $${paymentAmount.toFixed(2)} USDC processed successfully`,
      payment: verification.payment,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-payment',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in service payment endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process service payment',
    }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-payment',
    },
  });
}

