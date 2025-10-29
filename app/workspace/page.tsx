'use client';

import { useState, useEffect } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ManageWallet } from '../components/ManageWallet';

export default function WorkspacePage() {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const connectWallet = () => {
    open();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const utilities = [
    {
      name: 'Atlas Dashboard',
      description: 'Your balances, payments, mints, services — across Base and Solana. Export and analyze your activity.',
      href: '/workspace/atlas-dashboard',
      status: 'Live',
      category: 'Analytics'
    },
    {
      name: 'Atlas x402',
      description: 'Protocol revenue and usage dashboard. Monitor all user transactions, fees by category, and real-time network metrics.',
      href: '/workspace/atlas-x402',
      status: 'Live',
      category: 'Analytics'
    },
    {
      name: 'Atlas Foundry',
      description: 'Forge and deploy x402-native assets. Create tokens that represent services, access rights, and network value.',
      href: '/workspace/atlas-foundry',
      status: 'Live',
      category: 'Creation'
    },
    {
      name: 'Atlas Index',
      description: 'Real-time signal layer across all x402 services. Track activity, monitor performance, and discover patterns.',
      href: '/workspace/atlas-index',
      status: 'Live',
      category: 'Discovery'
    },
    {
      name: 'Atlas Mesh',
      description: 'Register and configure your services for the x402 economy. Connect once, monetize everywhere.',
      href: '/workspace/atlas-mesh',
      status: 'Live',
      category: 'Integration'
    },
    {
      name: 'Atlas Operator',
      description: 'Autonomous AI operator with full access to x402 services. Execute workflows on your behalf with approval guardrails.',
      href: '/workspace/atlas-operator',
      status: 'Live',
      category: 'AI'
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white"></div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Manage Wallet - Top Right */}
      <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50">
        <ManageWallet />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-32 pb-20">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-16 bg-red-600"></div>
            <div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-title">
                Atlas <span className="text-red-600">Workspace</span>
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Infrastructure for the x402 protocol</p>
            </div>
          </div>
        </div>
        
        {/* Wallet Connection Banner */}
        {!isConnected ? (
          <div className="mb-12 p-8 border-2 border-red-600 bg-red-600/10 backdrop-blur">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1 font-title">Connect Wallet</h3>
                <p className="text-sm text-gray-300">Unlock x402-gated features and services</p>
              </div>
              <button
                onClick={connectWallet}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 font-medium border-2 border-red-600 hover:border-white"
              >
                Connect Now →
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-12 p-8 border-2 border-white/20 bg-white/5 backdrop-blur">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-bold text-white font-title">Connected</h3>
                </div>
                <p className="text-sm text-gray-400 font-mono">{formatAddress(address!)}</p>
              </div>
              <button
                onClick={() => disconnect()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white transition-all duration-300 font-medium border-2 border-white/20"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
        
        {/* Category-based Layout */}
        {['Analytics', 'Creation', 'Discovery', 'Integration', 'AI'].map(category => {
          const categoryUtils = utilities.filter(u => u.category === category);
          if (categoryUtils.length === 0) return null;
          
          return (
            <div key={category} className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white font-title">{category}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {categoryUtils.map((utility, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(utility.href)}
                    className="group relative overflow-hidden text-left transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Subtle gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative border-2 border-white/10 hover:border-red-600 transition-all duration-300 p-8 bg-white/5 backdrop-blur m-[2px]">
                      {/* Status */}
                      <div className="flex items-end justify-end mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          <span className="text-red-600 text-xs font-medium uppercase tracking-wider">
                            {utility.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-600 transition-colors font-title">
                        {utility.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {utility.description}
                      </p>
                      
                      {/* Launch Button */}
                      <div className="flex items-center justify-between">
                        <div className="text-red-600 text-sm font-medium uppercase tracking-wider">Launch</div>
                        <svg className="w-5 h-5 text-red-600 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Resources Section */}
        <div className="mt-20 pt-12 border-t-2 border-white/10">
          <h2 className="text-2xl font-bold text-white mb-8 font-title">Developer Resources</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Link
              href="/docs"
              className="p-6 bg-white/5 border-2 border-white/10 hover:border-red-600 transition-all duration-300 group backdrop-blur"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-600 transition-colors font-title">Documentation</h3>
              <p className="text-sm text-gray-400">Learn how to integrate x402</p>
            </Link>
            <Link
              href="/docs/api-reference"
              className="p-6 bg-white/5 border-2 border-white/10 hover:border-red-600 transition-all duration-300 group backdrop-blur"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-600 transition-colors font-title">API Reference</h3>
              <p className="text-sm text-gray-400">Complete API documentation</p>
            </Link>
            <a
              href="https://github.com/atlas402"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-white/5 border-2 border-white/10 hover:border-red-600 transition-all duration-300 group backdrop-blur"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-600 transition-colors font-title">GitHub</h3>
              <p className="text-sm text-gray-400">Explore open-source code</p>
            </a>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 border-2 border-white/10 bg-white/5 backdrop-blur">
            <div className="text-3xl font-bold text-red-600 mb-1 font-title">6</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Utilities</div>
          </div>
          <div className="p-6 border-2 border-white/10 bg-white/5 backdrop-blur">
            <div className="text-3xl font-bold text-red-600 mb-1 font-title">2</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Networks</div>
          </div>
          <div className="p-6 border-2 border-white/10 bg-white/5 backdrop-blur">
            <div className="text-3xl font-bold text-red-600 mb-1 font-title">∞</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Services</div>
          </div>
          <div className="p-6 border-2 border-white/10 bg-white/5 backdrop-blur">
            <div className="text-3xl font-bold text-red-600 mb-1 font-title">24/7</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Uptime</div>
          </div>
        </div>
      </main>
    </div>
  );
}
