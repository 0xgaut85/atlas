import { NextRequest, NextResponse } from 'next/server';
import { listPayments } from '@/lib/atlas-tracking';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';

// Helper to fetch USDC balance from Base
async function fetchBaseUSDCBalance(address: string): Promise<string> {
  try {
    const rpcUrl = 'https://mainnet.base.org';
    const balanceOfSignature = '0x70a08231';
    const addressParam = address.substring(2).padStart(64, '0').toLowerCase();
    const data = balanceOfSignature + addressParam;
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: TOKENS.usdcEvm, data }, 'latest'],
        id: 1,
      }),
    });
    
    const result = await response.json();
    if (result.result && result.result !== '0x') {
      const balance = BigInt(result.result);
      return (Number(balance) / 1_000_000).toFixed(6);
    }
    return '0.0';
  } catch (error) {
    console.error('Error fetching Base USDC balance:', error);
    return '0.0';
  }
}

// Helper to fetch USDC balance from Solana
async function fetchSolanaUSDCBalance(address: string): Promise<string> {
  try {
    const USDC_MINT = TOKENS.usdcSol;
    const rpcUrl = 'https://api.mainnet-beta.solana.com';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [address, { mint: USDC_MINT }, { encoding: 'jsonParsed' }],
      }),
    });
    
    const result = await response.json();
    if (result.result?.value?.length > 0) {
      const balance = result.result.value[0].account.data.parsed.info.tokenAmount.uiAmount;
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
    const days = parseInt(searchParams.get('days') || '7');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    console.log('🔍 Fetching revenue data:', { days, since: since.toISOString() });

    // Fetch all payments from tracking system
    let payments;
    try {
      payments = await listPayments({
        since,
        limit: 10000,
      });
      console.log(`✅ Loaded ${payments.length} payments from database`);
    } catch (dbError: any) {
      console.error('❌ Database error, using empty array:', dbError.message);
      payments = [];
    }

    // Calculate totals by network
    const totals = {
      base: 0,
      solana: 0,
      combined: 0,
    };

    // Calculate by category
    const categories = {
      access: 0,
      registration: 0,
      mint: 0,
      service: 0,
      other: 0,
    };

    payments.forEach(p => {
      const amount = p.amountMicro / 1_000_000; // Convert from micro to USDC
      totals.combined += amount;
      
      if (p.network === 'base') {
        totals.base += amount;
      } else if (p.network === 'solana-mainnet') {
        totals.solana += amount;
      }

      const cat = p.category.toLowerCase();
      if (cat === 'access') categories.access += amount;
      else if (cat === 'registration') categories.registration += amount;
      else if (cat === 'mint' || cat === 'token_minted') categories.mint += amount;
      else if (cat === 'service') categories.service += amount;
      else categories.other += amount;
    });

    // Get stats - calculate servicesAdded from services table
    let servicesAdded = 0;
    try {
      const { listServices } = await import('@/lib/atlas-tracking');
      const allServices = await listServices();
      // Count services created in the time range
      servicesAdded = allServices.filter(s => {
        const serviceDate = s.createdAt ? new Date(s.createdAt) : new Date(0);
        return serviceDate >= since;
      }).length;
      console.log(`✅ Found ${servicesAdded} services added since ${since.toISOString()}`);
    } catch (error: any) {
      console.error('❌ Error calculating servicesAdded:', error.message);
    }

    const stats = {
      uniqueUsers: new Set(payments.map(p => p.userAddress).filter(Boolean)).size,
      servicesAdded,
      since: since.toISOString(),
      sampleSize: payments.length,
    };
    
    console.log('📊 Stats calculated:', stats);

    // Fetch real USDC balances from blockchain for protocol addresses
    console.log('🔍 Fetching protocol balances...');
    const [baseUSDC, solUSDC] = await Promise.all([
      fetchBaseUSDCBalance(X402_CONFIG.payTo),
      fetchSolanaUSDCBalance(X402_CONFIG.payToSol),
    ]);
    
    console.log('✅ Protocol balances:', { baseUSDC, solUSDC });

    const balances = {
      baseUSDC,
      solUSDC,
    };

    return NextResponse.json({
      success: true,
      data: {
        totals,
        categories,
        stats,
        balances,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching revenue:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch revenue',
    }, { status: 500 });
  }
}
