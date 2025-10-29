'use client';

import Link from 'next/link';

export default function ClientPage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-normal text-black mb-4">
        Client Integration
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

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const client = new X402Client({
  signer,
  network: 'base'
});

const response = await client.get('https://api.example.com/data');
const data = await response.json();`}
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

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`from x402 import X402Client
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
account = w3.eth.account.from_key('your-private-key')

client = X402Client(signer=account, network='base')
response = client.get('https://api.example.com/data')
data = response.json()`}
        </pre>
      </div>

      <div className="relative rounded-2xl p-6 text-black not-prose overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-[#0a0a0a] via-[#1a1a1a] to-red-600" />
        <div className="relative z-10">
          <h3 className="text-lg font-normal mb-2">Learn More</h3>
          <p className="text-sm opacity-90 mb-4">
            Check out code examples and understand the payment flow in detail.
          </p>
          <div className="flex gap-3">
            <Link
              href="/docs/integration/payment-flow"
              className="px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-normal hover:shadow-lg transition-all"
            >
              Payment Flow
            </Link>
            <Link
              href="/docs/reference/api"
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-black rounded-xl text-sm font-normal hover:bg-white/20 transition-all"
            >
              API Reference
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

