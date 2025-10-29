'use client';

import EditorialHero from '../../components/premium/EditorialHero';
import MosaicGrid from '../../components/premium/MosaicGrid';
import { motion } from 'framer-motion';
import Link from 'next/link';

const utilities = [
  {
    id: 'dashboard',
    title: 'Atlas Dashboard',
    description: 'Personal analytics and activity tracking across Base and Solana networks.',
    content: (
      <div>
        <p className="mb-4">Track all your activity in one place. View balances, payments, mints, and services registered across both networks.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Access Fee:</span>
              <span className="font-medium text-black">$1.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Session Duration:</span>
              <span className="font-medium text-black">1 hour</span>
            </div>
            <div className="flex justify-between">
              <span>Networks:</span>
              <span className="font-medium text-black">Base, Solana</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium text-black">Features:</div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Wallet balance tracking</li>
            <li>Payment history and analytics</li>
            <li>Minted tokens overview</li>
            <li>Registered services list</li>
            <li>Activity export</li>
          </ul>
        </div>
      </div>
    ),
    tag: 'Analytics',
    href: '/docs/utilities/dashboard'
  },
  {
    id: 'x402',
    title: 'Atlas x402',
    description: 'Protocol-wide revenue and usage dashboard for the entire x402 ecosystem.',
    content: (
      <div>
        <p className="mb-4">Monitor protocol-wide metrics including total revenue, transaction counts, user activity, and network balances.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Access Fee:</span>
              <span className="font-medium text-black">$1.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Session Duration:</span>
              <span className="font-medium text-black">1 hour</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium text-black">Features:</div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Revenue by category (access, registration, mint, service)</li>
            <li>Network breakdown (Base vs Solana)</li>
            <li>Transaction history</li>
            <li>Unique user counts</li>
            <li>Protocol USDC balances</li>
          </ul>
        </div>
      </div>
    ),
    tag: 'Analytics',
    href: '/docs/utilities/x402'
  },
  {
    id: 'foundry',
    title: 'Atlas Foundry',
    description: 'Create and mint x402-native tokens with instant payment integration.',
    content: (
      <div>
        <p className="mb-4">Browse available tokens or create your own. Includes dev settings for testing and full mint progress tracking.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Access Fee:</span>
              <span className="font-medium text-black">$1.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Token Creation:</span>
              <span className="font-medium text-black">$10.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Mint Fee:</span>
              <span className="font-medium text-black">$0.25 USDC</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium text-black">Features:</div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Browse tokens from Atlas Network</li>
            <li>Create new tokens with deployment</li>
            <li>Mint progress tracking (USDC value and percentage)</li>
            <li>Dev settings for testing</li>
            <li>x402 deployment verification</li>
            <li>PayAI facilitator registration check</li>
          </ul>
        </div>
      </div>
    ),
    tag: 'Creation',
    href: '/docs/utilities/foundry'
  },
  {
    id: 'index',
    title: 'Atlas Index',
    description: 'Discover and test x402 services across all categories and networks.',
    content: (
      <div>
        <p className="mb-4">Real-time service discovery with filtering by category, network, and price. Test services before committing funds.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Access Fee:</span>
              <span className="font-medium text-black">$1.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Service Payments:</span>
              <span className="font-medium text-black">Variable (per service)</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium text-black">Features:</div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Service discovery from PayAI facilitator</li>
            <li>Category filtering (AI, Data, Tokens, etc.)</li>
            <li>Network filtering (Base, Solana)</li>
            <li>Price filtering and sorting</li>
            <li>Service testing interface</li>
            <li>Real-time updates</li>
          </ul>
        </div>
      </div>
    ),
    tag: 'Discovery',
    href: '/docs/utilities/index'
  },
  {
    id: 'mesh',
    title: 'Atlas Mesh',
    description: 'Register and configure your x402 services for discovery and monetization.',
    content: (
      <div>
        <p className="mb-4">Register your services with automatic PayAI facilitator integration and x402scan.com listing.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Access Fee:</span>
              <span className="font-medium text-black">$1.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Service Registration:</span>
              <span className="font-medium text-black">$50.00 USDC</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium text-black">Features:</div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Service registration form</li>
            <li>Code generation (Express.js, Python)</li>
            <li>Integration guides</li>
            <li>Automatic PayAI facilitator registration</li>
            <li>x402scan.com auto-listing</li>
            <li>Service metadata management</li>
          </ul>
        </div>
      </div>
    ),
    tag: 'Integration',
    href: '/docs/utilities/mesh'
  },
  {
    id: 'operator',
    title: 'Atlas Operator',
    description: 'AI-powered automation for x402 services with conversational interface.',
    content: (
      <div>
        <p className="mb-4">Execute workflows, mint tokens, and interact with x402 services using natural language commands.</p>
        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 mb-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Access Fee:</span>
              <span className="font-medium text-black">$1.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol Fee:</span>
              <span className="font-medium text-black">$1.00 USDC per action</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium text-black">Features:</div>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Natural language interface</li>
            <li>Service discovery assistance</li>
            <li>Token minting automation</li>
            <li>Payment execution</li>
            <li>Workflow automation</li>
            <li>Approval guardrails</li>
          </ul>
        </div>
      </div>
    ),
    tag: 'AI',
    href: '/docs/utilities/operator'
  }
];

export default function UtilitiesPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="center"
        eyebrow="Platform Utilities"
        title="Six Integrated Tools"
        dek="Complete infrastructure for building, managing, and monetizing x402 services. All utilities require $1.00 USDC access fee for one hour."
        className="mb-24"
      />

      <MosaicGrid 
        items={utilities}
        columns={2}
        className="mb-24"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ threshold: 0.35 }}
        className="bg-white border-2 border-dashed border-black p-8 lg:p-12"
      >
        <h2 className="font-title text-2xl lg:text-3xl font-bold text-black mb-6">
          Access All Utilities
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Connect your wallet and pay $1.00 USDC to access any utility for one hour. All utilities are available on Base and Solana networks.
        </p>
        <Link
          href="/workspace"
          className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-300"
        >
          Open Workspace
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
}

