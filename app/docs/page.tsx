'use client';

import EditorialHero from '../components/premium/EditorialHero';
import MosaicGrid from '../components/premium/MosaicGrid';
import { motion } from 'framer-motion';
import Link from 'next/link';

const platformFeatures = [
  {
    id: 'infrastructure',
    title: 'Complete Infrastructure',
    content: (
      <div>
        <p className="mb-4">Atlas402 provides a full suite of tools for the x402 payment ecosystem. Six integrated utilities cover every aspect of building, managing, and monetizing x402 services.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300">
          <div className="text-sm text-gray-700 space-y-1">
            <div>Analytics, Creation, Discovery</div>
            <div>Integration, Automation</div>
            <div>Payment Processing</div>
          </div>
        </div>
      </div>
    ),
    tag: 'Platform',
    href: '/docs/utilities'
  },
  {
    id: 'utilities',
    title: 'Six Core Utilities',
    content: (
      <div>
        <p className="mb-4">Each utility serves a specific purpose in the x402 ecosystem:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Dashboard</span>
            <span className="text-gray-600">Analytics</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">x402</span>
            <span className="text-gray-600">Protocol Metrics</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Foundry</span>
            <span className="text-gray-600">Token Creation</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Index</span>
            <span className="text-gray-600">Service Discovery</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Mesh</span>
            <span className="text-gray-600">Service Registration</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium text-black">Operator</span>
            <span className="text-gray-600">AI Automation</span>
          </div>
        </div>
      </div>
    ),
    tag: 'Utilities',
    href: '/docs/utilities'
  },
  {
    id: 'fees',
    title: 'Transparent Pricing',
    content: (
      <div>
        <p className="mb-4">Fixed fees with transparent revenue distribution. Service providers receive 25% of revenue, with 50% redistributed to $ATLAS holders.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Utility Access:</span>
            <span className="font-medium text-black">$1.00 USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Token Creation:</span>
            <span className="font-medium text-black">$10.00 USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Registration:</span>
            <span className="font-medium text-black">$50.00 USDC</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-300">
            <span className="text-gray-600">Revenue Share:</span>
            <span className="font-medium text-red-600">25% providers</span>
          </div>
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-300">
            <div>25% team • 50% $ATLAS holders (buybacks)</div>
          </div>
        </div>
      </div>
    ),
    tag: 'Pricing',
    href: '/docs/fees'
  },
  {
    id: 'networks',
    title: 'Multi-Chain Support',
    content: (
      <div>
        <p className="mb-4">Live on Base and Solana mainnets. All utilities support both networks seamlessly.</p>
        <div className="flex items-center gap-2 flex-wrap">
          {['Base', 'Solana'].map((chain) => (
            <span key={chain} className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium border border-red-200">
              {chain}
            </span>
          ))}
        </div>
      </div>
    ),
    tag: 'Network',
    href: '/docs/reference/networks'
  }
];

const utilityCards = [
  {
    title: 'Atlas Dashboard',
    description: 'Track your balances, payments, mints, and services across Base and Solana. Export activity data for analysis.',
    href: '/docs/utilities/dashboard',
    fee: '$1.00 access',
    category: 'Analytics'
  },
  {
    title: 'Atlas x402',
    description: 'Protocol-wide revenue dashboard. Monitor all transactions, fees by category, and real-time network metrics.',
    href: '/docs/utilities/x402',
    fee: '$1.00 access',
    category: 'Analytics'
  },
  {
    title: 'Atlas Foundry',
    description: 'Browse and mint x402-native tokens. Create new tokens with $10 deployment fee. Includes dev settings.',
    href: '/docs/utilities/foundry',
    fee: '$1.00 access, $10 creation',
    category: 'Creation'
  },
  {
    title: 'Atlas Index',
    description: 'Discover and test x402 services across categories. Filter by network, category, and price. Real-time discovery.',
    href: '/docs/utilities/index',
    fee: '$1.00 access',
    category: 'Discovery'
  },
  {
    title: 'Atlas Mesh',
    description: 'Register your x402 services for discovery. Code generation, integration guides, and automatic PayAI registration.',
    href: '/docs/utilities/mesh',
    fee: '$1.00 access, $50 registration',
    category: 'Integration'
  },
  {
    title: 'Atlas Operator',
    description: 'AI-powered automation for x402 services. Execute workflows, mint tokens, and interact with services.',
    href: '/docs/utilities/operator',
    fee: '$1.00 access, $1 per action',
    category: 'AI'
  }
];

export default function DocsPage() {
  return (
    <div className="max-w-none">
      {/* Hero Section */}
      <EditorialHero
        variant="center"
        eyebrow="Atlas402 Documentation"
        title="x402 Payment Infrastructure Platform"
        dek="Six integrated utilities for building, managing, and monetizing x402 services. Transparent revenue distribution. Instant settlement."
        className="mb-24"
      />

      {/* Platform Features */}
      <MosaicGrid 
        items={platformFeatures}
        columns={2}
        className="mb-24"
      />

      {/* Utilities Grid */}
      <div className="mb-24">
        <h2 className="font-title text-3xl lg:text-4xl font-bold text-black mb-8">
          Platform Utilities
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilityCards.map((utility, index) => (
            <motion.div
              key={utility.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ threshold: 0.35 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white border-2 border-dashed border-black p-6 hover:border-red-600 transition-all"
            >
              <div className="mb-3">
                <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                  {utility.category}
                </span>
              </div>
              <h3 className="font-title text-xl font-bold text-black mb-3">
                {utility.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {utility.description}
              </p>
              <div className="mb-4">
                <div className="text-xs text-gray-500 font-medium">
                  {utility.fee}
                </div>
              </div>
              <Link
                href={utility.href}
                className="text-red-500 font-medium hover:text-red-600 transition-colors text-sm inline-flex items-center gap-1"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ threshold: 0.35 }}
        className="bg-white border-2 border-dashed border-black p-8 lg:p-12"
      >
        <h2 className="font-title text-2xl lg:text-3xl font-bold text-black mb-6">
          Quick Start
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/workspace"
            className="p-6 bg-gray-50 border-2 border-black hover:bg-red-50 hover:border-red-600 transition-all group"
          >
            <h3 className="font-title text-lg font-bold text-black mb-2 group-hover:text-red-600">
              Access Workspace
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Connect your wallet and pay $1.00 USDC to access any utility for one hour.
            </p>
            <div className="text-xs text-gray-500">All utilities require $1.00 access fee</div>
          </Link>
          <Link
            href="/docs/utilities"
            className="p-6 bg-gray-50 border-2 border-black hover:bg-red-50 hover:border-red-600 transition-all group"
          >
            <h3 className="font-title text-lg font-bold text-black mb-2 group-hover:text-red-600">
              Explore Utilities
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Learn about each utility's features, fees, and capabilities.
            </p>
            <div className="text-xs text-gray-500">Detailed documentation for all utilities</div>
          </Link>
          <Link
            href="/docs/integration/protocol"
            className="p-6 bg-gray-50 border-2 border-black hover:bg-red-50 hover:border-red-600 transition-all group"
          >
            <h3 className="font-title text-lg font-bold text-black mb-2 group-hover:text-red-600">
              Understand x402
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Learn how the HTTP 402 payment protocol works and how to integrate it.
            </p>
            <div className="text-xs text-gray-500">Protocol documentation and guides</div>
          </Link>
          <Link
            href="/docs/integration/server"
            className="p-6 bg-gray-50 border-2 border-black hover:bg-red-50 hover:border-red-600 transition-all group"
          >
            <h3 className="font-title text-lg font-bold text-black mb-2 group-hover:text-red-600">
              Build Services
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Integrate x402 payments into your Express.js or Python applications.
            </p>
            <div className="text-xs text-gray-500">Server integration guides</div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
