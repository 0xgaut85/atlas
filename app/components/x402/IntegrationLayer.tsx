'use client';

import { useState } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { validateServiceEndpoint, validatePaymentAmount } from '@/lib/x402-utils';
import { motion } from 'framer-motion';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';
import Link from 'next/link';

export function IntegrationLayer() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  const [activeTab, setActiveTab] = useState<'register' | 'guides'>('register');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    price: {
      amount: '',
      currency: 'USDC' as 'USDC' | 'SOL',
    },
    network: 'base',
    category: 'Other',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    serviceId?: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const categories = [
    { id: 'AI', name: 'AI & Machine Learning' },
    { id: 'API', name: 'API Services' },
    { id: 'Data', name: 'Data & Analytics' },
    { id: 'Payment', name: 'Payment Services' },
    { id: 'Infrastructure', name: 'Infrastructure' },
    { id: 'Other', name: 'Other Services' },
  ];

  const networks = [
    { id: 'base', name: 'Base Mainnet' },
    { id: 'solana-mainnet', name: 'Solana Mainnet' },
  ];

  const currencies = [
    { id: 'USDC', name: 'USDC', networks: ['base'] },
    { id: 'SOL', name: 'SOL', networks: ['solana-mainnet'] },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.endpoint.trim()) {
      newErrors.endpoint = 'API endpoint is required';
    } else if (!validateServiceEndpoint(formData.endpoint)) {
      newErrors.endpoint = 'Please enter a valid HTTPS URL';
    }

    if (!formData.price.amount) {
      newErrors.price = 'Price is required';
    } else if (!validatePaymentAmount(formData.price.amount)) {
      newErrors.price = 'Price must be between $0.001 and $1000';
    }

    const selectedCurrency = currencies.find(c => c.id === formData.price.currency);
    if (selectedCurrency && !selectedCurrency.networks.includes(formData.network)) {
      newErrors.currency = `${formData.price.currency} is not supported on ${formData.network}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setErrors({ wallet: 'Please connect your wallet first' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Show payment modal for $50 registration fee
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async () => {
    setShowPaymentModal(false);
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/x402/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          developerAddress: address,
          registrationFeePaid: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.serviceId) {
          try {
            await fetch('/api/admin/services', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: data.serviceId,
                name: formData.name,
                description: formData.description,
                endpoint: formData.endpoint,
                merchantAddress: address?.toLowerCase(),
                category: formData.category,
                network: formData.network,
                priceAmount: formData.price.amount,
                priceCurrency: formData.price.currency,
                metadata: {
                  registrationFeePaid: true,
                },
              }),
            });
          } catch (error) {
            console.error('Failed to upsert service', error);
          }
        }

        if (address) {
          try {
            await fetch('/api/admin/user-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userAddress: address.toLowerCase(),
                eventType: 'service_registered',
                network: formData.network,
                referenceId: data.serviceId,
                amountMicro: 50_000_000,
                metadata: {
                  name: formData.name,
                  description: formData.description,
                  endpoint: formData.endpoint,
                  category: formData.category,
                },
              }),
            });
          } catch (error) {
            console.error('Failed to log service registration event', error);
          }
        }

        setSubmitResult({
          success: true,
          message: data.message,
          serviceId: data.serviceId,
        });
        
        setFormData({
          name: '',
          description: '',
          endpoint: '',
          price: { amount: '', currency: 'USDC' },
          network: 'base',
          category: 'Other',
        });
      } else {
        setSubmitResult({
          success: false,
          message: data.error || 'Registration failed',
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev];
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b-2 border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-6 py-3 font-title text-lg transition-all ${
            activeTab === 'register'
              ? 'text-black border-b-4 border-red-600 -mb-[18px]'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          Register Service
        </button>
        <button
          onClick={() => setActiveTab('guides')}
          className={`px-6 py-3 font-title text-lg transition-all ${
            activeTab === 'guides'
              ? 'text-black border-b-4 border-red-600 -mb-[18px]'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          Integration Guides
        </button>
      </div>

      {activeTab === 'register' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
      {/* Wallet Connection Alert */}
      {!isConnected && (
              <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-red-900 font-medium mb-1">Wallet Required</p>
                    <p className="text-red-700 text-sm">Connect your wallet to register a service</p>
                  </div>
                </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {submitResult && (
              <div className={`mb-6 p-6 rounded-lg border-2 ${
          submitResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`text-3xl ${submitResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {submitResult.success ? '✓' : '✗'}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold mb-1 ${submitResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {submitResult.success ? 'Registration Successful!' : 'Registration Failed'}
              </h4>
                    <p className={`text-sm ${submitResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {submitResult.message}
              </p>
              {submitResult.serviceId && (
                      <p className="text-sm text-green-700 mt-2 font-mono bg-green-100 p-2 rounded">
                        ID: {submitResult.serviceId}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
            <div className="bg-white border-2 border-dashed border-black p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-black mb-6 font-title">Service Details</h3>
              
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div>
                  <label className="block text-sm font-medium text-black mb-2">
              Service Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., AI Content Generator"
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
                  {errors.name && <p className="text-red-600 text-sm mt-2">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
                  <label className="block text-sm font-medium text-black mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what your service does and how it helps users..."
              rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
                  {errors.description && <p className="text-red-600 text-sm mt-2">{errors.description}</p>}
          </div>

          {/* API Endpoint */}
          <div>
                  <label className="block text-sm font-medium text-black mb-2">
              API Endpoint *
            </label>
            <input
              type="url"
              value={formData.endpoint}
              onChange={(e) => handleInputChange('endpoint', e.target.value)}
              placeholder="https://api.yourservice.com/endpoint"
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                      errors.endpoint ? 'border-red-500' : 'border-gray-300'
              }`}
            />
                  {errors.endpoint && <p className="text-red-600 text-sm mt-2">{errors.endpoint}</p>}
                  <p className="text-gray-500 text-xs mt-2">
              Your API must implement x402 payment middleware
            </p>
          </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleInputChange('category', category.id)}
                        className={`p-4 border-2 rounded-lg transition-all text-left ${
                          formData.category === category.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-300 bg-white hover:border-red-300'
                        }`}
                      >
                        <div className={`text-sm font-medium ${formData.category === category.id ? 'text-red-600' : 'text-black'}`}>
                          {category.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price and Network */}
                <div className="grid grid-cols-2 gap-4">
            <div>
                    <label className="block text-sm font-medium text-black mb-2">
                Price per Request *
              </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="1000"
                value={formData.price.amount}
                onChange={(e) => handleInputChange('price.amount', e.target.value)}
                placeholder="1.00"
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
                    </div>
                    {errors.price && <p className="text-red-600 text-sm mt-2">{errors.price}</p>}
            </div>

            <div>
                    <label className="block text-sm font-medium text-black mb-2">
                Network
              </label>
              <select
                value={formData.network}
                      onChange={(e) => {
                        const newNetwork = e.target.value;
                        handleInputChange('network', newNetwork);
                        // Auto-update currency based on network
                        if (newNetwork === 'base') {
                          handleInputChange('price.currency', 'USDC');
                        } else if (newNetwork === 'solana-mainnet') {
                          handleInputChange('price.currency', 'SOL');
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
              >
                {networks.map(network => (
                        <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Connected Wallet Info */}
          {isConnected && address && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <h4 className="font-medium text-black">Connected Wallet</h4>
                    </div>
                    <p className="text-gray-700 text-sm font-mono break-all">{address}</p>
                    <p className="text-gray-500 text-xs mt-2">
                Payments will be sent to this address
              </p>
            </div>
          )}

                            {/* Registration Fee Notice */}
                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm text-red-900 font-medium mb-1">Registration Fee Required</p>
                                  <p className="text-sm text-red-700">
                                    $50 USDC one-time fee to register your service on Atlas402
                                  </p>
                                </div>
                              </div>
                            </div>

          {/* Submit Button */}
            <button
              type="submit"
              disabled={!isConnected || isSubmitting}
                  className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-all ${
                !isConnected || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
              }`}
            >
                  {isSubmitting ? 'Submitting...' : 'Pay $50 & Register Service →'}
            </button>
              </form>
            </div>
          </div>

          {/* Right Column - Preview & Info */}
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-gradient-to-br from-red-50 to-white border-2 border-dashed border-red-600 p-8 rounded-lg">
              <h4 className="text-lg font-bold text-black mb-4 font-title">Service Preview</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-red-600"></div>
                  <div>
                    <div className="text-gray-500 text-xs">Name</div>
                    <div className="text-black font-medium">
                      {formData.name || 'Your Service Name'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-red-600"></div>
                  <div>
                    <div className="text-gray-500 text-xs">Price</div>
                    <div className="text-black font-medium">
                      {formData.price.amount ? `$${formData.price.amount} ${formData.price.currency}` : 'Set your price'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-red-600"></div>
                  <div>
                    <div className="text-gray-500 text-xs">Network</div>
                    <div className="text-black font-medium capitalize">
                      {formData.network}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="bg-white border-2 border-dashed border-black p-6 rounded-lg">
              <h4 className="text-lg font-bold text-black mb-4 font-title">Requirements</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-black font-medium">HTTPS Endpoint</p>
                    <p className="text-gray-600 text-sm">API must use secure HTTPS</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-black font-medium">x402 Middleware</p>
                    <p className="text-gray-600 text-sm">Implement payment verification</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-black font-medium">Connected Wallet</p>
                    <p className="text-gray-600 text-sm">Receive payments to your address</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-black font-medium">24h Review</p>
                    <p className="text-gray-600 text-sm">Services reviewed within 24 hours</p>
                  </div>
                </li>
              </ul>
      </div>

            {/* Registration Fee Card */}
            <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-600 p-6 rounded-lg">
              <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Registration Fee
              </h4>
              <div className="text-4xl font-bold text-red-600 mb-2 font-title">$50</div>
              <p className="text-sm text-gray-600">
                One-time USDC payment on Base Mainnet to list your service
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-2 border-black p-4 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1 font-title">24h</div>
                <div className="text-sm text-gray-600">Review Time</div>
              </div>
              <div className="bg-white border-2 border-black p-4 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1 font-title">2</div>
                <div className="text-sm text-gray-600">Networks Live</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guides' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Express.js Guide */}
          <Link href="/docs/server-express" className="group">
            <div className="bg-white border-2 border-black p-8 rounded-lg hover:border-red-600 transition-all h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-3 font-title group-hover:text-red-600 transition-colors">
                Express.js Server
              </h3>
              <p className="text-gray-600 mb-4">
                Node.js implementation with x402 middleware. Deploy in 5 minutes.
              </p>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                JavaScript/TypeScript
              </div>
            </div>
          </Link>

          {/* Python Guide */}
          <Link href="/docs/server-python" className="group">
            <div className="bg-white border-2 border-black p-8 rounded-lg hover:border-red-600 transition-all h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-3 font-title group-hover:text-red-600 transition-colors">
                Python Server
              </h3>
              <p className="text-gray-600 mb-4">
                FastAPI/Flask integration with automatic payment verification.
              </p>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                Python
              </div>
            </div>
          </Link>

          {/* Echo Merchant */}
          <Link href="/docs/echo-merchant" className="group">
            <div className="bg-white border-2 border-black p-8 rounded-lg hover:border-red-600 transition-all h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-3 font-title group-hover:text-red-600 transition-colors">
                Echo Merchant
              </h3>
              <p className="text-gray-600 mb-4">
                Free testing service to validate your x402 integration before going live.
              </p>
              <div className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs rounded">
                Free Testing
              </div>
            </div>
          </Link>

          {/* Client Libraries */}
          <Link href="/docs/clients" className="group">
            <div className="bg-white border-2 border-black p-8 rounded-lg hover:border-red-600 transition-all h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-3 font-title group-hover:text-red-600 transition-colors">
                Client Libraries
              </h3>
              <p className="text-gray-600 mb-4">
                HTTP client integrations for consuming x402 services in your apps.
              </p>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                Multiple Languages
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Payment Modal for $50 Registration Fee */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-2 border-dashed border-black rounded-lg p-8 max-w-md w-full relative"
          >
            {/* Corner accents */}
            <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-red-600" />
            <div className="absolute top-[-1px] right-[-1px] w-4 h-4 border-t-2 border-r-2 border-red-600" />
            <div className="absolute bottom-[-1px] left-[-1px] w-4 h-4 border-b-2 border-l-2 border-red-600" />
            <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-red-600" />

            <h3 className="text-2xl font-bold text-black mb-4 font-title">Registration Fee</h3>
            <p className="text-gray-600 mb-6">
              Pay a one-time fee of <span className="font-bold text-red-600">$50 USDC</span> to register your service on Atlas402.
            </p>

            {/* Payment Details */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Registration Fee</span>
                <span className="text-2xl font-bold text-red-600">$50.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Currency</span>
                <span className="text-black font-medium">USDC</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Network</span>
                <span className="text-black font-medium">Base Mainnet</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={isPaying}
                className="flex-1 px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!walletProvider) {
                    alert('Wallet provider not available');
                    return;
                  }

                  setIsPaying(true);
                  
                  try {
                    // Get the connected address
                    const accounts = await walletProvider.request({ method: 'eth_accounts' });
                    const from = accounts[0];

                    if (!from) {
                      throw new Error('No connected account found');
                    }

                    // Convert $50 to micro-units (USDC has 6 decimals)
                    const amountInMicro = 50 * 1_000_000; // 50 USDC
                    const amountHex = '0x' + amountInMicro.toString(16).padStart(64, '0');

                    // ERC-20 transfer function signature: transfer(address,uint256)
                    const transferFunctionSignature = '0xa9059cbb';
                    const recipientPadded = X402_CONFIG.payTo.substring(2).padStart(64, '0');
                    
                    const data = transferFunctionSignature + recipientPadded + amountHex.substring(2);

                    // Send transaction to USDC contract on Base
                    const txHash = await walletProvider.request({
                      method: 'eth_sendTransaction',
                      params: [{
                        from,
                        to: TOKENS.usdcEvm, // Base USDC contract
                        data,
                        value: '0x0',
                      }],
                    });

                    console.log('$50 USDC registration fee paid:', txHash);
                    
                    // Track the registration payment
                    try {
                      await fetch('/api/admin/payment-tracker', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          txHash,
                          network: 'base',
                          from,
                          to: X402_CONFIG.payTo,
                          amountMicro: 50_000_000,
                          category: 'registration',
                          service: 'Atlas Mesh Service Registration',
                          metadata: {
                            serviceName: formData.name,
                            endpoint: formData.endpoint,
                            developerAddress: address
                          }
                        })
                      });
                      console.log('✅ Registration payment tracked:', txHash);
                    } catch (e) {
                      console.error('Failed to track registration payment:', e);
                    }
                    
                    // Wait a moment for transaction to propagate
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    setIsPaying(false);
                    handlePaymentComplete();
                  } catch (error: any) {
                    console.error('Payment failed:', error);
                    setIsPaying(false);
                    alert(`Payment failed: ${error.message || 'Unknown error'}`);
                  }
                }}
                disabled={isPaying || !walletProvider}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50"
              >
                {isPaying ? 'Processing...' : 'Pay $50 USDC'}
              </button>
            </div>

            {isPaying && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Confirm payment in your wallet...</span>
                </div>
              </div>
            )}
          </motion.div>
      </div>
      )}
    </div>
  );
}
