'use client';

import { useState, useEffect } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NovaHubPage() {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const connectWallet = () => {
    open(); // Use AppKit modal instead of direct connector
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const utilities = [
    {
      name: 'Service Hub',
      description: 'Discover and consume x402 services. Browse APIs, AI models, and digital tools with pay-per-request.',
      href: '/dapp/service-hub',
      status: 'Live',
      gradient: 'from-red-600/20 via-transparent to-transparent'
    },
    {
      name: 'Token Mint',
      description: "The 'Opensea of x402' - create and distribute x402-native tokens that represent services, usage, and value.",
      href: '/dapp/token-mint',
      status: 'Live',
      gradient: 'from-red-600/15 via-transparent to-transparent'
    },
    {
      name: 'x402 Indexer',
      description: 'Real-time visibility into all x402 services, providing transparency, tracking and trust across the network.',
      href: '/dapp/token-indexer',
      status: 'Live',
      gradient: 'from-red-600/10 via-transparent to-transparent'
    },
    {
      name: 'Integration Layer',
      description: 'Register and manage your services. A connective fabric that makes services plug-and-play across the x402 economy.',
      href: '/dapp/integration-layer',
      status: 'Live',
      gradient: 'from-red-600/15 via-transparent to-transparent'
    },
    {
      name: 'Atlas Native Agent',
      description: 'Autonomous agent with access to all x402 services, capable of interacting on behalf of builders, applications, and machines.',
      href: '/dapp/agent',
      status: 'Live',
      gradient: 'from-red-600/20 via-transparent to-transparent'
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/logosvg.svg"
                  alt="Atlas402"
                  width={72}
                  height={72}
                  className="w-[72px] h-[72px] transition-transform duration-300 group-hover:scale-105"
                />
                <span className="text-2xl font-normal text-white font-title tracking-wide">Atlas402</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logosvg.svg"
                alt="Atlas402"
                width={72}
                height={72}
                className="w-[72px] h-[72px] transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-normal text-white font-title tracking-wide">Atlas402</span>
            </Link>

            {/* Wallet Connection */}
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl text-white rounded-lg text-sm font-light border border-white/10">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span>{formatAddress(address!)}</span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-light min-h-[44px] px-3"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-light hover:bg-red-700 transition-all duration-300 min-h-[44px]"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-32 pb-20">
        {/* Hero Section */}
        <div className="relative -mx-6 sm:-mx-8 px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 mb-12 md:mb-16 overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-black" />
              
          {/* Grain texture */}
              <div
                className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '150px 150px'
                }}
              />
              
          <div className="relative z-10">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-4 md:mb-6 leading-tight">
              Welcome to <span className="font-title text-white">Atlas Hub</span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl font-light leading-relaxed">
              The infrastructure layer for the x402 protocol. Access powerful utilities for service discovery, token management, integration, and autonomous agent interaction.
            </p>
          </div>
            </div>
            
        {/* Utilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilities.map((utility, index) => (
            <button
              key={index}
              onClick={() => router.push(utility.href)}
              className="group relative overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] h-full"
            >
              {/* Card Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${utility.gradient}`} />
                    
                    {/* Grain texture */}
                    <div
                      className="absolute inset-0 opacity-[0.1] pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '150px 150px'
                      }}
                    />
                    
              <div className="relative border border-white/10 group-hover:border-red-600/50 transition-all duration-300 p-8 bg-black/40 backdrop-blur-sm h-full flex flex-col">
                {/* Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center border border-red-600/20">
                        <Image
                          src="/logosvg.svg"
                      alt="Atlas402"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <span className="px-3 py-1 bg-red-600/20 border border-red-600/30 text-red-600 rounded-full text-xs font-light">
                    {utility.status}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-light text-white mb-3 group-hover:text-red-600 transition-colors">
                  {utility.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-400 text-sm font-light leading-relaxed mb-4 flex-grow">
                  {utility.description}
                </p>
                
                {/* Arrow Icon */}
                <div className="flex items-center gap-2 text-red-600 text-sm font-light mt-auto">
                  <span>Launch</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                </div>
              </div>
            </button>
          ))}
            </div>

        {/* Quick Access Documentation */}
        <div className="mt-16 border-t border-white/10 pt-16">
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-8">Resources</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Link
              href="/docs"
              className="p-6 bg-white/5 border border-white/10 hover:border-red-600/50 transition-all duration-300 group"
            >
              <h3 className="text-lg font-light text-white mb-2 group-hover:text-red-600 transition-colors">Documentation</h3>
              <p className="text-sm text-gray-400 font-light">Learn how to integrate x402 into your services</p>
            </Link>
            <Link
              href="/docs/api-reference"
              className="p-6 bg-white/5 border border-white/10 hover:border-red-600/50 transition-all duration-300 group"
            >
              <h3 className="text-lg font-light text-white mb-2 group-hover:text-red-600 transition-colors">API Reference</h3>
              <p className="text-sm text-gray-400 font-light">Complete API documentation and examples</p>
            </Link>
            <a
              href="https://github.com/atlas402"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-white/5 border border-white/10 hover:border-red-600/50 transition-all duration-300 group"
            >
              <h3 className="text-lg font-light text-white mb-2 group-hover:text-red-600 transition-colors">GitHub</h3>
              <p className="text-sm text-gray-400 font-light">Explore open-source code and contribute</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
