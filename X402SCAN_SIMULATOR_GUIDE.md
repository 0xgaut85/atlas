# x402scan Activity Simulator Guide

## Overview

This simulator makes periodic small facilitator-verified payments to your registered x402 endpoints to simulate activity on x402scan. This ensures transactions appear on x402scan while your main site uses regular on-chain transfers.

## Why Use This?

- **Main site**: Use simple `transfer()` calls - fast, reliable, you receive USDC immediately
- **x402scan visibility**: Simulator makes facilitator-verified payments that appear on x402scan
- **Best of both worlds**: Your users get fast payments, x402scan shows activity

## Setup

### Option 1: Vercel Cron Job (Recommended)

1. **Set Environment Variables in Vercel:**
   ```
   X402SCAN_SIMULATOR_PRIVATE_KEY=0x...your_private_key_here
   CRON_SECRET=your_random_secret_here
   ```

2. **Fund the Simulator Wallet:**
   - The wallet corresponding to `X402SCAN_SIMULATOR_PRIVATE_KEY` needs USDC
   - Recommended: $1-5 USDC (small payments are made)
   - Address: Use the wallet's address, send USDC on Base network

3. **Cron Job:**
   - Already configured in `vercel.json`
   - Runs every hour: `0 * * * *`
   - Endpoint: `/api/cron/x402scan-simulator`
   - Vercel will automatically call it

4. **Verify It's Working:**
   ```bash
   curl https://api.atlas402.com/api/cron/x402scan-simulator \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Option 2: Manual Script (Local/Server)

1. **Install dependencies:**
   ```bash
   npm install tsx
   ```

2. **Set environment variable:**
   ```bash
   export X402SCAN_SIMULATOR_PRIVATE_KEY=0x...your_private_key
   ```

3. **Run the simulator:**
   ```bash
   npm run simulate-x402scan
   ```

4. **Or run directly:**
   ```bash
   npx tsx scripts/x402scan-activity-simulator.ts
   ```

## Configuration

Edit `scripts/x402scan-activity-simulator.ts` to customize:

```typescript
const SIMULATOR_CONFIG = {
  // Endpoints to ping (must be registered on x402scan)
  endpoints: [
    {
      url: 'https://api.atlas402.com/api/atlas-index',
      method: 'GET',
      amountMicro: 10000, // $0.01 USDC
    },
    // Add more endpoints...
  ],
  
  // How often to make payments (in milliseconds)
  intervalMs: 60 * 60 * 1000, // 1 hour
  
  // Maximum payments per day
  maxPaymentsPerDay: 24, // Once per hour = 24 per day
};
```

## How It Works

1. **Simulator wallet** makes a request to your registered x402 endpoint
2. **Endpoint returns 402** with payment requirements
3. **Simulator creates EIP-3009 authorization** (signed with simulator wallet)
4. **Sends authorization** to endpoint with `x-payment` header
5. **Your endpoint verifies** via PayAI facilitator
6. **Payment is recorded** and appears on x402scan (~5-15 minutes)
7. **You receive USDC** back (since you're paying yourself)

## Cost Analysis

- **Payment amount**: $0.01 USDC per payment (configurable)
- **Payments per day**: 24 (once per hour)
- **Daily cost**: ~$0.24 USDC
- **Monthly cost**: ~$7.20 USDC
- **You receive it back**: Payments go to your merchant address, so net cost is ~0

## Monitoring

Check if simulator is working:

1. **Vercel Cron Logs:**
   - Go to Vercel Dashboard → Your Project → Functions → `api/cron/x402scan-simulator`
   - Check logs for successful payments

2. **x402scan.com:**
   - Check your server page: `https://www.x402scan.com/server/YOUR_SERVER_ID`
   - Should see transactions appearing every hour

3. **Direct API Check:**
   ```bash
   curl https://api.atlas402.com/api/cron/x402scan-simulator \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

## Troubleshooting

### "X402SCAN_SIMULATOR_PRIVATE_KEY not configured"
- Set the environment variable in Vercel dashboard
- Make sure it's a valid private key (starts with `0x`)

### "Low USDC balance"
- Send USDC to the simulator wallet address
- Base network USDC contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### "Payment failed: Facilitator verification failed"
- This is the same issue as your main site
- If PayAI facilitator is rejecting signatures, simulator payments will also fail
- Consider using the workaround temporarily (accept payments even if facilitator fails)

### Transactions not appearing on x402scan
- Wait 5-15 minutes for facilitator sync
- Verify endpoints are registered on x402scan
- Check that facilitator verification succeeded (not fallback)

## Security Notes

⚠️ **IMPORTANT**: 
- The simulator wallet private key is stored in environment variables
- Never commit `X402SCAN_SIMULATOR_PRIVATE_KEY` to git
- Use Vercel environment variables (encrypted at rest)
- Only fund the simulator wallet with minimal USDC needed

## Main Site Changes

Now you can modify your main site to use simple on-chain transfers:

```typescript
// Simple transfer (no facilitator verification needed)
await walletClient.writeContract({
  address: USDC_CONTRACT,
  abi: erc20Abi,
  functionName: 'transfer',
  args: [merchantAddress, amount],
});
```

These transfers:
- ✅ Work immediately (no facilitator dependency)
- ✅ You receive USDC directly
- ✅ No signature validation issues
- ❌ Won't appear on x402scan automatically

But the simulator will handle x402scan visibility! 🎯

