'use client';

import DocStep from '../../components/docs/DocStep';
import CTABox from '../../components/docs/CTABox';

export default function FacilitatorsPage() {
  return (
    <div className="max-w-none">
      <h1 className="text-5xl sm:text-6xl font-normal text-black mb-8 tracking-wide leading-tight">
        Facilitators
      </h1>

      <p className="text-xl text-gray-700 font-normal leading-relaxed mb-16">
        Transaction verification services that enable servers to validate blockchain payments without running full nodes.
      </p>

      <div className="bg-white backdrop-blur-sm rounded-lg p-10 border border-2 border-dashed border-black mb-16">
        <h2 className="text-2xl font-bold text-black mb-4">Overview</h2>
        <p className="text-base text-gray-700 font-normal leading-relaxed">
          Facilitators provide REST APIs that x402 servers query to verify payment validity. 
          This architecture eliminates the need for complex blockchain infrastructure while maintaining trustless verification.
        </p>
      </div>

      <h2 className="text-3xl font-bold text-black mb-8 tracking-wide">Verification Flow</h2>

      <div className="space-y-4 mb-16">
        <DocStep 
          number={1}
          title="Payment Proof Received"
          description="Client submits transaction hash as payment proof via request headers"
        />

        <DocStep 
          number={2}
          title="Facilitator Query"
          description="Server calls facilitator API endpoint to initiate verification"
        />

        <DocStep 
          number={3}
          title="On-Chain Validation"
          description="Facilitator queries the blockchain to verify transaction authenticity and details"
        />

        <DocStep 
          number={4}
          title="Result Returned"
          description="Facilitator sends verification status back to the requesting server"
        />
      </div>

      <h2 className="text-3xl font-bold text-black mb-8 tracking-wide">API Specification</h2>

      <p className="text-base text-gray-700 font-normal mb-6">
        The PayAI facilitator exposes a simple REST endpoint:
      </p>

      <div className="bg-white backdrop-blur-sm rounded-lg p-8 border border-2 border-dashed border-black mb-8">
        <h3 className="text-lg font-bold text-black mb-4">Verify Transaction</h3>
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-red-600/20 text-red-600 rounded text-sm font-bold">POST</span>
          <code className="text-sm font-mono text-gray-300">https://facilitator.payai.network/verify</code>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-700 font-normal mb-3">Request Body:</p>
          <div className="bg-black rounded-lg p-5 font-mono text-sm text-gray-300 border border-white/[0.08] overflow-x-auto">
            <pre className="whitespace-pre-wrap">
{`{
  "txHash": "0x5f2d8a...",
  "network": "base",
  "expectedAmount": "1000000",
  "expectedRecipient": "0x742d35Cc...",
  "tokenAddress": "0x833589fCD6..."
}`}
            </pre>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700 font-normal mb-3">Response:</p>
          <div className="bg-black rounded-lg p-5 font-mono text-sm text-gray-300 border border-white/[0.08] overflow-x-auto">
            <pre className="whitespace-pre-wrap">
{`{
  "valid": true,
  "verified": true,
  "tx": {
    "hash": "0x5f2d8a...",
    "from": "0x123...",
    "to": "0x742d35Cc...",
    "amount": "1000000",
    "timestamp": 1706123456
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-black mb-8 tracking-wide">Implementation</h2>

      <div className="bg-white backdrop-blur-sm rounded-lg p-8 border border-2 border-dashed border-black mb-16">
        <h3 className="text-lg font-bold text-black mb-4">Server Integration</h3>
        <div className="bg-black rounded-lg p-5 font-mono text-sm text-gray-300 border border-white/[0.08] overflow-x-auto">
          <pre className="whitespace-pre-wrap">
{`import { X402Middleware } from '@payai/x402-server';

const middleware = new X402Middleware({
  payTo: "0x742d35Cc...",
  facilitatorUrl: "https://facilitator.payai.network",
  network: "base"
});

app.use('/api/*', middleware.verify);`}
          </pre>
        </div>
      </div>

      <CTABox 
        title="Deploy a Facilitator"
        description="Want to run your own facilitator? Check out the open-source implementation and deployment guides."
        buttonText="View on GitHub"
        buttonHref="https://github.com/nova402/facilitator"
      />
    </div>
  );
}
