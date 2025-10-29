/**
 * x402 Utility Functions
 * Real payment processing and blockchain integration utilities
 */

import { parseUnits, formatUnits, Address } from 'viem';

export interface PaymentRequest {
  serviceId: string;
  endpoint: string;
  amount: string;
  currency: 'USDC' | 'SOL';
  network: string;
  recipientAddress: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  cost?: string;
  network?: string;
  blockNumber?: number;
  timestamp: number;
}

export interface ServiceRegistration {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  price: {
    amount: string;
    currency: 'USDC' | 'SOL';
  };
  network: string;
  category: string;
  developerAddress: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * USDC Contract addresses for different networks
 */
export const USDC_CONTRACT_ADDRESS: Record<string, Address> = {
  'base': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'base-sepolia': '0x036CbD53842c54266f735e9269242e5f41dABcE3',
  'polygon': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  'peaq': '0xbbA60da06c2c5424f03f7434542280FCAd453d10',
};

export const USDC_CONTRACTS = USDC_CONTRACT_ADDRESS;

/**
 * Network chain IDs
 */
export const NETWORK_CHAIN_IDS: Record<string, number | null> = {
  'base': 8453,
  'base-sepolia': 84532,
  'polygon': 137,
  'peaq': 3338,
  'solana-mainnet': null,
  'solana-devnet': null,
};

/**
 * Get chain ID for a network
 */
export const getNetworkChainId = (network: string): number | null => {
  return NETWORK_CHAIN_IDS[network] || null;
};

/**
 * Get network name
 */
export const getNetworkName = (network: string): string => {
  const names: Record<string, string> = {
    'base': 'Base',
    'base-sepolia': 'Base Sepolia',
    'polygon': 'Polygon',
    'peaq': 'Peaq',
    'solana-mainnet': 'Solana',
    'solana-devnet': 'Solana Devnet',
  };
  return names[network] || network;
};

/**
 * Network configurations for x402 payments
 */
export const NETWORK_CONFIGS = {
  'base': {
    name: 'Base Mainnet',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    currency: 'ETH',
    usdcAddress: USDC_CONTRACTS.base,
  },
  'base-sepolia': {
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    currency: 'ETH',
    usdcAddress: USDC_CONTRACTS['base-sepolia'],
  },
  'solana-mainnet': {
    name: 'Solana Mainnet',
    chainId: 101,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    currency: 'SOL',
  },
  'solana-devnet': {
    name: 'Solana Devnet',
    chainId: 103,
    rpcUrl: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    currency: 'SOL',
  },
} as const;

/**
 * Parse payment amount to wei/lamports
 */
export function parsePaymentAmount(amount: string, currency: 'USDC' | 'SOL'): bigint {
  const decimals = currency === 'USDC' ? 6 : 9; // USDC has 6 decimals, SOL has 9
  return parseUnits(amount, decimals);
}

/**
 * Format payment amount from wei/lamports
 */
export function formatPaymentAmount(amount: bigint, currency: 'USDC' | 'SOL'): string {
  const decimals = currency === 'USDC' ? 6 : 9;
  return formatUnits(amount, decimals);
}

/**
 * Generate explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, network: string): string {
  const config = NETWORK_CONFIGS[network as keyof typeof NETWORK_CONFIGS];
  if (!config) return '';
  
  if (network.startsWith('solana')) {
    return `${config.explorerUrl}/tx/${txHash}`;
  } else {
    return `${config.explorerUrl}/tx/${txHash}`;
  }
}

/**
 * Validate service endpoint URL
 */
export function validateServiceEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Generate service ID
 */
export function generateServiceId(name: string, developerAddress: string): string {
  const timestamp = Date.now();
  const hash = btoa(`${name}-${developerAddress}-${timestamp}`).slice(0, 10);
  return `service-${hash}`;
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000; // Max $1000 per request
}

/**
 * Get network from chain ID
 */
export function getNetworkFromChainId(chainId: number): string | null {
  for (const [network, config] of Object.entries(NETWORK_CONFIGS)) {
    if (config.chainId === chainId) {
      return network;
    }
  }
  return null;
}

/**
 * Create payment request object
 */
export function createPaymentRequest(
  serviceId: string,
  endpoint: string,
  amount: string,
  currency: 'USDC' | 'SOL',
  network: string,
  recipientAddress: string
): PaymentRequest {
  return {
    serviceId,
    endpoint,
    amount,
    currency,
    network,
    recipientAddress,
  };
}

/**
 * Estimate gas cost for USDC transfer
 */
export function estimateGasCost(network: string): string {
  if (network.startsWith('base')) {
    return '0.0001'; // ~$0.0001 in ETH for Base
  }
  if (network.startsWith('solana')) {
    return '0.000005'; // ~5000 lamports for Solana
  }
  return '0.001';
}

/**
 * Check if network supports currency
 */
export function isNetworkCompatible(network: string, currency: 'USDC' | 'SOL'): boolean {
  if (currency === 'SOL') {
    return network.startsWith('solana');
  }
  if (currency === 'USDC') {
    return network.startsWith('base') || network.startsWith('solana');
  }
  return false;
}
