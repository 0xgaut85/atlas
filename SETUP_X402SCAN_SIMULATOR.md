# Quick Setup: x402scan Activity Simulator

## Step-by-Step Setup

### 1. Create a Simulator Wallet

**Option A: Use WalletGenerator (quick)**
1. Go to https://vanity-eth.tk/ or use MetaMask to create a new wallet
2. **SAVE THE PRIVATE KEY** - you'll need it for the environment variable
3. **DO NOT use your main wallet** - create a dedicated simulator wallet

**Option B: Use MetaMask**
1. Open MetaMask
2. Create a new account
3. Go to Account Details → Show Private Key
4. Copy the private key (starts with `0x`)

### 2. Fund the Simulator Wallet

1. **Send USDC to the simulator wallet on Base network:**
   - Network: Base Mainnet
   - Token: USDC (contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
   - Amount: **$1-5 USDC** (recommended)
   - This will last for months (payments are $0.01 each, 24/day = $0.24/day)

2. **Get Base ETH for gas** (optional, but recommended):
   - Send ~0.001 ETH to the simulator wallet for gas fees
   - Gas fees are minimal on Base (~$0.001 per transaction)

### 3. Set Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   Name: X402SCAN_SIMULATOR_PRIVATE_KEY
   Value: 0x...your_private_key_here (the one from step 1)
   Environment: Production (and Preview if you want)
   ```
3. Click "Save"

### 4. Verify Setup

After deployment, check the cron job logs:

1. Go to Vercel Dashboard → Your Project → Functions
2. Find `api/cron/x402scan-simulator`
3. Check logs - should see:
   ```
   ✅ Payment successful! Status: 200
   ✅ Payment verified by facilitator - will appear on x402scan
   ```

### 5. Monitor on x402scan

After ~15 minutes, check:
- https://www.x402scan.com/server/YOUR_SERVER_ID
- Should see transactions appearing hourly

## Cost Breakdown

- **One-time setup**: $1-5 USDC
- **Per payment**: $0.01 USDC
- **Daily cost**: ~$0.24 USDC (24 payments/hour)
- **Monthly cost**: ~$7.20 USDC
- **BUT**: Payments go to YOUR merchant address, so you receive most of it back!

## Security ⚠️

- **Never commit the private key to git**
- **Only fund with minimal USDC needed**
- **Use a separate wallet** (not your main merchant wallet)
- **Store private key securely** in Vercel environment variables (encrypted)

## Troubleshooting

### "X402SCAN_SIMULATOR_PRIVATE_KEY not configured"
- Set the environment variable in Vercel dashboard
- Make sure it's the full private key (starts with `0x`)

### "Low USDC balance" or payments failing
- Check the simulator wallet has USDC
- Send USDC on Base network: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Check balance on BaseScan: https://basescan.org/address/YOUR_SIMULATOR_WALLET_ADDRESS

### Payments not appearing on x402scan
- Wait 5-15 minutes for facilitator sync
- Check cron job logs in Vercel
- Verify endpoints are registered on x402scan

## Manual Test

Test the simulator manually:

```bash
curl https://api.atlas402.com/api/cron/x402scan-simulator
```

Should return:
```json
{
  "success": true,
  "results": [
    {
      "endpoint": "https://api.atlas402.com/api/atlas-index",
      "success": true,
      "txHash": "0x...",
      "note": "Payment verified by facilitator - will appear on x402scan"
    }
  ]
}
```

