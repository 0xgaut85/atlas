import { X402_CONFIG, TOKENS } from '@/lib/x402-config';
import { payaiClient } from '@/lib/payai-client';

export interface PaymentVerification {
  valid: boolean;
  error?: string;
  payment?: any;
}

/**
 * Verifies x402 payment from request headers
 * Main site: Uses DIRECT ON-CHAIN transfers (no facilitator)
 * Simulator: Uses PayAI facilitator for x402scan visibility
 * 
 * Discovery: Uses PayAI facilitator for service discovery
 */
export async function verifyX402Payment(
  request: Request,
  price: string
): Promise<PaymentVerification> {
  const paymentHeader = request.headers.get('x-payment');

  if (!paymentHeader) {
    return { 
      valid: false, 
      error: 'Payment required - missing x-payment header' 
    };
  }

  try {
    // Parse payment header (may be base64 encoded or plain JSON)
    let payment: any;
    let parseMethod = 'unknown';
    try {
      // Try parsing as base64 first (EIP-3009 format)
      const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
      payment = JSON.parse(decoded);
      parseMethod = 'base64';
      console.log('✅ Payment header parsed as base64');
    } catch (base64Error) {
      try {
        // Fallback to plain JSON (legacy transactionHash format)
        payment = JSON.parse(paymentHeader);
        parseMethod = 'plain-json';
        console.log('✅ Payment header parsed as plain JSON');
      } catch (jsonError) {
        console.error('❌ Failed to parse payment header:', {
          base64Error: base64Error instanceof Error ? base64Error.message : 'Unknown',
          jsonError: jsonError instanceof Error ? jsonError.message : 'Unknown',
          headerLength: paymentHeader.length,
          headerPreview: paymentHeader.substring(0, 100),
        });
        throw new Error('Invalid payment header format');
      }
    }
    
    console.log('📥 Payment header parsed successfully:', {
      method: parseMethod,
      hasPayload: !!payment.payload,
      hasSignature: !!payment.payload?.signature,
      hasAuthorization: !!payment.payload?.authorization,
      hasTransactionHash: !!payment.transactionHash || !!payment.payload?.transactionHash,
    });

    // Determine network and expected recipient
    const network: 'base' | 'solana-mainnet' = payment.network || X402_CONFIG.network;
    const expectedRecipient = network === 'solana-mainnet' ? X402_CONFIG.payToSol : X402_CONFIG.payTo;
    
    // Calculate expected amount in micro units
    const priceNumber = Number(price.replace(/[^0-9.]/g, '')) || 1;
    const expectedAmountMicro = Math.round(priceNumber * 1_000_000).toString();

      // Main site uses DIRECT ON-CHAIN transfers (not facilitator)
      // Skip EIP-3009 authorization - it's only for simulator
      if (payment.payload?.signature && payment.payload?.authorization) {
        console.log('⚠️ Received EIP-3009 authorization - main site uses direct on-chain transfers');
        console.log('⚠️ This authorization will be ignored - expecting transactionHash instead');
        // Fall through to transactionHash check below
      }
    
    // Direct on-chain transfer format (main site payments - no facilitator)
    // OR facilitator-verified transaction hash (simulator payments)
    if (payment.transactionHash || payment.payload?.transactionHash) {
      const txHash = payment.transactionHash || payment.payload?.transactionHash;
      
            // If facilitator already verified (simulator with PayAI), accept immediately
            if (payment.facilitatorVerified === true) {
              console.log('✅ Payment received with facilitator-verified transaction hash (simulator)');
              console.log('✅ Transaction already verified by PayAI facilitator - will appear on x402scan');
        
        // Record payment
        try {
          const { recordPayment } = await import('@/lib/atlas-tracking');
          await recordPayment({
            txHash: txHash,
            userAddress: payment.from || 'simulator',
            merchantAddress: expectedRecipient,
            network: network,
            amountMicro: parseInt(payment.amount || expectedAmountMicro),
            currency: 'USDC',
            category: 'access',
            service: null,
            metadata: {
              facilitatorVerified: true,
                      verifiedBy: payment.facilitatorVerified ? 'payai-facilitator' : 'direct-onchain',
              simulator: true,
            },
          });
          console.log('✅ Payment recorded in database');
        } catch (dbError: any) {
          console.error('Failed to record payment in database:', dbError.message);
        }
        
        return {
          valid: true,
          payment: {
            transactionHash: txHash,
            network: network,
            amount: payment.amount || expectedAmountMicro,
            to: expectedRecipient,
            verified: true,
            facilitatorVerified: true,
          },
        };
      }
      
      // For direct on-chain transfers (main site), verify on-chain
      // Main site payments are direct ERC-20 transfers, no facilitator needed
      console.log('✅ Payment received with transaction hash (direct on-chain transfer)');
      console.log('🔍 Verifying direct on-chain transfer...');
      return await verifyOnChainFallback(
        { transactionHash: txHash, network, amount: payment.amount || expectedAmountMicro },
        network,
        expectedRecipient
      );
    }

    return {
      valid: false,
      error: 'Payment required - missing or invalid transaction hash',
    };
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return {
      valid: false,
      error: `Payment verification failed: ${error.message}`,
    };
  }
}

/**
 * Fallback on-chain verification if facilitator is unavailable
 */
async function verifyOnChainFallback(
  payment: any,
  network: string,
  expectedRecipient: string
): Promise<PaymentVerification> {
  if (network === 'base') {
    try {
      console.log('🔍 Verifying Base transaction on-chain:', payment.transactionHash);
      
      // Use public Base RPC to verify the transaction
      const rpcUrl = 'https://mainnet.base.org';
      const txResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [payment.transactionHash],
          id: 1,
        }),
      });

      const txData = await txResponse.json();
      
      if (!txData.result) {
        console.error('❌ Transaction not found on-chain:', payment.transactionHash);
        return {
          valid: false,
          error: 'Transaction not found on-chain. Please wait a few seconds and try again.',
        };
      }
      
      const tx = txData.result;
      const usdcContract = TOKENS.usdcEvm.toLowerCase();
      
      console.log('📋 Transaction details:', {
        to: tx.to,
        from: tx.from,
        toMatchesUSDC: tx.to?.toLowerCase() === usdcContract,
        hasInput: !!tx.input,
        inputLength: tx.input?.length,
      });
      
      // Verify transaction is to USDC contract
      if (tx.to && tx.to.toLowerCase() === usdcContract) {
        // Decode the transfer data to verify recipient
        if (tx.input && tx.input.startsWith('0xa9059cbb')) {
          const recipientFromTx = '0x' + tx.input.slice(34, 74);
          
          console.log('📋 Transfer recipient:', {
            recipientFromTx,
            expectedRecipient,
            matches: recipientFromTx.toLowerCase() === expectedRecipient.toLowerCase(),
          });
          
          if (recipientFromTx.toLowerCase() === expectedRecipient.toLowerCase()) {
            console.log('✅ Payment verified via on-chain verification');
            
            // Record payment in database
            try {
              const { recordPayment } = await import('@/lib/atlas-tracking');
              await recordPayment({
                txHash: payment.transactionHash,
                userAddress: tx.from,
                merchantAddress: expectedRecipient,
                network: network,
                amountMicro: parseInt(payment.amount || '0'),
                currency: 'USDC',
                category: 'access',
                service: null,
                metadata: {
                  verifiedBy: 'on-chain',
                  directTransfer: true,
                },
              });
              console.log('✅ Payment recorded in database');
            } catch (dbError: any) {
              console.error('Failed to record payment in database:', dbError.message);
            }
            
            return {
              valid: true,
              payment: {
                transactionHash: payment.transactionHash,
                network: network,
                amount: payment.amount,
                from: tx.from,
                to: expectedRecipient,
                verified: true,
                verifiedBy: 'on-chain',
              },
            };
          } else {
            console.error('❌ Recipient mismatch:', {
              expected: expectedRecipient,
              actual: recipientFromTx,
            });
            return {
              valid: false,
              error: `Payment recipient mismatch. Expected ${expectedRecipient}, got ${recipientFromTx}`,
            };
          }
        } else {
          console.error('❌ Invalid transfer function signature in transaction');
          return {
            valid: false,
            error: 'Invalid transaction format - not a USDC transfer',
          };
        }
      } else {
        console.error('❌ Transaction not to USDC contract:', {
          expected: usdcContract,
          actual: tx.to,
        });
        return {
          valid: false,
          error: 'Transaction is not a USDC transfer',
        };
      }
    } catch (onChainError: any) {
      console.error('❌ On-chain verification error:', onChainError);
      return {
        valid: false,
        error: `On-chain verification failed: ${onChainError.message || 'Unknown error'}`,
      };
    }
  }

  // For Solana: accept transaction signature if it looks valid
  if (network === 'solana-mainnet' || network === 'solana-devnet') {
    if (payment.transactionHash && payment.transactionHash.length > 80) {
      console.log('✅ Accepting Solana payment (direct transfer)');
      return {
        valid: true,
        payment: {
          signature: payment.transactionHash,
          network: network,
          amount: payment.amount,
          verified: true,
          verifiedBy: 'solana-signature',
        },
      };
    }
  }

  return {
    valid: false,
    error: 'Payment verification failed - unsupported network or invalid transaction',
  };
}

/**
 * Creates a 402 Payment Required response
 * Compatible with x402scan.com strict schema validation
 * @param networksOnly - Optional array to limit which networks to include (e.g., ['base'] for Base-only)
 */
export function create402Response(
  request: Request,
  price: string = '$1.00',
  description?: string,
  networksOnly?: ('base' | 'solana-mainnet')[]
) {
  // Convert configured price (e.g., "$1.00") to micro units (string)
  const priceNumber = Number(price.replace(/[^0-9.]/g, '')) || 1;
  const maxAmountRequired = Math.round(priceNumber * 1_000_000).toString();

  // Get full resource URL from request
  const url = new URL(request.url);
  const resourceUrl = url.toString();

  // Build description if not provided
  const resourceDescription = description || `Payment required for ${url.pathname}`;

  const accepts: Array<Record<string, any>> = [];
  
  // Determine which networks to include
  const includeBase = !networksOnly || networksOnly.includes('base');
  const includeSolana = !networksOnly || networksOnly.includes('solana-mainnet');

  // Base (EVM) USDC option - x402scan requires "exact" scheme
  if (includeBase && X402_CONFIG.supportedNetworks.includes('base')) {
    accepts.push({
      scheme: 'exact', // x402scan requires "exact" instead of "x402+eip712"
      network: 'base',
      maxAmountRequired,
      resource: resourceUrl,
      description: resourceDescription,
      mimeType: 'application/json',
      payTo: X402_CONFIG.payTo,
      maxTimeoutSeconds: 60,
      asset: TOKENS.usdcEvm,
      extra: {
        scheme: 'x402+eip712', // Keep original scheme in extra for compatibility
        name: 'USD Coin', // CRITICAL: Must match Base USDC contract's domain name (not "USDC")
        version: '2',
      },
    });
  }

  // Solana USDC option - x402scan requires "exact" scheme
  if (includeSolana && X402_CONFIG.supportedNetworks.includes('solana-mainnet')) {
    accepts.push({
      scheme: 'exact', // x402scan requires "exact" instead of "x402+solana"
      network: 'solana-mainnet',
      maxAmountRequired,
      resource: resourceUrl,
      description: resourceDescription,
      mimeType: 'application/json',
      payTo: X402_CONFIG.payToSol,
      maxTimeoutSeconds: 60,
      asset: TOKENS.usdcSol,
      extra: {
        scheme: 'x402+solana', // Keep original scheme in extra for compatibility
        name: 'USDC',
      },
    });
  }

  // x402scan strict schema format
  const responseBody: any = {
    x402Version: 1,
    accepts,
  };
  
  // Only include error field if there's an actual error (x402scan prefers omission)
  // if (error) {
  //   responseBody.error = error;
  // }

  return new Response(
    JSON.stringify(responseBody),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'x-payment-required': JSON.stringify({ accepts }),
        // CORS for programmatic agent access
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-payment',
      },
    }
  );
}

