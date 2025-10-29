'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Search, Activity, TrendingUp, Users, DollarSign, Server, Zap, Globe, ArrowUp, ArrowDown, Wallet, X } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useSignMessage } from 'wagmi';
import { WalletButton } from '../components/WalletButton';
import { WalletContextProvider } from '../components/WalletProvider';
import { useEffect, useState } from 'react';

// Sample data for charts
const facilityData = [
  { name: 'xGrain Core', transactions: 4000, volume: 2400 },
  { name: 'BSCPay Hub', transactions: 3000, volume: 1398 },
  { name: 'Wheat Protocol', transactions: 2000, volume: 9800 },
  { name: 'Grain Bridge', transactions: 2780, volume: 3908 },
  { name: 'BSC Gateway', transactions: 1890, volume: 4800 },
];

const serverData = [
  { name: 'Atlas402', value: 400, color: '#EAB308' },
  { name: 'BSCHub', value: 300, color: '#F59E0B' },
  { name: 'WheatNode', value: 200, color: '#D97706' },
  { name: 'Others', value: 100, color: '#92400E' },
];

const transactionData = [
  { time: '00:00', count: 65 },
  { time: '04:00', count: 59 },
  { time: '08:00', count: 80 },
  { time: '12:00', count: 81 },
  { time: '16:00', count: 56 },
  { time: '20:00', count: 55 },
];

function ExplorerContent() {
  const { address, isConnected } = useAppKitAccount();
  const { signMessageAsync } = useSignMessage();
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const verifyWallet = async () => {
      if (isConnected && address && signMessageAsync && !isVerified) {
        setIsVerifying(true);
        try {
          const message = `Sign this message to verify your wallet ownership for Atlas402 explorer.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;
          const signature = await signMessageAsync({ message });
          
          // In a real app, you'd verify the signature on the backend
          // For now, we just check if the signature exists
          if (signature) {
            setIsVerified(true);
          }
        } catch (error) {
          console.error('Signature verification failed:', error);
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyWallet();
  }, [isConnected, address, signMessageAsync, isVerified]);

  // Reset verification when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setIsVerified(false);
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-white">
      {/* Verification Modal */}
      {isConnected && !isVerified && isVerifying && (
        <>
          {/* Backdrop blur */}
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40" />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md w-full"
            >
              <div className="text-center">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-2xl bg-gray-100">
                    <Image 
                      src="/logo.png" 
                      alt="Atlas402 Logo" 
                      width={48} 
                      height={48}
                    />
                  </div>
      </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold italic text-gray-900 mb-2">
                  Verify Your Wallet
                </h2>
                <p className="text-gray-600 text-sm mb-8">
                  Please sign the message in your wallet to verify ownership
                </p>

                {/* Loading Spinner */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Subtle background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white pointer-events-none" />

      {/* Clean Header - Not Blurred */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <Image 
                    src="/logo.png" 
                    alt="Atlas402 Logo" 
                width={28} 
                height={28}
                    priority
                  />
                </div>
            <h1 className="text-xl font-semibold italic text-gray-900">
              Atlas402<span className="text-yellow-600">scan</span>
                </h1>
              </Link>
              
              <div className="flex items-center gap-6">
                {/* Wallet Button */}
                <WalletButton />
              </div>
        </div>
      </header>

      {/* Connect Wallet Message - Not Blurred */}
      {!isVerified && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-yellow-500 rounded-2xl px-6 py-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Wallet className="text-yellow-600" size={24} />
              <div>
                <p className="text-sm font-semibold text-gray-900">Connect Your Wallet</p>
                <p className="text-xs text-gray-600">Please connect and verify your wallet to access the explorer</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content Wrapper with blur filter when not verified */}
      <div className={!isVerified ? 'blur-[4px] pointer-events-none' : ''}>
      {/* Navigation and Search */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-6">
                {/* Navigation Tabs */}
                <nav className="flex items-center gap-1">
                  <button className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-lg">
                    Overview
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    Transactions
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    Facilitators
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    Resources
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    Ecosystem
                  </button>
              </nav>

                {/* Search Bar */}
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                    placeholder="Search transactions..."
                    className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <main className="relative pt-40 px-6 pb-12 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold italic text-gray-900 mb-6">Network Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { title: 'Total Transactions', value: '0', change: '0%', positive: true, icon: Activity },
              { title: 'Active Facilitators', value: '0', change: '0%', positive: true, icon: Server },
              { title: '24h Volume', value: '$0', change: '0%', positive: false, icon: DollarSign },
              { title: 'Network Health', value: '0%', change: 'Coming Soon', positive: true, icon: TrendingUp },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <stat.icon size={20} className="text-black" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                        {stat.positive ? 
                      <ArrowUp size={14} className="text-emerald-600" /> : 
                      <ArrowDown size={14} className="text-red-600" />
                        }
                    <span className={`font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="mb-10 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold italic text-gray-900 mb-4">Top Facilitators</h3>
            <div className="h-72 flex items-center justify-center">
              <p className="text-gray-400 text-lg font-medium">Coming Soon</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold italic text-gray-900 mb-4">24h Activity</h3>
            <div className="h-72 flex items-center justify-center">
              <p className="text-gray-400 text-lg font-medium">Coming Soon</p>
            </div>
          </div>
        </section>

        {/* Tables */}
        <section className="grid grid-cols-1 gap-6 mb-10">
          {/* Top Servers Section */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold italic text-gray-900">Top Servers</h3>
                <p className="text-sm text-gray-500 mt-1">Top addresses that have received x402 transfers and are listed in the Bazaar</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Past 30 Days
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Server</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Activity</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Txns</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Volume</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Buyers</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Latest</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Chain</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Facilitator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { 
                      name: 'server01', 
                      addresses: '0 addresses',
                      more: '',
                      txns: '0', 
                      volume: '$0', 
                      buyers: '0',
                      latest: 'N/A',
                      facilitator: 'Grain',
                      activity: 'low'
                    },
                    { 
                      name: 'server02', 
                      addresses: '0 addresses',
                      more: '',
                      txns: '0', 
                      volume: '$0', 
                      buyers: '0',
                      latest: 'N/A',
                      facilitator: 'Grain',
                      activity: 'low'
                    },
                    { 
                      name: 'server03', 
                      addresses: '0 addresses',
                      more: '',
                      txns: '0', 
                      volume: '$0', 
                      buyers: '0',
                      latest: 'N/A',
                      facilitator: 'Grain',
                      activity: 'low'
                    },
                    { 
                      name: 'server04', 
                      addresses: '0 addresses',
                      more: '',
                      txns: '0', 
                      volume: '$0', 
                      buyers: '0',
                      latest: 'N/A',
                      facilitator: 'Grain',
                      activity: 'low'
                    },
                    { 
                      name: 'server05', 
                      addresses: '0 addresses',
                      more: '',
                      txns: '0', 
                      volume: '$0', 
                      buyers: '0',
                      latest: 'N/A',
                      facilitator: 'Grain',
                      activity: 'low'
                    },
                    { 
                      name: 'server06', 
                      addresses: '0 addresses',
                      more: '',
                      txns: '0', 
                      volume: '$0', 
                      buyers: '0',
                      latest: 'N/A',
                      facilitator: 'Grain',
                      activity: 'low'
                    },
                  ].map((server, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src="/logo.png" 
                            alt="Grain" 
                            className="w-8 h-8 rounded-lg object-contain"
                          />
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{server.name}</div>
                            <div className="text-xs text-gray-500">
                              {server.addresses}
                              {server.more && <span className="ml-1 text-gray-400">{server.more}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-24 h-8">
                          {server.activity === 'high' && (
                            <svg width="96" height="32" viewBox="0 0 96 32" fill="none">
                              <path d="M0 28 L20 28 L25 8 L30 28 L40 28 L50 4 L60 28 L70 28 L80 12 L96 28" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                            </svg>
                          )}
                          {server.activity === 'medium' && (
                            <svg width="96" height="32" viewBox="0 0 96 32" fill="none">
                              <path d="M0 24 L20 20 L40 18 L48 12 L56 16 L70 20 L96 24" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                            </svg>
                          )}
                          {server.activity === 'low' && (
                            <svg width="96" height="32" viewBox="0 0 96 32" fill="none">
                              <path d="M0 28 L96 28" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium">{server.txns}</td>
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium">{server.volume}</td>
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium">{server.buyers}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{server.latest}</td>
                      <td className="py-4 px-4">
                        <svg width="24" height="24" viewBox="0 0 126.61 126.61" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="63.305" cy="63.305" r="63.305" fill="#F3BA2F"/>
                          <path d="M38.73 53.2l24.575-24.574 24.572 24.574 14.288-14.286L63.305 0 24.444 38.914l14.286 14.286zM0 63.305l14.286-14.287 14.286 14.287-14.286 14.286L0 63.305zm38.73 10.105l24.575 24.574 24.572-24.574 14.288 14.286L63.305 126.61 24.444 87.696l-.002-.002 14.288-14.284zM112.327 63.305l14.286-14.287 14.286 14.287-14.286 14.286-14.286-14.286z" fill="#fff"/>
                          <path d="M77.43 63.305l-14.125-14.125-14.125 14.125 14.125 14.125L77.43 63.305z" fill="#fff"/>
                        </svg>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src="/logo.png" 
                            alt="Grain" 
                            className="w-5 h-5 rounded-md object-contain"
                          />
                          <span className="text-sm text-gray-900 font-medium">{server.facilitator}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold italic text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Signature</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Block</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...Array(6)].map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                          N/A
                        </code>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">0</td>
                      <td className="py-3 px-4 text-sm text-gray-500">N/A</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Sellers */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold italic text-gray-900">Active Sellers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: 'seller01', status: 'Coming Soon', volume: '$0' },
                    { name: 'seller02', status: 'Coming Soon', volume: '$0' },
                    { name: 'seller03', status: 'Coming Soon', volume: '$0' },
                    { name: 'seller04', status: 'Coming Soon', volume: '$0' },
                    { name: 'seller05', status: 'Coming Soon', volume: '$0' },
                    { name: 'seller06', status: 'Coming Soon', volume: '$0' },
                  ].map((seller, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">{seller.name}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {seller.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">{seller.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <WalletContextProvider>
      <ExplorerContent />
    </WalletContextProvider>
  );
}