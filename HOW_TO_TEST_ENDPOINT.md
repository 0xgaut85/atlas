# How to Test api.atlas402.com/api/atlas-index

## Option 1: Terminal (curl) - Recommended

Open your terminal/PowerShell and run:

```bash
curl https://api.atlas402.com/api/atlas-index
```

**Expected Response (HTTP 402):**
```json
{
  "x402Version": 1,
  "error": null,
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "1000000",
      "resource": "https://api.atlas402.com/api/atlas-index",
      "description": "Payment required for /api/atlas-index",
      "mimeType": "application/json",
      "payTo": "0x8bee703d6214a266e245b0537085b1021e1ccaed",
      "maxTimeoutSeconds": 60,
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "extra": {
        "scheme": "x402+eip712",
        "name": "USDC",
        "version": "2"
      }
    }
  ]
}
```

**To see HTTP status code:**
```bash
curl -I https://api.atlas402.com/api/atlas-index
```
Should return: `HTTP/1.1 402 Payment Required`

## Option 2: Browser

Simply visit in your browser:
```
https://api.atlas402.com/api/atlas-index
```

**Expected:** You'll see the JSON response above (402 Payment Required)

## Option 3: Postman / Insomnia

1. Open Postman or Insomnia
2. Create new GET request
3. URL: `https://api.atlas402.com/api/atlas-index`
4. Send request
5. Should get HTTP 402 with the JSON response

## Option 4: Test with Payment (Full Flow)

To test the full payment flow:

```bash
# Step 1: Make request without payment (should get 402)
curl https://api.atlas402.com/api/atlas-index

# Step 2: Make request with payment header (if you have a valid tx hash)
curl -H "x-payment: {\"transactionHash\":\"YOUR_TX_HASH\",\"network\":\"base\"}" \
     https://api.atlas402.com/api/atlas-index
```

## Verification Checklist

✅ **HTTP Status:** Should be `402 Payment Required`  
✅ **Content-Type:** Should be `application/json`  
✅ **CORS Headers:** Should include `Access-Control-Allow-Origin: *`  
✅ **Schema Format:** Should match x402scan strict schema:
   - `x402Version: 1`
   - `scheme: "exact"`
   - `resource` field present
   - `description` field present
   - `maxTimeoutSeconds: 60`

## If You Get Errors

**404 Not Found:**
- Endpoint not deployed yet
- Wait for Vercel deployment to complete

**SSL Error:**
- DNS not configured yet
- Wait for DNS propagation (can take up to 24 hours)

**500 Internal Server Error:**
- Check Vercel logs
- Verify environment variables are set

**Wrong Response Format:**
- Check deployment logs
- Verify code changes were deployed

