'use client';

import EditorialHero from '../components/premium/EditorialHero';
import KPIFilmstrip from '../components/premium/KPIFilmstrip';
import MosaicGrid from '../components/premium/MosaicGrid';
import PremiumTabs from '../components/premium/PremiumTabs';
import { motion } from 'framer-motion';

const metrics = [
  { id: '1', value: '$1.00', label: 'Access Fee', description: 'Per utility, 1 hour session' },
  { id: '2', value: '$10.00', label: 'Token Creation', description: 'Fixed deployment fee' },
  { id: '3', value: '$50.00', label: 'Service Registration', description: 'One-time registration' },
  { id: '4', value: '$0.25', label: 'Mint Fee', description: 'Per token mint via Foundry' },
  { id: '5', value: '<1s', label: 'Settlement Time', description: 'Instant on-chain confirmation' },
  { id: '6', value: '0%', label: 'Platform Fee', description: 'No revenue share from services' }
];

const principles = [
  {
    id: 'utilities',
    title: 'Six Integrated Utilities',
    content: (
      <div>
        <p className="mb-4">Atlas402 provides a complete ecosystem of tools for building, managing, and monetizing x402 services:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Atlas Dashboard</span>
            <span className="text-gray-600">Personal analytics</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Atlas x402</span>
            <span className="text-gray-600">Protocol metrics</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Atlas Foundry</span>
            <span className="text-gray-600">Token creation</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Atlas Index</span>
            <span className="text-gray-600">Service discovery</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Atlas Mesh</span>
            <span className="text-gray-600">Service registration</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Atlas Operator</span>
            <span className="text-gray-600">AI automation</span>
          </div>
        </div>
      </div>
    ),
    tag: 'Platform',
    href: '/workspace'
  },
  {
    id: 'fees',
    title: 'Fee Structure',
    content: (
      <div>
        <p className="mb-4">Transparent pricing with no hidden costs. Developers keep 100% of service revenue.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Utility Access:</span>
            <span className="font-medium text-black">$1.00 USDC (1 hour)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Token Creation:</span>
            <span className="font-medium text-black">$10.00 USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Registration:</span>
            <span className="font-medium text-black">$50.00 USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Token Mint Fee:</span>
            <span className="font-medium text-black">$0.25 USDC</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-300">
            <span className="text-gray-600">Platform Fee:</span>
            <span className="font-medium text-red-600">$0.00 (0%)</span>
          </div>
        </div>
      </div>
    ),
    tag: 'Pricing',
    href: '/workspace'
  },
  {
    id: 'instant',
    title: 'Instant Settlement',
    content: (
      <div>
        <p className="mb-4">Payments settle in under a second on-chain. No chargebacks, no disputes, complete transparency.</p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Base Mainnet & Solana</span>
        </div>
      </div>
    ),
    tag: 'Infrastructure',
    href: '/docs/payment-flow'
  },
  {
    id: 'multichain',
    title: 'Multi-Chain Native',
    content: (
      <div>
        <p className="mb-4">Built for a multi-chain future. Deploy once, transact everywhere:</p>
        <div className="flex items-center gap-2 flex-wrap">
          {['Base', 'Solana', 'Polygon', 'BSC', 'Sei', 'Peaq'].map((chain) => (
            <span key={chain} className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium border border-red-200">
              {chain}
            </span>
          ))}
        </div>
      </div>
    ),
    tag: 'Network',
    href: '/docs/deployment'
  }
];

const tabs = [
  {
    id: 'utilities',
    label: 'Utilities',
    content: (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Atlas Dashboard</h3>
          <p className="text-gray-600 mb-4">Track your balances, payments, mints, and services across Base and Solana. Export activity data for analysis.</p>
          <div className="text-sm text-gray-500 mb-2">Access Fee: $1.00 USDC</div>
          <a href="/workspace/atlas-dashboard" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Open Dashboard →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Atlas x402</h3>
          <p className="text-gray-600 mb-4">Monitor protocol-wide revenue, transaction metrics, and network activity. View revenue by category and real-time balances.</p>
          <div className="text-sm text-gray-500 mb-2">Access Fee: $1.00 USDC</div>
          <a href="/workspace/atlas-x402" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            View Metrics →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Atlas Foundry</h3>
          <p className="text-gray-600 mb-4">Browse and mint x402-native tokens. Create new tokens with $10 deployment fee. Includes dev settings for testing.</p>
          <div className="text-sm text-gray-500 mb-2">Access Fee: $1.00 USDC | Token Creation: $10.00 USDC | Mint Fee: $0.25 USDC</div>
          <a href="/workspace/atlas-foundry" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Open Foundry →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Atlas Index</h3>
          <p className="text-gray-600 mb-4">Discover and test x402 services across categories. Filter by network, category, and price. Real-time service discovery.</p>
          <div className="text-sm text-gray-500 mb-2">Access Fee: $1.00 USDC</div>
          <a href="/workspace/atlas-index" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Browse Services →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Atlas Mesh</h3>
          <p className="text-gray-600 mb-4">Register your x402 services for discovery. Includes code generation, integration guides, and automatic PayAI facilitator registration.</p>
          <div className="text-sm text-gray-500 mb-2">Access Fee: $1.00 USDC | Registration: $50.00 USDC</div>
          <a href="/workspace/atlas-mesh" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Register Service →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Atlas Operator</h3>
          <p className="text-gray-600 mb-4">AI-powered automation for x402 services. Execute workflows, mint tokens, and interact with services with approval guardrails.</p>
          <div className="text-sm text-gray-500 mb-2">Access Fee: $1.00 USDC | Protocol Fee: $1.00 USDC per action</div>
          <a href="/workspace/atlas-operator" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Open Operator →
          </a>
        </div>
      </div>
    )
  },
  {
    id: 'learn',
    label: 'Learn',
    content: (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Protocol Deep Dive</h3>
          <p className="text-gray-600 mb-4">Understand how HTTP 402 enables pay-per-request commerce at internet scale.</p>
          <a href="/docs/x402-protocol" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Protocol Overview →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Payment Flow</h3>
          <p className="text-gray-600 mb-4">Learn how micropayments flow through the x402 protocol.</p>
          <a href="/docs/payment-flow" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Payment Guide →
          </a>
        </div>
      </div>
    )
  },
  {
    id: 'integrate',
    label: 'Integrate',
    content: (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Server Integration</h3>
          <p className="text-gray-600 mb-4">Build x402-enabled services using Express.js or Python.</p>
          <a href="/docs/server-express" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Express.js Guide →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Client Libraries</h3>
          <p className="text-gray-600 mb-4">Integrate client libraries to consume services and handle payments automatically.</p>
          <a href="/docs/clients" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Client Docs →
          </a>
        </div>
      </div>
    )
  }
];

export default function DocsPage() {
  return (
    <div className="max-w-none">
      {/* Editorial Hero */}
      <EditorialHero
        variant="center"
        eyebrow="Atlas402 Documentation"
        title="Complete x402 Payment Infrastructure"
        dek="Six integrated utilities for building, managing, and monetizing x402 services. Zero platform fees. Instant settlement."
        className="mb-24"
      />

      {/* KPI Filmstrip */}
      <KPIFilmstrip 
        metrics={metrics}
        className="mb-24"
      />

      {/* Core Principles */}
      <MosaicGrid 
        items={principles}
        columns={2}
        className="mb-24"
      />

      {/* Build / Learn / Integrate Tabs */}
      <PremiumTabs 
        tabs={tabs}
        className="mb-24"
      />

      {/* Support CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ threshold: 0.35 }}
        className="bg-white border-2 border-dashed border-black p-8 lg:p-12 text-center"
      >
        <h2 className="font-title text-2xl lg:text-3xl font-bold text-black mb-4">
          Need Support?
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Access comprehensive implementation guides, API references, and technical documentation for advanced use cases.
        </p>
        <a 
          href="https://docs.payai.network"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-300"
        >
          PayAI Documentation
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </motion.div>
    </div>
  );
}
