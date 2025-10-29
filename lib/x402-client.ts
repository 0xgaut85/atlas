import { X402_CONFIG, PAYMENT_CONFIG, TOKENS } from './x402-config';
import type { Provider } from '@reown/appkit-adapter-wagmi';

export interface X402FetchOptions extends RequestInit {
  skipPayment?: boolean;
}

/**
 * Makes actual USDC transfer on-chain for x402 payment
 * Uses native wallet methods to send USDC ERC-20 transfer
 * @param walletProvider - The wallet provider from AppKit
 * @param recipient - Recipient address
 * @param amountMicro - Amount in micro units (e.g., 1000000 = $1 USDC)
 * @param network - Network ('base' or 'solana-mainnet')
 * @returns Transaction hash
 */
export async function makeUSDCTransfer(
  walletProvider: any,
  recipient: string,
  amountMicro: number,
  network: string
): Promise<string> {
  try {
    // Get the connected address
    const accounts = await walletProvider.request({ method: 'eth_accounts' });
    const from = accounts[0];

    if (!from) {
      throw new Error('No connected account found');
    }

    // Amount is already in micro units
    const amountHex = '0x' + amountMicro.toString(16).padStart(64, '0');

    // ERC-20 transfer function signature: transfer(address,uint256)
    const transferFunctionSignature = '0xa9059cbb';
    const recipientPadded = recipient.substring(2).padStart(64, '0');
    
    const data = transferFunctionSignature + recipientPadded + amountHex.substring(2);

    // Send transaction to USDC contract
    const usdcContract = network === 'base' ? TOKENS.usdcEvm : TOKENS.usdcEvm;
    
    const txHash = await walletProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        from,
        to: usdcContract,
        data,
        value: '0x0',
      }],
    });

    console.log('USDC transfer sent:', txHash);
    return txHash;
  } catch (error: any) {
    console.error('USDC transfer failed:', error);
    throw new Error(`Failed to transfer USDC: ${error.message}`);
  }
}

/**
 * Creates an x402-enabled fetch client
 * Handles 402 responses by making actual on-chain USDC transfers
 */
export function createX402Client(walletProvider: any) {
  return async function x402Fetch(
    url: string,
    options: X402FetchOptions = {}
  ): Promise<Response> {
    const { skipPayment, ...fetchOptions } = options;

    // First attempt without payment to check if required
    const initialResponse = await fetch(url, fetchOptions);

    // If 402, payment is required
    if (initialResponse.status === 402 && !skipPayment) {
      console.log('Payment required, initiating USDC transfer...');

      try {
        // Parse payment requirements from 402 response
        const paymentInfo = await initialResponse.json();
        const accepts = paymentInfo.accepts || [];
        
        // Find Base payment option
        const basePayment = accepts.find((a: any) => a.network === 'base');
        if (!basePayment) {
          throw new Error('Base payment option not available');
        }

        // Make actual USDC transfer on-chain
        const txHash = await makeUSDCTransfer(
          walletProvider,
          basePayment.payTo,
          parseInt(basePayment.maxAmountRequired),
          'base'
        );

        console.log('USDC transfer confirmed, retrying request with payment proof...');

        // Retry with payment header containing transaction hash
        const paidResponse = await fetch(url, {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            'x-payment': JSON.stringify({
              transactionHash: txHash,
              network: 'base',
              amount: basePayment.maxAmountRequired,
              currency: 'USDC',
              payTo: basePayment.payTo,
            }),
          },
        });

        return paidResponse;
      } catch (error: any) {
        console.error('Payment failed:', error);
        throw error;
      }
    }

    return initialResponse;
  };
}

/**
 * Hook-like interface for React components
 */
export async function makeX402Request(
  walletProvider: any,
  url: string,
  options?: X402FetchOptions
) {
  const client = createX402Client(walletProvider);
  return await client(url, options);
}

