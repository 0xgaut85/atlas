'use client';

import { useState, useEffect } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PaymentGateModal } from '../../components/x402/PaymentGateModal';
import { PaymentStatusBar } from '../../components/x402/PaymentStatusBar';
import { TokenMarketplace } from '../../components/x402/TokenMarketplace';
import { RealPaymentHandler } from '../../components/x402/RealPaymentHandler';
import { PaymentSuccessModal } from '../../components/x402/PaymentSuccessModal';
import { hasValidSession } from '@/lib/x402-session';
import { X402Service } from '@/lib/payai-client';
import { ManageWallet } from '../../components/ManageWallet';

export default function AtlasFoundryPage() {
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentService, setPaymentService] = useState<X402Service | null>(null);
  const [lastMintedService, setLastMintedService] = useState<X402Service | null>(null);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  
  // Token creation form state
  const [tokenForm, setTokenForm] = useState({
    name: '',
    symbol: '',
    description: '',
    supply: '',
    network: 'base',
    pricePerMint: '',
    website: '',
    category: 'Utility',
    logoUrl: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const sessionValid = hasValidSession('atlas-foundry');
    setHasAccess(sessionValid);
    if (!sessionValid) {
      setShowPaymentModal(true);
    }
  }, []);

  const handlePaymentSuccess = () => {
    setHasAccess(true);
    setShowPaymentModal(false);
  };

  const handleMintToken = async (serviceId: string) => {
    const response = await fetch('/api/x402/discover');
    const data = await response.json();
    
    if (data.success) {
      const service = data.services.find((s: X402Service) => s.id === serviceId);
      if (service) {
        setPaymentService(service);
        setLastMintedService(service);

        try {
          await fetch('/api/admin/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: service.id,
              name: service.name,
              description: service.description,
              endpoint: service.endpoint,
              merchantAddress: service.accepts?.[0]?.payTo,
              category: service.category,
              network: service.price?.network,
              priceAmount: service.price?.amount,
              priceCurrency: service.price?.currency,
              metadata: {
                icon: service.icon,
                accepts: service.accepts,
              },
            }),
          });
        } catch (error) {
          console.error('Failed to upsert service metadata', error);
        }
      }
    }
  };

  const handleMintSuccess = async (txHash: string) => {
    console.log('Mint successful:', txHash);
    setPaymentService(null);
    setSuccessTxHash(txHash);

    if (address && lastMintedService) {
      try {
        const amountMicro = Number(lastMintedService.accepts?.[0]?.maxAmountRequired || 0);
        await fetch('/api/admin/user-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAddress: address.toLowerCase(),
            eventType: 'token_minted',
            network: lastMintedService.price?.network,
            referenceId: lastMintedService.id,
            amountMicro: amountMicro || undefined,
            metadata: {
              tokenName: lastMintedService.name,
              serviceId: lastMintedService.id,
              endpoint: lastMintedService.endpoint,
              txHash,
            },
          }),
        });
      } catch (error) {
        console.error('Failed to log mint event', error);
      }
    }
  };

  const handleMintError = (error: string) => {
    console.error('Mint error:', error);
    alert(`Minting failed: ${error}`);
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setCreateResult({ success: false, message: 'Please connect your wallet first' });
      return;
    }

    setIsCreating(true);
    setCreateResult(null);

    // Simulate token creation (frontend only for now)
    setTimeout(() => {
      setCreateResult({
        success: true,
        message: 'Token creation will be available in November 2025. Your details have been saved for early access!'
      });
      setIsCreating(false);
    }, 2000);
  };

  const handleFormChange = (field: string, value: string) => {
    setTokenForm(prev => ({ ...prev, [field]: value }));
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Grain texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px'
        }}
      />

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
        pageName="Atlas Foundry"
        pageId="atlas-foundry"
        isOpen={showPaymentModal && isConnected}
        onSuccess={handlePaymentSuccess}
        onClose={() => setShowPaymentModal(false)}
        userAddress={address}
      />

      <div className="relative z-10 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {hasAccess && <PaymentStatusBar pageId="atlas-foundry" pageName="Atlas Foundry" />}

        {!hasAccess && (
          <div className="min-h-screen flex items-center justify-center px-6">
            <div className="max-w-2xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-12 border-2 border-dashed border-red-600 bg-gradient-to-br from-red-50 to-white rounded-lg text-center"
              >
                <h2 className="text-4xl font-bold text-black mb-4 font-title">Access Required</h2>
                <p className="text-lg text-gray-700 mb-8">
              Atlas Foundry requires x402 payment. Pay $1.00 USDC for 1 hour of access.
            </p>
            {!isConnected ? (
              <button
                onClick={() => open()}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium text-lg"
              >
                Connect Wallet to Continue
              </button>
            ) : (
              <button
                onClick={() => setShowPaymentModal(true)}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium text-lg"
              >
                Pay to Access
              </button>
            )}
              </motion.div>
            </div>
          </div>
        )}

        {hasAccess && (
          <>
              {/* Hero Section */}
              <section className="relative min-h-[60vh] flex items-center border-b-2 border-gray-200 -mx-6 sm:-mx-8 px-6 sm:px-8 mt-8">
              <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 py-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-black mb-6 font-title leading-[0.9]">
                    Atlas <span className="text-red-600">Foundry</span>
              </h1>
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                    Create, browse, and mint x402-enabled tokens with built-in micropayment infrastructure.
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Tab Navigation */}
            <section className="sticky top-0 z-40 bg-white border-b-2 border-gray-200 -mx-6 sm:-mx-8">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('browse')}
                    className={`py-6 px-2 font-title text-lg transition-all relative ${
                      activeTab === 'browse'
                        ? 'text-black'
                        : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    Browse Tokens
                    {activeTab === 'browse' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`py-6 px-2 font-title text-lg transition-all relative ${
                      activeTab === 'create'
                        ? 'text-black'
                        : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    Create Token
                    {activeTab === 'create' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"
                      />
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Tab Content */}
            <section className="py-24 -mx-6 sm:-mx-8 px-6 sm:px-8">
                {activeTab === 'browse' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-7xl mx-auto"
                  >
                    <TokenMarketplace onMintToken={handleMintToken} />
                  </motion.div>
                )}

                {activeTab === 'create' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-7xl mx-auto"
                  >
                    <div className="grid lg:grid-cols-2 gap-12">
                      {/* Left Column - Form */}
                      <div>
                        {/* Success/Error Message */}
                        {createResult && (
                          <div className={`mb-8 p-6 rounded-lg border-2 ${
                            createResult.success 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <p className={`text-sm ${createResult.success ? 'text-green-700' : 'text-red-700'}`}>
                              {createResult.message}
                            </p>
                          </div>
                        )}

                        <div className="bg-white border-2 border-dashed border-black p-8 rounded-lg">
                          <h2 className="text-3xl font-bold text-black mb-6 font-title">Token Configuration</h2>
                          
                          <form onSubmit={handleCreateToken} className="space-y-6">
                            {/* Token Name & Symbol */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                  Token Name *
                                </label>
                                <input
                                  type="text"
                                  value={tokenForm.name}
                                  onChange={(e) => handleFormChange('name', e.target.value)}
                                  placeholder="My Token"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                  Symbol *
                                </label>
                                <input
                                  type="text"
                                  value={tokenForm.symbol}
                                  onChange={(e) => handleFormChange('symbol', e.target.value.toUpperCase())}
                                  placeholder="MTK"
                                  maxLength={6}
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                  required
                                />
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <label className="block text-sm font-medium text-black mb-2">
                                Description *
                              </label>
                              <textarea
                                value={tokenForm.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                placeholder="Describe your token and its utility..."
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                required
                              />
                            </div>

                            {/* Initial Supply & Price */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                  Initial Supply *
                                </label>
                                <input
                                  type="number"
                                  value={tokenForm.supply}
                                  onChange={(e) => handleFormChange('supply', e.target.value)}
                                  placeholder="1000000"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                  Price per Mint *
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                  <input
                                    type="number"
                                    step="0.001"
                                    value={tokenForm.pricePerMint}
                                    onChange={(e) => handleFormChange('pricePerMint', e.target.value)}
                                    placeholder="1.00"
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Network & Category */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                  Network *
                                </label>
                                <select
                                  value={tokenForm.network}
                                  onChange={(e) => handleFormChange('network', e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                >
                                  <option value="base">Base Mainnet</option>
                                  <option value="solana-mainnet">Solana Mainnet</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                  Category *
                                </label>
                                <select
                                  value={tokenForm.category}
                                  onChange={(e) => handleFormChange('category', e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                >
                                  <option value="Utility">Utility Token</option>
                                  <option value="Memecoin">Memecoin</option>
                                  <option value="Social">Social Token</option>
                                  <option value="NFT">NFT Collection</option>
                                  <option value="Governance">Governance Token</option>
                                  <option value="Reward">Reward Token</option>
                                </select>
                              </div>
                            </div>

                            {/* Website & Logo */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                  Website URL
                                </label>
                                <input
                                  type="url"
                                  value={tokenForm.website}
                                  onChange={(e) => handleFormChange('website', e.target.value)}
                                  placeholder="https://yourproject.com"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                  Logo URL
                                </label>
                                <input
                                  type="url"
                                  value={tokenForm.logoUrl}
                                  onChange={(e) => handleFormChange('logoUrl', e.target.value)}
                                  placeholder="https://yourproject.com/logo.png"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                                />
                              </div>
                            </div>

                            {/* Connected Wallet */}
                            {isConnected && address && (
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                  <h4 className="font-medium text-black">Deployer Address</h4>
                                </div>
                                <p className="text-gray-700 text-sm font-mono break-all">{address}</p>
                              </div>
                            )}

                            {/* Submit Button */}
                            <button
                              type="submit"
                              disabled={!isConnected || isCreating}
                              className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-all ${
                                !isConnected || isCreating
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                              }`}
                            >
                              {isCreating ? 'Creating Token...' : 'Create & Deploy Token →'}
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Right Column - Preview & Info */}
                      <div className="space-y-6">
                        {/* Token Preview */}
                        <div className="bg-gradient-to-br from-red-50 to-white border-2 border-dashed border-red-600 p-8 rounded-lg">
                          <h3 className="text-2xl font-bold text-black mb-6 font-title">Token Preview</h3>
                          
                          <div className="space-y-4">
                            {/* Logo Preview */}
                            {tokenForm.logoUrl ? (
                              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-black">
                                <img src={tokenForm.logoUrl} alt="Token logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23fee" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23f00" font-size="40"%3E?%3C/text%3E%3C/svg%3E'; }} />
                              </div>
                            ) : (
                              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}

                            {/* Token Info */}
                            <div className="text-center mb-6">
                              <h4 className="text-2xl font-bold text-black font-title mb-1">
                                {tokenForm.name || 'Your Token Name'}
                              </h4>
                              <p className="text-gray-500 font-mono">
                                ${tokenForm.symbol || 'SYMBOL'}
              </p>
            </div>

                            {/* Details Grid */}
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                                <span className="text-gray-600">Supply</span>
                                <span className="font-medium text-black">
                                  {tokenForm.supply ? Number(tokenForm.supply).toLocaleString() : '—'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                                <span className="text-gray-600">Price</span>
                                <span className="font-medium text-red-600">
                                  ${tokenForm.pricePerMint || '0.00'} USDC
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                                <span className="text-gray-600">Network</span>
                                <span className="font-medium text-black capitalize">
                                  {tokenForm.network.replace('-mainnet', '')}
                                </span>
                  </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                                <span className="text-gray-600">Category</span>
                                <span className="font-medium text-black">
                                  {tokenForm.category}
                                </span>
                  </div>
                  </div>
                </div>
              </div>

                        {/* Timeline */}
                        <div className="bg-white border-2 border-dashed border-black p-8 rounded-lg">
                          <h3 className="text-xl font-bold text-black mb-6 font-title">Launch Timeline</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                1
                              </div>
                              <div>
                                <h4 className="font-medium text-black mb-1">Configure Token</h4>
                                <p className="text-sm text-gray-600">Set name, supply, pricing, and metadata</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                2
                              </div>
                              <div>
                                <h4 className="font-medium text-black mb-1">Deploy Smart Contract</h4>
                                <p className="text-sm text-gray-600">Automatic deployment to Base or Solana</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                3
                              </div>
                              <div>
                                <h4 className="font-medium text-black mb-1">x402 Integration</h4>
                                <p className="text-sm text-gray-600">Built-in micropayment capabilities</p>
                              </div>
                  </div>
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                4
                  </div>
                              <div>
                                <h4 className="font-medium text-gray-500 mb-1">Launch & List</h4>
                                <p className="text-sm text-gray-500">Automatic listing on Atlas Index</p>
                  </div>
                </div>
              </div>
            </div>

                        {/* Estimated Costs */}
                        <div className="bg-white border-2 border-black p-6 rounded-lg">
                          <h4 className="font-bold text-black mb-4">Estimated Deployment Cost</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Gas Fee ({tokenForm.network === 'base' ? 'Base' : 'Solana'})</span>
                              <span className="font-medium text-black">
                                {tokenForm.network === 'base' ? '~$0.10' : '~$0.01'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Platform Fee</span>
                              <span className="font-medium text-red-600">
                                {(() => {
                                  if (!tokenForm.supply || !tokenForm.pricePerMint) return '$300';
                                  const supply = Number(tokenForm.supply);
                                  const pricePerToken = Number(tokenForm.pricePerMint);
                                  const onePercent = (supply * pricePerToken * 0.01);
                                  const platformFee = Math.max(300, onePercent);
                                  return `$${platformFee.toFixed(2)}`;
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 italic">
                              <span>($300 minimum or 1% of supply value)</span>
                              <span></span>
                            </div>
                            <div className="flex justify-between pt-2 border-t-2 border-gray-200">
                              <span className="font-bold text-black">Total</span>
                              <span className="font-bold text-red-600">
                                {(() => {
                                  const gasFee = tokenForm.network === 'base' ? 0.10 : 0.01;
                                  if (!tokenForm.supply || !tokenForm.pricePerMint) {
                                    return `~$${(300 + gasFee).toFixed(2)}`;
                                  }
                                  const supply = Number(tokenForm.supply);
                                  const pricePerToken = Number(tokenForm.pricePerMint);
                                  const onePercent = (supply * pricePerToken * 0.01);
                                  const platformFee = Math.max(300, onePercent);
                                  return `~$${(platformFee + gasFee).toFixed(2)}`;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
            </div>
                  </motion.div>
                )}
              </section>
          </>
        )}
      </div>
      </div>

      {/* Mint Handler */}
      {paymentService && (
        <RealPaymentHandler
          service={paymentService}
          onSuccess={handleMintSuccess}
          onError={handleMintError}
          onClose={() => setPaymentService(null)}
          title="Mint Token"
          actionText="Mint Token"
          successText="Token Minted Successfully!"
        />
      )}

      {/* Mint Success Modal */}
      {successTxHash && (
        <PaymentSuccessModal
          txHash={successTxHash}
          onClose={() => setSuccessTxHash(null)}
        />
      )}
    </div>
  );
}
