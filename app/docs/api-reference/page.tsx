'use client';

import Link from 'next/link';

export default function APIReferencePage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-normal text-black mb-4">
        API Reference
      </h1>

      <p className="text-base text-gray-700 leading-relaxed mb-8">
        Complete API reference for x402 libraries, middleware, and facilitator endpoints.
      </p>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Express Middleware</h2>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-6">
        <h3 className="text-base font-normal text-black mb-3">paymentMiddleware()</h3>
        <p className="text-sm text-gray-700 mb-4">
          Creates Express middleware for x402 payment protection.
        </p>
        
        <h4 className="text-sm font-normal text-black mb-2">Parameters</h4>
        <div className="space-y-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">payTo</code>
            <span className="text-xs text-gray-700 ml-2">string | Record&lt;string, string&gt;</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Wallet address(es) to receive payments</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">routes</code>
            <span className="text-xs text-gray-700 ml-2">Record&lt;string, RouteConfig&gt;</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Route configurations with pricing</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">options</code>
            <span className="text-xs text-gray-700 ml-2">MiddlewareOptions</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Facilitator URL and other settings</p>
          </div>
        </div>

        <h4 className="text-sm font-normal text-black mb-2">Example</h4>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto">
          <pre className="whitespace-pre-wrap">
{`app.use(
  paymentMiddleware(
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bFa0",
    {
      "GET /api/data": {
        price: "$0.001",
        network: "base"
      },
      "/premium/*": {
        price: "$1.00",
        network: "base"
      }
    },
    {
      url: "https://facilitator.payai.network",
      timeout: 5000
    }
  )
);`}
          </pre>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Python Decorators</h2>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-6">
        <h3 className="text-base font-normal text-black mb-3">@require_payment()</h3>
        <p className="text-sm text-gray-700 mb-4">
          Decorator to protect endpoints with x402 payments.
        </p>
        
        <h4 className="text-sm font-normal text-black mb-2">Parameters</h4>
        <div className="space-y-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">price</code>
            <span className="text-xs text-gray-700 ml-2">str | Callable</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Price as dollar string or function</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">network</code>
            <span className="text-xs text-gray-700 ml-2">str</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Blockchain network (base, polygon, solana)</p>
          </div>
        </div>

        <h4 className="text-sm font-normal text-black mb-2">Example</h4>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto">
          <pre className="whitespace-pre-wrap">
{`@app.get("/data")
@require_payment(price="$0.001", network="base")
async def get_data():
    return {"data": "premium content"}

# Dynamic pricing
@app.post("/generate")
@require_payment(
    price=lambda req: "$0.05" if len(req.body) > 1000 else "$1.00",
    network="base"
)
async def generate(request):
    return {"result": "generated content"}`}
          </pre>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Client Library</h2>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-6">
        <h3 className="text-base font-normal text-black mb-3">X402Client</h3>
        <p className="text-sm text-gray-700 mb-4">
          Client for consuming x402-protected services.
        </p>
        
        <h4 className="text-sm font-normal text-black mb-2">Constructor</h4>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto mb-4">
          <pre className="whitespace-pre-wrap">
{`new X402Client(options: X402ClientOptions)`}
          </pre>
        </div>

        <h4 className="text-sm font-normal text-black mb-2">Options</h4>
        <div className="space-y-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">signer</code>
            <span className="text-xs text-gray-700 ml-2">Signer</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Ethers.js signer or wallet instance</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">network</code>
            <span className="text-xs text-gray-700 ml-2">string</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Network to use for payments</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">maxPayment</code>
            <span className="text-xs text-gray-700 ml-2">string (optional)</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Maximum payment per request</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">autoApprove</code>
            <span className="text-xs text-gray-700 ml-2">boolean (optional)</span>
            <p className="text-xs text-gray-700 mt-1 m-0">Auto-approve payments (default: true)</p>
          </div>
        </div>

        <h4 className="text-sm font-normal text-black mb-2">Methods</h4>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">get(url, options?)</code>
            <p className="text-xs text-gray-700 mt-1 m-0">Make GET request with automatic payment</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">post(url, options?)</code>
            <p className="text-xs text-gray-700 mt-1 m-0">Make POST request with automatic payment</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">put(url, options?)</code>
            <p className="text-xs text-gray-700 mt-1 m-0">Make PUT request with automatic payment</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 border border-white/[0.08]">
            <code className="text-xs font-mono text-red-600">delete(url, options?)</code>
            <p className="text-xs text-gray-700 mt-1 m-0">Make DELETE request with automatic payment</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Facilitator API</h2>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-6">
        <h3 className="text-base font-normal text-black mb-3">POST /verify</h3>
        <p className="text-sm text-gray-700 mb-4">
          Verify a blockchain transaction for x402 payment.
        </p>
        
        <h4 className="text-sm font-normal text-black mb-2">Request</h4>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto mb-4">
          <pre className="whitespace-pre-wrap">
{`POST https://facilitator.payai.network/verify
Content-Type: application/json

{
  "txHash": "0x5f2d8a...",
  "network": "base",
  "expectedAmount": "1000000",
  "expectedRecipient": "0x742d35Cc...",
  "tokenAddress": "0x833589fCD6..." // Optional
}`}
          </pre>
        </div>

        <h4 className="text-sm font-normal text-black mb-2">Response</h4>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto">
          <pre className="whitespace-pre-wrap">
{`{
  "valid": true,
  "confirmed": true,
  "amount": "1000000",
  "recipient": "0x742d35Cc...",
  "sender": "0x123...",
  "timestamp": 1704067200,
  "blockNumber": 12345678
}`}
          </pre>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">HTTP Headers</h2>

      <div className="space-y-3 mb-8">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">X-Accept-Payment</h3>
          <p className="text-sm text-gray-700 mb-2">Server indicates payment is required</p>
          <code className="text-xs font-mono bg-[#1E1E1E] text-white/90 px-2 py-1 rounded">
            X-Accept-Payment: pay.base 0.001 USDC
          </code>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">X-Payment-Address</h3>
          <p className="text-sm text-gray-700 mb-2">Wallet address to send payment to</p>
          <code className="text-xs font-mono bg-[#1E1E1E] text-white/90 px-2 py-1 rounded">
            X-Payment-Address: 0x742d35Cc6634C0532925a3b8...
          </code>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">X-Payment-Network</h3>
          <p className="text-sm text-gray-700 mb-2">Blockchain network for payment</p>
          <code className="text-xs font-mono bg-[#1E1E1E] text-white/90 px-2 py-1 rounded">
            X-Payment-Network: base
          </code>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">X-Payment-Proof</h3>
          <p className="text-sm text-gray-700 mb-2">Client provides transaction hash as proof</p>
          <code className="text-xs font-mono bg-[#1E1E1E] text-white/90 px-2 py-1 rounded">
            X-Payment-Proof: 0x5f2d8a...
          </code>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">X-Facilitator-URL</h3>
          <p className="text-sm text-gray-700 mb-2">URL for payment verification</p>
          <code className="text-xs font-mono bg-[#1E1E1E] text-white/90 px-2 py-1 rounded">
            X-Facilitator-URL: https://facilitator.payai.network
          </code>
        </div>
      </div>

      <div className="relative rounded-2xl p-6 text-black not-prose overflow-hidden">
        {/* Enhanced gradient background - black to green */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-[#0a0a0a] via-[#1a1a1a] to-red-600" />
        
        {/* Heavy grain texture overlay - increased for more visibility */}
        <div 
          className="absolute inset-0 opacity-[0.2] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px'
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='7' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px'
          }}
        />
        
        <div className="relative z-10">
          <h3 className="text-lg font-normal mb-2">Need Help?</h3>
          <p className="text-sm opacity-90 mb-4">
            Check out code examples or visit the full PayAI documentation.
          </p>
          <div className="flex gap-3">
            <Link
              href="/docs/examples"
              className="px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-normal hover:shadow-lg transition-all"
            >
              Code Examples
            </Link>
            <a
              href="https://docs.payai.network"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-black rounded-xl text-sm font-normal hover:bg-white/20 transition-all"
            >
              PayAI Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
