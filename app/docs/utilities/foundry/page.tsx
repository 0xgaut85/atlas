'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Browse Tokens',
    description: 'Discover tokens from Atlas Network facilitator with website previews and metadata.'
  },
  {
    title: 'Create Tokens',
    description: 'Create new x402-native tokens with $10 deployment fee. Includes dev settings for testing.'
  },
  {
    title: 'Mint Tokens',
    description: 'Mint tokens with $0.25 platform fee. Full payment flow to token deployer.'
  },
  {
    title: 'Mint Progress',
    description: 'Track mint progress in USDC value and percentage with real-time updates.'
  },
  {
    title: 'x402 Verification',
    description: 'Verify tokens are x402 deployment mints with PayAI facilitator registration check.'
  },
  {
    title: 'Dev Settings',
    description: 'Configure supply to mint for dev address for testing purposes.'
  }
];

export default function FoundryDocsPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="left"
        eyebrow="Atlas Foundry"
        title="Token Creation & Minting Platform"
        dek="Browse and mint x402-native tokens. Create new tokens with $10 deployment fee. Includes dev settings for testing and full mint progress tracking."
        className="mb-24"
      />

      <div className="grid lg:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Overview
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Atlas Foundry is the premier platform for creating and minting x402-native tokens. Browse available tokens from the Atlas Network or create your own with full deployment support.
          </p>
          <div className="bg-red-50 border-2 border-dashed border-red-600 p-6 mb-6">
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
              <div className="flex justify-between">
                <span>Networks:</span>
                <span className="font-medium text-black">Base, Solana</span>
              </div>
            </div>
          </div>
          <Link
            href="/workspace/atlas-foundry"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Open Foundry
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Features
          </h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ threshold: 0.35 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-l-4 border-red-600 pl-4 py-2"
              >
                <h3 className="font-medium text-black mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-dashed border-black p-8 lg:p-12">
        <h2 className="font-title text-2xl font-bold text-black mb-6">
          Creating a Token
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-black mb-2">Step 1: Configure Token</h3>
            <p className="text-gray-600 mb-2">
              Fill out the token creation form with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Token name and symbol</li>
              <li>Description and metadata</li>
              <li>Initial supply</li>
              <li>Price per mint</li>
              <li>Network (Base or Solana)</li>
              <li>Dev settings (supply to mint for dev address)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-black mb-2">Step 2: Pay Deployment Fee</h3>
            <p className="text-gray-600">
              Pay $10.00 USDC deployment fee. After payment, you will receive deployment instructions and can proceed with contract deployment.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-black mb-2">Step 3: Deploy Contract</h3>
            <p className="text-gray-600">
              Deploy your token contract using the provided instructions. Once deployed, update the service with your contract address to enable minting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

