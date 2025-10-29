# x402scan Registration Checklist

## ✅ Code Configuration Complete

### 1. Endpoints Updated
- ✅ `/api/atlas-index` - Returns 402 with strict x402scan schema
- ✅ `/api/atlas-operator` - Returns 402 with strict x402scan schema  
- ✅ `/api/x402/info` - Merchant discovery endpoint
- ✅ `/api/x402/health` - Health check endpoint
- ✅ Old endpoints removed (service-hub, token-indexer, agent)

### 2. Response Format
- ✅ `x402Version: 1` included
- ✅ `scheme: "exact"` (required by x402scan)
- ✅ `resource` field included (full URL)
- ✅ `description` field included
- ✅ `maxTimeoutSeconds: 60` included
- ✅ `error: null` (x402scan prefers null)

### 3. Infrastructure
- ✅ `api.atlas402.com` root redirects to `/api/x402/info`
- ✅ CORS headers enabled
- ✅ SSL required (HTTPS)

## 🔍 Pre-Deployment Verification

### Before Registering on x402scan:

1. **Verify DNS is configured**:
   ```bash
   # Should resolve to Vercel
   nslookup api.atlas402.com
   ```

2. **Verify SSL certificate**:
   ```bash
   # Should return 200
   curl -I https://api.atlas402.com/api/x402/info
   ```

3. **Test 402 Response**:
   ```bash
   # Should return 402 with correct schema
   curl https://api.atlas402.com/api/atlas-index
   ```
   
   Expected response:
   ```json
   {
     "x402Version": 1,
     "error": null,
     "accepts": [{
       "scheme": "exact",
       "network": "base",
       "maxAmountRequired": "1000000",
       "resource": "https://api.atlas402.com/api/atlas-index",
       "description": "Payment required for /api/atlas-index",
       "mimeType": "application/json",
       "payTo": "0x8bee703d6214a266e245b0537085b1021e1ccaed",
       "maxTimeoutSeconds": 60,
       "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
     }]
   }
   ```

4. **Verify Merchant Info**:
   ```bash
   # Should return merchant info
   curl https://api.atlas402.com/api/x402/info
   ```

## 📝 x402scan Registration

### On https://www.x402scan.com/resources/register:

**Resource URL:**
```
https://api.atlas402.com/api/atlas-index
```

**Headers:**
- Leave empty (no custom headers needed)

**Validation Schema:**
- Leave empty (optional)

### After Registration:

1. x402scan will validate your endpoint
2. It should pass validation if:
   - Returns HTTP 402
   - Matches the strict schema format
   - Has correct CORS headers
   - SSL certificate is valid

## ⚠️ Important Notes

1. **Environment Variable**: Make sure `NEXT_PUBLIC_MERCHANT_URL=https://api.atlas402.com` is set in Vercel production environment

2. **First Payment Triggers Discovery**: After your first real payment transaction, the facilitator will automatically register you for discovery

3. **Automatic Discovery**: x402scan periodically syncs from the facilitator, so you'll appear automatically after first payment

4. **Multiple Resources**: You can register multiple endpoints:
   - `https://api.atlas402.com/api/atlas-index` (Discovery)
   - `https://api.atlas402.com/api/chat` (Atlas Operator)
   - `https://api.atlas402.com/api/token/create` (Token Creation)

## 🚀 You're Ready!

Everything is configured correctly. Once deployed:
1. Test the endpoints with curl
2. Register on x402scan.com
3. Make a test payment
4. Wait ~15 minutes for sync
5. Your services will appear on x402scan!

