'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import DocStep from '../../../components/docs/DocStep';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProtocolPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="left"
        eyebrow="x402 Protocol"
        title="HTTP 402 Payment Protocol"
        dek="The HTTP 402 payment protocol reimagined for the blockchain era. Native micropayments for every HTTP request."
        className="mb-24"
      />

      <div className="bg-white border-2 border-dashed border-black p-8 lg:p-12 mb-16">
        <h2 className="font-title text-2xl font-bold text-black mb-4">Protocol Vision</h2>
        <p className="text-gray-700 leading-relaxed">
          HTTP 402 "Payment Required" was defined in HTTP/1.1 but never implemented. x402 brings this vision to reality using blockchain technology, enabling instant trustless micropayments at internet scale.
        </p>
      </div>

      <h2 className="font-title text-3xl font-bold text-black mb-8">Request Flow</h2>

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

      <h2 className="font-title text-3xl font-bold text-black mb-8">Core Advantages</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-bold text-black mb-3">True Micropayments</h3>
          <p className="text-gray-700 leading-relaxed">
            Charge $0.0001 per request. Traditional payment rails collapse at this scale.
          </p>
        </div>

        <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-bold text-black mb-3">Sub-Second Settlement</h3>
          <p className="text-gray-700 leading-relaxed">
            Payments finalize on-chain in under a second. No multi-day clearing windows.
          </p>
        </div>

        <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-bold text-black mb-3">Borderless Commerce</h3>
          <p className="text-gray-700 leading-relaxed">
            Anyone with a wallet can transact. No geographic restrictions or card networks.
          </p>
        </div>

        <div className="bg-gray-50 p-8 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-bold text-black mb-3">Machine Economy Ready</h3>
          <p className="text-gray-700 leading-relaxed">
            Perfect for AI agents and autonomous systems that need to pay for services.
          </p>
        </div>
      </div>

      <div className="bg-white border-2 border-dashed border-black p-8 lg:p-12">
        <h2 className="font-title text-2xl font-bold text-black mb-6">Next Steps</h2>
        <p className="text-gray-600 mb-6">
          Understand the payment flow and learn how to integrate x402 into your applications.
        </p>
        <div className="flex gap-4">
          <Link
            href="/docs/integration/payment-flow"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Payment Flow
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/docs/integration/server"
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-black text-black font-medium hover:bg-gray-50 transition-colors"
          >
            Server Setup
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

