'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Service Discovery',
    description: 'Real-time discovery of all x402 services from PayAI facilitator.'
  },
  {
    title: 'Category Filtering',
    description: 'Filter by category: AI, Data, Tokens, Payment, Infrastructure, API, Other.'
  },
  {
    title: 'Network Filtering',
    description: 'Filter by network: Base, Solana, or view all networks.'
  },
  {
    title: 'Price Filtering',
    description: 'Search and filter services by price range and currency.'
  },
  {
    title: 'Service Testing',
    description: 'Test services before committing funds with built-in testing interface.'
  },
  {
    title: 'Real-Time Updates',
    description: 'Auto-refresh service list every 60 seconds for latest availability.'
  }
];

export default function IndexDocsPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="left"
        eyebrow="Atlas Index"
        title="Service Discovery & Testing"
        dek="Discover and test x402 services across categories. Filter by network, category, and price. Real-time service discovery from PayAI facilitator."
        className="mb-24"
      />

      <div className="grid lg:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Overview
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Atlas Index provides real-time discovery of all x402 services available in the ecosystem. Filter, search, and test services before making payments.
          </p>
          <div className="bg-red-50 border-2 border-dashed border-red-600 p-6 mb-6">
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
                <span>Service Payments:</span>
                <span className="font-medium text-black">Variable (per service)</span>
              </div>
            </div>
          </div>
          <Link
            href="/workspace/atlas-index"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Browse Services
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
          Service Categories
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['AI', 'Data', 'Tokens', 'Payment', 'Infrastructure', 'API', 'Other'].map((category) => (
            <div key={category} className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
              <div className="font-medium text-black">{category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

