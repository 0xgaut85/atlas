# How to Check PayAI Facilitator Request Logs

## Server-Side Logs (Vercel Functions)

### Method 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: **atlas402**
3. Click **"Functions"** tab (or **"Deployments"** → Latest deployment → **"Functions"**)
4. Find the function that handled the payment (e.g., `api/x402/payment/service-payment`)
5. Click on the function name
6. Click **"Logs"** tab
7. Look for these log messages:
   - `🔍 PayAI Facilitator Request (FULL DETAILS):` - Shows exactly what we're sending
   - `🔍 PayAI Facilitator Response:` - Shows facilitator's response
   - `❌ Facilitator verification failed:` - Shows error details

### Method 2: Vercel CLI
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# View logs (real-time)
vercel logs --follow

# View logs for specific function
vercel logs --follow | grep "Facilitator"
```

### Method 3: Vercel Dashboard → Logs Page
1. Go to your project on Vercel
2. Click **"Logs"** in the left sidebar
3. Filter by function name or search for "Facilitator"
4. Look for entries with `🔍 PayAI Facilitator Request`

## What to Look For in Logs

### ✅ Good Request Should Show:
```json
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "base",
    "payload": {
      "signature": "0x...",
      "authorization": {
        "from": "0xAcBd12c452ae1b75321a70cbe1b540e66400a3a5",  // Checksummed
        "to": "0x8BEE703d6214a266e245b0537085b1021e1ccaed",   // Checksummed
        "value": "500000",                                      // Decimal string
        "validAfter": "1761805100",                            // Decimal string
        "validBefore": "1761808700",                           // Decimal string
        "nonce": "0x..."                                       // Hex string
      }
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "500000",
    "payTo": "0x8BEE703d6214a266e245b0537085b1021e1ccaed",  // Checksummed
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",   // Checksummed
    "extra": {
      "name": "USDC",
      "version": "2"
    }
  }
}
```

### ❌ Common Issues to Check:
1. **Domain name mismatch**: Should be `"USDC"` (from `extra.name`), not `"USD Coin"`
2. **Address checksumming**: All addresses must be checksummed (mixed case)
3. **uint256 values**: Must be decimal strings (`"500000"`), not hex (`"0x7a120"`)
4. **Nonce format**: Must be hex string (`"0x..."`), not decimal
5. **Network**: Should be `"base"`, not `"base-mainnet"`

## Client-Side Logs (Browser Console)

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Trigger a payment
4. Look for:
   - `📋 EIP-712 Typed Data (EXACT STRUCTURE):` - Full typed data being signed
   - `📋 Domain (VERIFYING):` - Domain details
   - `📋 Message (VERIFYING):` - Message details
   - `📋 Authorization object (FINAL):` - Final authorization object

## If Logs Show Error

If you see `invalid_exact_evm_payload_signature`:

1. **Copy the full log output** including:
   - The `🔍 PayAI Facilitator Request (FULL DETAILS)` log
   - The `🔍 PayAI Facilitator Response` log
   - Any `❌ Facilitator verification failed` logs

2. **Check these specific fields**:
   - `domain.name` in client logs vs `paymentRequirements.extra.name` in server logs
   - Address checksumming (should see `fromIsChecksummed: true`)
   - Value format (should be `"500000"` not hex)

3. **Contact PayAI Support** with:
   - Full request payload (from logs)
   - Error message: `invalid_exact_evm_payload_signature`
   - Your merchant address: `0x8bee703d6214a266e245b0537085b1021e1ccaed`

## Quick Debug Command

To see logs in real-time while testing:
```bash
vercel logs --follow | grep -E "(Facilitator|EIP-712|invalid_exact)"
```

