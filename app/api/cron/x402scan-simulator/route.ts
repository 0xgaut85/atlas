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
import { getAddress } from 'viem';
import { TOKENS } from '@/lib/x402-config';

// Vercel Cron Job endpoint
// Vercel automatically sends authorization header, but we can also verify manually
export async function GET(request: NextRequest) {
  // Vercel cron jobs include Authorization header automatically
  // For manual testing, you can also set CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Skip auth check if no secret is set (for development)
  // In production, Vercel will automatically add auth header
  if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
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
    const walletAddress = account.address;
    
    console.log(`💰 Simulator wallet: ${walletAddress}`);
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org'),
    });
    
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http('https://mainnet.base.org'),
    });
    
    // Check USDC balance before proceeding
    const usdcAbi = parseAbi([
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ]);
    
    try {
      const balance = await publicClient.readContract({
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
        abi: usdcAbi,
        functionName: 'balanceOf',
        args: [walletAddress],
      });
      
      const decimals = await publicClient.readContract({
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
        abi: usdcAbi,
        functionName: 'decimals',
      });
      
      const balanceUSD = Number(balance) / Math.pow(10, Number(decimals));
      console.log(`💵 USDC Balance: $${balanceUSD.toFixed(2)}`);
      
      // Need enough USDC for multiple payments
      // Cron runs every minute, making 10 payments each (10 × $0.01 = $0.10 per minute)
      const requiredUSD = 0.5; // $0.50 should last for several cron runs
      if (balanceUSD < requiredUSD) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient USDC balance',
          walletAddress: walletAddress,
          balanceUSD: balanceUSD.toFixed(2),
          required: `At least $${requiredUSD.toFixed(2)} USDC`,
          reason: `Need $${requiredUSD.toFixed(2)} for 10 payments per cron run (runs every minute)`,
          instructions: `Send USDC to ${walletAddress} on Base network (USDC contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)`,
        }, { status: 400 });
      }
    } catch (balanceError: any) {
      console.warn('⚠️ Could not check USDC balance:', balanceError.message);
      // Continue anyway - might work if balance check fails
    }
    
    // Endpoint to ping (registered on x402scan)
    const endpoint = 'https://api.atlas402.com/api/atlas-index';
    
    // SIMPLE: Call PayAI facilitator directly, then notify our server
    const makeFacilitatorPayment = async (endpointUrl: string): Promise<{ success: boolean; error?: string; txHash?: string }> => {
      try {
        // Step 1: Get payment requirements from our endpoint
        const response = await fetch(endpointUrl, { method: 'GET' });
        if (response.status !== 402) {
          return { success: false, error: `Expected 402, got ${response.status}` };
        }
        
        const paymentInfo = await response.json();
        const basePayment = paymentInfo.accepts?.find((a: any) => a.network === 'base');
        if (!basePayment) {
          return { success: false, error: 'Base payment option not available' };
        }
        
        // Step 2: Create EIP-3009 authorization
        const amountMicro = parseInt(basePayment.maxAmountRequired);
        const recipient = getAddress(basePayment.payTo);
        const usdcContract = getAddress(TOKENS.usdcEvm);
        
        const domain = {
          name: 'USD Coin',
          version: '2',
          chainId: 8453,
          verifyingContract: usdcContract,
        };
        
        const types = {
          TransferWithAuthorization: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'validAfter', type: 'uint256' },
            { name: 'validBefore', type: 'uint256' },
            { name: 'nonce', type: 'bytes32' },
          ],
        };
        
        const nonceHex = '0x' + Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join('');
        
        // CRITICAL: validAfter must be <= current block time
        // Set it to 60 seconds ago to account for block time differences and delays
        const now = Math.floor(Date.now() / 1000);
        const validAfter = now - 60; // 60 seconds ago to ensure it's always valid
        const validBefore = now + 3600; // 1 hour from now
        
        const message = {
          from: getAddress(walletAddress),
          to: recipient,
          value: amountMicro.toString(),
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce: nonceHex,
        };
        
        // Sign with viem
        const signature = await walletClient.signTypedData({
          domain: domain as any,
          types: types as any,
          primaryType: 'TransferWithAuthorization',
          message: message as any,
        });
        
        const authorization = {
          from: getAddress(walletAddress),
          to: recipient,
          value: amountMicro.toString(),
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce: nonceHex,
        };
        
        // Step 3: Verify with PayAI facilitator directly
        const facilitatorUrl = 'https://facilitator.payai.network/verify';
        const facilitatorRequest = {
          paymentPayload: {
            x402Version: 1,
            scheme: 'exact',
            network: 'base',
            payload: { signature, authorization },
          },
          paymentRequirements: {
            scheme: 'exact',
            network: 'base',
            maxAmountRequired: amountMicro.toString(),
            payTo: recipient,
            asset: usdcContract,
            resource: endpointUrl,
            description: 'Simulator payment for x402scan',
            mimeType: 'application/json',
            maxTimeoutSeconds: 60,
            extra: { name: 'USD Coin', version: '2' },
          },
        };
        
        // Step 3a: Verify with PayAI facilitator
        const facilitatorResponse = await fetch(facilitatorUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(facilitatorRequest),
        });
        
        const facilitatorData = await facilitatorResponse.json();
        
        console.log('🔍 PayAI Facilitator Verify Response:', {
          status: facilitatorResponse.status,
          isValid: facilitatorData.isValid,
          txHash: facilitatorData.txHash,
          fullResponse: facilitatorData,
        });
        
        if (!facilitatorResponse.ok || !facilitatorData.isValid) {
          return { success: false, error: `Facilitator rejected: ${facilitatorData.invalidReason || 'Unknown'}` };
        }
        
        // Step 3b: Settle the payment (execute on-chain)
        // PayAI facilitator requires /settle to actually execute the transfer
        const settleUrl = 'https://facilitator.payai.network/settle';
        const settleRequest = {
          paymentPayload: facilitatorRequest.paymentPayload,
          paymentRequirements: facilitatorRequest.paymentRequirements,
        };
        
        const settleResponse = await fetch(settleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settleRequest),
        });
        
        const settleData = await settleResponse.json();
        
        console.log('🔍 PayAI Facilitator Settle Response:', {
          status: settleResponse.status,
          transaction: settleData.transaction,
          txHash: settleData.txHash,
          success: settleData.success,
          fullResponse: settleData,
        });
        
        // PayAI facilitator returns transaction hash in 'transaction' field, not 'txHash'
        const txHash = settleData.transaction || settleData.txHash;
        
        if (!settleResponse.ok || !txHash) {
          return { success: false, error: `Settlement failed: ${settleData.error || 'No transaction hash'}` };
        }
        
        // Step 4: Notify our server with facilitator's actual transaction hash
        const serverPaymentPayload = {
          x402Version: 1,
          scheme: 'exact',
          network: 'base',
          transactionHash: txHash,
          amount: amountMicro.toString(),
          facilitatorVerified: true,
        };
        
        const serverResponse = await fetch(endpointUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-payment': btoa(JSON.stringify(serverPaymentPayload)),
          },
        });
        
        // If settlement succeeded and we have a txHash, payment is complete!
        // Transaction will appear on x402scan after indexing (~5-15 minutes)
        if (txHash) {
          console.log(`✅ Payment settled! Transaction hash: ${txHash}`);
          console.log(`✅ Will appear on x402scan: https://www.x402scan.com/server/f3c66953-18b9-46b9-84af-6f3774730036`);
          return { success: true, txHash: txHash };
        }
        
        return { success: false, error: `Settlement failed: No transaction hash received` };
      } catch (error: any) {
        return { success: false, error: error.message || 'Unknown error' };
      }
    };
    
    // Make multiple payments with random delays (3-8 seconds between each)
    // Increased delay to avoid PayAI facilitator nonce conflicts
    const paymentCount = 10;
    const results = [];
    
    console.log(`🚀 Starting PayAI facilitator spam: ${paymentCount} payments with 3-8s delays...`);
    
    for (let i = 0; i < paymentCount; i++) {
      console.log(`🔄 [${i + 1}/${paymentCount}] Making payment...`);
      const result = await makeFacilitatorPayment(endpoint);
      
      if (result.success) {
        results.push({ 
          paymentNumber: i + 1,
          success: true, 
          timestamp: new Date().toISOString(),
          txHash: result.txHash,
          note: 'Payment verified by PayAI facilitator - will appear on x402scan'
        });
        console.log(`✅ [${i + 1}/${paymentCount}] Payment successful: ${result.txHash}`);
      } else {
        results.push({ 
          paymentNumber: i + 1,
          success: false, 
          error: result.error 
        });
        console.error(`❌ [${i + 1}/${paymentCount}] Payment failed: ${result.error}`);
      }
      
      // Random delay between 3-8 seconds (except for last payment)
      // Increased delay to reduce PayAI facilitator nonce conflicts
      if (i < paymentCount - 1) {
        const delay = Math.floor(Math.random() * 5000) + 3000; // 3-8 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      simulatorWallet: walletAddress,
      paymentStats: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
        successRate: `${((successCount / results.length) * 100).toFixed(1)}%`,
      },
      results: results.slice(0, 5), // Only return first 5 results to avoid huge response
      note: `Made ${results.length} payments with 1-5s delays. Successful payments will appear on x402scan after facilitator sync (~5-15 minutes)`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

