'use client';

import EditorialHero from '../../components/premium/EditorialHero';
import { motion } from 'framer-motion';

const feeCategories = [
  {
    title: 'Access Fees',
    description: 'One-time payment for utility access',
    fees: [
      {
        name: 'Utility Access',
        amount: '$1.00',
        currency: 'USDC',
        duration: '1 hour',
        description: 'Access fee for any Atlas402 utility (Dashboard, x402, Foundry, Index, Mesh, Operator)',
        networks: ['Base', 'Solana']
      }
    ]
  },
  {
    title: 'Creation Fees',
    description: 'One-time fees for creating assets',
    fees: [
      {
        name: 'Token Creation',
        amount: '$10.00',
        currency: 'USDC',
        duration: 'One-time',
        description: 'Fixed deployment fee for creating a new token in Atlas Foundry',
        networks: ['Base', 'Solana']
      },
      {
        name: 'Service Registration',
        amount: '$50.00',
        currency: 'USDC',
        duration: 'One-time',
        description: 'Registration fee for listing your service in Atlas Mesh and PayAI facilitator',
        networks: ['Base']
      }
    ]
  },
  {
    title: 'Transaction Fees',
    description: 'Per-action fees',
    fees: [
      {
        name: 'Token Mint Fee',
        amount: '$0.25',
        currency: 'USDC',
        duration: 'Per mint',
        description: 'Platform fee charged when minting tokens via Atlas Foundry',
        networks: ['Base', 'Solana']
      },
      {
        name: 'Protocol Fee',
        amount: '$1.00',
        currency: 'USDC',
        duration: 'Per action',
        description: 'Fee charged for each action executed via Atlas Operator',
        networks: ['Base', 'Solana']
      }
    ]
  },
  {
    title: 'Revenue Fees',
    description: 'Fees on service revenue',
    fees: [
      {
        name: 'Revenue Distribution',
        amount: '25%',
        currency: 'USDC',
        duration: 'Per service',
        description: 'Service providers receive 25% of revenue. 25% goes to team, 50% redistributed to $ATLAS holders via buybacks.',
        networks: ['All']
      }
    ]
  }
];

export default function FeesPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="center"
        eyebrow="Fee Structure"
        title="Transparent Pricing"
        dek="Fixed fees with transparent revenue distribution. Service providers receive 25% of revenue, with 50% redistributed to $ATLAS holders via buybacks."
        className="mb-24"
      />

      <div className="space-y-12">
        {feeCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ threshold: 0.35 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            className="bg-white border-2 border-dashed border-black p-8 lg:p-12"
          >
            <div className="mb-6">
              <h2 className="font-title text-2xl lg:text-3xl font-bold text-black mb-2">
                {category.title}
              </h2>
              <p className="text-gray-600">{category.description}</p>
            </div>

            <div className="space-y-6">
              {category.fees.map((fee, feeIndex) => (
                <div
                  key={fee.name}
                  className="border-l-4 border-red-600 pl-6 py-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-title text-xl font-bold text-black mb-1">
                        {fee.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {fee.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600 font-title">
                        {fee.amount}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {fee.currency}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {fee.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">Networks:</span>
                    {fee.networks.map((network) => (
                      <span
                        key={network}
                        className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium border border-red-200"
                      >
                        {network}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ threshold: 0.35 }}
        className="bg-red-50 border-2 border-dashed border-red-600 p-8 lg:p-12 mt-12"
      >
        <h2 className="font-title text-2xl lg:text-3xl font-bold text-black mb-4">
          Revenue Distribution
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          Atlas402 uses a transparent revenue distribution model. Service providers receive 25% of revenue. 25% goes to the Atlas402 team, and 50% is redistributed to $ATLAS token holders through buybacks and rewards.
        </p>
        <div className="bg-white p-6 border-2 border-black">
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-6">
            <div>
              <div className="font-medium text-black mb-2">What We Charge:</div>
              <ul className="space-y-1 text-gray-600">
                <li>Utility access fees ($1.00)</li>
                <li>Token creation ($10.00)</li>
                <li>Service registration ($50.00)</li>
                <li>Platform transaction fees</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-black mb-2">Fixed Fees:</div>
              <ul className="space-y-1 text-gray-600">
                <li>Access fees: $1.00 USDC</li>
                <li>Token creation: $10.00 USDC</li>
                <li>Service registration: $50.00 USDC</li>
                <li>Transaction fees: $0.25-$1.00</li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-black pt-6">
            <div className="font-medium text-black mb-3">Revenue Distribution on Service Payments:</div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300">
                <div className="font-medium text-black mb-1">Service Providers</div>
                <div className="text-2xl font-bold text-red-600 font-title mb-1">25%</div>
                <div className="text-xs text-gray-600">Direct revenue share</div>
              </div>
              <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300">
                <div className="font-medium text-black mb-1">Team</div>
                <div className="text-2xl font-bold text-red-600 font-title mb-1">25%</div>
                <div className="text-xs text-gray-600">Platform operations</div>
              </div>
              <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300">
                <div className="font-medium text-black mb-1">$ATLAS Holders</div>
                <div className="text-2xl font-bold text-red-600 font-title mb-1">50%</div>
                <div className="text-xs text-gray-600">Buybacks & rewards</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

