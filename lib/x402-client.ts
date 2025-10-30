import { X402_CONFIG, PAYMENT_CONFIG, TOKENS } from './x402-config';
import type { Provider } from '@reown/appkit-adapter-wagmi';

export interface X402FetchOptions extends RequestInit {
  skipPayment?: boolean;
}

/**
 * Creates EIP-3009 authorization signature for USDC transferWithAuthorization
 * PayAI facilitator will execute the transfer on-chain using this authorization
 * @param walletProvider - The wallet provider from AppKit
 * @param recipient - Recipient address (merchant)
 * @param amountMicro - Amount in micro units (e.g., 1000000 = $1 USDC)
 * @param network - Network ('base' or 'solana-mainnet')
 * @returns Authorization signature and payload
 */
export async function createEIP3009Authorization(
  walletProvider: any,
  recipient: string,
  amountMicro: number,
  network: string
): Promise<{ signature: string; authorization: any }> {
  try {
    // Get the connected address
    const accounts = await walletProvider.request({ method: 'eth_accounts' });
    const from = accounts[0];

    if (!from) {
      throw new Error('No connected account found');
    }

    const usdcContract = network === 'base' ? TOKENS.usdcEvm : TOKENS.usdcEvm;
    const chainId = network === 'base' ? 8453 : 1; // Base = 8453, Ethereum = 1
    
    // EIP-3009 TransferWithAuthorization domain separator and types
    // USDC contract uses EIP-712 for transferWithAuthorization
    const domain = {
      name: 'USD Coin',
      version: '2',
      chainId: chainId,
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

    // Generate nonce (use current timestamp + random for uniqueness)
    const nonceHex = '0x' + Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');

    // ValidAfter = now, ValidBefore = now + 1 hour
    const now = Math.floor(Date.now() / 1000);
    const validAfter = now;
    const validBefore = now + 3600; // 1 hour validity

    const message = {
      from: from.toLowerCase(),
      to: recipient.toLowerCase(),
      value: '0x' + amountMicro.toString(16),
      validAfter: '0x' + validAfter.toString(16),
      validBefore: '0x' + validBefore.toString(16),
      nonce: nonceHex,
    };

    // Sign EIP-712 typed data
    const signature = await walletProvider.request({
      method: 'eth_signTypedData_v4',
      params: [from, JSON.stringify({
        types,
        domain,
        primaryType: 'TransferWithAuthorization',
        message,
      })],
    });

    console.log('✅ EIP-3009 authorization signature created');

    return {
      signature,
      authorization: {
        from: from.toLowerCase(),
        to: recipient.toLowerCase(),
        value: amountMicro.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce: nonceHex,
      },
    };
  } catch (error: any) {
    console.error('EIP-3009 authorization failed:', error);
    throw new Error(`Failed to create authorization: ${error.message}`);
  }
}

/**
 * Makes actual USDC transfer on-chain for x402 payment (legacy method)
 * DEPRECATED: Use createEIP3009Authorization for PayAI facilitator compatibility
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

    try {
      // First attempt without payment to check if required
      const initialResponse = await fetch(url, fetchOptions);

      // If 402, payment is required
      if (initialResponse.status === 402 && !skipPayment) {
        console.log('Payment required, creating EIP-3009 authorization...');

        try {
          // Parse payment requirements from 402 response
          const paymentInfo = await initialResponse.json();
          const accepts = paymentInfo.accepts || [];
          
          // Find Base payment option
          const basePayment = accepts.find((a: any) => a.network === 'base');
          if (!basePayment) {
            throw new Error('Base payment option not available');
          }

          // Create EIP-3009 authorization signature (PayAI facilitator compatible)
          const { signature, authorization } = await createEIP3009Authorization(
            walletProvider,
            basePayment.payTo,
            parseInt(basePayment.maxAmountRequired),
            'base'
          );

          console.log('✅ EIP-3009 authorization created, sending to server...');

          // Create payment payload in PayAI facilitator format
          const paymentPayload = {
            x402Version: 1,
            scheme: 'exact',
            network: 'base',
            payload: {
              signature: signature,
              authorization: authorization,
            },
          };

          // Base64 encode payment payload (as per x402 standard)
          // Use browser-compatible base64 encoding
          const paymentHeaderB64 = btoa(JSON.stringify(paymentPayload));

          // Retry with payment header containing EIP-3009 authorization
          const paidResponse = await fetch(url, {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              'x-payment': paymentHeaderB64, // Base64 encoded as per x402 standard
            },
          });

          return paidResponse;
        } catch (error: any) {
          console.error('Payment failed:', error);
          throw error;
        }
      }

      return initialResponse;
    } catch (error: any) {
      // Handle network errors and other fetch failures
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', error);
        throw new Error(`Failed to connect to ${url}. Please check your internet connection and try again.`);
      }
      // Re-throw other errors
      throw error;
    }
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

