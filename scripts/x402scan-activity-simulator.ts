/**
 * x402scan Activity Simulator
 * 
 * Makes periodic small payments to registered x402 endpoints to simulate activity on x402scan
 * This ensures transactions appear on x402scan while your main site uses regular on-chain transfers
 * 
 * Usage:
 *   npm run simulate-x402scan
 *   or deploy as Vercel Cron Job: vercel.json -> cron jobs
 */

import { createPublicClient, http, createWalletClient, custom, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Configuration
const SIMULATOR_CONFIG = {
  // Private key for simulator wallet (must have USDC for payments)
  // Set via environment variable: X402SCAN_SIMULATOR_PRIVATE_KEY
  privateKey: process.env.X402SCAN_SIMULATOR_PRIVATE_KEY || '',
  
  // Base RPC
  rpcUrl: 'https://mainnet.base.org',
  
  // USDC contract address
  usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
  
  // Your merchant address (you'll receive the USDC back)
  merchantAddress: process.env.NEXT_PUBLIC_X402_PAY_TO || '0x8bee703d6214a266e245b0537085b1021e1ccaed' as `0x${string}`,
  
  // Registered x402 endpoints to ping (these should be registered on x402scan)
  endpoints: [
    {
      url: 'https://api.atlas402.com/api/atlas-index',
      method: 'GET',
      amountMicro: 10000, // $0.01 USDC (minimum to show activity)
    },
    {
      url: 'https://api.atlas402.com/api/atlas-operator',
      method: 'GET',
      amountMicro: 10000, // $0.01 USDC
    },
  ],
  
  // How often to make payments (in milliseconds)
  intervalMs: 60 * 60 * 1000, // 1 hour
  
  // Maximum payments per day
  maxPaymentsPerDay: 24, // Once per hour = 24 per day
};

/**
 * Makes a small facilitator-verified payment to an x402 endpoint
 * This payment will go through PayAI facilitator and appear on x402scan
 */
async function makeFacilitatorVerifiedPayment(
  endpoint: { url: string; method: string; amountMicro: number },
  walletClient: any,
  publicClient: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    console.log(`🔄 Making facilitator-verified payment to ${endpoint.url}...`);
    
    // Step 1: Make initial request to get 402 payment requirements
    const initialResponse = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (initialResponse.status !== 402) {
      console.warn(`⚠️ Endpoint ${endpoint.url} did not return 402. Status: ${initialResponse.status}`);
      return { success: false, error: `Expected 402, got ${initialResponse.status}` };
    }
    
    const paymentInfo = await initialResponse.json();
    console.log('📋 Payment requirements received:', paymentInfo);
    
    const accepts = paymentInfo.accepts || [];
    const basePayment = accepts.find((a: any) => a.network === 'base');
    
    if (!basePayment) {
      return { success: false, error: 'Base payment option not available' };
    }
    
    // Step 2: Create EIP-3009 authorization signature
    const accounts = await walletClient.getAddresses();
    const from = accounts[0];
    
    if (!from) {
      return { success: false, error: 'No wallet connected' };
    }
    
    // Import EIP-3009 authorization creation
    const { createEIP3009Authorization } = await import('../lib/x402-client');
    
    const { signature, authorization } = await createEIP3009Authorization(
      walletClient,
      basePayment.payTo,
      endpoint.amountMicro,
      'base',
      basePayment.extra
    );
    
    console.log('✅ EIP-3009 authorization created');
    
    // Step 3: Create payment payload
    const paymentPayload = {
      x402Version: 1,
      scheme: 'exact',
      network: 'base',
      payload: {
        signature: signature,
        authorization: authorization,
      },
    };
    
    // Step 4: Base64 encode and send with x-payment header
    const paymentHeaderB64 = btoa(JSON.stringify(paymentPayload));
    
    // Step 5: Retry request with payment header
    const paidResponse = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'x-payment': paymentHeaderB64,
      },
    });
    
    if (paidResponse.status === 200 || paidResponse.status === 201) {
      console.log(`✅ Payment successful! Status: ${paidResponse.status}`);
      
      // Payment was verified by facilitator - will appear on x402scan
      return {
        success: true,
        txHash: authorization.nonce, // Use nonce as transaction identifier
      };
    } else {
      const errorText = await paidResponse.text();
      console.error(`❌ Payment failed. Status: ${paidResponse.status}, Error: ${errorText}`);
      return {
        success: false,
        error: `Payment failed: ${paidResponse.status} - ${errorText}`,
      };
    }
  } catch (error: any) {
    console.error(`❌ Error making payment to ${endpoint.url}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Main simulator function - makes periodic payments to registered endpoints
 */
async function runActivitySimulator() {
  console.log('🚀 Starting x402scan Activity Simulator...');
  console.log(`📊 Will make payments every ${SIMULATOR_CONFIG.intervalMs / 1000 / 60} minutes`);
  console.log(`🎯 Endpoints: ${SIMULATOR_CONFIG.endpoints.length}`);
  
  if (!SIMULATOR_CONFIG.privateKey) {
    console.error('❌ X402SCAN_SIMULATOR_PRIVATE_KEY environment variable not set!');
    console.error('⚠️  Set a private key for the simulator wallet (must have USDC)');
    process.exit(1);
  }
  
  // Setup wallet client
  const account = privateKeyToAccount(SIMULATOR_CONFIG.privateKey as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain: base,
    transport: http(SIMULATOR_CONFIG.rpcUrl),
  });
  
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(SIMULATOR_CONFIG.rpcUrl),
  });
  
  console.log(`💰 Simulator wallet: ${account.address}`);
  
  // Check USDC balance
  const usdcAbi = parseAbi([
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
  ]);
  
  try {
    const balance = await publicClient.readContract({
      address: SIMULATOR_CONFIG.usdcContract,
      abi: usdcAbi,
      functionName: 'balanceOf',
      args: [account.address],
    });
    
    const decimals = await publicClient.readContract({
      address: SIMULATOR_CONFIG.usdcContract,
      abi: usdcAbi,
      functionName: 'decimals',
    });
    
    const balanceUSD = Number(balance) / Math.pow(10, Number(decimals));
    console.log(`💵 USDC Balance: $${balanceUSD.toFixed(2)}`);
    
    if (balanceUSD < 0.1) {
      console.warn('⚠️  Low USDC balance! Add USDC to simulator wallet for activity generation.');
    }
  } catch (error) {
    console.warn('⚠️  Could not check USDC balance:', error);
  }
  
  let paymentCount = 0;
  const paymentsToday: { endpoint: string; timestamp: number }[] = [];
  
  // Function to make a round of payments
  async function makePayments() {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    // Remove payments older than 24 hours
    const recentPayments = paymentsToday.filter(p => p.timestamp > todayStart);
    paymentsToday.length = 0;
    paymentsToday.push(...recentPayments);
    
    if (paymentsToday.length >= SIMULATOR_CONFIG.maxPaymentsPerDay) {
      console.log(`⏸️  Daily limit reached (${SIMULATOR_CONFIG.maxPaymentsPerDay} payments). Waiting...`);
      return;
    }
    
    console.log(`\n📅 Making payments round ${paymentCount + 1}...`);
    console.log(`📊 Payments today: ${paymentsToday.length}/${SIMULATOR_CONFIG.maxPaymentsPerDay}`);
    
    // Make payment to each endpoint
    for (const endpoint of SIMULATOR_CONFIG.endpoints) {
      const result = await makeFacilitatorVerifiedPayment(endpoint, walletClient, publicClient);
      
      if (result.success) {
        paymentCount++;
        paymentsToday.push({
          endpoint: endpoint.url,
          timestamp: now,
        });
        console.log(`✅ Payment ${paymentCount} successful! Will appear on x402scan in ~5-15 minutes`);
      } else {
        console.error(`❌ Payment failed: ${result.error}`);
      }
      
      // Wait 30 seconds between payments
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    console.log(`\n✅ Round complete. Total payments: ${paymentCount}`);
    console.log(`⏰ Next payment round in ${SIMULATOR_CONFIG.intervalMs / 1000 / 60} minutes`);
  }
  
  // Make initial payments
  await makePayments();
  
  // Set up interval for periodic payments
  setInterval(makePayments, SIMULATOR_CONFIG.intervalMs);
  
  console.log('\n✅ Activity simulator running. Press Ctrl+C to stop.');
}

// Run if executed directly
if (require.main === module) {
  runActivitySimulator().catch((error) => {
    console.error('❌ Simulator error:', error);
    process.exit(1);
  });
}

export { runActivitySimulator, makeFacilitatorVerifiedPayment };

