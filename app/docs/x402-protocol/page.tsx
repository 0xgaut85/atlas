'use client';

import Link from 'next/link';
import DocStep from '../../components/docs/DocStep';
import CTABox from '../../components/docs/CTABox';

export default function X402ProtocolPage() {
  return (
    <div className="max-w-none">
      <h1 className="text-5xl sm:text-6xl font-normal text-black mb-8 tracking-wide leading-tight">
        x402 Protocol
      </h1>

      <p className="text-xl text-gray-700 font-normal leading-relaxed mb-16">
        The HTTP 402 payment protocol reimagined for the blockchain era. Native micropayments for every HTTP request.
      </p>

      <div className="bg-white backdrop-blur-sm rounded-lg p-10 border border-2 border-dashed border-black mb-16">
        <h2 className="text-2xl font-bold text-black mb-4">Protocol Vision</h2>
        <p className="text-base text-gray-700 font-normal leading-relaxed">
          HTTP 402 "Payment Required" was defined in HTTP/1.1 but never implemented. x402 brings this vision to reality using blockchain technology, enabling instant trustless micropayments at internet scale.
        </p>
      </div>

      <h2 className="text-3xl font-bold text-black mb-8 tracking-wide">Request Flow</h2>

      <div className="space-y-4 mb-16">
        <DocStep 
          number={1}
          title="Client Request"
          description="Client sends HTTP request to an x402-protected API endpoint"
        />

        <DocStep 
          number={2}
          title="402 Response"
          description="Server returns HTTP 402 with payment instructions: amount, address, and accepted tokens"
        />

        <DocStep 
          number={3}
          title="Payment Execution"
          description="Client creates and signs blockchain transaction to specified payment address"
        />

        <DocStep 
          number={4}
          title="Proof Submission"
          description="Client retries request with transaction signature as payment proof in headers"
        />

        <DocStep 
          number={5}
          title="Validation & Response"
          description="Server verifies payment on-chain and returns requested resource if valid"
        />
      </div>

      <h2 className="text-3xl font-bold text-black mb-8 tracking-wide">Core Advantages</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-8 border border-white/[0.12]">
          <h3 className="text-lg font-bold text-black mb-3">True Micropayments</h3>
          <p className="text-base text-gray-700 font-normal leading-relaxed">
            Charge $0.0001 per request. Traditional payment rails collapse at this scale.
          </p>
        </div>

        <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-8 border border-white/[0.12]">
          <h3 className="text-lg font-bold text-black mb-3">Sub-Second Settlement</h3>
          <p className="text-base text-gray-700 font-normal leading-relaxed">
            Payments finalize on-chain in under a second. No multi-day clearing windows.
          </p>
        </div>

        <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-8 border border-white/[0.12]">
          <h3 className="text-lg font-bold text-black mb-3">Borderless Commerce</h3>
          <p className="text-base text-gray-700 font-normal leading-relaxed">
            Anyone with a wallet can transact. No geographic restrictions or card networks.
          </p>
        </div>

        <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-8 border border-white/[0.12]">
          <h3 className="text-lg font-bold text-black mb-3">Machine Economy Ready</h3>
          <p className="text-base text-gray-700 font-normal leading-relaxed">
            Perfect for AI agents and autonomous systems that need to pay for services.
          </p>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-black mb-8 tracking-wide">Multi-Chain Support</h2>

      <div className="grid md:grid-cols-3 gap-4 mb-16">
        {[
          { name: 'Base', logo: '/logos/base.jpg', desc: 'L2 Ethereum • Low fees' },
          { name: 'Solana', logo: '/logos/solana.jpg', desc: 'High performance • Sub-cent fees' },
          { name: 'Polygon', logo: '/logos/polygon.jpg', desc: 'EVM compatible • Fast' },
          { name: 'BSC', logo: '/logos/BSC.jpg', desc: 'Binance chain • Low cost' },
          { name: 'Sei', logo: '/logos/sei.jpg', desc: 'Optimized L1 • Speed' },
          { name: 'Peaq', logo: '/logos/peaq.jpg', desc: 'DePIN network • IoT' }
        ].map((chain) => (
          <div key={chain.name} className="bg-white backdrop-blur-sm rounded-lg p-6 border border-2 border-dashed border-black hover:border-red-600/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <img src={chain.logo} alt={chain.name} className="w-10 h-10 rounded-lg object-cover" />
              <h4 className="text-base font-bold text-black">{chain.name}</h4>
            </div>
            <p className="text-sm text-gray-700 font-normal">{chain.desc}</p>
          </div>
        ))}
      </div>

      <CTABox 
        title="Start Building"
        description="Ready to integrate x402 payments? Choose your stack and start building in minutes."
        buttonText="View Guides"
        buttonHref="/docs/server-express"
      />
    </div>
  );
}
