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
    title: 'Six Integrated Utilities',
    content: (
      <div>
        <p className="mb-4">Atlas402 provides a complete ecosystem of tools for building, managing, and monetizing x402 services:</p>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-black">Atlas Dashboard</span>
            <span>- Personal analytics and activity tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-black">Atlas x402</span>
            <span>- Protocol-wide revenue and metrics</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-black">Atlas Foundry</span>
            <span>- Create and mint x402-native tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-black">Atlas Index</span>
            <span>- Discover and test x402 services</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-black">Atlas Mesh</span>
            <span>- Register and configure your services</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-black">Atlas Operator</span>
            <span>- AI-powered automation and workflows</span>
          </div>
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
    title: 'Access Workspace Utilities',
    content: (
      <div>
        <p className="mb-4">All six Atlas402 utilities require a $1.00 USDC access fee for one hour of usage. Connect your wallet and pay once to access any utility.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-4">
          <div className="text-sm text-gray-700 space-y-1">
            <div>Access Fee: $1.00 USDC per utility</div>
            <div>Session Duration: 1 hour</div>
            <div>Supported Networks: Base, Solana</div>
          </div>
        </div>
        <a href="/workspace" className="text-red-500 font-medium hover:text-red-600 transition-colors">
          Access Workspace →
        </a>
      </div>
    )
  },
  {
    id: 'discover',
    number: 2,
    title: 'Discover Services',
    content: (
      <div>
        <p className="mb-4">Use Atlas Index to browse and test x402 services. Filter by category, network, and price. Each service requires payment per request.</p>
        <a href="/workspace/atlas-index" className="text-red-500 font-medium hover:text-red-600 transition-colors">
          Browse Services →
        </a>
      </div>
    )
  },
  {
    id: 'create',
    number: 3,
    title: 'Create Tokens or Register Services',
    content: (
      <div>
        <p className="mb-4">Create tokens in Atlas Foundry ($10 deployment fee) or register services in Atlas Mesh ($50 registration fee). Both provide instant x402 integration.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-4">
          <div className="text-sm text-gray-700 space-y-1">
            <div>Token Creation: $10 USDC deployment fee</div>
            <div>Service Registration: $50 USDC registration fee</div>
            <div>Access Fee: $1.00 USDC per utility</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'monitor',
    number: 4,
    title: 'Monitor Activity',
    content: (
      <div>
        <p className="mb-4">Track your payments, mints, and services in Atlas Dashboard. View protocol-wide metrics in Atlas x402. Export data for analysis.</p>
        <a href="/workspace/atlas-dashboard" className="text-red-500 font-medium hover:text-red-600 transition-colors">
          View Dashboard →
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
              Atlas402 is a comprehensive platform for the x402 payment protocol ecosystem. It provides six integrated utilities for discovering, creating, managing, and monetizing x402-enabled services. Every API request becomes a micropayment transaction settling instantly on-chain across Base and Solana networks.
            </p>
            <div className="bg-red-50 border-2 border-dashed border-red-200 p-4 mb-4">
              <p className="text-sm text-red-700 font-medium mb-2">
                Transform every API call into an instant micropayment
              </p>
              <p className="text-xs text-red-600">
                Service providers: 25% revenue | Team: 25% | $ATLAS holders: 50% via buybacks
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
