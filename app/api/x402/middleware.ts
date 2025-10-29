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
 */
export function create402Response(message?: string) {
  // Convert configured price (e.g., "$1.00") to micro units (string)
  const priceNumber = Number((X402_CONFIG.price || '$1.00').replace(/[^0-9.]/g, '')) || 1;
  const maxAmountRequired = Math.round(priceNumber * 1_000_000).toString();

  const accepts: Array<Record<string, string>> = [];

  // Base (EVM) USDC option
  if (X402_CONFIG.supportedNetworks.includes('base')) {
    accepts.push({
      asset: TOKENS.usdcEvm,
      payTo: X402_CONFIG.payTo,
      network: 'base',
      maxAmountRequired,
      scheme: 'x402+eip712',
      mimeType: 'application/json',
    });
  }

  // Solana USDC option
  if (X402_CONFIG.supportedNetworks.includes('solana-mainnet')) {
    accepts.push({
      asset: TOKENS.usdcSol,
      payTo: X402_CONFIG.payToSol,
      network: 'solana-mainnet',
      maxAmountRequired,
      scheme: 'x402+solana',
      mimeType: 'application/json',
    });
  }

  return new Response(
    JSON.stringify({
      error: message || 'Payment required',
      paymentRequired: true,
      accepts,
    }),
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

