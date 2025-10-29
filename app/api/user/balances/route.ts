import { NextRequest, NextResponse } from 'next/server';

// Helper to fetch USDC balance from Base using RPC
async function fetchBaseUSDCBalance(address: string): Promise<string> {
  try {
    const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC
    const rpcUrl = 'https://mainnet.base.org';
    
    // ERC-20 balanceOf(address) function signature
    const balanceOfSignature = '0x70a08231'; // balanceOf(address)
    const addressParam = address.substring(2).padStart(64, '0').toLowerCase();
    const data = balanceOfSignature + addressParam;
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: USDC_CONTRACT, data }, 'latest'],
        id: 1,
      }),
    });
    
    const result = await response.json();
    if (result.result && result.result !== '0x') {
      const balance = BigInt(result.result);
      const balanceUsdc = Number(balance) / 1_000_000; // USDC has 6 decimals
      return balanceUsdc.toFixed(6);
    }
    return '0.0';
  } catch (error) {
    console.error('Error fetching Base USDC balance:', error);
    return '0.0';
  }
}

// Helper to fetch ETH balance from Base
async function fetchBaseETHBalance(address: string): Promise<string> {
  try {
    const rpcUrl = 'https://mainnet.base.org';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });
    
    const result = await response.json();
    if (result.result && result.result !== '0x') {
      const balance = BigInt(result.result);
      const balanceEth = Number(balance) / 1e18; // ETH has 18 decimals
      return balanceEth.toFixed(6);
    }
    return '0.0';
  } catch (error) {
    console.error('Error fetching Base ETH balance:', error);
    return '0.0';
  }
}

// Helper to fetch SOL balance from Solana
async function fetchSolanaSOLBalance(address: string): Promise<string> {
  try {
    const rpcUrl = 'https://api.mainnet-beta.solana.com';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
      }),
    });
    
    const result = await response.json();
    if (result.result && result.result.value) {
      const balance = result.result.value / 1e9; // SOL has 9 decimals
      return balance.toFixed(6);
    }
    return '0.0';
  } catch (error) {
    console.error('Error fetching Solana SOL balance:', error);
    return '0.0';
  }
}

// Helper to fetch SOL balance from Solana
async function fetchSolanaUSDCBalance(address: string): Promise<string> {
  try {
    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Solana USDC
    const rpcUrl = 'https://api.mainnet-beta.solana.com';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { mint: USDC_MINT },
          { encoding: 'jsonParsed' }
        ],
      }),
    });
    
    const result = await response.json();
    if (result.result && result.result.value && result.result.value.length > 0) {
      const tokenAccount = result.result.value[0];
      const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
      return balance.toFixed(6);
    }
    return '0.0';
  } catch (error) {
    console.error('Error fetching Solana USDC balance:', error);
    return '0.0';
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');
    const solAddress = searchParams.get('solAddress');
    
    console.log('🔍 Fetching balances for:', { address, solAddress });
    
    let evmBalance = null;
    let solBalance = null;
    
    if (address) {
      const [usdc, eth] = await Promise.all([
        fetchBaseUSDCBalance(address),
        fetchBaseETHBalance(address),
      ]);
      evmBalance = {
        network: 'base',
        native: eth,
        usdc,
      };
    }
    
    if (solAddress) {
      const [usdc, sol] = await Promise.all([
        fetchSolanaUSDCBalance(solAddress),
        fetchSolanaSOLBalance(solAddress),
      ]);
      solBalance = {
        network: 'solana-mainnet',
        native: sol,
        usdc,
      };
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        evm: evmBalance,
        solana: solBalance,
      }
    });
  } catch (error: any) {
    console.error('Error fetching balances:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch balances' 
    }, { status: 500 });
  }
}
