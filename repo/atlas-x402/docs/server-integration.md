# Server Integration Guide

This guide explains how to integrate Atlas x402 payments into your server applications.

## Installation

### TypeScript/JavaScript

```bash
npm install @atlas402/x402-server
```

### Python

```bash
pip install atlas-x402-server
```

## Basic Usage

### Express.js

```typescript
import express from 'express';
import { x402Middleware } from '@atlas402/x402-server';

const app = express();

app.get('/api/data',
  x402Middleware({
    price: '0.05 USDC',
    network: 'base',
    merchantAddress: '0x...',
  }),
  (req, res) => {
    res.json({ data: 'Your content here' });
  }
);
```

### FastAPI

```python
from fastapi import FastAPI
from atlas_x402.server.middleware import x402_middleware

app = FastAPI()

@app.get('/api/data')
async def get_data(request: Request):
    await x402_middleware(
        request,
        price='0.05',
        network='base',
        merchant_address='0x...'
    )
    return {'data': 'Your content here'}
```

## Payment Verification

You can verify payments directly without facilitator:

```typescript
import { verifyPayment } from '@atlas402/x402-server';

const result = await verifyPayment({
  paymentPayload: parsedPayload,
  requirements: paymentRequirements,
  rpcUrl: 'https://mainnet.base.org',
});
```

## Session Management

Implement session caching to avoid repeated payments:

```typescript
const sessionCache = new Map();

app.use((req, res, next) => {
  const sessionKey = `${req.ip}-${req.path}`;
  if (sessionCache.has(sessionKey)) {
    return next();
  }
  // Check payment
});
```

## Best Practices

- Always verify payments server-side
- Use facilitator for production
- Implement proper error handling
- Cache verification results
- Monitor payment success rates

