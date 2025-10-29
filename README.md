# Atlas402 Utilities & SDKs

> Multi-chain x402 payment infrastructure for the API economy

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0-orange)](https://pnpm.io/)

Atlas402 Utilities is a comprehensive monorepo containing backend infrastructure, SDKs, and tools for building payment-native services using the x402 protocol.

## 🎯 Overview

This repository powers the Atlas402 ecosystem's backend infrastructure, providing developers with everything needed to integrate x402 payments into their applications across multiple blockchains.

### The Problem

Traditional API monetization requires:
- Complex subscription systems
- Credit card processors with high fees
- Manual invoicing and payment tracking
- Geographic restrictions
- High friction for small payments

### Our Solution

Atlas402 makes every API call a micropayment:
- **Instant Settlement**: Payments settle on-chain in under 1 second
- **Usage-Based Pricing**: Pay exactly for what you consume
- **Multi-Chain Native**: Support for Base, Solana, Polygon, BSC, Sei, Peaq
- **Frictionless Integration**: Drop-in middleware for Express, Next.js, Python
- **Zero Subscriptions**: No monthly fees, no commitment

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Basic Usage

**Express.js Server:**

```typescript
import express from 'express';
import { x402Middleware } from '@atlas402/express-sdk';

const app = express();

app.post('/api/ai/generate',
  x402Middleware({
    price: '0.05 USDC',
    network: 'base',
    description: 'AI content generation'
  }),
  async (req, res) => {
    // Your API logic here
    res.json({ result: 'Generated content' });
  }
);
```

**Next.js API Route:**

```typescript
import { withX402 } from '@atlas402/next-sdk';

export const POST = withX402(
  async (req) => {
    // Your API logic
    return Response.json({ success: true });
  },
  {
    price: '1.00 USDC',
    network: 'base',
    description: 'Data query'
  }
);
```

**React Client:**

```typescript
import { useX402Payment } from '@atlas402/react-sdk';

function MyComponent() {
  const { pay, isPaying } = useX402Payment({
    price: '0.05 USDC',
    asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    payTo: '0xYourAddress',
    network: 'eip155:8453'
  });

  return (
    <button onClick={() => pay('/api/endpoint')} disabled={isPaying}>
      {isPaying ? 'Processing...' : 'Pay & Use'}
    </button>
  );
}
```

## 📦 Core Packages

### Server-Side

- **[@atlas402/express-sdk](./packages/express-sdk)** - Express.js middleware and utilities
- **[@atlas402/next-sdk](./packages/next-sdk)** - Next.js App Router integration
- **[@atlas402/ts-sdk](./packages/ts-sdk)** - TypeScript client library
- **[@atlas402/core](./packages/core)** - Core protocol implementation

### Client-Side

- **[@atlas402/react-sdk](./packages/react-sdk)** - React hooks and components
- **[@atlas402/payment-verifier](./packages/payment-verifier)** - Payment verification engine
- **[@atlas402/settlement-engine](./packages/settlement-engine)** - On-chain settlement

### Infrastructure

- **[@atlas402/facilitator-client](./packages/facilitator-client)** - Facilitator API client
- **[@atlas402/logger](./packages/logger)** - Structured logging (coming soon)
- **[@atlas402/metrics](./packages/metrics)** - Monitoring and analytics (coming soon)

## 📚 Examples

- **[Express API](./examples/express-api)** - Full-featured Express.js API with x402 payments
- **[Next.js Chatbot](./examples/nextjs-chatbot)** - AI chatbot with pay-per-message
- **[React Dashboard](./examples/react-dashboard)** - Admin dashboard with payment analytics

## 🛠️ Templates

- **[Next.js API Template](./templates/next-api)** - Starter for Next.js APIs
- **[Express REST Template](./templates/express-rest)** - REST API boilerplate

## 🌐 Supported Networks

| Network | Chain ID | Status | USDC Address |
|---------|----------|--------|--------------|
| Base Mainnet | 8453 | ✅ Live | `0x833589fC...` |
| Base Sepolia | 84532 | ✅ Live | `0x036CbD53...` |
| Solana Mainnet | - | ✅ Live | `EPjFWdd5Au...` |
| Solana Devnet | - | ✅ Live | `4zMMC9srt5...` |
| Polygon | 137 | ✅ Live | `0x2791Bca1...` |
| BSC | 56 | ✅ Live | `0x8AC76a51...` |
| Sei | 1329 | 🔄 Soon | - |
| Peaq | 3338 | 🔄 Soon | - |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Atlas402 Ecosystem                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Service    │───▶│  Facilitator │                  │
│  │   Provider   │    │   Network    │                  │
│  └──────────────┘    └──────────────┘                  │
│         │                    │                          │
│         │                    │                          │
│         ▼                    ▼                          │
│  ┌──────────────────────────────────┐                  │
│  │      Settlement Engine           │                  │
│  │  (Base, Solana, Polygon, BSC)   │                  │
│  └──────────────────────────────────┘                  │
│         │                    │                          │
│         │                    │                          │
│         ▼                    ▼                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Consumer   │───▶│    Wallet    │                  │
│  │     App      │    │  (MetaMask,  │                  │
│  │              │    │   Phantom)   │                  │
│  └──────────────┘    └──────────────┘                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- pnpm 9+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/atlas402/atlas-utils.git
cd atlas-utils

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm typecheck
```

### Monorepo Structure

```
atlas-utils/
├── packages/          # Published npm packages
│   ├── core/         # Protocol core
│   ├── express-sdk/  # Express middleware
│   ├── next-sdk/     # Next.js integration
│   ├── react-sdk/    # React hooks
│   └── ts-sdk/       # TypeScript client
├── examples/         # Example applications
├── templates/        # Project templates
├── docs/            # Documentation
└── scripts/         # Build and deployment scripts
```

## 📖 Use Cases

### AI Services
Pay per API call for:
- Text generation
- Image creation
- Code completion
- Voice synthesis

### Data Services
- Real-time market data
- Weather forecasts
- Geolocation lookups
- Analytics queries

### Content APIs
- Article summaries
- Translation services
- Content moderation
- SEO analysis

### Development Tools
- Code formatting
- Linting services
- Test generation
- Documentation builders

## 📘 Documentation

- [Getting Started](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Architecture Guide](./docs/architecture.md)
- [Integration Patterns](./docs/integration-patterns.md)
- [Network Configuration](./docs/networks.md)
- [Security Best Practices](./docs/security.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

## 🌟 Community

- [Discord](https://discord.gg/atlas402)
- [Twitter](https://twitter.com/atlas402)
- [GitHub Discussions](https://github.com/atlas402/atlas-utils/discussions)
- [Documentation](https://docs.atlas402.com)

## 🙏 Acknowledgments

Built with inspiration from:
- [Coinbase x402](https://github.com/coinbase/x402) - Original HTTP 402 protocol
- [Merit Systems Echo](https://github.com/Merit-Systems/echo) - API architecture patterns
- The broader Web3 developer community

---

**Made with ❤️ by the Atlas402 Team**

*Enabling the payment-native internet, one API call at a time.*
