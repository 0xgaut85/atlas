# API Reference

## AtlasFoundry

Main class for token creation and management.

### Constructor

```typescript
new AtlasFoundry(config: FoundryConfig)
```

### Methods

#### `createToken(params: TokenParams): Promise<TokenResult>`

Creates a new x402-protected token.

**Parameters:**
- `params.name`: Token name
- `params.symbol`: Token symbol (2-10 characters)
- `params.supply`: Total supply as string
- `params.pricePerMint`: Price per mint in USDC
- `params.network`: Network ('base' or 'solana-mainnet')
- `params.deployerAddress`: Wallet address of deployer
- `params.description`: Optional description
- `params.decimals`: Optional decimals (default: 18 for EVM, 9 for Solana)

**Returns:**
- `contractAddress`: Deployed contract address
- `mintEndpoint`: x402-protected mint endpoint URL
- `deploymentTxHash`: Transaction hash of deployment
- `explorerLink`: Blockchain explorer link

#### `mintToken(contractAddress: string, options: MintOptions): Promise<MintResult>`

Mints tokens via x402-protected endpoint.

**Parameters:**
- `contractAddress`: Token contract address
- `options.amount`: Amount to mint
- `options.recipient`: Recipient address
- `options.network`: Network ('base' or 'solana-mainnet')

## Types

### TokenParams

```typescript
interface TokenParams {
  name: string;
  symbol: string;
  supply: string;
  pricePerMint: string;
  network: 'base' | 'solana-mainnet';
  deployerAddress: string;
  description?: string;
  decimals?: number;
}
```

### TokenResult

```typescript
interface TokenResult {
  contractAddress: string;
  mintEndpoint: string;
  deploymentTxHash: string;
  explorerLink: string;
  network: string;
}
```

