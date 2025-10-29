'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Image from 'next/image';
import Link from 'next/link';
import { IntegrationLayer } from '../../components/x402/IntegrationLayer';
import { PaymentGateModal } from '../../components/x402/PaymentGateModal';
import { PaymentStatusBar } from '../../components/x402/PaymentStatusBar';
import { hasValidSession } from '@/lib/x402-session';

export default function IntegrationLayerPage() {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  
  const [mounted, setMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentGate, setShowPaymentGate] = useState(false);

  useEffect(() => {
    setMounted(true);
    const access = hasValidSession('integration-layer');
    setHasAccess(access);
    if (!access) {
      setShowPaymentGate(true);
    }
  }, []);

  const connectWallet = () => {
    open(); // Use AppKit modal instead of direct connector
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
      {/* Payment Gate Modal */}
      <PaymentGateModal
        pageName="Integration Layer"
        pageId="integration-layer"
        isOpen={showPaymentGate && !hasAccess}
        onSuccess={() => {
          setHasAccess(true);
          setShowPaymentGate(false);
        }}
        userAddress={address}
      />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/dapp" className="flex items-center gap-3 group">
              <Image
                src="/logosvg.svg"
                alt="Atlas402"
                width={72}
                height={72}
                className="w-[72px] h-[72px] transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-normal text-white font-title tracking-wide">Atlas402</span>
            </Link>

            {/* Right Side - Wallet Connection */}
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
      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-20">
        {/* Payment Status Bar */}
        {hasAccess && <PaymentStatusBar pageId="integration-layer" pageName="Integration Layer" />}
        
        {/* Hero Section */}
        <div className="relative -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12 py-20 mb-16 overflow-hidden">
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
          
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight">
                Integration <span className="font-title text-white">Layer</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl font-light leading-relaxed">
                A connective fabric that reduces friction and makes services plug-and-play across the x402 economy.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Layer Component */}
        <IntegrationLayer />
      </main>
    </div>
  );
}

