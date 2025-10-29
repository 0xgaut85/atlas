'use client';

import CurtainReveal from '../../components/premium/CurtainReveal';
import StairStep from '../../components/premium/StairStep';
import Marginalia from '../../components/premium/Marginalia';
import { motion } from 'framer-motion';

const coreIdeas = [
  {
    id: '1',
    number: 1,
    title: 'API Economy Revolution',
    content: (
      <div>
        <p className="mb-4">Every API call becomes a micropayment transaction. No subscriptions, no commitments—just pure value exchange per request.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300">
          <code className="text-sm text-gray-700">
            GET /api/data → $1.00 USDC → Instant access
          </code>
        </div>
      </div>
    )
  },
  {
    id: '2',
    number: 2,
    title: 'Instant Settlement',
    content: (
      <div>
        <p className="mb-4">Payments settle in under a second on-chain. No chargebacks, no disputes, complete transparency across Base Mainnet and Solana.</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Base Mainnet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Solana</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: '3',
    number: 3,
    title: 'Risk-Free Testing',
    content: (
      <div>
        <p className="mb-4">Explore and test any service before spending a single token. Validate integration before commitment with built-in testing interfaces.</p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Free trial periods available</span>
        </div>
      </div>
    )
  },
  {
    id: '4',
    number: 4,
    title: 'Global Distribution',
    content: (
      <div>
        <p className="mb-4">List once, reach anyone with a crypto wallet. Deploy services that work across multiple blockchains without additional infrastructure.</p>
        <div className="flex items-center gap-2 flex-wrap">
          {['Base', 'Solana', 'Polygon', 'BSC', 'Sei', 'Peaq'].map((chain) => (
            <span key={chain} className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium border border-red-200">
              {chain}
            </span>
          ))}
        </div>
      </div>
    )
  }
];

const usageSteps = [
  {
    id: 'explore',
    number: 1,
    title: 'Explore Marketplace',
    content: (
      <div>
        <p className="mb-4">Discover AI services, data APIs, image processing, and specialized tools across categories. All services support instant x402 payment integration.</p>
        <a href="/workspace" className="text-red-500 font-medium hover:text-red-600 transition-colors">
          Browse Services →
        </a>
      </div>
    )
  },
  {
    id: 'validate',
    number: 2,
    title: 'Validate Functionality',
    content: (
      <div>
        <p className="mb-4">Use built-in testing interfaces to verify service behavior without payment. Test integration patterns before committing funds.</p>
        <a href="/docs/quickstart" className="text-red-500 font-medium hover:text-red-600 transition-colors">
          Learn More →
        </a>
      </div>
    )
  },
  {
    id: 'connect',
    number: 3,
    title: 'Connect Wallet',
    content: (
      <div>
        <p className="mb-4">Link MetaMask, Phantom, or any supported wallet to enable transactions. Multi-chain support for seamless cross-platform usage.</p>
        <a href="/docs/clients" className="text-red-500 font-medium hover:text-red-600 transition-colors">
          Wallet Setup →
        </a>
      </div>
    )
  },
  {
    id: 'integrate',
    number: 4,
    title: 'Integrate & Deploy',
    content: (
      <div>
        <p className="mb-4">Generate production-ready integration code, embed in your application, and start transacting. Deploy in minutes, not days.</p>
        <a href="/docs/examples" className="text-red-500 font-medium hover:text-red-600 transition-colors">
          Integration Guide →
        </a>
      </div>
    )
  }
];

const marginaliaNotes = [
  {
    id: 'infrastructure',
    content: (
      <div>
        <h4 className="font-medium text-black mb-2">Zero Payment Infrastructure</h4>
        <p className="text-sm">x402 handles all payment processing and settlements automatically.</p>
      </div>
    )
  },
  {
    id: 'settlement',
    content: (
      <div>
        <h4 className="font-medium text-black mb-2">Immediate Settlement</h4>
        <p className="text-sm">Receive funds on-chain instantly with no intermediaries.</p>
      </div>
    )
  },
  {
    id: 'pricing',
    content: (
      <div>
        <h4 className="font-medium text-black mb-2">Request Pricing</h4>
        <p className="text-sm">Charge per-use without subscription complexity.</p>
      </div>
    )
  }
];

export default function IntroductionPage() {
  return (
    <div className="max-w-none">
      {/* Curtain Reveal Opening */}
      <CurtainReveal
        leftContent={
          <div>
            <h1 className="font-title text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Introduction
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Building x402 protocol infrastructure for the emerging API economy and beyond.
            </p>
          </div>
        }
        rightContent={
          <div>
            <h2 className="font-title text-2xl lg:text-3xl font-bold text-black mb-6">
              Platform Overview
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Atlas402 is a marketplace where services are discovered, tested, and monetized through the HTTP 402 payment protocol. Every API request is a micropayment transaction settling instantly on-chain.
            </p>
            <div className="bg-red-50 border-2 border-dashed border-red-200 p-4">
              <p className="text-sm text-red-700 font-medium">
                Transform every API call into an instant micropayment
              </p>
            </div>
          </div>
        }
        className="mb-24"
      />

      {/* Core Ideas StairStep */}
      <StairStep 
        steps={coreIdeas}
        className="mb-24"
      />

      {/* Usage Flow with Marginalia */}
      <Marginalia
        notes={marginaliaNotes}
        className="mb-24"
      >
        <div>
          <h2 className="font-title text-3xl lg:text-4xl font-bold text-black mb-8">
            Usage Flow
          </h2>
          <StairStep 
            steps={usageSteps}
          />
        </div>
      </Marginalia>

      {/* For Builders CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ threshold: 0.35 }}
        className="bg-white border-2 border-dashed border-black p-8 lg:p-12 text-center"
      >
        <h2 className="font-title text-2xl lg:text-3xl font-bold text-black mb-4">
          Start Building
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Learn the x402 protocol and deploy your first service in under 10 minutes.
        </p>
        <a 
          href="/docs/x402-protocol"
          className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-300"
        >
          Protocol Docs
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </motion.div>
    </div>
  );
}
