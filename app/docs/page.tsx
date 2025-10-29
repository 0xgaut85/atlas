'use client';

import EditorialHero from '../components/premium/EditorialHero';
import KPIFilmstrip from '../components/premium/KPIFilmstrip';
import MosaicGrid from '../components/premium/MosaicGrid';
import PremiumTabs from '../components/premium/PremiumTabs';
import { motion } from 'framer-motion';

const metrics = [
  { id: '1', value: '$1.00', label: 'Per Request', description: 'Fixed micropayment amount' },
  { id: '2', value: '1 Hour', label: 'Session Duration', description: 'Access window per payment' },
  { id: '3', value: '6+', label: 'Blockchains', description: 'Multi-chain support' },
  { id: '4', value: '<1s', label: 'Settlement Time', description: 'Instant on-chain confirmation' },
  { id: '5', value: '100%', label: 'Transparent', description: 'No hidden fees or charges' },
  { id: '6', value: '∞', label: 'Scalable', description: 'Internet-scale micropayments' }
];

const principles = [
  {
    id: 'usage-based',
    title: 'Usage-Based Pricing',
    content: (
      <div>
        <p className="mb-4">Pay exactly for what you consume. No monthly fees, no commitments. Just pure value exchange per request.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300">
          <code className="text-sm text-gray-700">
            GET /api/data → $1.00 USDC → Instant access
          </code>
        </div>
      </div>
    ),
    tag: 'Core',
    href: '/docs/x402-protocol'
  },
  {
    id: 'frictionless',
    title: 'Frictionless Testing',
    content: (
      <div>
        <p className="mb-4">Explore and test any service before spending a single token. Validate integration before commitment.</p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Free trial periods available</span>
        </div>
      </div>
    ),
    tag: 'Developer',
    href: '/docs/quickstart'
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
    id: 'build',
    label: 'Build',
    content: (
      <div className="space-y-6">
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Deploy Your Service</h3>
          <p className="text-gray-600 mb-4">Build x402-enabled services using Express.js, Python, or any HTTP framework you prefer.</p>
          <a href="/docs/server-express" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Express.js Guide →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Python Server</h3>
          <p className="text-gray-600 mb-4">Fast Python implementation with Flask or FastAPI integration.</p>
          <a href="/docs/server-python" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Python Guide →
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
          <h3 className="font-title text-xl font-bold text-black mb-3">Client Libraries</h3>
          <p className="text-gray-600 mb-4">Integrate client libraries to consume services and handle payments automatically.</p>
          <a href="/docs/clients" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Client Docs →
          </a>
        </div>
        <div className="bg-white border-2 border-dashed border-black p-6">
          <h3 className="font-title text-xl font-bold text-black mb-3">Code Examples</h3>
          <p className="text-gray-600 mb-4">Real-world examples and implementation patterns.</p>
          <a href="/docs/examples" className="text-red-500 font-medium hover:text-red-600 transition-colors">
            Examples →
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
        title="Build the Future of Micropayments"
        dek="Transform every API call into an instant micropayment. Deploy pay-per-request services with x402 protocol infrastructure."
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
