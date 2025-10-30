'use client';

import { useState } from 'react';
import { Section } from './page-utils';

interface Transaction {
  network: string;
  time: number;
  user: string;
  amount: number;
  category: string;
  explorer: string;
  service: string | null;
}

// Small mock transactions
const mockTransactions: Transaction[] = [
  {
    network: 'base',
    time: Date.now() - 15 * 60000, // 15 minutes ago
    user: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    amount: 1.25,
    category: 'service',
    explorer: 'https://basescan.org/tx/0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    service: 'atlas-index',
  },
  {
    network: 'solana-mainnet',
    time: Date.now() - 42 * 60000, // 42 minutes ago
    user: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    amount: 0.50,
    category: 'access',
    explorer: 'https://solscan.io/tx/5vJ8qT3mNxKpR2sL4wF6hD9cA1bG7yE8zU0iP5jM3nO6qV4xW9',
    service: 'atlas-operator',
  },
  {
    network: 'base',
    time: Date.now() - 2 * 3600000, // 2 hours ago
    user: '0x8ba1f109551bD432803012645Hac136c58',
    amount: 2.00,
    category: 'registration',
    explorer: 'https://basescan.org/tx/0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
    service: 'atlas-mesh',
  },
  {
    network: 'base',
    time: Date.now() - 3 * 3600000, // 3 hours ago
    user: '0x3cD4e3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d',
    amount: 1.50,
    category: 'mint',
    explorer: 'https://basescan.org/tx/0x2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b',
    service: 'atlas-foundry',
  },
  {
    network: 'solana-mainnet',
    time: Date.now() - 5 * 3600000, // 5 hours ago
    user: 'AhkzKLW8xR3mNpQ9sT5vY7uI1oP4jL6kH9gF2dS0cA3bE5x',
    amount: 0.75,
    category: 'service',
    explorer: 'https://solscan.io/tx/6wK9rT4nXmLpS3tY8vZ0uJ2qP5kM7lI1hG3eT6dA4cB8yF1x',
    service: 'atlas-index',
  },
  {
    network: 'base',
    time: Date.now() - 8 * 3600000, // 8 hours ago
    user: '0x5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f',
    amount: 1.00,
    category: 'service',
    explorer: 'https://basescan.org/tx/0x4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e',
    service: null,
  },
  {
    network: 'base',
    time: Date.now() - 12 * 3600000, // 12 hours ago
    user: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a',
    amount: 0.50,
    category: 'access',
    explorer: 'https://basescan.org/tx/0x8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f',
    service: 'atlas-operator',
  },
  {
    network: 'solana-mainnet',
    time: Date.now() - 16 * 3600000, // 16 hours ago
    user: 'BmK3nP7qR9sT2vY5wX8zA1cD4fG7hJ0kL3mO6pQ9tU2vW5xZ8',
    amount: 1.25,
    category: 'service',
    explorer: 'https://solscan.io/tx/7xL0mQ4oY9rU3wZ6aB2cE5gH8jK1lM4nP7qS0tV3wX6yA9bC3',
    service: 'atlas-index',
  },
  {
    network: 'base',
    time: Date.now() - 20 * 3600000, // 20 hours ago
    user: '0x1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a',
    amount: 1.75,
    category: 'service',
    explorer: 'https://basescan.org/tx/0x0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f',
    service: 'atlas-mesh',
  },
  {
    network: 'base',
    time: Date.now() - 24 * 3600000, // 24 hours ago
    user: '0x6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c',
    amount: 3.00,
    category: 'registration',
    explorer: 'https://basescan.org/tx/0x5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b',
    service: 'atlas-mesh',
  },
];

export function TransactionsDisplay() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [loading] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr === 'unknown') return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Section
      title="Transactions"
      description="x402 requests made through known facilitators"
      href="/explorer"
    >
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Signature</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">From</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Network</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      {tx.explorer && tx.explorer !== '#' ? (
                        <a
                          href={tx.explorer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-red-600 hover:text-red-700 underline"
                        >
                          {formatAddress(tx.explorer.split('/').pop() || '')}
                        </a>
                      ) : (
                        <code className="text-xs font-mono text-gray-400">N/A</code>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs font-mono text-gray-600">{formatAddress(tx.user)}</code>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {tx.network === 'base' ? 'Base' : tx.network === 'solana-mainnet' ? 'Solana' : tx.network}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatTime(tx.time)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

