'use client';

import Link from 'next/link';

export default function PaymentFlowPage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-normal text-black mb-4">
        Payment Flow
      </h1>

      <p className="text-base text-gray-700 leading-relaxed mb-8">
        Understand how x402 handles payments end-to-end, from initial request to service delivery.
      </p>

      <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-2 border-dashed border-black mb-8 not-prose">
        <h2 className="text-lg font-normal text-black mb-2">The x402 Payment Protocol</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          x402 uses HTTP 402 "Payment Required" status code to negotiate payments between clients and servers.
          The entire flow is automatic when using x402 client libraries.
        </p>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Step-by-Step Flow</h2>

      <div className="space-y-4 mb-8">
        <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              1
            </div>
            <h3 className="text-base font-normal text-black m-0">Client Initiates Request</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Client makes a standard HTTP request to a protected endpoint:
          </p>
          <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
            <pre className="whitespace-pre-wrap">
{`GET /api/premium-data HTTP/1.1
Host: api.example.com
Accept: application/json`}
            </pre>
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              2
            </div>
            <h3 className="text-base font-normal text-black m-0">Server Returns 402</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Server responds with HTTP 402 and payment instructions in headers:
          </p>
          <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto">
            <pre className="whitespace-pre-wrap">
{`HTTP/1.1 402 Payment Required
X-Accept-Payment: pay.base 0.001 USDC
X-Payment-Address: 0x742d35Cc6634C0532925a3b8...
X-Payment-Network: base
X-Facilitator-URL: https://facilitator.payai.network
Content-Type: application/json

{
  "error": "Payment required",
  "price": "0.001 USDC",
  "network": "base"
}`}
            </pre>
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              3
            </div>
            <h3 className="text-base font-normal text-black m-0">Client Parses Payment Info</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            x402 client library extracts payment details from the response headers:
          </p>
          <ul className="text-sm text-gray-700 space-y-1 m-0">
            <li>• Payment amount: 0.001 USDC</li>
            <li>• Recipient address: 0x742d35Cc...</li>
            <li>• Network: Base</li>
            <li>• Facilitator URL for verification</li>
          </ul>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              4
            </div>
            <h3 className="text-base font-normal text-black m-0">Create Transaction</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Client creates a blockchain transaction:
          </p>
          <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto">
            <pre className="whitespace-pre-wrap">
{`{
  "from": "0xClientWalletAddress",
  "to": "0x742d35Cc6634C0532925a3b8...",
  "value": "0",
  "data": "0x..." // USDC transfer call data
}`}
            </pre>
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              5
            </div>
            <h3 className="text-base font-normal text-black m-0">Sign & Broadcast</h3>
          </div>
          <p className="text-sm text-gray-700 m-0">
            User's wallet signs the transaction and broadcasts it to the blockchain. Transaction settles in seconds.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              6
            </div>
            <h3 className="text-base font-normal text-black m-0">Retry with Proof</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Client retries the original request with payment proof:
          </p>
          <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto">
            <pre className="whitespace-pre-wrap">
{`GET /api/premium-data HTTP/1.1
Host: api.example.com
X-Payment-Proof: 0x5f2d8a...transaction_hash
X-Payment-Network: base
Accept: application/json`}
            </pre>
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              7
            </div>
            <h3 className="text-base font-normal text-black m-0">Server Validates Payment</h3>
          </div>
          <p className="text-sm text-gray-700 m-0">
            Server queries the blockchain (via facilitator) to verify the transaction is valid, confirmed, and matches the required payment.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              8
            </div>
            <h3 className="text-base font-normal text-black m-0">Service Delivered</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Payment verified! Server processes the request and returns the resource:
          </p>
          <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
            <pre className="whitespace-pre-wrap">
{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": "Premium content here",
  "timestamp": "2025-01-01T00:00:00Z"
}`}
            </pre>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Payment Verification</h2>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-4">
        <h3 className="text-sm font-normal text-black mb-3">On-Chain Verification</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          The facilitator verifies payments by querying the blockchain directly. It checks:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mt-2 mb-0">
          <li>• Transaction is confirmed on-chain</li>
          <li>• Recipient address matches</li>
          <li>• Amount matches or exceeds required payment</li>
          <li>• Transaction hasn't been used before (no replay attacks)</li>
        </ul>
      </div>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-8">
        <h3 className="text-sm font-normal text-black mb-3">Facilitator Role</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Facilitators are services that help verify payments without requiring servers to run blockchain nodes.
          They provide a simple API to check if a transaction hash is valid.
        </p>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Edge Cases</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8 not-prose">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Insufficient Payment</h3>
          <p className="text-sm text-gray-700">
            If payment is less than required, server returns 402 again with the remaining amount needed.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Network Mismatch</h3>
          <p className="text-sm text-gray-700">
            Client must pay on the correct network specified by the server, or request fails.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Unconfirmed Transaction</h3>
          <p className="text-sm text-gray-700">
            Server may accept pending transactions or require confirmation depending on configuration.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Replay Attack Prevention</h3>
          <p className="text-sm text-gray-700">
            Each transaction hash can only be used once. Servers track used transaction hashes.
          </p>
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
          <h3 className="text-lg font-normal mb-2">Dive Deeper</h3>
          <p className="text-sm opacity-90 mb-4">
            Learn about facilitators and see code examples of the complete flow.
          </p>
          <div className="flex gap-3">
            <Link
              href="/docs/facilitators"
              className="px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-normal hover:shadow-lg transition-all"
            >
              Facilitators Guide
            </Link>
            <Link
              href="/docs/examples"
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-black rounded-xl text-sm font-normal hover:bg-white/20 transition-all"
            >
              Code Examples
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

