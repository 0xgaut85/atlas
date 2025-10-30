# Token Deployment Specification

## Overview

Atlas Foundry enables deployment of x402-protected tokens on multiple blockchain networks.

## Supported Networks

- Base (EVM) - ERC-20 tokens
- Solana - SPL tokens

## Token Parameters

- `name`: Token name (required)
- `symbol`: Token symbol, 2-10 characters (required)
- `supply`: Total supply as string (required)
- `pricePerMint`: Price per mint in USDC (required)
- `network`: Network identifier ('base' or 'solana-mainnet')
- `deployerAddress`: Wallet address of deployer (required)
- `description`: Optional description
- `decimals`: Optional decimals (default: 18 for EVM, 9 for Solana)

## Deployment Process

1. Validate token parameters
2. Deploy contract on target network
3. Create x402-protected mint endpoint
4. Register endpoint with facilitator
5. Return deployment result

## Fees

- Fixed deployment fee: 10 USDC
- Network fees: Gas costs for deployment transaction

## Security Considerations

- Always verify contract deployment before registration
- Validate all user inputs
- Use secure wallet management
- Implement proper error handling




