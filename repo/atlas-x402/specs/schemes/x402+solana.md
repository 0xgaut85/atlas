# x402+solana Scheme Specification

## Overview

The `x402+solana` scheme enables payment verification on Solana blockchain using transaction signatures.

## Network Support

- Solana Mainnet
- Solana Devnet (testnet)

## Payment Payload

```typescript
interface SolanaPaymentPayload {
  signature: string; // Base58-encoded transaction signature
  amount: string; // Amount in micro units (e.g., "1000000" for 1 USDC)
  currency: string; // Asset identifier (e.g., "USDC")
  payTo: string; // Base58-encoded address
  slot?: number; // Optional transaction slot number
}
```

## Verification Process

1. **Fetch Transaction**: Query Solana RPC for transaction by signature
2. **Verify Status**: Ensure transaction meta.err is null
3. **Verify Recipient**: Check that recipient address matches `payTo`
4. **Verify Amount**: Parse transaction logs to verify USDC transfer amount
5. **Verify Asset**: Ensure transfer is from correct USDC mint
6. **Verify Timing**: Check transaction slot is recent (within timeout window)

## USDC Mint Addresses

- Solana Mainnet: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

## Example Implementation

```python
from atlas_x402.server import verify_solana_payment

result = await verify_solana_payment(
    signature="5j7s8K9mL3nP2qR4tV6wX8yZ...",
    network="solana-mainnet",
    rpc_url="https://api.mainnet-beta.solana.com",
    expected_amount=1000000,
    expected_recipient="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    expected_asset="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    timeout_seconds=60,
)

if result.is_valid:
    # Payment verified, serve content
else:
    # Payment invalid: result.invalid_reason
```

## Error Handling

Common verification failures:

- `INVALID_TRANSACTION`: Transaction not found or failed
- `WRONG_RECIPIENT`: Recipient address mismatch
- `WRONG_AMOUNT`: Amount mismatch
- `WRONG_ASSET`: Asset mint mismatch
- `EXPIRED`: Transaction slot too old
- `NETWORK_ERROR`: RPC connection failed

## Security Considerations

- Always verify on-chain via RPC
- Use facilitator service for production
- Implement proper rate limiting
- Cache verification results
- Monitor for replay attacks using slot numbers




