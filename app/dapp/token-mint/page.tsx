'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Image from 'next/image';
import Link from 'next/link';
import { TokenMarketplace } from '../../components/x402/TokenMarketplace';
import { TestingInterface } from '../../components/x402/TestingInterface';
import { CodeGenerator } from '../../components/x402/CodeGenerator';
import { RealPaymentHandler } from '../../components/x402/RealPaymentHandler';
import { PaymentSuccessModal } from '../../components/x402/PaymentSuccessModal';
import { PaymentGateModal } from '../../components/x402/PaymentGateModal';
import { PaymentStatusBar } from '../../components/x402/PaymentStatusBar';
import { X402Service } from '@/lib/payai-client';
import { hasValidSession } from '@/lib/x402-session';

export default function TokenMintPage() {
  const router = useRouter();
  const { address, isConnected, caipAddress } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  
  // Extract chainId from caipAddress (format: "eip155:8453:0x...")
  const chainId = caipAddress ? parseInt(caipAddress.split(':')[1]) : undefined;
  
  const [mounted, setMounted] = useState(false);
  const [testingServiceId, setTestingServiceId] = useState<string | null>(null);
  const [codeGenServiceId, setCodeGenServiceId] = useState<string | null>(null);
  const [isTestingActive, setIsTestingActive] = useState(false);
  const [paymentService, setPaymentService] = useState<X402Service | null>(null);
  const [services, setServices] = useState<X402Service[]>([]);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentGate, setShowPaymentGate] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has paid for access
    const access = hasValidSession('token-mint');
    setHasAccess(access);
    if (!access) {
      setShowPaymentGate(true);
    }
  }, []);

  const handleTestService = (serviceId: string) => {
    setTestingServiceId(serviceId);
    setIsTestingActive(true);
  };

  const handleCloseTestingInterface = () => {
    setTestingServiceId(null);
    setIsTestingActive(false);
  };

  const handleGetCode = (serviceId: string) => {
    setCodeGenServiceId(serviceId);
  };

  const handleCloseCodeGenerator = () => {
    setCodeGenServiceId(null);
  };

  const handleMintToken = async (serviceId: string) => {
    // Same as Pay and Use for now - will handle minting
    const response = await fetch('/api/x402/discover');
    const data = await response.json();
    
    if (data.success) {
      const service = data.services.find((s: X402Service) => s.id === serviceId);
      if (service) {
        setServices(data.services);
        setPaymentService(service);
      }
    }
  };

  const handlePaymentSuccess = async (txHash: string) => {
    console.log('Mint successful:', txHash);
    
    // Get network name
    const getNetworkName = (chainId: number | undefined) => {
      if (!chainId) return 'Not Connected';
      const networks: Record<number, string> = {
        8453: 'Base Mainnet',
        84532: 'Base Sepolia',
        137: 'Polygon',
        3338: 'Peaq',
        56: 'BSC',
        97: 'BSC Testnet',
      };
      return networks[chainId] || `Chain ID: ${chainId}`;
    };
    
    // Save payment to history
    const newPayment = {
      txHash,
      service: `Token Mint: ${paymentService?.name || 'Unknown Token'}`,
      amount: paymentService?.price.amount || '0',
      timestamp: Date.now(),
      network: getNetworkName(chainId)
    };
    
    // Load existing history
    const savedHistory = localStorage.getItem('x402_payment_history');
    const paymentHistory = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Add new payment and save
    const updatedHistory = [newPayment, ...paymentHistory];
    localStorage.setItem('x402_payment_history', JSON.stringify(updatedHistory));
    
    setPaymentService(null);
    setSuccessTxHash(txHash);
  };

  const handlePaymentError = (error: string) => {
    console.error('Mint error:', error);
    alert(`Minting failed: ${error}`);
  };

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
        pageName="Token Mint"
        pageId="token-mint"
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
        {hasAccess && <PaymentStatusBar pageId="token-mint" pageName="Token Mint" />}
        
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
            <div className="text-left mb-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight">
                Token <span className="font-title text-white">Mint</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl font-light leading-relaxed mb-8">
                Mint and buy new x402 tokens directly, with full "create and launch" capabilities for providers coming soon.
              </p>
              
              {/* Create Token Button */}
              <button
                onClick={() => setShowComingSoon(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-lg text-base font-light hover:bg-red-700 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create x402 Token</span>
              </button>
            </div>
          </div>
        </div>

        {/* Token Marketplace Section */}
        <TokenMarketplace
          onMintToken={handleMintToken}
        />
      </main>

      {/* Testing Interface Modal */}
      {testingServiceId && (
        <TestingInterface
          selectedServiceId={testingServiceId}
          onClose={handleCloseTestingInterface}
        />
      )}

      {/* Code Generator Modal */}
      {codeGenServiceId && (
        <CodeGenerator
          serviceId={codeGenServiceId}
          onClose={handleCloseCodeGenerator}
        />
      )}

      {/* Mint Handler (reusing payment handler for now) */}
      {paymentService && (
        <RealPaymentHandler
          service={paymentService}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => setPaymentService(null)}
        />
      )}

      {/* Mint Success Modal */}
      {successTxHash && (
        <PaymentSuccessModal
          txHash={successTxHash}
          onClose={() => setSuccessTxHash(null)}
        />
      )}

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-light text-white mb-4">Coming Soon</h3>
            <p className="text-gray-400 font-light mb-6 leading-relaxed">
              Full "create and launch" token capabilities for providers are coming soon. Stay tuned!
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-light hover:bg-red-700 transition-all duration-300"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

