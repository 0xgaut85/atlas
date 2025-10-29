# Client Integration Guide

This guide explains how to integrate Atlas x402 payments into your client applications.

## Installation

### TypeScript/JavaScript

```bash
npm install @atlas402/x402-client
```

### Python

```bash
pip install atlas-x402-client
```

## Basic Usage

### TypeScript

```typescript
import { x402Fetch } from '@atlas402/x402-client';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

const walletClient = createWalletClient({
  chain: base,
  transport: http(),
});

const response = await x402Fetch('https://api.example.com/data', {
  walletClient,
  network: 'base',
});

const data = await response.json();
```

### Python

```python
from atlas_x402.client import x402_fetch

response = await x402_fetch(
    'https://api.example.com/data',
    network='base',
    wallet_address='0x...'
)

data = await response.json()
```

## Payment Flow

1. Client makes initial request
2. Server returns 402 with payment requirements
3. Client creates blockchain transaction
4. Client retries with X-PAYMENT header
5. Server verifies and returns content

## Error Handling

```typescript
try {
  const response = await x402Fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
} catch (error) {
  if (error.message.includes('402')) {
    console.error('Payment required');
  }
}
```

## Best Practices

- Cache payment sessions when possible
- Handle network errors gracefully
- Show clear payment UI to users
- Implement retry logic for failed payments

