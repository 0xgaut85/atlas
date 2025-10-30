# x402scan.com Resources to Register

All endpoints below return HTTP 402 Payment Required and should be registered on https://www.x402scan.com/resources/register

**Base URL:** `https://api.atlas402.com`

---

## ✅ REQUIRED RESOURCES (Payment Endpoints)

### 1. Atlas Index - Service Discovery
**URL:** `https://api.atlas402.com/api/atlas-index`  
**Method:** GET  
**Price:** $1.00 USDC  
**Description:** Discover and test x402 services across categories  
**Status:** ✅ Already registered

---

### 2. Atlas Operator
**URL:** `https://api.atlas402.com/api/atlas-operator`  
**Method:** GET  
**Price:** $1.00 USDC  
**Description:** Autonomous AI operator with x402 access  
**Note:** Returns 402 when no payment header

---

### 3. Atlas Foundry - Token Creation
**URL:** `https://api.atlas402.com/api/token/create`  
**Method:** POST  
**Price:** $10.00 USDC  
**Description:** Create and deploy x402-protected tokens  
**Note:** POST endpoint - may need special handling on x402scan

---

### 4. Atlas Mesh - Service Registration
**URL:** `https://api.atlas402.com/api/mesh/register`  
**Method:** POST  
**Price:** $50.00 USDC  
**Description:** Register x402 services for discovery  
**Note:** POST endpoint - may need special handling on x402scan

---

### 5. Service Payment (Variable)
**URL:** `https://api.atlas402.com/api/x402/payment/service-payment`  
**Method:** POST  
**Price:** Variable (sent in request body)  
**Description:** Generic service payment endpoint for variable amounts  
**Note:** Used for various service payments

---

### 6. Operator Protocol Fee
**URL:** `https://api.atlas402.com/api/x402/payment/operator-fee`  
**Method:** POST  
**Price:** $1.00 USDC  
**Description:** Protocol fee for Atlas Operator actions

---

### 7. Mint Fee
**URL:** `https://api.atlas402.com/api/x402/payment/mint-fee`  
**Method:** POST  
**Price:** $0.25 USDC  
**Description:** Mint fee payment for token minting

---

### 8. Token Mint (Dynamic)
**URL Pattern:** `https://api.atlas402.com/api/token/[contractAddress]/mint`  
**Method:** GET  
**Price:** Variable (depends on token)  
**Description:** Mint x402-protected tokens  
**Note:** Dynamic endpoint - register individual token mint endpoints as resources

**Example:**
- `https://api.atlas402.com/api/token/0x1234.../mint`

---

## 📋 Registration Instructions

For each resource URL above:

1. Go to: **https://www.x402scan.com/resources/register**
2. **Resource URL:** Paste the full URL (e.g., `https://api.atlas402.com/api/atlas-index`)
3. **Headers:** Leave empty (no custom headers needed)
4. **Validation Schema:** Leave empty (optional)
5. Click **"Add Resource"**

---

## ⚠️ Important Notes

### For POST Endpoints:
- Some endpoints are POST (token/create, mesh/register, payment endpoints)
- x402scan may have limitations for POST endpoints
- Test with GET first if available, or register as-is

### For Dynamic Endpoints:
- Token mint endpoints (`/api/token/[contractAddress]/mint`) are dynamic
- Each deployed token creates a new mint endpoint
- Consider registering the pattern or individual tokens as they're deployed

### Verification:
After registration, test each endpoint with:
```bash
curl https://api.atlas402.com/api/atlas-index
```
Should return HTTP 402 with payment requirements.

---

## 🔄 Transaction Visibility

Once registered, all payments to these endpoints will:
1. ✅ Call PayAI facilitator `/verify` endpoint
2. ✅ Be tracked by facilitator
3. ✅ Appear on x402scan.com after sync (~5-15 minutes)
4. ✅ Show transaction history on your server page

---

## 📊 Summary

**Total Endpoints to Register:** 8+ (includes dynamic token mint endpoints)

**Priority Order:**
1. ✅ `/api/atlas-index` (already done)
2. `/api/atlas-operator` 
3. `/api/token/create`
4. `/api/mesh/register`
5. `/api/x402/payment/service-payment`
6. `/api/x402/payment/operator-fee`
7. `/api/x402/payment/mint-fee`
8. Individual `/api/token/[contractAddress]/mint` endpoints (as tokens are deployed)

