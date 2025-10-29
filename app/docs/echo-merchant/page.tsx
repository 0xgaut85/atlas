'use client';

import Link from 'next/link';

export default function EchoMerchantPage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-normal text-black mb-4">
        Echo Merchant
      </h1>

      <p className="text-base text-gray-700 leading-relaxed mb-8">
        A free testing service to validate your x402 client implementation. Test payment flows without spending real crypto.
      </p>

      <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-2 border-dashed border-black mb-8 not-prose">
        <h2 className="text-lg font-normal text-black mb-2">What is Echo Merchant?</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Echo Merchant is a publicly available x402 test server that responds with HTTP 402 but doesn't require actual payment. 
          Perfect for testing your client implementation before deploying to production.
        </p>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Endpoints</h2>

      <div className="space-y-3 mb-8">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-normal">GET</span>
            <code className="text-sm font-mono text-black">https://echo.payai.network/echo</code>
          </div>
          <p className="text-sm text-gray-700 m-0">
            Returns the request body as JSON response. Use this to test basic x402 flow.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-red-600/10 text-red-600 rounded text-xs font-normal">POST</span>
            <code className="text-sm font-mono text-black">https://echo.payai.network/echo</code>
          </div>
          <p className="text-sm text-gray-700 m-0">
            Echoes back the POST body. Test payment flow with request payloads.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Testing Your Client</h2>

      <p className="text-sm text-gray-700 mb-4">
        Use Echo Merchant to verify your x402 client handles the payment flow correctly:
      </p>

      <div className="space-y-4 mb-8">
        <div className="flex gap-4 bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-sm font-normal">
            1
          </div>
          <div>
            <h3 className="text-sm font-normal text-black mb-1">Make Initial Request</h3>
            <p className="text-sm text-gray-700 m-0">
              Your client makes a request to Echo Merchant without payment proof
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-sm font-normal">
            2
          </div>
          <div>
            <h3 className="text-sm font-normal text-black mb-1">Receive 402 Response</h3>
            <p className="text-sm text-gray-700 m-0">
              Server responds with HTTP 402 and payment headers
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-sm font-normal">
            3
          </div>
          <div>
            <h3 className="text-sm font-normal text-black mb-1">Parse Payment Instructions</h3>
            <p className="text-sm text-gray-700 m-0">
              Your client should parse the payment headers correctly
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-sm font-normal">
            4
          </div>
          <div>
            <h3 className="text-sm font-normal text-black mb-1">Simulate Payment</h3>
            <p className="text-sm text-gray-700 m-0">
              Echo Merchant accepts any payment proof format for testing
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-black rounded-lg flex items-center justify-center text-sm font-normal">
            5
          </div>
          <div>
            <h3 className="text-sm font-normal text-black mb-1">Retry & Get Response</h3>
            <p className="text-sm text-gray-700 m-0">
              Retry with payment proof header and receive the actual response
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Example with cURL</h2>

      <p className="text-sm text-gray-700 mb-4">
        Test the basic flow with cURL:
      </p>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-4">
        <p className="text-xs font-normal text-gray-600 mb-2">Initial Request (no payment)</p>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
          <pre className="whitespace-pre-wrap">
{`curl -v https://echo.payai.network/echo`}
          </pre>
        </div>
        <p className="text-xs text-gray-700 mt-3 m-0">
          Response: HTTP 402 with payment headers
        </p>
      </div>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-8">
        <p className="text-xs font-normal text-gray-600 mb-2">Retry with Payment Proof</p>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
          <pre className="whitespace-pre-wrap">
{`curl https://echo.payai.network/echo \\
  -H "X-Payment-Proof: test-proof-123" \\
  -H "X-Payment-Network: base-sepolia"`}
          </pre>
        </div>
        <p className="text-xs text-gray-700 mt-3 m-0">
          Response: HTTP 200 with echoed content
        </p>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Example with JavaScript</h2>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`const response1 = await fetch('https://echo.payai.network/echo');

if (response1.status === 402) {
  // Parse payment instructions
  const paymentHeader = response1.headers.get('X-Accept-Payment');
  const paymentAddress = response1.headers.get('X-Payment-Address');
  
  console.log('Payment required:', paymentHeader);
  
  // Retry with mock payment proof
  const response2 = await fetch('https://echo.payai.network/echo', {
    headers: {
      'X-Payment-Proof': 'test-signature-123',
      'X-Payment-Network': 'base-sepolia'
    }
  });
  
  const data = await response2.json();
  console.log('Success:', data);
}`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Next Steps</h2>

      <p className="text-sm text-gray-700 mb-4">
        Once you've validated your x402 client against Echo Merchant:
      </p>

      <ul className="text-sm text-gray-700 space-y-2 mb-8">
        <li>Use proper x402 client libraries for production</li>
        <li>Connect to real services on Atlas402 marketplace</li>
        <li>Implement actual blockchain transaction signing</li>
        <li>Handle payment confirmations and errors properly</li>
      </ul>

      <div className="relative rounded-2xl p-6 text-black not-prose overflow-hidden">
        {/* Enhanced gradient background - black to yellow */}
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
          <h3 className="text-lg font-normal mb-2">Ready for Production?</h3>
          <p className="text-sm opacity-90 mb-4">
            Learn how to integrate real x402 clients into your applications.
          </p>
          <Link
            href="/docs/clients"
            className="inline-block px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-normal hover:shadow-lg transition-all"
          >
            Client Integration Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
