# Create Mint Implementation Plan - Atlas Foundry

## Current Status: ❌ NOT FUNCTIONAL

The "Create Mint" feature currently **does not work**. It only simulates token creation with a fake success message.

**Current Code** (`app/workspace/atlas-foundry/page.tsx`):
```typescript
const handleCreateToken = async (e: React.FormEvent) => {
  // Simulate token creation (frontend only for now)
  setTimeout(() => {
    setCreateResult({
      success: true,
      message: 'Token creation will be available in November 2025...'
    });
  }, 2000);
};
```

## What Needs to Be Built

To make "Create Mint" fully functional with x402 technology, you need:

### 1. Backend API Endpoint: `/api/token/create` (x402-protected)

**Purpose**: Accept token creation requests, deploy smart contract, register as x402 service

**Flow**:
1. User fills form → clicks "Create & Deploy Mint"
2. Frontend calls `/api/token/create` with token parameters
3. Server returns HTTP 402 with payment requirements
4. User pays deployment fee (e.g., $300 minimum or 1% of supply value)
5. Server verifies payment via PayAI facilitator
6. Server deploys ERC-20 (Base) or SPL token (Solana) using Coinbase CDP AgentKit
7. Server creates x402-protected mint endpoint
8. Server registers service on PayAI facilitator (auto-registers on x402scan.com)
9. Server returns token contract address and mint endpoint

**Required Fields**:
- Token name, symbol, description
- Initial supply
- Price per mint (USDC)
- Network (Base or Solana)
- Deployer address (from wallet)

**Payment**: Deployment fee (calculated as max($300, 1% of supply * price_per_mint))

### 2. Smart Contract Deployment (Coinbase CDP AgentKit)

**For Base (ERC-20)**:
- Use Coinbase CDP AgentKit's `deployContract` action
- Deploy `AtlasERC20.sol` contract with constructor parameters:
  - `_name`: Token name
  - `_symbol`: Token symbol  
  - `_decimals`: 18 (standard for ERC-20)
  - `_initialSupply`: Supply amount (with decimals)
  - `_owner`: User's wallet address

**For Solana (SPL Token)**:
- Use Coinbase CDP AgentKit's Solana actions
- Create SPL token mint with metadata
- Set supply and ownership

**CDP Environment Variables Required**:
```bash
CDP_API_KEY_NAME=your_key_name
CDP_API_KEY_PRIVATE_KEY=your_private_key
```

**CDP Documentation**: https://docs.cdp.coinbase.com/

### 3. x402 Mint Endpoint Creation

After deployment, create an x402-protected endpoint for minting:

**Endpoint**: `/api/token/[contractAddress]/mint`

**x402 Flow**:
1. User requests mint → Server returns HTTP 402
2. Payment requirements: `{ asset: "USDC", payTo: "[deployer_address]", network: "base", maxAmountRequired: "[price_per_mint in microUSDC]", scheme: "x402+eip712" }`
3. User pays USDC to deployer address
4. User retries with `x-payment` header containing transaction hash
5. Server verifies payment via PayAI facilitator
6. Server executes mint (transfers tokens from deployer to user)
7. Server returns success with mint transaction hash

**Registration**: This endpoint auto-registers on PayAI facilitator (which registers on x402scan.com)

**PayAI Facilitator**: https://facilitator.payai.network/discovery/resources
**x402scan Registration**: https://www.x402scan.com/resources/register (auto via PayAI)

### 4. Database Storage

Store token metadata in `atlas_services` table:
- Service ID: `token-{contractAddress}`
- Name: Token name
- Description: Token description
- Endpoint: `/api/token/[contractAddress]/mint`
- Merchant address: Deployer address
- Category: "Tokens"
- Network: Base or Solana
- Metadata: Contract address, symbol, supply, price per mint, etc.

### 5. Frontend Updates

**Current**: `handleCreateToken` simulates creation

**Needed**:
1. Call `/api/token/create` API endpoint
2. Handle HTTP 402 payment flow
3. Use `makeX402Request` to pay deployment fee
4. Wait for deployment confirmation
5. Display token contract address and mint endpoint
6. Show success message with explorer links

## Implementation Steps

### Step 1: Create Token Creation API Route

**File**: `app/api/token/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { x402Middleware } from '@/lib/x402-middleware';
import { deployERC20Contract } from '@/lib/cdp-agentkit'; // To be created
import { upsertService } from '@/lib/atlas-tracking';

const DEPLOYMENT_FEE_MICRO = 300_000_000; // $300 minimum

export async function POST(req: NextRequest) {
  // x402 payment gate - require deployment fee payment
  const paymentResult = await x402Middleware(req, {
    amountMicro: DEPLOYMENT_FEE_MICRO,
    category: 'registration',
  });
  
  if (!paymentResult.verified) {
    return paymentResult.response; // HTTP 402
  }

  const body = await req.json();
  const { name, symbol, description, supply, pricePerMint, network, deployerAddress } = body;

  // Deploy contract using Coinbase CDP AgentKit
  const contractAddress = await deployERC20Contract({
    name,
    symbol,
    decimals: 18,
    initialSupply: BigInt(supply) * BigInt(10 ** 18),
    owner: deployerAddress,
    network: network === 'base' ? 'base' : 'solana-mainnet',
  });

  // Create x402 mint endpoint URL
  const mintEndpoint = `/api/token/${contractAddress}/mint`;

  // Register service in database
  await upsertService({
    id: `token-${contractAddress}`,
    name,
    description,
    endpoint: mintEndpoint,
    merchantAddress: deployerAddress.toLowerCase(),
    category: 'Tokens',
    network,
    priceAmount: pricePerMint.toString(),
    priceCurrency: 'USDC',
    metadata: {
      contractAddress,
      symbol,
      supply,
      pricePerMint,
      deployedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({
    success: true,
    contractAddress,
    mintEndpoint,
    explorerLink: network === 'base' 
      ? `https://basescan.org/token/${contractAddress}`
      : `https://solscan.io/token/${contractAddress}`,
  });
}
```

### Step 2: Create Mint Endpoint (x402-protected)

**File**: `app/api/token/[contractAddress]/mint/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { x402Middleware } from '@/lib/x402-middleware';
import { mintTokens } from '@/lib/cdp-agentkit'; // To be created

export async function GET(
  req: NextRequest,
  { params }: { params: { contractAddress: string } }
) {
  const contractAddress = params.contractAddress;
  
  // Load token metadata from database
  const service = await getService(`token-${contractAddress}`);
  if (!service) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  const pricePerMintMicro = Number(service.priceAmount) * 1_000_000;

  // x402 payment gate
  const paymentResult = await x402Middleware(req, {
    amountMicro: pricePerMintMicro,
    payTo: service.merchantAddress,
    category: 'mint',
  });

  if (!paymentResult.verified) {
    return paymentResult.response; // HTTP 402
  }

  // Execute mint transaction
  const mintTxHash = await mintTokens({
    contractAddress,
    to: paymentResult.userAddress,
    amount: 1, // Mint 1 token (or use pricePerMint if fractional)
    network: service.network,
  });

  return NextResponse.json({
    success: true,
    txHash: mintTxHash,
    tokensMinted: 1,
    contractAddress,
  });
}
```

### Step 3: Create Coinbase CDP AgentKit Integration

**File**: `lib/cdp-agentkit.ts`

```typescript
import { Coinbase } from '@coinbase/cdp-sdk';

const cdp = new Coinbase({
  apiKeyName: process.env.CDP_API_KEY_NAME!,
  apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
});

export async function deployERC20Contract(params: {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  owner: string;
  network: 'base' | 'solana-mainnet';
}) {
  // Use CDP AgentKit to deploy contract
  // Documentation: https://docs.cdp.coinbase.com/agentkit/actions/contract
  const deployment = await cdp.solana?.deployContract({
    contractBytecode: compileAtlasERC20(params), // Compile Solidity contract
    constructorArgs: [params.name, params.symbol, params.decimals, params.initialSupply, params.owner],
    network: params.network === 'base' ? 'base-mainnet' : 'solana-mainnet',
  });

  return deployment.contractAddress;
}

export async function mintTokens(params: {
  contractAddress: string;
  to: string;
  amount: number;
  network: string;
}) {
  // Use CDP AgentKit to call contract mint function
  const tx = await cdp.solana?.callContract({
    contractAddress: params.contractAddress,
    functionName: 'transfer',
    args: [params.to, params.amount],
    network: params.network === 'base' ? 'base-mainnet' : 'solana-mainnet',
  });

  return tx.hash;
}
```

### Step 4: Update Frontend

**File**: `app/workspace/atlas-foundry/page.tsx`

```typescript
const handleCreateToken = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!isConnected || !address || !walletProvider) {
    setCreateResult({ success: false, message: 'Please connect your wallet first' });
    return;
  }

  setIsCreating(true);
  setCreateResult(null);

  try {
    // Make x402 request to create token endpoint
    const response = await makeX402Request(
      walletProvider,
      '/api/token/create',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tokenForm.name,
          symbol: tokenForm.symbol,
          description: tokenForm.description,
          supply: tokenForm.supply,
          pricePerMint: tokenForm.pricePerMint,
          network: tokenForm.network,
          deployerAddress: address,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Token creation failed: ${response.status}`);
    }

    const result = await response.json();
    
    setCreateResult({
      success: true,
      message: `Token deployed successfully! Contract: ${result.contractAddress}. Mint endpoint: ${result.mintEndpoint}`,
    });

    // Reset form
    setTokenForm({
      name: '',
      symbol: '',
      description: '',
      supply: '',
      network: 'base',
      pricePerMint: '',
      website: '',
      category: 'Utility',
      logoUrl: '',
    });
  } catch (error: any) {
    setCreateResult({
      success: false,
      message: error.message || 'Token creation failed',
    });
  } finally {
    setIsCreating(false);
  }
};
```

## Summary

**Current State**: ❌ Not functional - simulation only

**What's Missing**:
1. ✅ Backend API endpoint `/api/token/create` (x402-protected)
2. ✅ Coinbase CDP AgentKit integration for contract deployment
3. ✅ x402-protected mint endpoint `/api/token/[address]/mint`
4. ✅ Frontend integration with x402 payment flow
5. ✅ Database storage of token metadata

**Technologies Required**:
- **x402 Protocol**: HTTP 402 payment standard
- **PayAI Facilitator**: Payment verification and service discovery
- **Coinbase CDP AgentKit**: Smart contract deployment (ERC-20/SPL)
- **x402scan**: Auto-registration via PayAI facilitator

**Documentation References**:
- x402 Protocol: https://x402.gitbook.io/x402
- PayAI Network: https://docs.payai.network/
- Coinbase CDP: https://docs.cdp.coinbase.com/
- x402scan Registration: https://www.x402scan.com/resources/register

**Estimated Implementation Time**: 2-3 days
- Day 1: CDP AgentKit integration + contract deployment
- Day 2: x402 endpoints + payment flow
- Day 3: Frontend integration + testing

