# Atlas x402 Protocol Specification

## Overview

Atlas x402 is an HTTP-based payment protocol that enables resource servers to request payment from clients before serving content. It implements the HTTP 402 Payment Required status code using blockchain technology for instant settlement.

## Protocol Version

Current version: **1.0**

## Core Types

### Payment Required Response

When a resource server requires payment, it returns HTTP 402 with a JSON body:

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "x402+eip712",
      "network": "base",
      "maxAmountRequired": "1000000",
      "resource": "https://api.example.com/data",
      "description": "Access to data API",
      "mimeType": "application/json",
      "payTo": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "maxTimeoutSeconds": 60,
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "extra": {
        "name": "USDC",
        "version": "2"
      }
    }
  ],
  "error": null
}
```

### Payment Payload

Clients send payment proof in the `X-PAYMENT` header (base64 encoded JSON):

```json
{
  "x402Version": 1,
  "scheme": "x402+eip712",
  "network": "base",
  "payload": {
    "transactionHash": "0x...",
    "amount": "1000000",
    "currency": "USDC",
    "payTo": "0x..."
  }
}
```

## Payment Flow

1. **Client Request**: Client sends HTTP GET/POST to protected resource
2. **Server Response**: Server returns 402 with payment requirements
3. **Payment Creation**: Client creates blockchain transaction
4. **Payment Retry**: Client retries request with X-PAYMENT header
5. **Verification**: Server verifies payment via facilitator or direct query
6. **Content Delivery**: Server returns 200 OK with content if payment valid

## Facilitator Interface

### POST /verify

Verify a payment transaction.

**Request:**
```json
{
  "x402Version": 1,
  "paymentHeader": "base64-encoded-payment-payload",
  "paymentRequirements": { /* paymentRequirements object */ }
}
```

**Response:**
```json
{
  "isValid": true,
  "invalidReason": null
}
```

### POST /settle

Settle a payment transaction.

**Request:**
```json
{
  "x402Version": 1,
  "paymentHeader": "base64-encoded-payment-payload",
  "paymentRequirements": { /* paymentRequirements object */ }
}
```

**Response:**
```json
{
  "success": true,
  "error": null,
  "txHash": "0x...",
  "networkId": "base"
}
```

### GET /supported

Get supported payment schemes and networks.

**Response:**
```json
{
  "kinds": [
    { "scheme": "x402+eip712", "network": "base" },
    { "scheme": "x402+solana", "network": "solana-mainnet" }
  ]
}
```

## Payment Schemes

### x402+eip712 (EVM Networks)

Payment scheme for Ethereum-compatible networks using EIP-712 signatures.

**Payload Structure:**
```json
{
  "transactionHash": "0x...",
  "amount": "1000000",
  "currency": "USDC",
  "payTo": "0x...",
  "nonce": 1234567890
}
```

### x402+solana (Solana)

Payment scheme for Solana network using transaction signatures.

**Payload Structure:**
```json
{
  "signature": "...",
  "amount": "1000000",
  "currency": "USDC",
  "payTo": "...",
  "slot": 123456789
}
```

## Security Considerations

- Always verify payments server-side
- Use HTTPS for all communication
- Validate payment amounts and recipients
- Implement rate limiting
- Store payment sessions securely

## References

- [HTTP 402 RFC](https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.2)
- [EIP-712: Ethereum Typed Data](https://eips.ethereum.org/EIPS/eip-712)
- [Solana Transaction Format](https://docs.solana.com/developing/programming-model/transactions)





