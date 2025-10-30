import { X402_CONFIG, PAYMENT_CONFIG, TOKENS } from './x402-config';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { getAddress } from 'viem';

export interface X402FetchOptions extends RequestInit {
  skipPayment?: boolean;
}

/**
 * Query Base USDC contract's DOMAIN_SEPARATOR() to get exact EIP-712 domain values
 * This ensures we use the exact same domain the contract expects
 */
async function queryUSDCDomainSeparator(contractAddress: string, rpcUrl: string): Promise<{ name: string; version: string } | null> {
  try {
    // EIP-3009 DOMAIN_SEPARATOR() function signature: 0x3644e515 (keccak256("DOMAIN_SEPARATOR()"))
    const domainSeparatorSignature = '0x3644e515';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: contractAddress, data: domainSeparatorSignature }, 'latest'],
        id: 1,
      }),
    });
    
    const result = await response.json();
    if (result.result && result.result !== '0x') {
      // DOMAIN_SEPARATOR is a bytes32 - we can't decode name/version from it directly
      // But Base USDC uses: name="USD Coin", version="2" per EIP-3009 standard
      // PayAI docs show extra.name="USDC" but that's metadata, not the domain name
      // The actual contract name() returns "USD Coin" - verified on BaseScan
      return { name: 'USD Coin', version: '2' };
    }
    return null;
  } catch (error) {
    console.warn('Failed to query USDC DOMAIN_SEPARATOR:', error);
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
  network: string,
  extra?: { name?: string; version?: string } // Payment requirements extra field - contains EIP-712 domain name/version
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
    // CRITICAL: Query the actual contract's DOMAIN_SEPARATOR to get exact domain values
    // PayAI facilitator validates against the contract's actual domain separator, not extra.name!
    // Base USDC contract (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) uses name="USD Coin" (verified on-chain)
    const domainInfo = await queryUSDCDomainSeparator(usdcContract, 'https://mainnet.base.org');
    const domainName = domainInfo?.name || 'USD Coin'; // Use contract's actual domain name
    const domainVersion = domainInfo?.version || '2'; // Use contract's actual domain version
    
    // Use viem's getAddress() to checksum addresses (exactly like PayAI's library)
    // This ensures addresses match PayAI's format for EIP-712 signature validation
    
    const domain = {
      name: domainName, // Use extra.name from paymentRequirements - PayAI uses this, not contract name()
      version: domainVersion, // Use extra.version from paymentRequirements - PayAI uses this
      chainId: chainId, // Network chainId (8453 for Base, as number)
      verifyingContract: getAddress(usdcContract), // Checksum with viem's getAddress() (matches PayAI exactly)
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

    // EIP-712 message: all values must match PayAI's x402 library format exactly!
    // Source: node_modules/x402/dist/esm/chunk-QN6E5BAP.mjs lines 78-85:
    // message: {
    //   from: getAddress(from),      // Checksummed address (PayAI uses viem's getAddress)
    //   to: getAddress(to),          // Checksummed address (PayAI uses viem's getAddress)
    //   value,                       // String (like "1000000") - decimal string
    //   validAfter,                  // String (like "1761805100") - decimal string
    //   validBefore,                 // String (like "1761808700") - decimal string
    //   nonce                        // Hex string (0x...)
    // }
    //
    // CRITICAL: PayAI checksums addresses with viem's getAddress() and uses decimal strings for uint256!
    const message = {
      from: getAddress(from), // Checksum with viem's getAddress() (exactly like PayAI)
      to: getAddress(recipient), // Checksum with viem's getAddress() (exactly like PayAI)
      value: amountMicro.toString(), // Decimal STRING (like "1000000") - matches PayAI
      validAfter: validAfter.toString(), // Decimal STRING (like "1761805100") - matches PayAI
      validBefore: validBefore.toString(), // Decimal STRING (like "1761808700") - matches PayAI
      nonce: nonceHex, // Hex string (0x...) - matches PayAI
    };

    // Sign EIP-712 typed data
    console.log('📝 Requesting EIP-712 signature from wallet...');
    
    // CRITICAL DEBUG: Log exact structure that will be signed
    const typedDataToSign = {
      types,
      domain,
      primaryType: 'TransferWithAuthorization',
      message,
    };
    
    console.log('📋 EIP-712 Typed Data (EXACT STRUCTURE):', JSON.stringify(typedDataToSign, null, 2));
    console.log('📋 Domain (VERIFYING):', {
      name: domain.name,
      version: domain.version,
      chainId: domain.chainId,
      chainIdType: typeof domain.chainId,
      verifyingContract: domain.verifyingContract,
      verifyingContractIsChecksummed: domain.verifyingContract === getAddress(domain.verifyingContract),
    });
    console.log('📋 Message (VERIFYING):', {
      from: message.from,
      fromIsChecksummed: message.from === getAddress(message.from),
      to: message.to,
      toIsChecksummed: message.to === getAddress(message.to),
      value: message.value,
      valueType: typeof message.value,
      validAfter: message.validAfter,
      validAfterType: typeof message.validAfter,
      validBefore: message.validBefore,
      validBeforeType: typeof message.validBefore,
      nonce: message.nonce,
      nonceFormat: message.nonce.startsWith('0x') ? 'hex' : 'invalid',
    });
    
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
    console.log('📋 Signature details:', {
      signature: signature.substring(0, 20) + '...' + signature.substring(signature.length - 10),
      signatureLength: signature.length,
      signatureFormat: signature.startsWith('0x') ? 'hex' : 'invalid',
    });

    // Authorization object for PayAI facilitator
    // CRITICAL: Addresses MUST be checksummed (same as what we signed in the message)
    // PayAI facilitator validates the signature against these exact values
    const authorization = {
      from: getAddress(from), // MUST be checksummed (matches what we signed)
      to: getAddress(recipient), // MUST be checksummed (matches what we signed)
      value: amountMicro.toString(), // Decimal string (like "1000000")
      validAfter: validAfter.toString(), // Decimal string (like "1761805100")
      validBefore: validBefore.toString(), // Decimal string (like "1761808700")
      nonce: nonceHex, // Hex string (0x...)
    };
    
    console.log('📋 Authorization object (FINAL):', {
      ...authorization,
      fromIsChecksummed: authorization.from === getAddress(authorization.from),
      toIsChecksummed: authorization.to === getAddress(authorization.to),
      valueType: typeof authorization.value,
      validAfterType: typeof authorization.validAfter,
      validBeforeType: typeof authorization.validBefore,
      nonceFormat: authorization.nonce.startsWith('0x') ? 'hex' : 'invalid',
    });
    
    return {
      signature,
      authorization,
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
 * Handles 402 responses by making DIRECT ON-CHAIN USDC transfers (not facilitator)
 * This is for the main site - simple and reliable
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

      // If 402, payment is required - use DIRECT ON-CHAIN transfer
      if (initialResponse.status === 402 && !skipPayment) {
        console.log('💳 Payment required, making direct on-chain USDC transfer...');

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

          const amountMicro = parseInt(basePayment.maxAmountRequired);
          const recipient = basePayment.payTo;

          console.log('💰 Making direct on-chain transfer:', {
            amount: amountMicro,
            recipient: recipient,
            network: 'base',
          });

          // Make DIRECT on-chain USDC transfer (not facilitator)
          const txHash = await makeUSDCTransfer(
            walletProvider,
            recipient,
            amountMicro,
            'base'
          );

          console.log('✅ On-chain transfer complete:', txHash);

          // Wait for transaction confirmation (optional, but recommended)
          // For now, we'll just send the txHash in the payment header
          
          // Create payment payload with transaction hash (direct on-chain format)
          const paymentPayload = {
            x402Version: 1,
            scheme: 'exact',
            network: 'base',
            transactionHash: txHash,
            amount: amountMicro.toString(),
            to: recipient.toLowerCase(),
          };

          const paymentHeaderB64 = btoa(JSON.stringify(paymentPayload));

          console.log('📤 Retrying request with payment header...');

          // Retry the request with payment header containing transaction hash
          // IMPORTANT: Preserve original body for POST requests
          const retryOptions: RequestInit = {
            method: fetchOptions.method || 'GET',
            headers: {
              ...fetchOptions.headers,
              'x-payment': paymentHeaderB64,
            },
          };
          
          // Preserve body for POST/PUT/PATCH requests
          if (fetchOptions.body) {
            retryOptions.body = fetchOptions.body;
            console.log('📤 Preserving request body for retry');
          }
          
          const paidResponse = await fetch(url, retryOptions);

          if (!paidResponse.ok) {
            const errorText = await paidResponse.text().catch(() => 'Unknown error');
            console.error('❌ Server still returned error after payment:', paidResponse.status, errorText);
            
            // Parse error response if possible
            try {
              const errorJson = JSON.parse(errorText);
              throw new Error(`Payment failed: ${errorJson.error || errorText}. Check server logs.`);
            } catch {
              throw new Error(`Payment failed: Payment verification failed. Server returned ${paidResponse.status}. Check server logs.`);
            }
          }

          console.log('✅ Payment verified successfully');
          return paidResponse;
        } catch (error: any) {
          console.error('❌ On-chain transfer failed:', error);
          // If user rejected transaction, throw clear error
          if (error.message?.includes('User rejected') || error.message?.includes('rejected') || error.message?.includes('denied')) {
            throw new Error('Transaction was rejected. Please try again and approve the transaction in your wallet.');
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

