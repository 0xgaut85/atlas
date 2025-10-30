'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ManageWallet } from '../components/ManageWallet';
import GlitchText from '../components/motion/GlitchText';
import MagneticButton from '../components/motion/MagneticButton';
import HoverRevealCard from '../components/motion/HoverRevealCard';

export default function WorkspacePage() {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);

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
      category: 'Analytics',
      number: '[1]'
    },
    {
      name: 'Atlas x402',
      description: 'Protocol revenue and usage dashboard. Monitor all user transactions, fees by category, and real-time network metrics.',
      href: '/workspace/atlas-x402',
      status: 'Live',
      category: 'Analytics',
      number: '[2]'
    },
    {
      name: 'Atlas Foundry',
      description: 'Forge and deploy x402-native assets. Create tokens that represent services, access rights, and network value.',
      href: '/workspace/atlas-foundry',
      status: 'Live',
      category: 'Creation',
      number: '[3]'
    },
    {
      name: 'Atlas Index',
      description: 'Real-time signal layer across all x402 services. Track activity, monitor performance, and discover patterns.',
      href: '/workspace/atlas-index',
      status: 'Live',
      category: 'Discovery',
      number: '[4]'
    },
    {
      name: 'Atlas Mesh',
      description: 'Register and configure your services for the x402 economy. Connect once, monetize everywhere.',
      href: '/workspace/atlas-mesh',
      status: 'Live',
      category: 'Integration',
      number: '[5]'
    },
    {
      name: 'Atlas Operator',
      description: 'Autonomous AI operator with full access to x402 services. Execute workflows on your behalf with approval guardrails.',
      href: '/workspace/atlas-operator',
      status: 'Live',
      category: 'AI',
      number: '[6]'
    },
    {
      name: 'Payment Tester',
      description: 'Test and debug x402 payment flows step-by-step. Validate endpoints, check 402 responses, and troubleshoot integration issues.',
      href: '/workspace/payment-tester',
      status: 'Live',
      category: 'Development',
      number: '[7]'
    },
    {
      name: 'Service Monitor',
      description: 'Real-time health monitoring for x402 services. Track uptime, response times, and payment success rates across the ecosystem.',
      href: '/workspace/service-monitor',
      status: 'Live',
      category: 'Development',
      number: '[8]'
    },
    {
      name: 'Code Generator',
      description: 'Generate ready-to-use x402 server code for Express, FastAPI, Flask, and Next.js. Copy-paste ready templates with customization.',
      href: '/workspace/code-generator',
      status: 'Live',
      category: 'Development',
      number: '[9]'
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white"></div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Premium grain texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px'
        }}
      />

      {/* Manage Wallet - Top Right */}
      <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50">
        <ManageWallet />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-32 pb-20">
        {/* Hero Section with scroll parallax */}
        <motion.div 
          style={{ y: heroY }}
          className="mb-20 md:mb-28"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-20 md:h-24 bg-red-600"></div>
            <div>
                <h1 className="text-[clamp(3rem,8vw,8rem)] font-bold leading-[0.9] text-black mb-4 font-title tracking-tight">
                  <GlitchText text="Atlas" delay={300} replayOnView inViewThreshold={0.6} />{' '}
                  <span className="text-red-600">
                    <GlitchText text="Workspace" delay={600} replayOnView inViewThreshold={0.6} />
                  </span>
              </h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-[clamp(1rem,2vw,1.5rem)] text-gray-600 font-light leading-tight"
                >
                  Infrastructure for the x402 protocol
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Wallet Connection Banner - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-16"
        >
        {!isConnected ? (
            <div className="p-8 md:p-10 border-2 border-dashed border-red-600 bg-white relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                  <h3 className="text-2xl font-bold text-black mb-2 font-title">Connect Wallet</h3>
                  <p className="text-gray-600 font-light">Unlock x402-gated features and services</p>
              </div>
                <MagneticButton>
              <button
                onClick={connectWallet}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 text-white font-medium transition-all duration-300 hover:bg-red-700 text-lg border-2 border-black"
              >
                    <span>Connect Now</span>
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
              </button>
                </MagneticButton>
            </div>
          </div>
        ) : (
            <div className="p-8 md:p-10 border-2 border-dashed border-black bg-white relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-black font-title">Connected</h3>
                  </div>
                  <p className="text-gray-600 font-mono font-light">{formatAddress(address!)}</p>
                </div>
                <MagneticButton>
              <button
                onClick={() => disconnect()}
                    className="px-6 py-3 bg-white text-black font-medium border-2 border-black transition-all duration-300 hover:bg-black hover:text-white"
              >
                Disconnect
              </button>
                </MagneticButton>
            </div>
          </div>
        )}
        </motion.div>
        
        {/* Category-based Layout with Premium Design */}
        {['Analytics', 'Creation', 'Discovery', 'Integration', 'AI', 'Development'].map((category, catIndex) => {
          const categoryUtils = utilities.filter(u => u.category === category);
          if (categoryUtils.length === 0) return null;
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: catIndex * 0.1 }}
              className="mb-20 md:mb-28"
            >
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold text-black font-title tracking-tight">
                  {category}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-red-600 via-black to-transparent"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {categoryUtils.map((utility, index) => (
                  <HoverRevealCard key={index} delay={index * 0.1}>
                  <button
                    onClick={() => router.push(utility.href)}
                      className="group w-full text-left"
                    >
                      <div className="bg-white p-8 md:p-10 border-2 border-dashed border-black h-full relative transition-all duration-300 hover:border-red-600">
                        {/* Number Badge */}
                        <div className="mb-6">
                          <span className="text-xl font-bold text-red-600 tracking-wider font-title">
                            {utility.number}
                          </span>
                        </div>

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
                        <h3 className="text-2xl md:text-3xl font-bold text-black mb-4 group-hover:text-red-600 transition-colors font-title">
                        {utility.name}
                      </h3>
                      
                      {/* Description */}
                        <p className="text-gray-700 font-light leading-relaxed mb-8 text-sm md:text-base">
                        {utility.description}
                      </p>
                      
                        {/* Launch CTA */}
                      <div className="flex items-center justify-between">
                          <div className="text-red-600 text-sm font-medium uppercase tracking-wider font-title">
                            Launch
                          </div>
                        <svg className="w-5 h-5 text-red-600 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  </HoverRevealCard>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Resources Section - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-32 pt-16 border-t-2 border-dashed border-black"
        >
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold text-black mb-12 font-title tracking-tight">
            Developer Resources
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
            <HoverRevealCard delay={0.1}>
            <Link
              href="/docs"
                className="block p-8 md:p-10 bg-white border-2 border-dashed border-black h-full group transition-all duration-300 hover:border-red-600"
            >
                <h3 className="text-xl md:text-2xl font-bold text-black mb-3 group-hover:text-red-600 transition-colors font-title">
                  Documentation
                </h3>
                <p className="text-gray-700 font-light leading-relaxed">Learn how to integrate x402</p>
            </Link>
            </HoverRevealCard>
            <HoverRevealCard delay={0.2}>
            <Link
              href="/docs/api-reference"
                className="block p-8 md:p-10 bg-white border-2 border-dashed border-black h-full group transition-all duration-300 hover:border-red-600"
            >
                <h3 className="text-xl md:text-2xl font-bold text-black mb-3 group-hover:text-red-600 transition-colors font-title">
                  API Reference
                </h3>
                <p className="text-gray-700 font-light leading-relaxed">Complete API documentation</p>
            </Link>
            </HoverRevealCard>
            <HoverRevealCard delay={0.3}>
            <a
              href="https://github.com/atlas402"
              target="_blank"
              rel="noopener noreferrer"
                className="block p-8 md:p-10 bg-white border-2 border-dashed border-black h-full group transition-all duration-300 hover:border-red-600"
            >
                <h3 className="text-xl md:text-2xl font-bold text-black mb-3 group-hover:text-red-600 transition-colors font-title">
                  GitHub
                </h3>
                <p className="text-gray-700 font-light leading-relaxed">Explore open-source code</p>
            </a>
            </HoverRevealCard>
          </div>
        </motion.div>

        {/* Stats Footer - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {[
            { value: '9', label: 'Utilities' },
            { value: '2', label: 'Networks' },
            { value: '∞', label: 'Services' },
            { value: '24/7', label: 'Uptime' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="p-8 md:p-10 bg-white border-2 border-dashed border-black text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2 font-title">
                  {stat.value}
          </div>
                <div className="text-xs md:text-sm text-gray-600 uppercase tracking-wider font-light">
                  {stat.label}
          </div>
        </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
