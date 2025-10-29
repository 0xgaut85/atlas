'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import { motion } from 'framer-motion';

const networks = [
  {
    name: 'Base',
    status: 'Live',
    description: 'Ethereum L2 by Coinbase. Low fees, fast transactions.',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    nativeToken: 'ETH',
    stablecoin: 'USDC'
  },
  {
    name: 'Solana',
    status: 'Live',
    description: 'High-performance blockchain. Sub-cent fees.',
    rpc: 'https://api.mainnet-beta.solana.com',
    explorer: 'https://solscan.io',
    nativeToken: 'SOL',
    stablecoin: 'USDC'
  },
  {
    name: 'Polygon',
    status: 'Planned',
    description: 'EVM-compatible L2. Fast and low-cost.',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeToken: 'MATIC',
    stablecoin: 'USDC'
  },
  {
    name: 'BSC',
    status: 'Planned',
    description: 'Binance Smart Chain. Low transaction fees.',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    nativeToken: 'BNB',
    stablecoin: 'USDC'
  }
];

export default function NetworksPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="center"
        eyebrow="Network Support"
        title="Multi-Chain x402 Payments"
        dek="Atlas402 utilities support multiple blockchain networks. Currently live on Base and Solana mainnets."
        className="mb-24"
      />

      <div className="grid md:grid-cols-2 gap-6 mb-24">
        {networks.map((network, index) => (
          <motion.div
            key={network.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ threshold: 0.35 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white border-2 border-dashed border-black p-8 hover:border-red-600 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title text-2xl font-bold text-black">{network.name}</h3>
              <span className={`px-3 py-1 text-xs font-medium ${
                network.status === 'Live' 
                  ? 'bg-red-100 text-red-600 border border-red-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {network.status}
              </span>
            </div>
            <p className="text-gray-600 mb-6">{network.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">RPC:</span>
                <code className="text-xs bg-gray-50 px-2 py-1 rounded">{network.rpc}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Explorer:</span>
                <a href={`https://${network.explorer}`} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 text-xs">
                  {network.explorer.replace('https://', '')}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Native Token:</span>
                <span className="font-medium text-black">{network.nativeToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stablecoin:</span>
                <span className="font-medium text-black">{network.stablecoin}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-red-50 border-2 border-dashed border-red-600 p-8 lg:p-12">
        <h2 className="font-title text-2xl font-bold text-black mb-4">
          Network Selection
        </h2>
        <p className="text-gray-700 mb-6">
          All Atlas402 utilities support both Base and Solana networks. When creating tokens or registering services, you can choose which network to use. Payments are processed on the selected network.
        </p>
        <div className="bg-white p-6 border-2 border-black">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-medium text-black mb-2">Base Network</div>
              <ul className="space-y-1 text-gray-600">
                <li>• EVM-compatible</li>
                <li>• Low transaction fees</li>
                <li>• Fast confirmation times</li>
                <li>• Coinbase CDP integration</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-black mb-2">Solana Network</div>
              <ul className="space-y-1 text-gray-600">
                <li>• High throughput</li>
                <li>• Sub-cent fees</li>
                <li>• Fast finality</li>
                <li>• SPL token support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

