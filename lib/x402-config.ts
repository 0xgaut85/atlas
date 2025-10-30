export const X402_CONFIG = {
  facilitatorUrl: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://base-facilitator.cdp.coinbase.com',
  payTo: process.env.NEXT_PUBLIC_X402_PAY_TO || '0x8bee703d6214a266e245b0537085b1021e1ccaed', // EVM (Base)
  payToSol: process.env.NEXT_PUBLIC_X402_PAY_TO_SOL || 'GLrMcCztDV4Bu4TdN3NFiQmcVGHUh6LMGwkwbwLXm48N', // Solana
  network: process.env.NEXT_PUBLIC_X402_NETWORK || 'base',
  price: '$1.00', // USDC
  supportedNetworks: (process.env.NEXT_PUBLIC_X402_SUPPORTED_NETWORKS?.split(',') as ('base' | 'solana-mainnet')[]) || ['base','solana-mainnet'],
  merchantUrl: process.env.NEXT_PUBLIC_MERCHANT_URL || 'https://api.atlas402.com',
};

export const PAYMENT_CONFIG = {
  amount: '1.00',
  currency: 'USDC',
  network: 'base', // default UI preselect
  payTo: '0x8bee703d6214a266e245b0537085b1021e1ccaed',
};

export const TOKENS = {
  usdcEvm: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  usdcSol: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Solana USDC (legacy token program)
};

// Your public merchant URL (this will be registered with facilitator)
export const X402_FACILITATOR_URL = 
  process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 
  'https://base-facilitator.cdp.coinbase.com';

export const X402_MERCHANT_URL = 
  process.env.NEXT_PUBLIC_MERCHANT_URL || 
  'https://api.atlas402.com';

