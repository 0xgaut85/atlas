'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import { ServiceMarketplace } from '../components/x402/ServiceMarketplace';
import { TestingInterface } from '../components/x402/TestingInterface';
import { CodeGenerator } from '../components/x402/CodeGenerator';
import { ServiceRegistration } from '../components/x402/ServiceRegistration';
import { RealPaymentHandler } from '../components/x402/RealPaymentHandler';
import { PaymentSuccessModal } from '../components/x402/PaymentSuccessModal';
import { X402Service } from '@/lib/payai-client';

export default function DappPage() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'dashboard'>('marketplace');
  const [testingServiceId, setTestingServiceId] = useState<string | null>(null);
  const [codeGenServiceId, setCodeGenServiceId] = useState<string | null>(null);
  const [isTestingActive, setIsTestingActive] = useState(false);
  const [showServiceRegistration, setShowServiceRegistration] = useState(false);
  const [paymentService, setPaymentService] = useState<X402Service | null>(null);
  const [services, setServices] = useState<X402Service[]>([]);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    txHash: string;
    service: string;
    amount: string;
    timestamp: number;
    network: string;
  }>>([]);

  useEffect(() => {
    setMounted(true);
    // Load payment history from localStorage on mount
    const savedHistory = localStorage.getItem('x402_payment_history');
    if (savedHistory) {
      try {
        setPaymentHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse payment history:', error);
      }
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

  const handlePayAndUse = async (serviceId: string) => {
    // Fetch service details
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
    console.log('Payment successful:', txHash);
    
    // Save payment to history
    const newPayment = {
      txHash,
      service: paymentService?.name || 'Unknown Service',
      amount: paymentService?.price.amount || '0',
      timestamp: Date.now(),
      network: getNetworkName(chainId)
    };
    
    const updatedHistory = [newPayment, ...paymentHistory];
    setPaymentHistory(updatedHistory);
    localStorage.setItem('x402_payment_history', JSON.stringify(updatedHistory));
    
    setPaymentService(null);
    
    // Show success modal instead of alert
    setSuccessTxHash(txHash);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const connectWallet = () => {
    const injectedConnector = connectors.find(c => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/logosvg.svg"
                  alt="Lumen402"
                  width={72}
                  height={72}
                  className="w-[72px] h-[72px] transition-transform duration-300 group-hover:scale-105"
                />
                <span className="text-2xl font-normal text-white font-title tracking-wide">Lumen402</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Matching Landing Page Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logosvg.svg"
                alt="Lumen402"
                width={72}
                height={72}
                className="w-[72px] h-[72px] transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-normal text-white font-title tracking-wide">Lumen402</span>
            </Link>

            {/* Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-10">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`transition-colors duration-300 text-base font-light tracking-wide ${
                  activeTab === 'marketplace'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`transition-colors duration-300 text-base font-light tracking-wide ${
                  activeTab === 'dashboard'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setShowServiceRegistration(true)}
                className="px-4 py-2 bg-[#74a180] text-white rounded-lg text-sm font-light hover:bg-[#8fb896] transition-all duration-300"
              >
                Register Service
              </button>
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
                  activeTab === 'marketplace'
                    ? 'bg-[#74a180] text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[#74a180] text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
            </div>

            {/* Right Side - Wallet Connection */}
            <div className="hidden sm:flex items-center gap-4">
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl text-white rounded-lg text-sm font-light border border-white/10">
                    <div className="w-2 h-2 bg-[#74a180] rounded-full animate-pulse"></div>
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
                  className="px-5 py-2 bg-[#74a180] text-white rounded-lg text-sm font-light hover:bg-[#8fb896] transition-all duration-300 min-h-[44px]"
                >
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile Wallet - Simplified Icon */}
            <div className="sm:hidden">
              {isConnected ? (
                <button
                  onClick={() => disconnect()}
                  className="px-3 py-2 bg-white/5 backdrop-blur-xl text-white rounded-lg border border-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-3 py-2 bg-[#74a180] text-white rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Add top padding for fixed nav */}
      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-20">
        {activeTab === 'marketplace' && (
          <div>
            {/* Hero Section - Full Width with Grain Background */}
            <div className="relative -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12 py-20 mb-16 overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#74a180]/10 via-transparent to-black" />
              
              {/* Heavy grain texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '150px 150px'
                }}
              />
              
              <div className="relative z-10 max-w-6xl mx-auto">
                <div className="text-left mb-12">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight">
                    Discover <span className="font-title text-white">Lumen</span> Services
                  </h1>
                  <p className="text-xl text-gray-400 max-w-3xl font-light leading-relaxed">
                    The decentralized marketplace for pay-per-request APIs. Connect your wallet, browse live services, and start making micropayments on-chain.
                  </p>
                </div>
                
                {/* Blockchain Networks Carousel - Liquid Glass Effect */}
                <div className="relative">
                  {/* Liquid Glass Container */}
                  <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent border border-white/[0.15] p-8">
                    {/* Glass reflection effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.05] via-transparent to-transparent" />
                    
                    {/* Inner glow */}
                    <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(116,161,128,0.1)]" />
                    
                    <div className="relative z-10">
                      <h3 className="text-center text-lg font-light text-white/90 mb-6 tracking-wide">
                        Supported Networks
                      </h3>
                      
                      {/* Rotating Carousel */}
                      <div className="flex items-center justify-center gap-8 flex-wrap">
                        {/* Base - Live (colored) */}
                        <div className="group relative">
                          <div className="relative w-24 h-24 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/20 p-4 transition-all duration-500 hover:scale-110 hover:bg-white/[0.12] hover:border-[#74a180]/50 hover:shadow-[0_0_30px_rgba(116,161,128,0.3)]">
                            <Image
                              src="/logos/base.jpg"
                              alt="Base"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#74a180] rounded-full flex items-center justify-center border-2 border-black">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            </div>
                          </div>
                          <p className="text-center text-xs text-white/80 mt-2 font-light">Base</p>
                          <p className="text-center text-[10px] text-[#74a180] font-light">Live</p>
                        </div>

                        {/* Solana - Coming Soon (greyed) */}
                        <div className="group relative">
                          <div className="relative w-24 h-24 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 p-4 transition-all duration-500 hover:scale-105 hover:bg-white/[0.08]">
                            <Image
                              src="/logos/solana.jpg"
                              alt="Solana"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg grayscale opacity-40"
                            />
                          </div>
                          <p className="text-center text-xs text-white/50 mt-2 font-light">Solana</p>
                          <p className="text-center text-[10px] text-gray-600 font-light">Soon</p>
                        </div>

                        {/* Polygon - Coming Soon (greyed) */}
                        <div className="group relative">
                          <div className="relative w-24 h-24 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 p-4 transition-all duration-500 hover:scale-105 hover:bg-white/[0.08]">
                            <Image
                              src="/logos/polygon.jpg"
                              alt="Polygon"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg grayscale opacity-40"
                            />
                          </div>
                          <p className="text-center text-xs text-white/50 mt-2 font-light">Polygon</p>
                          <p className="text-center text-[10px] text-gray-600 font-light">Soon</p>
                        </div>

                        {/* BSC - Coming Soon (greyed) */}
                        <div className="group relative">
                          <div className="relative w-24 h-24 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 p-4 transition-all duration-500 hover:scale-105 hover:bg-white/[0.08]">
                            <Image
                              src="/logos/BSC.jpg"
                              alt="BSC"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg grayscale opacity-40"
                            />
                          </div>
                          <p className="text-center text-xs text-white/50 mt-2 font-light">BSC</p>
                          <p className="text-center text-[10px] text-gray-600 font-light">Soon</p>
                        </div>

                        {/* Peaq - Coming Soon (greyed) */}
                        <div className="group relative">
                          <div className="relative w-24 h-24 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 p-4 transition-all duration-500 hover:scale-105 hover:bg-white/[0.08]">
                            <Image
                              src="/logos/peaq.jpg"
                              alt="Peaq"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg grayscale opacity-40"
                            />
                          </div>
                          <p className="text-center text-xs text-white/50 mt-2 font-light">Peaq</p>
                          <p className="text-center text-[10px] text-gray-600 font-light">Soon</p>
                        </div>

                        {/* Sei - Coming Soon (greyed) */}
                        <div className="group relative">
                          <div className="relative w-24 h-24 rounded-xl bg-white/[0.05] backdrop-blur-sm border border-white/10 p-4 transition-all duration-500 hover:scale-105 hover:bg-white/[0.08]">
                            <Image
                              src="/logos/sei.jpg"
                              alt="Sei"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg grayscale opacity-40"
                            />
                          </div>
                          <p className="text-center text-xs text-white/50 mt-2 font-light">Sei</p>
                          <p className="text-center text-[10px] text-gray-600 font-light">Soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated glow effect around container */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#74a180]/0 via-[#74a180]/10 to-[#74a180]/0 animate-pulse opacity-50 blur-xl -z-10" />
                </div>
              </div>
            </div>

            {/* Marketplace Section */}
            <ServiceMarketplace
              onTestService={handleTestService}
              onGetCode={handleGetCode}
              onPayAndUse={handlePayAndUse}
              isTestingActive={isTestingActive}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            {/* Dashboard Hero */}
            <div className="mb-16">
              <h1 className="text-5xl sm:text-6xl font-light text-white mb-4">Dashboard</h1>
              <p className="text-xl text-gray-400 font-light">Monitor your activity and manage your x402 services</p>
            </div>
            
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-12 gap-8 mb-16">
              {/* Left Column - Wallet & Stats */}
              <div className="lg:col-span-5 space-y-8">
                {/* User Stats Section */}
                {!isConnected ? (
                  <div className="relative overflow-hidden">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#74a180]/20 to-transparent" />
                    
                    {/* Grain texture */}
                    <div
                      className="absolute inset-0 opacity-[0.1] pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '150px 150px'
                      }}
                    />
                    
                    <div className="relative text-center py-16 px-8 border border-white/10">
                      <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Image
                          src="/logosvg.svg"
                          alt="Lumen402"
                          width={96}
                          height={96}
                          className="w-24 h-24 opacity-80"
                        />
                      </div>
                      <h3 className="text-2xl text-white font-light mb-3">Connect Wallet</h3>
                      <p className="text-gray-400 text-base font-light mb-8 max-w-sm mx-auto leading-relaxed">
                        View your payment history and transaction details
                      </p>
                      <button
                        onClick={connectWallet}
                        className="px-8 py-3 bg-[#74a180] text-white rounded-lg text-base font-light hover:bg-[#8fb896] transition-all duration-300"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Wallet Info */}
                    <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-8">
                      <h3 className="text-lg font-light text-white mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#74a180] rounded-full animate-pulse"></div>
                        Connected Wallet
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-3 px-4 bg-white/5 rounded border border-white/10">
                          <span className="text-gray-400 text-sm font-light">Address</span>
                          <span className="font-mono text-sm text-white font-light">{address}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 px-4 bg-white/5 rounded border border-white/10">
                          <span className="text-gray-400 text-sm font-light">Network</span>
                          <span className="text-white text-sm font-light">{getNetworkName(chainId)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Supported Networks */}
                    <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-8">
                      <h3 className="text-lg font-light text-white mb-2">Supported Networks</h3>
                      <p className="text-gray-400 text-sm font-light mb-6">
                        x402 works across multiple chains
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded border border-white/10 hover:border-[#74a180]/30 transition-all">
                          <img src="/logos/base.jpg" alt="Base" className="w-6 h-6 rounded object-cover" />
                          <div>
                            <p className="font-light text-xs text-white">Base</p>
                            <p className="text-[10px] text-gray-500 font-light">Mainnet</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded border border-white/10">
                          <img src="/logos/solana.jpg" alt="Solana" className="w-6 h-6 rounded object-cover" />
                          <div>
                            <p className="font-light text-xs text-white">Solana</p>
                            <p className="text-[10px] text-gray-500 font-light">Soon</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded border border-white/10">
                          <img src="/logos/polygon.jpg" alt="Polygon" className="w-6 h-6 rounded object-cover" />
                          <div>
                            <p className="font-light text-xs text-white">Polygon</p>
                            <p className="text-[10px] text-gray-500 font-light">Soon</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded border border-white/10">
                          <img src="/logos/peaq.jpg" alt="Peaq" className="w-6 h-6 rounded object-cover" />
                          <div>
                            <p className="font-light text-xs text-white">Peaq</p>
                            <p className="text-[10px] text-gray-500 font-light">Soon</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Recent Transactions */}
              <div className="lg:col-span-7">
                {isConnected && (
                  <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-8 h-full">
                    <h3 className="text-lg font-light text-white mb-6">Recent Payments</h3>
                    {paymentHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-64 text-center">
                        <div>
                          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-base font-light text-gray-500">No payments yet</p>
                          <p className="text-sm font-light text-gray-600 mt-2">Your transaction history will appear here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {paymentHistory.slice(0, 10).map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/10 hover:bg-white/10 hover:border-[#74a180]/30 transition-all">
                            <div className="flex-1">
                              <p className="font-light text-sm text-white mb-1">{payment.service}</p>
                              <p className="text-xs text-gray-500 font-light">
                                {new Date(payment.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-light text-sm text-white">{payment.amount}</p>
                                <p className="text-xs text-gray-500 font-light">{payment.network}</p>
                              </div>
                              <a
                                href={`https://basescan.org/tx/${payment.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-[#74a180] text-white rounded text-xs font-light hover:bg-[#8fb896] transition-all"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Developer Tools Section - Full Width */}
            <div className="relative overflow-hidden mb-16">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-[#0a0a0a] to-[#74a180]/20" />
              
              {/* Heavy grain texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '150px 150px'
                }}
              />
              
              <div className="relative z-10 p-12 border border-white/10">
                <div className="max-w-4xl mb-10">
                  <h2 className="text-4xl font-light mb-4 text-white">Build Your Own Service</h2>
                  <p className="text-gray-400 text-lg font-light leading-relaxed">
                    Deploy your x402-enabled API and start accepting micropayments. Choose your stack and integrate in minutes.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {/* Express Starter */}
                  <div className="group bg-white/5 border border-white/10 p-6 hover:border-[#74a180]/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-light text-lg text-white">Express.js</h3>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-[#74a180] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed">
                      Node.js server with x402 middleware
                    </p>
                    <button
                      onClick={() => router.push('/docs/server-express')}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded hover:bg-[#74a180] transition-all duration-300 text-sm font-light border border-white/10"
                    >
                      View Guide
                    </button>
                  </div>

                  {/* Python Starter */}
                  <div className="group bg-white/5 border border-white/10 p-6 hover:border-[#74a180]/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-light text-lg text-white">Python</h3>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-[#74a180] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed">
                      FastAPI/Flask integration
                    </p>
                    <button
                      onClick={() => router.push('/docs/server-python')}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded hover:bg-[#74a180] transition-all duration-300 text-sm font-light border border-white/10"
                    >
                      View Guide
                    </button>
                  </div>

                  {/* Echo Merchant */}
                  <div className="group bg-white/5 border border-white/10 p-6 hover:border-[#74a180]/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-light text-lg text-white">Echo Merchant</h3>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-[#74a180] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed">
                      Free testing service
                    </p>
                    <button
                      onClick={() => router.push('/docs/echo-merchant')}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded hover:bg-[#74a180] transition-all duration-300 text-sm font-light border border-white/10"
                    >
                      View Guide
                    </button>
                  </div>

                  {/* Client Libraries */}
                  <div className="group bg-white/5 border border-white/10 p-6 hover:border-[#74a180]/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-light text-lg text-white">Client Libraries</h3>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-[#74a180] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed">
                      HTTP client integrations
                    </p>
                    <button
                      onClick={() => router.push('/docs/clients')}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded hover:bg-[#74a180] transition-all duration-300 text-sm font-light border border-white/10"
                    >
                      View Guide
                    </button>
                  </div>

                  {/* Facilitator API */}
                  <div className="group bg-white/5 border border-white/10 p-6 hover:border-[#74a180]/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-light text-lg text-white">Facilitator API</h3>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-[#74a180] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 font-light leading-relaxed">
                      Payment verification
                    </p>
                    <button
                      onClick={() => router.push('/docs/facilitators')}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded hover:bg-[#74a180] transition-all duration-300 text-sm font-light border border-white/10"
                    >
                      View Guide
                    </button>
                  </div>

                  {/* Register Service - Highlighted */}
                  <div className="bg-[#74a180]/20 border border-[#74a180]/50 p-6 hover:bg-[#74a180]/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-light text-lg text-white">Register Service</h3>
                      <svg className="w-5 h-5 text-[#74a180]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm mb-6 font-light leading-relaxed">
                      List on the marketplace
                    </p>
                    <button
                      onClick={() => setShowServiceRegistration(true)}
                      className="w-full px-4 py-2 bg-[#74a180] text-white rounded hover:bg-[#8fb896] transition-all duration-300 text-sm font-light"
                    >
                      Register Now
                    </button>
                  </div>
                </div>

                {/* How it Works - Compact */}
                <div className="border-t border-white/10 pt-10">
                  <h3 className="font-light text-xl mb-6 text-white">Quick Start</h3>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#74a180]/20 rounded-full flex items-center justify-center border border-[#74a180]/30">
                        <span className="text-[#74a180] text-sm font-light">1</span>
                      </div>
                      <p className="text-sm font-light text-gray-400 leading-relaxed">Deploy your API</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#74a180]/20 rounded-full flex items-center justify-center border border-[#74a180]/30">
                        <span className="text-[#74a180] text-sm font-light">2</span>
                      </div>
                      <p className="text-sm font-light text-gray-400 leading-relaxed">Test with Echo</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#74a180]/20 rounded-full flex items-center justify-center border border-[#74a180]/30">
                        <span className="text-[#74a180] text-sm font-light">3</span>
                      </div>
                      <p className="text-sm font-light text-gray-400 leading-relaxed">Register service</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#74a180]/20 rounded-full flex items-center justify-center border border-[#74a180]/30">
                        <span className="text-[#74a180] text-sm font-light">4</span>
                      </div>
                      <p className="text-sm font-light text-gray-400 leading-relaxed">Start earning</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Service Registration Modal */}
      {showServiceRegistration && (
        <ServiceRegistration
          onClose={() => setShowServiceRegistration(false)}
        />
      )}

      {/* Real Payment Handler */}
      {paymentService && (
        <RealPaymentHandler
          service={paymentService}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => setPaymentService(null)}
        />
      )}

      {/* Payment Success Modal */}
      {successTxHash && (
        <PaymentSuccessModal
          txHash={successTxHash}
          onClose={() => setSuccessTxHash(null)}
        />
      )}
    </div>
  );
}
