'use client';

import { useState, useEffect } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Link from 'next/link';
import { PaymentGateModal } from '../../components/x402/PaymentGateModal';
import { PaymentStatusBar } from '../../components/x402/PaymentStatusBar';
import { X402Indexer } from '../../components/x402/X402Indexer';
import { hasValidSession } from '@/lib/x402-session';
import { ManageWallet } from '../../components/ManageWallet';
import GlitchText from '../../components/motion/GlitchText';

export default function AtlasIndexPage() {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionValid = hasValidSession('atlas-index');
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
        pageName="Atlas Index"
        pageId="atlas-index"
        isOpen={showPaymentModal && isConnected}
        onSuccess={handlePaymentSuccess}
        onClose={() => setShowPaymentModal(false)}
        userAddress={address}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {hasAccess && <PaymentStatusBar pageId="atlas-index" pageName="Atlas Index" />}

        {!hasAccess && (
          <div className="mb-12 p-8 border-2 border-dashed border-red-600 bg-red-50">
            <h2 className="text-2xl font-bold text-black mb-3 font-title">Access Required</h2>
            <p className="text-gray-700 mb-4">
              Atlas Index requires x402 payment. Pay $1.00 USDC for 1 hour of access.
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
            <div className="mb-12">
              <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold text-black mb-4 font-title leading-[0.9]">
                <GlitchText text="Atlas" delay={300} replayOnView inViewThreshold={0.6} />{' '}
                <span className="text-red-600">
                  <GlitchText text="Index" delay={600} replayOnView inViewThreshold={0.6} />
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Real-time visibility into all x402 services, providing transparency, tracking and trust across the network.
              </p>
            </div>

            {/* x402 Indexer Component */}
            <X402Indexer />
          </>
        )}
      </div>
    </div>
  );
}
