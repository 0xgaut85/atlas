import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '../middleware';

/**
 * x402 Payment Tester / Debugger
 * 
 * Tests x402 payment flows step-by-step
 * - Validates endpoint URLs
 * - Shows 402 response details
 * - Tests payment verification
 * - Provides debugging information
 * 
 * Access: $1.00 USDC
 */

export async function POST(req: NextRequest) {
  // Verify payment access
  const verification = await verifyX402Payment(req, '$1.00');
  
  if (!verification.valid) {
    return create402Response(req, '$1.00', 'Test and debug x402 payment flows', ['base']);
  }

  try {
    const body = await req.json();
    const { endpointUrl, testMode } = body;

    if (!endpointUrl) {
      return NextResponse.json({
        success: false,
        error: 'endpointUrl is required',
      }, { status: 400 });
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(endpointUrl);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format',
      }, { status: 400 });
    }

    const results: any = {
      endpoint: endpointUrl,
      timestamp: new Date().toISOString(),
      steps: [],
    };

    // Step 1: Test endpoint without payment (should return 402)
    try {
      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const step1 = {
        step: 1,
        name: 'Initial Request (No Payment)',
        status: response.status === 402 ? 'success' : 'warning',
        details: {
          statusCode: response.status,
          statusText: response.statusText,
          hasPaymentRequired: response.status === 402,
        },
      };

      if (response.status === 402) {
        try {
          const paymentInfo = await response.json();
          step1.details.paymentInfo = paymentInfo;
          step1.details.hasAccepts = !!paymentInfo.accepts;
          step1.details.acceptsCount = paymentInfo.accepts?.length || 0;
          step1.details.hasBaseOption = paymentInfo.accepts?.some((a: any) => a.network === 'base');
          step1.details.hasSolanaOption = paymentInfo.accepts?.some((a: any) => a.network === 'solana-mainnet');
          
          // Validate payment requirements structure
          const validationErrors: string[] = [];
          if (!paymentInfo.accepts || !Array.isArray(paymentInfo.accepts)) {
            validationErrors.push('Missing or invalid "accepts" array');
          } else {
            paymentInfo.accepts.forEach((accept: any, idx: number) => {
              if (!accept.network) validationErrors.push(`accepts[${idx}]: missing "network"`);
              if (!accept.payTo) validationErrors.push(`accepts[${idx}]: missing "payTo"`);
              if (!accept.maxAmountRequired) validationErrors.push(`accepts[${idx}]: missing "maxAmountRequired"`);
              if (!accept.scheme) validationErrors.push(`accepts[${idx}]: missing "scheme"`);
            });
          }
          
          step1.details.validationErrors = validationErrors;
          step1.details.isValid = validationErrors.length === 0;
        } catch (e) {
          step1.details.jsonParseError = 'Response is not valid JSON';
        }
      } else {
        step1.details.warning = 'Expected HTTP 402, got ' + response.status;
      }

      results.steps.push(step1);
    } catch (error: any) {
      results.steps.push({
        step: 1,
        name: 'Initial Request (No Payment)',
        status: 'error',
        error: error.message,
      });
    }

    // Step 2: If testMode is 'validate-only', return here
    if (testMode === 'validate-only') {
      return NextResponse.json({
        success: true,
        results,
        message: 'Endpoint validation complete',
      });
    }

    // Step 3: Test with invalid payment header (should fail)
    try {
      const invalidPaymentResponse = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-payment': btoa(JSON.stringify({
            transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            network: 'base',
            amount: '1000000',
          })),
        },
      });

      results.steps.push({
        step: 2,
        name: 'Invalid Payment Test',
        status: invalidPaymentResponse.status === 402 ? 'success' : 'warning',
        details: {
          statusCode: invalidPaymentResponse.status,
          statusText: invalidPaymentResponse.statusText,
          expected: 'Should return 402 for invalid payment',
        },
      });
    } catch (error: any) {
      results.steps.push({
        step: 2,
        name: 'Invalid Payment Test',
        status: 'error',
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Payment flow test complete',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// GET endpoint for accessing the tester
export async function GET(req: NextRequest) {
  const verification = await verifyX402Payment(req, '$1.00');
  
  if (!verification.valid) {
    return create402Response(req, '$1.00', 'Test and debug x402 payment flows', ['base']);
  }

  return NextResponse.json({
    success: true,
    message: 'x402 Payment Tester is ready',
    usage: {
      method: 'POST',
      endpoint: '/api/x402/payment-tester',
      body: {
        endpointUrl: 'string (required) - The x402 endpoint URL to test',
        testMode: 'string (optional) - "validate-only" to skip payment tests',
      },
    },
  });
}

