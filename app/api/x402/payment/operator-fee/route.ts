import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '../../middleware';
import { recordPayment } from '@/lib/atlas-tracking';
import { X402_CONFIG } from '@/lib/x402-config';

/**
 * Operator Protocol Fee Endpoint
 * x402-protected endpoint for $1.00 USDC protocol fee for Atlas Operator
 * This ensures operator fees are tracked on x402scan
 */
const OPERATOR_FEE_USD = 1.00;

export async function POST(req: NextRequest) {
  try {
    // Verify x402 payment for operator fee
    const verification = await verifyX402Payment(req, OPERATOR_FEE_USD.toString());

    if (!verification.valid) {
      // Return 402 Payment Required - Base-only for x402scan compatibility
      return create402Response(req, `$${OPERATOR_FEE_USD.toFixed(2)}`, 'Protocol fee for Atlas Operator actions', ['base']);
    }

    console.log('✅ Operator fee verified:', {
      operatorFeeUSD: OPERATOR_FEE_USD,
      txHash: verification.payment?.transactionHash,
      userAddress: verification.payment?.from,
    });

    // Parse request body for metadata
    const body = await req.json().catch(() => ({}));
    const { action, actionType, metadata } = body;

    // Record operator fee payment
    try {
      await recordPayment({
        txHash: verification.payment?.transactionHash || 'unknown',
        userAddress: verification.payment?.from?.toLowerCase() || '',
        merchantAddress: X402_CONFIG.payTo,
        network: 'base',
        amountMicro: Math.round(OPERATOR_FEE_USD * 1_000_000),
        currency: 'USDC',
        category: 'service',
        service: 'Atlas Operator Protocol Fee',
        metadata: {
          purchaseType: 'operator_fee',
          revenue: true,
          action,
          actionType,
          ...metadata,
        },
      });
    } catch (dbError: any) {
      console.error('Failed to record operator fee:', dbError.message);
      // Continue even if DB recording fails
    }

    return NextResponse.json({
      success: true,
      message: `Operator protocol fee of $${OPERATOR_FEE_USD} USDC paid successfully`,
      payment: verification.payment,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-payment',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in operator fee endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process operator fee payment',
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

