# Payment Schemes

Payment schemes define how payments are structured and verified for different blockchain networks.

## Scheme Format

Each scheme is identified by a string: `{scheme}+{network_identifier}`

Examples:
- `x402+eip712` - EVM networks (Base, Ethereum, Polygon)
- `x402+solana` - Solana network

## x402+eip712 (EVM Networks)

Payment scheme for Ethereum Virtual Machine (EVM) compatible networks.

### Supported Networks

- Base Mainnet
- Base Sepolia (testnet)
- Ethereum Mainnet (coming Q2 2026)
- Polygon (coming Q1 2026)

### Payment Payload

```json
{
  "transactionHash": "0x1234...",
  "amount": "1000000",
  "currency": "USDC",
  "payTo": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "nonce": 1234567890,
  "chainId": 8453
}
```

### Verification

1. Fetch transaction from blockchain RPC
2. Verify transaction status is "success"
3. Verify recipient matches `payTo`
4. Verify amount matches `maxAmountRequired`
5. Verify asset contract matches `asset`
6. Verify transaction is recent (within timeout window)

### Example

```typescript
import { verifyEIP712Payment } from '@atlas402/x402-server';

const isValid = await verifyEIP712Payment({
  transactionHash: '0x...',
  network: 'base',
  expectedAmount: '1000000',
  expectedRecipient: '0x...',
  expectedAsset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
});
```

## x402+solana (Solana)

Payment scheme for Solana network.

### Supported Networks

- Solana Mainnet
- Solana Devnet (testnet)

### Payment Payload

```json
{
  "signature": "5j7s8K9mL3nP2qR4tV6wX8yZ...",
  "amount": "1000000",
  "currency": "USDC",
  "payTo": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "slot": 123456789
}
```

### Verification

1. Fetch transaction from Solana RPC
2. Verify transaction status is "success"
3. Verify recipient matches `payTo`
4. Verify amount matches `maxAmountRequired`
5. Verify asset mint matches `asset`
6. Verify transaction slot is recent

### Example

```python
from atlas_x402.server import verify_solana_payment

is_valid = await verify_solana_payment(
    signature="5j7s8K9mL3nP2qR4tV6wX8yZ...",
    network="solana-mainnet",
    expected_amount=1000000,
    expected_recipient="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    expected_asset="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
)
```

## Scheme Requirements

Each scheme must define:

1. **Payload Structure**: JSON schema for payment payload
2. **Verification Logic**: How to verify payments on-chain
3. **Network Support**: Which networks are supported
4. **Asset Support**: Which assets are supported (USDC, etc.)

## Creating New Schemes

To add support for a new payment scheme:

1. Create specification document in `specs/schemes/{scheme-name}/`
2. Implement client library in `client/` for each language
3. Implement server middleware in `server/` for each language
4. Add tests and examples
5. Submit PR for review

See `specs/schemes/exact/` for reference implementation.

