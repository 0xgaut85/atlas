/**
 * Token Contract Reader - Read real on-chain token data
 * Uses server-side API endpoint for secure RPC access
 */

export interface TokenContractData {
  totalSupply?: string;
  totalSupplyRaw?: number;
  maxSupply?: string;
  percentMinted?: number;
  contractAddress?: string;
  symbol?: string;
  decimals?: number;
  name?: string;
  verified?: boolean;
  network?: string;
  payTo?: string;
  scheme?: string;
}

/**
 * Fetch token data via server-side API (works for Base and Solana)
 */
export async function fetchTokenData(contractAddress: string, network: string): Promise<TokenContractData> {
  try {
    const response = await fetch('/api/token-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractAddress, network }),
    });

    const result = await response.json();

    if (result.success && result.data) {
      return result.data;
    }

    return { contractAddress, network };
  } catch (error) {
    console.error('Error fetching token data:', error);
    return { contractAddress, network };
  }
}

/**
 * Extract contract address from x402 service
 * For tokens, this is usually in the accepts array or endpoint
 */
export function extractContractAddress(service: any): string | null {
  try {
    // Check if endpoint contains a contract address
    const endpoint = service.endpoint;
    if (endpoint) {
      // Match Ethereum address (0x + 40 hex chars)
      const ethMatch = endpoint.match(/0x[a-fA-F0-9]{40}/);
      if (ethMatch) {
        // Skip if it's a known payment token (USDC)
        const knownPaymentTokens = [
          '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
        ];
        if (!knownPaymentTokens.includes(ethMatch[0])) {
          return ethMatch[0];
        }
      }

      // Match Solana address (base58, 32-44 chars)
      const solMatch = endpoint.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
      if (solMatch) {
        const knownSolTokens = [
          'EPjFWdd5Au11kK6iGkQv5QGNsq4mVQK1JvLw6j4wC6N', // Solana USDC
        ];
        if (!knownSolTokens.includes(solMatch[0])) {
          return solMatch[0];
        }
      }
    }

    // Check accepts array for asset that's not a payment token
    if (service.accepts && Array.isArray(service.accepts)) {
      for (const accept of service.accepts) {
        if (accept.asset) {
          // Skip known payment tokens
          const knownPaymentTokens = [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
            'EPjFWdd5Au11kK6iGkQv5QGNsq4mVQK1JvLw6j4wC6N', // Solana USDC
          ];
          
          if (!knownPaymentTokens.includes(accept.asset)) {
            return accept.asset;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting contract address:', error);
    return null;
  }
}

// Legacy functions kept for backwards compatibility
export const readBaseTokenContract = fetchTokenData;
export const readSolanaTokenContract = fetchTokenData;
