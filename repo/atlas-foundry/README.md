# Atlas Foundry

> Token creation and minting SDK for x402-native assets

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![x402](https://img.shields.io/badge/x402-Compatible-green)](https://x402.org)

Atlas Foundry enables developers to create, deploy, and manage x402-protected tokens across multiple blockchains. Build payment-native assets with seamless x402 integration.

## Features

- Multi-chain token deployment (Base, Solana, Polygon)
- x402-protected mint endpoints
- Automatic facilitator registration
- Multiple language support (TypeScript, Python, Go, Java, JavaScript)

## Installation

### TypeScript/JavaScript

```bash
npm install @atlas402/foundry
```

### Python

```bash
pip install atlas-foundry
```

### Go

```bash
go get github.com/atlas402/foundry
```

### Java

```xml
<dependency>
  <groupId>com.atlas402</groupId>
  <artifactId>foundry</artifactId>
  <version>1.0.0</version>
</dependency>
```

## Quick Start

### TypeScript

```typescript
import { AtlasFoundry } from '@atlas402/foundry';

const foundry = new AtlasFoundry({
  facilitatorUrl: 'https://facilitator.payai.network',
});

const token = await foundry.createToken({
  name: 'My Token',
  symbol: 'MTK',
  supply: '1000000',
  pricePerMint: '10.00',
  network: 'base',
  deployerAddress: '0x...',
});
```

### Python

```python
from atlas_foundry import AtlasFoundry

foundry = AtlasFoundry(facilitator_url='https://facilitator.payai.network')

token = await foundry.create_token(
    name='My Token',
    symbol='MTK',
    supply='1000000',
    price_per_mint='10.00',
    network='base',
    deployer_address='0x...'
)
```

### Go

```go
package main

import (
    "github.com/atlas402/foundry"
)

func main() {
    foundry := foundry.New(&foundry.Config{
        FacilitatorURL: "https://facilitator.payai.network",
    })
    
    token, err := foundry.CreateToken(&foundry.TokenParams{
        Name: "My Token",
        Symbol: "MTK",
        Supply: "1000000",
        PricePerMint: "10.00",
        Network: "base",
        DeployerAddress: "0x...",
    })
}
```

## Documentation

- [TypeScript SDK](./typescript/README.md)
- [Python SDK](./python/README.md)
- [Go SDK](./go/README.md)
- [Java SDK](./java/README.md)
- [API Reference](./docs/api.md)

## License

Apache 2.0
