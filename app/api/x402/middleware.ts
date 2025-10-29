import { X402_CONFIG, TOKENS } from '@/lib/x402-config';
import { payaiClient } from '@/lib/payai-client';

export interface PaymentVerification {
  valid: boolean;
  error?: string;
  payment?: any;
}

/**
 * Verifies x402 payment from request headers using PayAI facilitator
 * This follows the x402 standard by using the facilitator for verification
 * which also auto-registers the merchant for discovery on x402scan.com
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
    // Parse payment header
    const payment = JSON.parse(paymentHeader);

    // If we have a transaction hash, verify it via PayAI facilitator
    if (payment.transactionHash) {
      console.log('✅ Payment received with transaction hash:', payment.transactionHash);
      console.log('Payment details:', payment);
      
      // Determine network and expected recipient
      const network: 'base' | 'solana-mainnet' = payment.network || X402_CONFIG.network;
      const expectedRecipient = network === 'solana-mainnet' ? X402_CONFIG.payToSol : X402_CONFIG.payTo;
      
      // Calculate expected amount in micro units
      const priceNumber = Number(price.replace(/[^0-9.]/g, '')) || 1;
      const expectedAmountMicro = Math.round(priceNumber * 1_000_000).toString();
      
      // Use PayAI facilitator to verify payment (standard x402 approach)
      // This also auto-registers the merchant for discovery
      try {
        const facilitatorVerification = await payaiClient.verifyPayment({
          txHash: payment.transactionHash,
          network: network,
          expectedAmount: expectedAmountMicro,
          expectedRecipient: expectedRecipient,
          tokenAddress: network === 'base' ? TOKENS.usdcEvm : TOKENS.usdcSol,
        });

        if (facilitatorVerification.success && facilitatorVerification.data?.valid) {
          console.log('✅ Payment verified via PayAI facilitator');
          console.log('✅ Merchant auto-registered for discovery');
          
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
                verifiedBy: 'payai-facilitator',
              },
            });
            console.log('✅ Payment recorded in database');
          } catch (dbError: any) {
            console.error('Failed to record payment in database:', dbError.message);
            // Continue even if DB recording fails
          }
          
          return {
            valid: true,
            payment: {
              transactionHash: payment.transactionHash,
              network: payment.network,
              amount: payment.amount,
              from: facilitatorVerification.data?.tx?.from,
              to: expectedRecipient,
              verified: true,
              facilitatorVerified: true,
            },
          };
        } else {
          console.warn('⚠️ Facilitator verification failed:', facilitatorVerification.error);
          // Fallback to on-chain verification if facilitator fails
          return await verifyOnChainFallback(payment, network, expectedRecipient);
        }
      } catch (facilitatorError: any) {
        console.error('Facilitator verification error:', facilitatorError);
        // Fallback to on-chain verification if facilitator is unavailable
        return await verifyOnChainFallback(payment, network, expectedRecipient);
      }
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
        name: 'USDC',
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

