# Troubleshooting x402scan Registration

## Issue: "Failed to add resource" on x402scan.com

### Current Status
- ✅ Endpoint: `https://api.atlas402.com/api/atlas-index`
- ✅ Returns HTTP 402
- ✅ Schema includes all required fields
- ✅ CORS headers enabled
- ❌ x402scan validation fails

## Possible Issues & Solutions

### 1. Multiple Networks Issue
**Problem:** x402scan might not accept endpoints with multiple networks (Base + Solana) in the same `accepts` array.

**Solution:** Try registering Base-only endpoint first, or create separate endpoints per network.

**Test:** Register `https://api.atlas402.com/api/atlas-index?network=base` (if we support query params)

### 2. Error Field Format
**Problem:** x402scan might prefer `error` field to be omitted rather than `null`.

**Current:**
```json
{
  "x402Version": 1,
  "error": null,
  "accepts": [...]
}
```

**Alternative:**
```json
{
  "x402Version": 1,
  "accepts": [...]
}
```

### 3. Resource URL Must Match Exactly
**Problem:** The `resource` field must exactly match the URL being requested.

**Current:** We use `url.toString()` which includes the full URL with protocol.

**Verify:** Make sure `resource` field exactly matches: `https://api.atlas402.com/api/atlas-index`

### 4. Headers Issue
**Problem:** x402scan might check specific headers.

**Current Headers:**
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type, x-payment`

**Try:** Make sure all CORS headers are present when x402scan fetches from their backend.

### 5. SSL Certificate Issue
**Problem:** x402scan might verify SSL certificate validity.

**Check:**
```bash
curl -vI https://api.atlas402.com/api/atlas-index
```

Should show valid SSL certificate.

### 6. Network-Specific Registration
**Try:** Register each network separately:
- Base: `https://api.atlas402.com/api/atlas-index` (with only Base in accepts)
- Solana: Create separate endpoint or modify to return only Solana

## Immediate Actions

1. **Check x402scan GitHub Issues**
   - Visit: https://github.com/Merit-Systems/x402scan/issues
   - Search for similar registration failures
   - Open an issue with your endpoint URL and response

2. **Test with Single Network**
   - Temporarily modify endpoint to return only Base network
   - Try registration again

3. **Verify from Their Backend**
   - x402scan fetches from their backend, not browser
   - Test with `curl` from different IP/location
   - Check if response is accessible

4. **Remove `error` field**
   - Try omitting `error` field completely instead of `null`

5. **Check x402scan Logs/Docs**
   - Review their validation code in GitHub repo
   - Check their sync service code for validation logic

## Alternative: Wait for Automatic Discovery

Since you're using PayAI facilitator, after your first real payment:
1. PayAI facilitator will auto-register you
2. x402scan syncs from facilitator every ~15 minutes
3. You should appear automatically without manual registration

**Timeline:**
- First payment → PayAI registration (1-2 min)
- x402scan sync → Auto-discovery (5-15 min)
- Visible on x402scan.com → ~15 minutes total

## Next Steps

1. Make a test payment on your endpoint
2. Wait 15 minutes
3. Check x402scan.com for auto-discovery
4. If still not appearing, open GitHub issue with:
   - Your endpoint URL
   - Full 402 response JSON
   - curl output showing headers
   - Any error messages from x402scan

