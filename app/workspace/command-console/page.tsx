'use client';

import { useState, useEffect } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Link from 'next/link';
import { PaymentGateModal } from '../../components/x402/PaymentGateModal';
import { PaymentStatusBar } from '../../components/x402/PaymentStatusBar';
import { hasValidSession } from '@/lib/x402-session';
import { ManageWallet } from '../../components/ManageWallet';

export default function CommandConsolePage() {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionValid = hasValidSession('command-console');
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
        pageName="Command Console"
        pageId="command-console"
        isOpen={showPaymentModal && isConnected}
        onSuccess={handlePaymentSuccess}
        onClose={() => setShowPaymentModal(false)}
        userAddress={address}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {hasAccess && <PaymentStatusBar pageId="command-console" pageName="Command Console" />}

        {!hasAccess && (
          <div className="mb-12 p-8 border-2 border-dashed border-red-600 bg-red-50">
            <h2 className="text-2xl font-bold text-black mb-3 font-title">Access Required</h2>
            <p className="text-gray-700 mb-4">
              Command Console requires x402 payment. Pay $1.00 USDC for 1 hour of access.
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-4 font-title">
                Command Console
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Discover and interact with x402-powered services. Browse APIs, AI models, and utilities with instant micropayments.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 border-2 border-dashed border-black bg-gray-50">
                <h3 className="text-2xl font-bold text-black mb-4 font-title">Service Discovery</h3>
                <p className="text-gray-600 mb-6">
                  Browse the complete catalog of x402-enabled services across all networks.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">Search and filter by category, network, or price</span>
                    </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">Real-time service availability and health status</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">Instant preview and testing interface</span>
                        </div>
                      </div>
                    </div>

              <div className="p-8 border-2 border-dashed border-black bg-gray-50">
                <h3 className="text-2xl font-bold text-black mb-4 font-title">Pay & Execute</h3>
                <p className="text-gray-600 mb-6">
                  Execute service calls with automatic payment handling via x402 protocol.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">One-click payment and execution</span>
                          </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">Automatic session management and retries</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm">Transaction history and usage analytics</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 border-2 border-dashed border-black bg-white">
                <h3 className="text-2xl font-bold text-black mb-4 font-title">Featured Services</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 border border-gray-200">
                    <div className="text-sm font-medium text-red-600 mb-2">AI/ML</div>
                    <div className="text-lg font-bold text-black mb-1 font-title">GPT-4 API</div>
                    <div className="text-sm text-gray-600">$1.00 per 1K tokens</div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200">
                    <div className="text-sm font-medium text-red-600 mb-2">Data</div>
                    <div className="text-lg font-bold text-black mb-1 font-title">Price Feeds</div>
                    <div className="text-sm text-gray-600">$1.00 per query</div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200">
                    <div className="text-sm font-medium text-red-600 mb-2">Compute</div>
                    <div className="text-lg font-bold text-black mb-1 font-title">Image Processing</div>
                    <div className="text-sm text-gray-600">$1.00 per image</div>
                  </div>
                </div>
                      </div>

              <div className="p-8 border-2 border-dashed border-red-600 bg-white">
                <h3 className="text-2xl font-bold text-black mb-4 font-title">Developer Tools</h3>
                <p className="text-gray-600 mb-6">
                  Generate integration code, test services, and manage your API keys from one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/docs/api-reference"
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium text-center"
                  >
                    View API Docs
                  </Link>
                  <Link
                    href="/docs/quickstart"
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all duration-300 font-medium border-2 border-black text-center"
                  >
                    Quickstart Guide
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
