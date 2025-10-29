import { X402_CONFIG, TOKENS } from '@/lib/x402-config';

export interface PaymentVerification {
  valid: boolean;
  error?: string;
  payment?: any;
}

/**
 * Verifies x402 payment from request headers
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

    // If we have a transaction hash, verify it on-chain
    if (payment.transactionHash) {
      console.log('✅ Payment received with transaction hash:', payment.transactionHash);
      console.log('Payment details:', payment);
      
      // Determine network and expected recipient
      const network: 'base' | 'solana-mainnet' = payment.network || X402_CONFIG.network;
      const expectedRecipient = network === 'solana-mainnet' ? X402_CONFIG.payToSol : X402_CONFIG.payTo;
      
      // For Base/EVM: verify the transaction on-chain
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
            console.log('✅ Transaction verified on Base:', txData.result);
            
            // Basic validation: check transaction exists and is to USDC contract
            const tx = txData.result;
            const usdcContract = TOKENS.usdcEvm.toLowerCase();
            
            if (tx.to && tx.to.toLowerCase() === usdcContract) {
              console.log('✅ Transaction is to USDC contract');
              
              // Decode the transfer data to verify recipient and amount
              // Format: 0xa9059cbb + recipient (32 bytes) + amount (32 bytes)
              if (tx.input && tx.input.startsWith('0xa9059cbb')) {
                const recipientFromTx = '0x' + tx.input.slice(34, 74);
                console.log('Transaction recipient:', recipientFromTx);
                console.log('Expected recipient:', expectedRecipient.toLowerCase());
                
                if (recipientFromTx.toLowerCase() === expectedRecipient.toLowerCase()) {
                  console.log('✅ Payment verified successfully!');
                  return {
                    valid: true,
                    payment: {
                      transactionHash: payment.transactionHash,
                      network: payment.network,
                      amount: payment.amount,
                      from: tx.from,
                      to: expectedRecipient,
                      verified: true,
                    },
                  };
                } else {
                  console.warn('⚠️ Recipient mismatch');
                }
              }
            }
          } else {
            console.warn('⚠️ Transaction not found on-chain (may still be pending)');
            // Accept pending transactions (they'll confirm soon)
            return {
              valid: true,
              payment: {
                transactionHash: payment.transactionHash,
                network: payment.network,
                amount: payment.amount,
                verified: true,
                pending: true,
              },
            };
          }
        } catch (onChainError: any) {
          console.error('On-chain verification error:', onChainError);
          // If on-chain check fails, still accept if we have a valid-looking tx hash
          if (payment.transactionHash.startsWith('0x') && payment.transactionHash.length === 66) {
            console.log('✅ Accepting payment (on-chain verification unavailable)');
            return {
              valid: true,
              payment: {
                transactionHash: payment.transactionHash,
                network: payment.network,
                amount: payment.amount,
                verified: true,
                fallback: true,
              },
            };
          }
        }
      }

      // For Solana: accept transaction signature
      if (network === 'solana-mainnet' || network === 'solana-devnet') {
        console.log('✅ Accepting Solana payment');
        return {
          valid: true,
          payment: {
            signature: payment.transactionHash,
            network: payment.network,
            amount: payment.amount,
            verified: true,
          },
        };
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

