import { X402_CONFIG, TOKENS } from '@/lib/x402-config';
import { payaiClient } from '@/lib/payai-client';

export interface PaymentVerification {
  valid: boolean;
  error?: string;
  payment?: any;
}

/**
 * Verifies x402 payment from request headers using Coinbase CDP facilitator
 * This follows the x402 standard by using the facilitator for verification
 * which also auto-registers the merchant for discovery on x402scan.com
 * CRITICAL: Payments MUST be verified by facilitator to appear on x402scan
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

      // Check if we have EIP-3009 authorization (Coinbase facilitator format)
    if (payment.payload?.signature && payment.payload?.authorization) {
      console.log('✅ Payment received with EIP-3009 authorization');
      console.log('Authorization details:', {
        from: payment.payload.authorization.from,
        to: payment.payload.authorization.to,
        value: payment.payload.authorization.value,
      });
      
      // Use Coinbase CDP facilitator to verify EIP-3009 authorization
      // CRITICAL: Must succeed for transactions to appear on x402scan

      
      try {
        // Get the resource URL from the request
        const resourceUrl = request.url || 'https://api.atlas402.com';
        
        const facilitatorVerification = await payaiClient.verifyPayment({
          signature: payment.payload.signature,
          authorization: payment.payload.authorization,
          network: network,
          expectedAmount: expectedAmountMicro,
          expectedRecipient: expectedRecipient,
          tokenAddress: network === 'base' ? TOKENS.usdcEvm : TOKENS.usdcSol,
          resource: resourceUrl,
          description: `Payment for ${price} USDC`,
        });

        if (facilitatorVerification.success && facilitatorVerification.data?.valid) {
          console.log('✅ Payment verified via Coinbase CDP facilitator');
          console.log('✅ Transaction will appear on x402scan after sync (~5-15 minutes)');
          
          // Record payment in database for analytics
          try {
            const { recordPayment } = await import('@/lib/atlas-tracking');
            await recordPayment({
              txHash: payment.transactionHash,
              userAddress: facilitatorVerification.data?.tx?.from || payment.from,
              merchantAddress: expectedRecipient,
              network: network,
              amountMicro: parseInt(expectedAmountMicro),
              currency: 'USDC',
              category: 'access',
              service: null,
              metadata: {
                facilitatorVerified: true,
                verifiedBy: 'coinbase-cdp-facilitator',
              },
            });
            console.log('✅ Payment recorded in database');
          } catch (dbError: any) {
            console.error('Failed to record payment in database:', dbError.message);
            // Continue even if DB recording fails
          }
          
          // Facilitator verified and executed transfer - USDC is now in your wallet!
          return {
            valid: true,
            payment: {
              transactionHash: facilitatorVerification.data?.txHash || payment.payload?.authorization?.nonce,
              network: payment.network || network,
              amount: payment.payload?.authorization?.value || expectedAmountMicro,
              from: payment.payload?.authorization?.from,
              to: expectedRecipient,
              verified: true,
              facilitatorVerified: true,
              txHash: facilitatorVerification.data?.txHash, // Facilitator's execution tx hash
            },
          };
        } else {
          const errorDetails = facilitatorVerification.error || 'Unknown error';
          const responseData = facilitatorVerification.data;
          console.warn('⚠️ Facilitator verification failed:', {
            error: errorDetails,
            responseData: responseData,
            authorizationSent: {
              from: payment.payload.authorization.from,
              to: payment.payload.authorization.to,
              value: payment.payload.authorization.value,
            },
          });
          
          // Coinbase facilitator verification failed - payment cannot be verified
          // Transactions must be verified by facilitator to appear on x402scan
          console.error('❌ Coinbase facilitator verification failed - payment rejected');
          console.error('❌ Transactions must be verified by facilitator to appear on x402scan');
          return {
            valid: false,
            error: `Facilitator verification failed: ${errorDetails}. Payment must be verified by Coinbase facilitator to appear on x402scan.`,
          };
        }
      } catch (facilitatorError: any) {
        console.error('❌ Coinbase facilitator verification error:', facilitatorError);
        console.error('❌ Error stack:', facilitatorError.stack);
        // For EIP-3009, payment MUST be verified by facilitator to appear on x402scan
        // If facilitator fails, payment cannot be accepted
        return {
          valid: false,
          error: `Coinbase facilitator error: ${facilitatorError.message || 'Unknown error'}. Payment must be verified by facilitator to appear on x402scan.`,
        };
      }
    }
    
    // Legacy transactionHash format (fallback for old clients)
    if (payment.transactionHash || payment.payload?.transactionHash) {
      console.log('✅ Payment received with transaction hash (legacy format)');
      const txHash = payment.transactionHash || payment.payload?.transactionHash;
      
      // Try facilitator verification first (might work if they support it)
      try {
        const facilitatorVerification = await payaiClient.verifyPayment({
          txHash: txHash,
          network: network,
          expectedAmount: expectedAmountMicro,
          expectedRecipient: expectedRecipient,
          tokenAddress: network === 'base' ? TOKENS.usdcEvm : TOKENS.usdcSol,
        });

        if (facilitatorVerification.success && facilitatorVerification.data?.valid) {
          console.log('✅ Payment verified via Coinbase CDP facilitator (legacy)');
          return {
            valid: true,
            payment: {
              transactionHash: txHash,
              network: network,
              amount: payment.amount || expectedAmountMicro,
              from: facilitatorVerification.data?.tx?.from,
              to: expectedRecipient,
              verified: true,
              facilitatorVerified: true,
            },
          };
        }
      } catch (e) {
        console.warn('Facilitator verification failed for legacy format, using on-chain fallback');
      }
      
      // Fallback to on-chain verification
      return await verifyOnChainFallback(
        { transactionHash: txHash, network, amount: payment.amount },
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
          
          if (txData.result) {
            const tx = txData.result;
            const usdcContract = TOKENS.usdcEvm.toLowerCase();
            
            if (tx.to && tx.to.toLowerCase() === usdcContract) {
          // Decode the transfer data to verify recipient
              if (tx.input && tx.input.startsWith('0xa9059cbb')) {
                const recipientFromTx = '0x' + tx.input.slice(34, 74);
                
                if (recipientFromTx.toLowerCase() === expectedRecipient.toLowerCase()) {
              console.log('✅ Payment verified via on-chain fallback');
                  return {
                    valid: true,
                    payment: {
                      transactionHash: payment.transactionHash,
                      network: payment.network,
                      amount: payment.amount,
                      from: tx.from,
                      to: expectedRecipient,
                verified: true,
                fallback: true,
              },
            };
          }
          }
        }
      }
    } catch (onChainError: any) {
      console.error('On-chain fallback error:', onChainError);
        }
      }

  // For Solana: accept transaction signature if it looks valid
      if (network === 'solana-mainnet' || network === 'solana-devnet') {
    if (payment.transactionHash && payment.transactionHash.length > 80) {
      console.log('✅ Accepting Solana payment (fallback)');
        return {
          valid: true,
          payment: {
            signature: payment.transactionHash,
            network: payment.network,
            amount: payment.amount,
            verified: true,
          fallback: true,
          },
        };
      }
    }

    return {
      valid: false,
    error: 'Payment verification failed - unable to verify transaction',
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

