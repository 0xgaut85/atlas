'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Balance Tracking',
    description: 'View your USDC balances across Base and Solana networks in real-time.'
  },
  {
    title: 'Payment History',
    description: 'Complete history of all payments made across Atlas402 utilities and services.'
  },
  {
    title: 'Mint Tracking',
    description: 'Track all tokens you have minted, including amounts and transaction details.'
  },
  {
    title: 'Service Management',
    description: 'View all services you have registered and their current status.'
  },
  {
    title: 'Activity Export',
    description: 'Export your activity data for external analysis and reporting.'
  },
  {
    title: 'Cross-Chain View',
    description: 'Unified view of activity across both Base and Solana networks.'
  }
];

export default function DashboardDocsPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="left"
        eyebrow="Atlas Dashboard"
        title="Personal Analytics & Activity Tracking"
        dek="Track your balances, payments, mints, and services across Base and Solana networks. Export activity data for analysis."
        className="mb-24"
      />

      <div className="grid lg:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Overview
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Atlas Dashboard provides a comprehensive view of your activity across the Atlas402 platform. Track payments, monitor balances, and analyze your usage patterns all in one place.
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
                <span>Networks:</span>
                <span className="font-medium text-black">Base, Solana</span>
              </div>
            </div>
          </div>
          <Link
            href="/workspace/atlas-dashboard"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Open Dashboard
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
          Usage
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-black mb-2">Accessing the Dashboard</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
              <li>Navigate to Atlas Workspace</li>
              <li>Click on "Atlas Dashboard"</li>
              <li>Connect your wallet (EVM or Solana)</li>
              <li>Pay $1.00 USDC access fee</li>
              <li>Access granted for 1 hour</li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium text-black mb-2">Viewing Activity</h3>
            <p className="text-gray-600 mb-2">
              The dashboard displays activity across multiple tabs:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Overview: Summary statistics and recent activity</li>
              <li>Activity: Complete chronological activity feed</li>
              <li>Payments: All payment transactions</li>
              <li>Minted: Tokens you have minted</li>
              <li>Services: Services you have registered</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

