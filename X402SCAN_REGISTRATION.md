# Atlas402 x402scan Registration Guide

## Domain Setup

### 1. Configure DNS

In your domain registrar for `atlas402.com`, add a CNAME record:

```
Type:  CNAME
Name:  api
Value: cname.vercel-dns.com
TTL:   3600 (or default)
```

### 2. Add Domain in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `api.atlas402.com`
4. Vercel will verify DNS and issue SSL certificate (5-15 minutes)

### 3. Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**, set:

```bash
NEXT_PUBLIC_MERCHANT_URL=https://api.atlas402.com
NEXT_PUBLIC_BASE_URL=https://api.atlas402.com
```

Apply to: **Production**, **Preview**, **Development**

## x402scan Registration

### Automatic Registration Process

Atlas402 will automatically appear on x402scan.com after your first payment transaction:

1. **First Payment Triggers Registration**
   - When someone makes a payment on your site (e.g., $1.00 USDC for accessing a service)
   - Your API calls PayAI facilitator's `/verify` endpoint
   - Facilitator automatically records `api.atlas402.com` as an active merchant

2. **x402scan Discovery**
   - x402scan periodically queries facilitator's `/discovery/resources` endpoint
   - Gets list of all active merchants
   - Discovers `api.atlas402.com` automatically

3. **You Appear on Scanner**
   - Merchant name: **Atlas402**
   - URL: `api.atlas402.com`
   - Services: All your x402-protected endpoints
   - Network: Base mainnet, Solana mainnet
   - Wallet addresses: Your configured payment addresses

### Timeline

- ⏱️ First payment triggers registration: **Immediate**
- ⏱️ Facilitator sync: **1-2 minutes**
- ⏱️ x402scan sync: **5-10 minutes**
- ⏱️ Visible on https://www.x402scan.com/: **~15 minutes after first payment**

## Verification Endpoints

### 1. Merchant Info Endpoint

```bash
curl https://api.atlas402.com/api/x402/info
```

Should return:
```json
{
  "name": "Atlas402",
  "description": "Infrastructure platform for x402 protocol - micropayments for APIs",
  "version": "1.0.0",
  "merchant": "https://api.atlas402.com",
  "services": [
    {
      "id": "service-hub",
      "name": "Service Hub",
      "endpoint": "https://api.atlas402.com/api/service-hub",
      "price": {
        "amount": "1.00",
        "currency": "USDC",
        "network": "base"
      }
    }
  ],
  "payment": {
    "wallet": "0x8bee703d6214a266e245b0537085b1021e1ccaed",
    "networks": ["base", "solana-mainnet"],
    "facilitator": "https://facilitator.payai.network"
  },
  "discovery": {
    "x402scan": "https://www.x402scan.com",
    "facilitator": "https://facilitator.payai.network"
  }
}
```

### 2. Health Check Endpoint

```bash
curl https://api.atlas402.com/api/x402/health
```

Should return:
```json
{
  "status": "operational",
  "timestamp": "2025-01-01T12:00:00Z",
  "merchant": "api.atlas402.com",
  "x402Version": "1.0",
  "endpoints": {
    "info": "https://api.atlas402.com/api/x402/info",
    "health": "https://api.atlas402.com/api/x402/health"
  }
}
```

### 3. Protected Endpoint (Should Return 402)

```bash
curl https://api.atlas402.com/api/service-hub
```

Should return HTTP 402 with payment requirements:
```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "x402+eip712",
      "network": "base",
      "maxAmountRequired": "1000000",
      "payTo": "0x8bee703d6214a266e245b0537085b1021e1ccaed",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "mimeType": "application/json"
    }
  ],
  "error": null
}
```

## Verify Your Registration

After your first real payment transaction:

1. Wait 10-15 minutes
2. Visit https://www.x402scan.com/
3. Search for:
   - `api.atlas402.com`
   - `Atlas402`
4. Your merchant should appear with all service details

## Important Notes

✅ **No manual registration required** - The facilitator automatically tracks merchants  
✅ **Discovery is automatic** - First payment triggers registration  
✅ **x402scan syncs automatically** - No manual submission needed  
✅ **CORS enabled** - Endpoints are accessible from x402scan.com  
✅ **SSL required** - HTTPS is mandatory for x402 merchants  

## Troubleshooting

### Not appearing on x402scan?

1. **Check DNS**: Verify `api.atlas402.com` resolves correctly
   ```bash
   dig api.atlas402.com
   ```

2. **Check SSL**: Ensure HTTPS works
   ```bash
   curl -I https://api.atlas402.com/api/x402/info
   ```

3. **Check Endpoints**: Verify both `/api/x402/info` and `/api/x402/health` return 200
   ```bash
   curl https://api.atlas402.com/api/x402/info
   curl https://api.atlas402.com/api/x402/health
   ```

4. **Make a Test Payment**: Try accessing a protected endpoint and making a payment
   - This triggers facilitator registration
   - Wait 15 minutes after payment

5. **Check Facilitator**: Query facilitator directly
   ```bash
   curl https://facilitator.payai.network/discovery/resources | grep -i atlas402
   ```

### Still not working?

- Ensure `NEXT_PUBLIC_MERCHANT_URL=https://api.atlas402.com` is set in Vercel
- Check that CORS headers are present (they should be)
- Verify payments are actually being processed and verified
- Contact PayAI support if facilitator registration fails

