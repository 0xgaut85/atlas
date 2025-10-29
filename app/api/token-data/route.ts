import { NextRequest, NextResponse } from 'next/server';

/**
 * Fetch real on-chain token data using public RPC endpoints
 * Falls back to CDP SDK if configured
 */
export async function POST(req: NextRequest) {
  try {
    const { contractAddress, network } = await req.json();

    if (!contractAddress || !network) {
      return NextResponse.json(
        { error: 'Missing contractAddress or network' },
        { status: 400 }
      );
    }

    let tokenData: any = {
      contractAddress,
      network,
    };

    // Base/EVM tokens
    if (network === 'base' || network === 'base-sepolia') {
      const rpcUrl = network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
      
      // ERC-20 function signatures
      const totalSupplySignature = '0x18160ddd'; // totalSupply()
      const nameSignature = '0x06fdde03'; // name()
      const symbolSignature = '0x95d89b41'; // symbol()
      const decimalsSignature = '0x313ce567'; // decimals()

      // Batch calls
      const calls = [
        {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: contractAddress, data: totalSupplySignature }, 'latest'],
          id: 1,
        },
        {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: contractAddress, data: symbolSignature }, 'latest'],
          id: 2,
        },
        {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: contractAddress, data: decimalsSignature }, 'latest'],
          id: 3,
        },
        {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: contractAddress, data: nameSignature }, 'latest'],
          id: 4,
        },
        {
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [contractAddress, 'latest'],
          id: 5,
        },
      ];

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calls),
      });

      const results = await response.json();

      if (!Array.isArray(results)) {
        throw new Error('Invalid RPC response');
      }

      // Parse total supply
      const totalSupplyHex = results[0]?.result;
      if (totalSupplyHex && totalSupplyHex !== '0x') {
        const decimals = results[2]?.result ? parseInt(results[2].result, 16) : 18;
        const supply = BigInt(totalSupplyHex);
        const divisor = BigInt(10 ** decimals);
        const supplyNumber = Number(supply / divisor);
        
        tokenData.totalSupply = supplyNumber.toLocaleString();
        tokenData.totalSupplyRaw = supplyNumber;
        tokenData.decimals = decimals;
      }

      // Parse symbol
      const symbolHex = results[1]?.result;
      if (symbolHex && symbolHex !== '0x') {
        try {
          const cleanHex = symbolHex.slice(2);
          // Remove length prefix (first 64 chars) and decode
          const dataHex = cleanHex.slice(128);
          const bytes = dataHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
          tokenData.symbol = String.fromCharCode(...bytes.filter(b => b > 0 && b < 128)).trim();
        } catch (e) {
          console.log('Symbol decode error:', e);
        }
      }

      // Parse name
      const nameHex = results[3]?.result;
      if (nameHex && nameHex !== '0x') {
        try {
          const cleanHex = nameHex.slice(2);
          const dataHex = cleanHex.slice(128);
          const bytes = dataHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
          tokenData.name = String.fromCharCode(...bytes.filter(b => b > 0 && b < 128)).trim();
        } catch (e) {
          console.log('Name decode error:', e);
        }
      }

      // Check if contract exists
      const codeHex = results[4]?.result;
      tokenData.verified = codeHex && codeHex !== '0x' && codeHex.length > 2;
      
      // Try to get cap() if available (optional, not all tokens have it)
      try {
        const capSignature = '0x355274ea'; // cap()
        const capResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{ to: contractAddress, data: capSignature }, 'latest'],
            id: 6,
          }),
        });
        
        const capResult = await capResponse.json();
        if (capResult.result && capResult.result !== '0x') {
          const capValue = BigInt(capResult.result);
          const divisor = BigInt(10 ** (tokenData.decimals || 18));
          tokenData.maxSupply = Number(capValue / divisor).toLocaleString();
        }
      } catch (e) {
        // cap() not available, that's fine
      }
    }

    // Solana tokens
    if (network === 'solana-mainnet' || network === 'solana-devnet') {
      const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=e5af1d68-c89f-4bbf-bfc1-c12dd6cbbee2';
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenSupply',
          params: [contractAddress],
        }),
      });

      const result = await response.json();

      if (result.result?.value) {
        const supply = result.result.value;
        const amount = Number(supply.uiAmount || 0);
        
        tokenData.totalSupply = amount.toLocaleString();
        tokenData.totalSupplyRaw = amount;
        tokenData.decimals = supply.decimals;
        tokenData.verified = true;
      }
    }

    return NextResponse.json({
      success: true,
      data: tokenData,
    });

  } catch (error: any) {
    console.error('Token data fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch token data' 
      },
      { status: 500 }
    );
  }
}

