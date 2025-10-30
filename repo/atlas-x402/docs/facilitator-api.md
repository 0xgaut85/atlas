# Facilitator API Reference

Atlas x402 facilitators provide third-party payment verification and settlement services.

## Base URL

```
https://facilitator.payai.network
```

## Endpoints

### POST /verify

Verify a payment transaction.

**Request:**
```json
{
  "x402Version": 1,
  "paymentHeader": "base64-encoded-payment-payload",
  "paymentRequirements": {
    "scheme": "x402+eip712",
    "network": "base",
    "maxAmountRequired": "1000000",
    "payTo": "0x...",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }
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
  "paymentRequirements": { /* same as verify */ }
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

## Error Codes

- `400`: Invalid request format
- `402`: Payment verification failed
- `500`: Server error
- `503`: Facilitator unavailable

## Rate Limits

Default rate limit: 100 requests per minute per IP address.

## Authentication

Public facilitator endpoints do not require authentication. Private facilitators may require API keys.









