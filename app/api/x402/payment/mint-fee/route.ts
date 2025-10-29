import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '../../middleware';
import { recordPayment } from '@/lib/atlas-tracking';
import { X402_CONFIG } from '@/lib/x402-config';

/**
 * Mint Fee Payment Endpoint
 * x402-protected endpoint for $0.25 USDC mint fee
 * This ensures the fee is tracked on x402scan
 */
const MINT_FEE_USD = 0.25;

export async function POST(req: NextRequest) {
  try {
    // Verify x402 payment FIRST - before parsing body
    // This ensures the endpoint always returns 402 when no payment is provided
    const verification = await verifyX402Payment(req, MINT_FEE_USD.toString());

    if (!verification.valid) {
      // Return 402 Payment Required - Base-only for x402scan compatibility
      return create402Response(req, `$${MINT_FEE_USD.toFixed(2)}`, 'Mint fee payment for token minting', ['base']);
    }

    console.log('✅ Mint fee verified:', {
      mintFeeUSD: MINT_FEE_USD,
      txHash: verification.payment?.transactionHash,
      userAddress: verification.payment?.from,
    });

    // Now parse request body for metadata (after payment is verified)
    const body = await req.json().catch(() => ({}));
    const { serviceId, serviceName, tokenName } = body;

    // Record mint fee payment
    try {
      await recordPayment({
        txHash: verification.payment?.transactionHash || 'unknown',
        userAddress: verification.payment?.from?.toLowerCase() || '',
        merchantAddress: X402_CONFIG.payTo,
        network: 'base',
        amountMicro: Math.round(MINT_FEE_USD * 1_000_000),
        currency: 'USDC',
        category: 'mint',
        service: serviceName || `Mint Fee: ${tokenName || 'Token'}`,
        metadata: {
          purchaseType: 'token_mint_fee',
          revenue: true,
          serviceId,
          tokenName,
        },
      });
    } catch (dbError: any) {
      console.error('Failed to record mint fee:', dbError.message);
      // Continue even if DB recording fails
    }

    return NextResponse.json({
      success: true,
      message: `Mint fee of $${MINT_FEE_USD} USDC paid successfully`,
      payment: verification.payment,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-payment',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in mint fee endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process mint fee payment',
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

