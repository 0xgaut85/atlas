'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import { motion } from 'framer-motion';
import Link from 'next/link';

const metrics = [
  {
    title: 'Total Revenue',
    description: 'Combined revenue across all categories and networks'
  },
  {
    title: 'Revenue by Category',
    description: 'Breakdown by access fees, registrations, mints, and services'
  },
  {
    title: 'Network Breakdown',
    description: 'Revenue and activity split between Base and Solana'
  },
  {
    title: 'Transaction History',
    description: 'Complete transaction log with service names and amounts'
  },
  {
    title: 'Unique Users',
    description: 'Count of unique wallet addresses using the platform'
  },
  {
    title: 'Protocol Balances',
    description: 'Current USDC balances for protocol addresses'
  }
];

export default function X402DocsPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="left"
        eyebrow="Atlas x402"
        title="Protocol Revenue & Usage Dashboard"
        dek="Monitor protocol-wide revenue, transaction metrics, and network activity. View revenue by category and real-time balances."
        className="mb-24"
      />

      <div className="grid lg:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Overview
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Atlas x402 provides protocol-wide analytics for the entire Atlas402 ecosystem. Monitor revenue, track usage patterns, and understand platform growth across all networks.
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
            </div>
          </div>
          <Link
            href="/workspace/atlas-x402"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            View Metrics
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Metrics Tracked
          </h2>
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ threshold: 0.35 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-l-4 border-red-600 pl-4 py-2"
              >
                <h3 className="font-medium text-black mb-1">{metric.title}</h3>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-dashed border-black p-8 lg:p-12">
        <h2 className="font-title text-2xl font-bold text-black mb-6">
          Revenue Categories
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
            <h3 className="font-medium text-black mb-2">Access</h3>
            <p className="text-sm text-gray-600">$1.00 USDC fees for utility access</p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
            <h3 className="font-medium text-black mb-2">Registration</h3>
            <p className="text-sm text-gray-600">$50.00 USDC service registration fees</p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
            <h3 className="font-medium text-black mb-2">Mint</h3>
            <p className="text-sm text-gray-600">Token minting payments (variable amounts)</p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
            <h3 className="font-medium text-black mb-2">Service</h3>
            <p className="text-sm text-gray-600">Other service payments via Operator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

