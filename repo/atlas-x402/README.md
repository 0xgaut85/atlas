# Atlas x402

> A payments protocol for the internet. Built on HTTP.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![Go](https://img.shields.io/badge/Go-1.21-blue)](https://go.dev/)

Atlas x402 is a payments protocol that enables HTTP services to request payment from clients before serving content. Built on blockchain technology, it provides instant settlement, true micropayments, and multi-chain support.

## Overview

Atlas x402 implements the HTTP 402 Payment Required status code, originally defined in RFC 2068 but never widely implemented until now. By leveraging blockchain technology, Atlas x402 enables:

- **Instant Settlement**: Payments settle on-chain in under 1 second
- **True Micropayments**: Pay as little as $0.001 per request
- **Multi-Chain Native**: Support for Base, Solana, Polygon, and more
- **Zero Friction**: No subscriptions, no credit cards, no manual invoicing

## Core Concepts

### Protocol Flow

1. Client makes an HTTP request to a resource server
2. Resource server responds with `402 Payment Required` status and payment requirements
3. Client selects payment method and creates blockchain transaction
4. Client retries request with `X-PAYMENT` header containing transaction proof
5. Resource server verifies payment via facilitator or direct chain query
6. Resource server returns `200 OK` with requested content

### Facilitator

A facilitator server is a third-party service that handles payment verification and settlement without requiring resource servers to run full blockchain nodes or manage wallets.

**Facilitator Endpoints:**
- `POST /verify` - Verify a payment transaction
- `POST /settle` - Settle a payment transaction
- `GET /supported` - Get supported payment schemes and networks

## Installation

### TypeScript/JavaScript

```bash
npm install @atlas402/x402-client
npm install @atlas402/x402-server
```

### Python

```bash
pip install atlas-x402-client
pip install atlas-x402-server
```

### Go

```bash
go get github.com/atlas402/x402/client
go get github.com/atlas402/x402/server
```

### Java

```xml
<dependency>
  <groupId>com.atlas402</groupId>
  <artifactId>x402-client</artifactId>
  <version>1.0.0</version>
</dependency>
<dependency>
  <groupId>com.atlas402</groupId>
  <artifactId>x402-server</artifactId>
  <version>1.0.0</version>
</dependency>
```

## Quick Start

### Server (Express.js)

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
    res.json({ data: 'Your paid content here' });
  }
);
```

### Client (TypeScript)

```typescript
import { x402Fetch } from '@atlas402/x402-client';
import { createWalletClient } from 'viem';

const walletClient = createWalletClient({ /* ... */ });

const response = await x402Fetch('https://api.example.com/data', {
  walletClient,
  network: 'base',
});

const data = await response.json();
```

## Payment Schemes

Atlas x402 supports multiple payment schemes optimized for different use cases:

- **exact**: Transfer exact amount (e.g., pay $1 to read an article)
- **upto**: Transfer up to amount based on consumption (e.g., LLM token generation)

Each scheme is implemented differently for each blockchain network. See [specs/schemes](./specs/schemes) for detailed specifications.

## Supported Networks

- Base (EVM)
- Solana
- Polygon (coming Q1 2026)
- Ethereum (coming Q2 2026)

## Examples

See the [examples](./examples) directory for complete working examples in multiple languages and frameworks.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────▶│    Server    │────────▶│ Facilitator │
│  (Browser)  │         │   (Express)  │         │  (Atlas)    │
└─────────────┘         └──────────────┘         └─────────────┘
       │                       │                       │
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Wallet    │         │   Database   │         │  Blockchain │
│ (MetaMask)  │         │   (Postgres) │         │   (Base)    │
└─────────────┘         └──────────────┘         └─────────────┘
```

## Documentation

- [Protocol Specification](./specs/protocol.md)
- [Payment Schemes](./specs/schemes)
- [Client Integration Guide](./docs/client-integration.md)
- [Server Integration Guide](./docs/server-integration.md)
- [Facilitator API](./docs/facilitator-api.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

Apache 2.0 - see [LICENSE](./LICENSE) file for details.

## Resources

- [Website](https://api.atlas402.com)
- [Documentation](https://api.atlas402.com/docs)
- [Discord](https://discord.gg/atlas402)
- [Twitter](https://twitter.com/atlas402)

---

**Made with ❤️ by the Atlas402 Team**

*Enabling the payment-native internet, one API call at a time.*
