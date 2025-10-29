'use client';

import Link from 'next/link';

export default function ClientsPage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-normal text-black mb-4">
        Client Libraries
      </h1>

      <p className="text-base text-gray-700 leading-relaxed mb-8">
        Integrate x402 payments into your applications using our client libraries. Automatic payment handling for HTTP requests.
      </p>

      <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-2 border-dashed border-black mb-8 not-prose">
        <h2 className="text-lg font-normal text-black mb-2">How Client Libraries Work</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          x402 client libraries automatically handle the HTTP 402 payment flow. When you make a request to a protected endpoint,
          the library detects the 402 response, creates a payment transaction, and retries the request with payment proof.
        </p>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">JavaScript / TypeScript</h2>

      <p className="text-sm text-gray-700 mb-4">
        Install the x402 client for Node.js or browser environments:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-4 not-prose">
        <code>npm install x402-client</code>
      </div>

      <h3 className="text-lg font-normal text-black mb-3">Basic Usage</h3>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-6 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`import { X402Client } from 'x402-client';
import { ethers } from 'ethers';

// Initialize with your wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const client = new X402Client({
  signer,
  network: 'base'
});

// Make paid requests automatically
const response = await client.get('https://api.example.com/data');
const data = await response.json();

console.log(data);`}
        </pre>
      </div>

      <h3 className="text-lg font-normal text-black mb-3">POST Requests</h3>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-6 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`// POST with automatic payment
const response = await client.post(
  'https://api.example.com/generate',
  {
    body: JSON.stringify({ prompt: 'Generate image' }),
    headers: { 'Content-Type': 'application/json' }
  }
);

const result = await response.json();`}
        </pre>
      </div>

      <h3 className="text-lg font-normal text-black mb-3">React Integration</h3>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`import { X402Provider, useX402 } from 'x402-react';
import { useWallet } from '@solana/wallet-adapter-react';

function App() {
  const { signer } = useWallet();
  
  return (
    <X402Provider signer={signer} network="solana">
      <YourApp />
    </X402Provider>
  );
}

function YourComponent() {
  const { client } = useX402();
  
  const fetchData = async () => {
    const response = await client.get('https://api.example.com/data');
    const data = await response.json();
    return data;
  };
  
  // Use in your component
}`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Python</h2>

      <p className="text-sm text-gray-700 mb-4">
        Install the Python client library:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-4 not-prose">
        <code>pip install x402-python-client</code>
      </div>

      <h3 className="text-lg font-normal text-black mb-3">Basic Usage</h3>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-6 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`from x402 import X402Client
from web3 import Web3

# Initialize client
w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
account = w3.eth.account.from_key('your-private-key')

client = X402Client(
    signer=account,
    network='base'
)

# Make paid request
response = client.get('https://api.example.com/data')
data = response.json()

print(data)`}
        </pre>
      </div>

      <h3 className="text-lg font-normal text-black mb-3">Async Support</h3>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`from x402 import AsyncX402Client

async def fetch_data():
    client = AsyncX402Client(signer=account, network='base')
    
    response = await client.get('https://api.example.com/data')
    data = await response.json()
    
    return data

# Use with asyncio
import asyncio
data = asyncio.run(fetch_data())`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Configuration Options</h2>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-4">
        <h3 className="text-sm font-normal text-black mb-3">Network Selection</h3>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
          <pre className="whitespace-pre-wrap">
{`const client = new X402Client({
  signer,
  network: 'base', // or 'solana', 'polygon', 'bsc'
  rpcUrl: 'https://mainnet.base.org' // optional custom RPC
});`}
          </pre>
        </div>
      </div>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-4">
        <h3 className="text-sm font-normal text-black mb-3">Payment Limits</h3>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
          <pre className="whitespace-pre-wrap">
{`const client = new X402Client({
  signer,
  network: 'base',
  maxPayment: '0.1', // Maximum payment per request (in ETH)
  autoApprove: false // Require manual approval for each payment
});`}
          </pre>
        </div>
      </div>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-8">
        <h3 className="text-sm font-normal text-black mb-3">Custom Headers</h3>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
          <pre className="whitespace-pre-wrap">
{`const response = await client.get(
  'https://api.example.com/data',
  {
    headers: {
      'Authorization': 'Bearer token',
      'Custom-Header': 'value'
    }
  }
);`}
          </pre>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Error Handling</h2>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`try {
  const response = await client.get('https://api.example.com/data');
  const data = await response.json();
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Not enough balance for payment');
  } else if (error.code === 'PAYMENT_REJECTED') {
    console.error('User rejected payment');
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Advanced Features</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8 not-prose">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Payment Caching</h3>
          <p className="text-sm text-gray-700">
            Automatically cache payment proofs to avoid redundant payments for the same resource
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Retry Logic</h3>
          <p className="text-sm text-gray-700">
            Built-in retry mechanism for failed payments and network issues
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Multi-Network</h3>
          <p className="text-sm text-gray-700">
            Support for multiple blockchain networks with automatic network detection
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">TypeScript Types</h3>
          <p className="text-sm text-gray-700">
            Full TypeScript support with comprehensive type definitions
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
          <h3 className="text-lg font-normal mb-2">Learn More</h3>
          <p className="text-sm opacity-90 mb-4">
            Check out code examples and understand the payment flow in detail.
          </p>
          <div className="flex gap-3">
            <Link
              href="/docs/examples"
              className="px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-normal hover:shadow-lg transition-all"
            >
              Code Examples
            </Link>
            <Link
              href="/docs/payment-flow"
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-black rounded-xl text-sm font-normal hover:bg-white/20 transition-all"
            >
              Payment Flow
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
