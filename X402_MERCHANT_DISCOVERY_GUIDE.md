# 🎯 x402 Merchant Discovery - Deployment Guide

## ✅ Code Changes Complete

All necessary code changes have been implemented to make **Atlas402** visible on [x402scan.com](https://www.x402scan.com/) as a merchant.

### Files Created:
1. ✅ `app/api/x402/info/route.ts` - Merchant discovery endpoint
2. ✅ `app/api/x402/health/route.ts` - Health monitoring endpoint
3. ✅ `vercel.json` - CORS configuration for x402 protocol

### Files Updated:
1. ✅ `lib/x402-config.ts` - Added merchant URL configuration

### Protected API Routes (Already Configured):
- ✅ `/api/service-hub` - Returns 402 without payment
- ✅ `/api/token-indexer` - Returns 402 without payment  
- ✅ `/api/agent` - Returns 402 without payment

---

## 🚀 Next Steps: Deploy to Production

### 1. Add Environment Variable to Vercel

Go to your Vercel Dashboard:
1. Navigate to your project
2. Go to **Settings** → **Environment Variables**
3. Add this variable:
   - **Key**: `NEXT_PUBLIC_MERCHANT_URL`
   - **Value**: `https://api.atlas402.com`
   - **Environment**: Production, Preview, Development (all)

### 2. Configure DNS for api.atlas402.com

**In your domain registrar** (where you manage atlas402.com DNS):

Add a CNAME record:
```
Type:  CNAME
Name:  api
Value: cname.vercel-dns.com
TTL:   3600 (or default)
```

### 3. Add Domain in Vercel

In Vercel Dashboard:
1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `api.atlas402.com`
4. Vercel will verify DNS and issue SSL certificate (5-15 minutes)

### 4. Deploy Your Changes

```bash
git add .
git commit -m "Add x402 merchant discovery endpoints for x402scan.com"
git push origin main
```

Vercel will automatically deploy your changes.

---

## 🧪 Testing After Deployment

### Test Your Public Endpoints

Once deployed and DNS is configured, test these URLs:

**1. Merchant Info Endpoint:**
```bash
curl https://api.atlas402.com/api/x402/info
```

Should return:
```json
{
  "name": "Nova402 / Atlas402",
  "description": "AI Agent marketplace with x402-gated dApp features",
  "version": "1.0.0",
  "services": [...],
  "payment": {
    "wallet": "0x8bee703d6214a266e245b0537085b1021e1ccaed",
    "networks": ["base"],
    "facilitator": "https://facilitator.payai.network"
  }
}
```

**2. Health Check Endpoint:**
```bash
curl https://api.atlas402.com/api/x402/health
```

Should return:
```json
{
  "status": "operational",
  "timestamp": "2025-10-28T...",
  "merchant": "api.atlas402.com"
}
```

**3. Protected Endpoint (Should Return 402):**
```bash
curl https://api.atlas402.com/api/service-hub
```

Should return:
```json
{
  "error": "Payment Required",
  "message": "x402 payment required to access this resource"
}
```

---

## 📊 How Discovery Works

### Automatic Registration Process:

1. **User Makes First Payment**
   - When someone pays $1.00 USDC on your site
   - Your API calls PayAI facilitator's `/verify` endpoint
   - Facilitator records `api.atlas402.com` as active merchant

2. **x402scan.com Discovery**
   - x402scan periodically queries facilitator's `/list` endpoint
   - Gets list of all active merchants
   - Discovers `api.atlas402.com`

3. **You Appear on Scanner**
   - Merchant name: **Nova402 / Atlas402**
   - URL: `api.atlas402.com`
   - Services: 4 endpoints ($1.00 each)
   - Network: Base mainnet
   - Wallet: `0x8bee...caed`

### Timeline:
- ⏱️ First payment triggers registration: **Immediate**
- ⏱️ x402scan sync: **5-10 minutes**
- ⏱️ Visible on https://www.x402scan.com/: **~15 minutes after first payment**

---

## 🔍 Verify Your Registration

### After your first real payment transaction:

1. Wait 10-15 minutes
2. Visit https://www.x402scan.com/
3. Search for:
   - `api.atlas402.com`
   - `Atlas402`
   - `Nova402`
4. Your merchant should appear with all service details

---

## 📝 Important Notes

✅ **No manual registration required** - The facilitator automatically tracks merchants  
✅ **Discovery is automatic** - First payment triggers registration  
✅ **All existing code works** - No changes to payment flow  
✅ **Subdomain is optional** - But recommended for clean separation  
✅ **SSL/HTTPS required** - Vercel handles this automatically  

---

## 🎯 Current Status

- ✅ Code implementation: **Complete**
- ⏳ DNS configuration: **Pending** (you need to add CNAME)
- ⏳ Vercel domain setup: **Pending** (you need to add domain)
- ⏳ Environment variable: **Pending** (you need to add to Vercel)
- ⏳ Deployment: **Pending** (ready to deploy)
- ⏳ First payment: **Pending** (will trigger discovery)
- ⏳ x402scan listing: **Pending** (after first payment)

---

## 🚨 Checklist Before Going Live

- [ ] Add `NEXT_PUBLIC_MERCHANT_URL` to Vercel environment variables
- [ ] Add CNAME record: `api` → `cname.vercel-dns.com` in DNS
- [ ] Add `api.atlas402.com` domain in Vercel dashboard
- [ ] Wait for SSL certificate provisioning (5-15 minutes)
- [ ] Deploy code to production (git push)
- [ ] Test `/api/x402/info` endpoint
- [ ] Test `/api/x402/health` endpoint  
- [ ] Test a protected endpoint returns 402
- [ ] Make first real payment on your site
- [ ] Wait 10-15 minutes
- [ ] Check x402scan.com for your merchant listing

---

## 💰 Revenue Tracking

Once live, you can track:
- Total merchants using your facilitator
- Payment volume through your endpoints
- Active sessions across all services
- Revenue from $1.00 payments

All visible on x402scan.com merchant dashboard.

---

## 🔗 Useful Links

- **Your merchant info**: https://api.atlas402.com/api/x402/info
- **x402scan explorer**: https://www.x402scan.com/
- **PayAI docs**: https://docs.payai.network/x402/
- **Your facilitator**: https://facilitator.payai.network

---

## ❓ FAQ

**Q: Do I need to register manually on x402scan.com?**  
A: No, discovery is automatic after your first payment.

**Q: Can I use my main domain instead of api.atlas402.com?**  
A: Yes, but a subdomain is cleaner and recommended.

**Q: When will I appear on x402scan?**  
A: 10-15 minutes after your first real payment transaction.

**Q: What if I don't appear on the scanner?**  
A: Check that:
- Your domain is publicly accessible via HTTPS
- Your protected endpoints return 402 status
- You've made at least one real payment
- DNS and SSL are properly configured

---

**Ready to Deploy!** 🚀

All code is complete. Just follow the deployment steps above to go live!

