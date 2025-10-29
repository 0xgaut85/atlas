'use client';

import { useState, useEffect } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Link from 'next/link';
import { PaymentGateModal } from '../../components/x402/PaymentGateModal';
import { PaymentStatusBar } from '../../components/x402/PaymentStatusBar';
import { IntegrationLayer } from '../../components/x402/IntegrationLayer';
import { hasValidSession } from '@/lib/x402-session';
import { ManageWallet } from '../../components/ManageWallet';
import GlitchText from '../../components/motion/GlitchText';

export default function AtlasMeshPage() {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionValid = hasValidSession('atlas-mesh');
    setHasAccess(sessionValid);
    if (!sessionValid) {
      setShowPaymentModal(true);
    }
  }, []);

  const handlePaymentSuccess = () => {
    setHasAccess(true);
    setShowPaymentModal(false);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <div className="min-h-screen bg-white text-black pt-24 pb-20">
      {/* Back Button - Top Right */}
      <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50">
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-lg"
        >
          <span className="text-sm sm:text-base font-medium">Back</span>
          <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:translate-x-1">↩</span>
        </Link>
      </div>

      {/* Manage Wallet - Below Back Button */}
      <ManageWallet />

      <PaymentGateModal
        pageName="Atlas Mesh"
        pageId="atlas-mesh"
        isOpen={showPaymentModal && isConnected}
        onSuccess={handlePaymentSuccess}
        onClose={() => setShowPaymentModal(false)}
        userAddress={address}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {hasAccess && <PaymentStatusBar pageId="atlas-mesh" pageName="Atlas Mesh" />}

        {!hasAccess && (
          <div className="mb-12 p-8 border-2 border-dashed border-red-600 bg-red-50">
            <h2 className="text-2xl font-bold text-black mb-3 font-title">Access Required</h2>
            <p className="text-gray-700 mb-4">
              Atlas Mesh requires x402 payment. Pay $1.00 USDC for 1 hour of access.
            </p>
            {!isConnected ? (
              <button
                onClick={() => open()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium"
              >
                Connect Wallet to Continue
              </button>
            ) : (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium"
              >
                Pay to Access
              </button>
            )}
          </div>
        )}

        {hasAccess && (
          <>
            {/* Hero Section */}
            <div className="mb-16 text-center max-w-4xl mx-auto">
              <h1 className="text-[clamp(4rem,10vw,7rem)] font-bold text-black mb-6 font-title leading-[0.9]">
                <GlitchText text="Atlas" delay={300} replayOnView inViewThreshold={0.6} />{' '}
                <span className="text-red-600">
                  <GlitchText text="Mesh" delay={600} replayOnView inViewThreshold={0.6} />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
                Turn your API into a revenue stream. Register your service and start earning with every request.
              </p>
              
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2 font-title">5min</div>
                  <div className="text-sm text-gray-600">Setup Time</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2 font-title">2</div>
                  <div className="text-sm text-gray-600">Networks</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2 font-title">$0</div>
                  <div className="text-sm text-gray-600">Platform Fee</div>
                </div>
              </div>
            </div>

            {/* Integration Layer Component */}
            <IntegrationLayer />

            {/* Bottom CTA */}
            <div className="mt-16 bg-black text-white p-12 rounded-lg text-center">
              <h3 className="text-3xl font-bold mb-4 font-title">Need Help Getting Started?</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Check our comprehensive guides for Express.js, Python, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs/quickstart"
                  className="px-8 py-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                >
                  Quick Start Guide
                </Link>
                <Link
                  href="/docs"
                  className="px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-all"
                >
                  View All Docs
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
