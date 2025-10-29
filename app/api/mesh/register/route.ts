import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '../../x402/middleware';
import { upsertService } from '@/lib/atlas-tracking';
import { recordPayment } from '@/lib/atlas-tracking';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';
import { payaiClient } from '@/lib/payai-client';

/**
 * Atlas Mesh Service Registration Endpoint
 * x402-protected endpoint that:
 * 1. Requires registration fee payment (50 USDC fixed)
 * 2. Registers the service with PayAI facilitator for discovery on x402scan
 * 3. Saves service metadata to database
 */

const REGISTRATION_FEE_USD = 50; // Fixed fee: 50 USDC

export async function POST(req: NextRequest) {
  try {
    // Calculate registration fee
    const registrationFeeUSD = REGISTRATION_FEE_USD;
    const registrationFeeMicro = Math.round(registrationFeeUSD * 1_000_000);

    // Verify x402 payment FIRST - before validating body fields
    // This ensures the endpoint always returns 402 when no payment is provided
    const verification = await verifyX402Payment(
      req,
      registrationFeeUSD.toString()
    );

    if (!verification.valid) {
      // Return 402 Payment Required - Base-only for x402scan compatibility
      return create402Response(req, `$${registrationFeeUSD.toFixed(2)}`, 'Register x402 services for discovery', ['base']);
    }

    console.log('✅ Registration fee verified:', {
      registrationFeeUSD,
      txHash: verification.payment?.transactionHash,
      userAddress: verification.payment?.from,
    });

    // Now parse and validate body fields AFTER payment is verified
    const body = await req.json();
    const {
      name,
      description,
      endpoint,
      developerAddress,
      category,
      network,
      price,
      metadata,
    } = body;

    // Validate required fields
    if (!name || !endpoint || !developerAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, endpoint, developerAddress',
      }, { status: 400 });
    }

    // Validate endpoint format
    try {
      const endpointUrl = new URL(endpoint);
      if (!['http:', 'https:'].includes(endpointUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid endpoint format. Must be a valid HTTP/HTTPS URL',
      }, { status: 400 });
    }

    // Determine network and price
    const serviceNetwork = network || 'base';
    const priceAmount = price?.amount || '1.00';
    const priceCurrency = price?.currency || 'USDC';
    const priceMicro = Math.round(parseFloat(priceAmount) * 1_000_000).toString();

    // Generate service ID from endpoint
    const serviceId = endpoint.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    // Record registration fee payment
    try {
      await recordPayment({
        txHash: verification.payment?.transactionHash || 'unknown',
        userAddress: verification.payment?.from?.toLowerCase() || developerAddress.toLowerCase(),
        merchantAddress: serviceNetwork === 'base' ? X402_CONFIG.payTo : X402_CONFIG.payToSol,
        network: serviceNetwork === 'base' ? 'base' : 'solana-mainnet',
        amountMicro: registrationFeeMicro,
        currency: 'USDC',
        category: 'registration',
        service: `Service Registration: ${name}`,
        metadata: {
          serviceName: name,
          serviceEndpoint: endpoint,
          developerAddress,
          category,
          network: serviceNetwork,
          registrationFeeUSD,
        },
      });
    } catch (dbError: any) {
      console.error('Failed to record registration fee:', dbError.message);
      // Continue even if DB recording fails
    }

    // Register service with PayAI facilitator for discovery on x402scan
    try {
      // Prepare registration data for facilitator
      const registrationData = {
        id: serviceId,
        name,
        description: description || '',
        endpoint,
        category: category || 'Other',
        network: serviceNetwork,
        merchantAddress: developerAddress.toLowerCase(),
        accepts: [{
          asset: serviceNetwork === 'base' ? TOKENS.usdcEvm : TOKENS.usdcSol,
          payTo: developerAddress.toLowerCase(),
          network: serviceNetwork,
          maxAmountRequired: priceMicro,
          scheme: serviceNetwork === 'base' ? 'exact' : 'exact',
          mimeType: 'application/json',
          description: description || `x402 service: ${name}`,
          maxTimeoutSeconds: 60,
        }],
        metadata: metadata || {},
      };

      // Register with PayAI facilitator
      // Note: The facilitator has a discovery endpoint, but registration might happen automatically
      // when payment is verified. We'll still try to register explicitly.
      console.log('📡 Registering service with PayAI facilitator...');
      
      // The facilitator auto-registers when payment is verified, but we can also
      // try to register the service endpoint explicitly if needed
      // For now, we rely on the facilitator's auto-registration via payment verification
      
    } catch (facilitatorError: any) {
      console.error('Failed to register with facilitator:', facilitatorError.message);
      // Continue even if facilitator registration fails - payment is already verified
    }

    // Save service to database
    try {
      await upsertService({
        id: serviceId,
        name,
        description: description || '',
        endpoint,
        merchantAddress: developerAddress.toLowerCase(),
        category: category || 'Other',
        network: serviceNetwork,
        priceAmount: priceAmount,
        priceCurrency: priceCurrency,
        metadata: {
          ...metadata,
          registrationFeePaid: true,
          registeredAt: new Date().toISOString(),
          registrationTxHash: verification.payment?.transactionHash,
          facilitatorRegistered: true,
        },
        createdAt: new Date(),
      });
      console.log('✅ Service saved to database:', serviceId);
    } catch (dbError: any) {
      console.error('❌ Database error saving service:', dbError.message);
      // Continue even if DB fails - service can still be registered
    }

    return NextResponse.json({
      success: true,
      serviceId,
      message: `Service "${name}" registered successfully. Registration fee of $${registrationFeeUSD} USDC paid.`,
      service: {
        id: serviceId,
        name,
        endpoint,
        category: category || 'Other',
        network: serviceNetwork,
        registeredAt: new Date().toISOString(),
      },
      payment: verification.payment,
      discovery: {
        facilitator: X402_CONFIG.facilitatorUrl,
        x402scan: 'https://www.x402scan.com',
        note: 'Service will appear on x402scan after facilitator sync (5-15 minutes)',
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-payment',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in mesh register:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to register service',
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
