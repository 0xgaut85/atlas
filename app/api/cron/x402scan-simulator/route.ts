/**
 * Vercel Cron Job: x402scan Activity Simulator
 * 
 * Makes periodic small facilitator-verified payments to registered x402 endpoints
 * This ensures transactions appear on x402scan while main site uses regular on-chain transfers
 * 
 * Schedule: Every hour (can be adjusted in vercel.json)
 * 
 * Environment Variables Required:
 *   X402SCAN_SIMULATOR_PRIVATE_KEY - Private key of wallet with USDC for simulator
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, createWalletClient, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Verify cron secret (set in Vercel environment variables)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const simulatorPrivateKey = process.env.X402SCAN_SIMULATOR_PRIVATE_KEY;
  if (!simulatorPrivateKey) {
    return NextResponse.json({ 
      error: 'X402SCAN_SIMULATOR_PRIVATE_KEY not configured',
      note: 'Set this in Vercel environment variables with a wallet private key that has USDC'
    }, { status: 500 });
  }
  
  try {
    // Setup wallet
    const account = privateKeyToAccount(simulatorPrivateKey as `0x${string}`);
    const publicClient = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org'),
    });
    
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http('https://mainnet.base.org'),
    });
    
    // Endpoints to ping (registered on x402scan)
    const endpoints = [
      {
        url: 'https://api.atlas402.com/api/atlas-index',
        method: 'GET' as const,
        amountMicro: 10000, // $0.01 USDC
      },
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        // Step 1: Get 402 response
        const initialResponse = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (initialResponse.status !== 402) {
          results.push({ endpoint: endpoint.url, success: false, error: `Expected 402, got ${initialResponse.status}` });
          continue;
        }
        
        const paymentInfo = await initialResponse.json();
        const accepts = paymentInfo.accepts || [];
        const basePayment = accepts.find((a: any) => a.network === 'base');
        
        if (!basePayment) {
          results.push({ endpoint: endpoint.url, success: false, error: 'Base payment option not available' });
          continue;
        }
        
        // Step 2: Create EIP-3009 authorization
        const { createEIP3009Authorization } = await import('@/lib/x402-client');
        const { signature, authorization } = await createEIP3009Authorization(
          walletClient as any,
          basePayment.payTo,
          endpoint.amountMicro,
          'base',
          basePayment.extra
        );
        
        // Step 3: Create payment payload
        const paymentPayload = {
          x402Version: 1,
          scheme: 'exact',
          network: 'base',
          payload: { signature, authorization },
        };
        
        const paymentHeaderB64 = btoa(JSON.stringify(paymentPayload));
        
        // Step 4: Retry with payment header
        const paidResponse = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'x-payment': paymentHeaderB64,
          },
        });
        
        if (paidResponse.ok) {
          results.push({ 
            endpoint: endpoint.url, 
            success: true, 
            txHash: authorization.nonce,
            note: 'Payment verified by facilitator - will appear on x402scan'
          });
        } else {
          const errorText = await paidResponse.text();
          results.push({ endpoint: endpoint.url, success: false, error: `${paidResponse.status}: ${errorText}` });
        }
      } catch (error: any) {
        results.push({ endpoint: endpoint.url, success: false, error: error.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
      },
      note: 'Successful payments will appear on x402scan after facilitator sync (~5-15 minutes)',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

