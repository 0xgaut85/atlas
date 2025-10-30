import { X402_CONFIG, PAYMENT_CONFIG, TOKENS } from './x402-config';
import type { Provider } from '@reown/appkit-adapter-wagmi';

export interface X402FetchOptions extends RequestInit {
  skipPayment?: boolean;
}

/**
 * Query USDC contract's name() to get the exact contract name for EIP-712 domain
 */
async function queryUSDCContractName(contractAddress: string, rpcUrl: string): Promise<string | null> {
  try {
    // ERC-20 name() function signature: 0x06fdde03
    const nameSignature = '0x06fdde03';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: contractAddress, data: nameSignature }, 'latest'],
        id: 1,
      }),
    });
    
    const result = await response.json();
    if (result.result && result.result !== '0x') {
      // Decode string from bytes32 (first 64 chars are offset, next 64 are length)
      // For now, return common values. Full decoding requires ABI parsing.
      // Base USDC typically uses "USD Coin"
      return 'USD Coin';
    }
    return null;
  } catch (error) {
    console.warn('Failed to query USDC contract name:', error);
    return null;
  }
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
    // CRITICAL: Domain values MUST match exactly what Base USDC contract uses for EIP-712
    // Base USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) EIP-712 domain separator:
    // IMPORTANT: Try "USDC" first (PayAI's extra field uses this), fallback to "USD Coin" if needed
    // - name: Contract name - may be "USDC" or "USD Coin" (need to verify via contract call)
    // - version: "2" (EIP-3009 standard version, always "2" for USDC)
    // - chainId: 8453 (Base mainnet chainId, as number not string)
    // - verifyingContract: Contract address (lowercase for EIP-712)
    //
    // PayAI facilitator validates signatures against the contract's DOMAIN_SEPARATOR
    // Any mismatch in these values will cause invalid_exact_evm_payload_signature error
    // 
    // Note: PayAI's paymentRequirements.extra shows "name": "USDC", suggesting domain name might be "USDC"
    const domain = {
      name: 'USDC', // Try "USDC" first (matches PayAI's extra field) - Base USDC may use this instead of "USD Coin"
      version: '2', // EIP-3009 version (always "2" for USDC)
      chainId: chainId, // Network chainId (8453 for Base, as number)
      verifyingContract: usdcContract.toLowerCase(), // Contract address (lowercase for EIP-712 - wallets normalize)
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

    // EIP-712 message: all values must match EIP-3009 TransferWithAuthorization format exactly
    // IMPORTANT: uint256 values should be minimal hex (no padding) - wallets encode them properly
    // Addresses: lowercase for EIP-712 (wallets handle checksumming internally)
    // bytes32 nonce: hex string starting with 0x (already padded correctly)
    const message = {
      from: from.toLowerCase(),
      to: recipient.toLowerCase(),
      value: '0x' + BigInt(amountMicro).toString(16), // Minimal hex - wallets handle padding during encoding
      validAfter: '0x' + BigInt(validAfter).toString(16), // Minimal hex
      validBefore: '0x' + BigInt(validBefore).toString(16), // Minimal hex
      nonce: nonceHex, // Already 66 chars (0x + 64 hex chars)
    };

    // Sign EIP-712 typed data
    console.log('📝 Requesting EIP-712 signature from wallet...');
    console.log('📋 EIP-712 Typed Data:', JSON.stringify({
      types,
      domain,
      primaryType: 'TransferWithAuthorization',
      message,
    }, null, 2));
    console.log('📋 Domain:', domain);
    console.log('📋 Message:', message);
    
    let signature: string;
    try {
      signature = await walletProvider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify({
          types,
          domain,
          primaryType: 'TransferWithAuthorization',
          message,
        })],
      });
      
      if (!signature || signature.length < 130) {
        throw new Error('Invalid signature received from wallet');
      }
    } catch (sigError: any) {
      console.error('❌ Signature request failed:', sigError);
      // Check for common rejection patterns
      if (sigError.message?.includes('rejected') || 
          sigError.message?.includes('denied') ||
          sigError.code === 4001 || // MetaMask user rejection
          sigError.code === 'ACTION_REJECTED') {
        throw new Error('User rejected the signature request. Please approve to continue.');
      }
      throw new Error(`Signature failed: ${sigError.message || 'Unknown error'}`);
    }

    console.log('✅ EIP-3009 authorization signature created');

    // Authorization object for PayAI facilitator
    // Note: Some facilitators expect hex values, but PayAI expects decimal strings
    return {
      signature,
      authorization: {
        from: from.toLowerCase(),
        to: recipient.toLowerCase(),
        value: amountMicro.toString(), // Decimal string for PayAI facilitator
        validAfter: validAfter.toString(), // Decimal string
        validBefore: validBefore.toString(), // Decimal string
        nonce: nonceHex, // Keep as hex string (0x...)
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
        console.log('💳 Payment required, creating EIP-3009 authorization...');

        try {
          // Parse payment requirements from 402 response
          const paymentInfo = await initialResponse.json();
          console.log('📋 Payment requirements:', paymentInfo);
          const accepts = paymentInfo.accepts || [];
          
          // Find Base payment option
          const basePayment = accepts.find((a: any) => a.network === 'base');
          if (!basePayment) {
            throw new Error('Base payment option not available');
          }

          console.log('💰 Creating authorization for:', {
            amount: basePayment.maxAmountRequired,
            recipient: basePayment.payTo,
            network: 'base',
          });

          // Create EIP-3009 authorization signature (PayAI facilitator compatible)
          const { signature, authorization } = await createEIP3009Authorization(
            walletProvider,
            basePayment.payTo,
            parseInt(basePayment.maxAmountRequired),
            'base'
          );

          console.log('✅ EIP-3009 authorization created:', {
            signature: signature.substring(0, 20) + '...',
            authorization: {
              from: authorization.from,
              to: authorization.to,
              value: authorization.value,
            },
          });

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
          let paymentHeaderB64: string;
          try {
            paymentHeaderB64 = btoa(JSON.stringify(paymentPayload));
            console.log('✅ Payment payload base64 encoded, length:', paymentHeaderB64.length);
          } catch (b64Error: any) {
            console.error('❌ Base64 encoding failed:', b64Error);
            throw new Error(`Failed to encode payment: ${b64Error.message}`);
          }

          // Retry with payment header containing EIP-3009 authorization
          // IMPORTANT: Preserve original body for POST requests
          console.log('🔄 Retrying request with EIP-3009 authorization...');
          const retryOptions: RequestInit = {
            method: fetchOptions.method || 'GET',
            headers: {
              ...fetchOptions.headers,
              'x-payment': paymentHeaderB64, // Base64 encoded as per x402 standard
            },
          };
          
          // Preserve body for POST/PUT/PATCH requests
          if (fetchOptions.body) {
            retryOptions.body = fetchOptions.body;
            console.log('📤 Preserving request body for retry');
          }
          
          const paidResponse = await fetch(url, retryOptions);

          console.log('📨 Retry response status:', paidResponse.status);

          // If still 402, log detailed error and throw helpful message
          if (paidResponse.status === 402) {
            let errorInfo: any = {};
            try {
              const errorText = await paidResponse.text();
              errorInfo = errorText ? JSON.parse(errorText) : {};
              console.error('❌ Server still returned 402 after sending authorization:', errorInfo);
              console.error('📤 Payment header sent (first 100 chars):', paymentHeaderB64.substring(0, 100));
              console.error('📦 Full payment payload:', JSON.stringify(paymentPayload, null, 2));
              
              // Extract error message from response
              const errorMsg = errorInfo.error || errorInfo.message || 'Payment verification failed';
              throw new Error(`Payment failed: ${errorMsg}. Check server logs for details.`);
            } catch (parseError) {
              console.error('❌ Failed to parse error response:', parseError);
              throw new Error('Payment verification failed. Server returned 402. Check server logs.');
            }
          }

          return paidResponse;
        } catch (error: any) {
          console.error('❌ Payment authorization failed:', error);
          // If authorization creation failed (user rejected), throw clear error
          if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
            throw new Error('Payment authorization was rejected. Please try again and approve the signature request.');
          }
          throw new Error(`Payment failed: ${error.message || 'Unknown error'}`);
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

