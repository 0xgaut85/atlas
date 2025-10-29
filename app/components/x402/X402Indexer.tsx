'use client';

import { useState, useEffect } from 'react';
import { X402Service } from '@/lib/payai-client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function X402Indexer() {
  const [services, setServices] = useState<X402Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<X402Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const categories = ['All', 'AI', 'API', 'Data', 'Payment', 'Infrastructure', 'Other'];
  const networks = ['All', 'base', 'solana-mainnet'];

  useEffect(() => {
    fetchServices();
    
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing x402 indexer...');
      fetchServices();
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, selectedCategory, selectedNetwork, searchQuery]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/x402/discover');
      const data = await response.json();

      if (data.success) {
        const uniqueServices = Array.from(
          new Map(data.services.map((service: X402Service) => [service.id, service])).values()
        );
        setServices(uniqueServices);
        setError(null);
        setLastRefresh(new Date());
      } else {
        setError(data.error || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Unable to connect to x402 network');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Exclude Tokens category - x402 Indexer is for services only
    filtered = filtered.filter(service => service.category !== 'Tokens');

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (selectedNetwork !== 'All') {
      filtered = filtered.filter(service => service.price.network === selectedNetwork);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const handleRefresh = () => {
    fetchServices();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-white border-2 border-dashed border-black rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-black font-bold mb-2 font-title">Connection Error</h3>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toolbar - Horizontal Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-gray-200">
        {/* Left - Info */}
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-2xl font-bold text-black font-title">Service Index</h2>
            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
              {filteredServices.length} Services
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        {/* Right - Refresh Button */}
        <button
          onClick={handleRefresh}
          className="px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-50 transition-all font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Filters - Inline Horizontal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services..."
          className="px-4 py-3 border-2 border-black rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border-2 border-black rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <select
          value={selectedNetwork}
          onChange={(e) => setSelectedNetwork(e.target.value)}
          className="px-4 py-3 border-2 border-black rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
        >
          {networks.map(net => (
            <option key={net} value={net}>{net === 'All' ? 'All Networks' : net}</option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-black mb-2 font-title">No Services Found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== 'All' || selectedNetwork !== 'All'
              ? 'Try adjusting your filters'
              : 'No x402 services available yet'}
          </p>
        </div>
      )}

      {/* Service Cards - Horizontal Layout with Website Previews */}
      {filteredServices.length > 0 && (
        <div className="space-y-6">
          {filteredServices.map((service, index) => {
            const getWebsiteUrl = (endpoint: string) => {
              try {
                const url = new URL(endpoint);
                return `${url.protocol}//${url.hostname}`;
              } catch {
                return null;
              }
            };
            const websiteUrl = getWebsiteUrl(service.endpoint);
            const getScreenshotUrl = (url: string) => {
              return `https://api.apiflash.com/v1/urltoimage?access_key=182f19ef948340c29ef9b9eada082156&url=${encodeURIComponent(url)}&format=png&width=1280&height=720`;
            };
            const hasImageError = imageErrors[service.id] || false;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-white border-2 border-black hover:border-red-600 transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left - Website Preview */}
                  <div className="md:w-2/5 relative h-80 md:h-96 bg-gray-100 overflow-hidden flex-shrink-0">
                    {websiteUrl && !hasImageError ? (
                      <div className="relative w-full h-full">
                        <img
                          src={getScreenshotUrl(websiteUrl)}
                          alt={`${service.name} preview`}
                          className="w-full h-full object-cover object-top"
                          onError={() => setImageErrors(prev => ({ ...prev, [service.id]: true }))}
                          loading="lazy"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent group-hover:from-red-600/40 transition-all" />
                        
                        {/* Website URL badge */}
                        <div className="absolute bottom-6 left-6 right-6">
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm text-black text-sm font-medium rounded hover:bg-red-600 hover:text-white transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Visit Website
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center p-8">
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No Preview Available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right - Service Info */}
                  <div className="md:w-3/5 p-8 flex flex-col justify-between">
                    {/* Top - Info */}
                    <div>
                      {/* Service Name & Category */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-3xl font-bold text-black group-hover:text-red-600 transition-colors font-title mb-3">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                              {service.category}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                              {service.price.network}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {service.description}
                      </p>

                      {/* x402 Details */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-white border-l-4 border-black">
                        <h4 className="text-xs font-bold text-black mb-3 uppercase tracking-wide">x402 Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Price per Request</span>
                            <span className="font-bold text-black">${service.price.amount} {service.price.currency}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Network</span>
                            <span className="font-medium text-black">{service.price.network}</span>
                          </div>
                          {service.accepts && service.accepts.length > 0 && (
                            <>
                              {service.accepts[0].scheme && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Scheme</span>
                                  <span className="font-medium text-black">{service.accepts[0].scheme}</span>
                                </div>
                              )}
                              {service.accepts[0].asset && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Payment Asset</span>
                                  <span className="font-mono text-xs text-black">
                                    {service.accepts[0].asset === 'SOL' ? 'SOL' : `${service.accepts[0].asset.slice(0, 6)}...${service.accepts[0].asset.slice(-4)}`}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Endpoint Info */}
                      <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">API Endpoint</div>
                        <a 
                          href={service.endpoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-black hover:text-red-600 transition-colors font-mono break-all flex items-center gap-1"
                        >
                          <span className="break-all">{service.endpoint}</span>
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>

                      {/* Payment Recipient */}
                      {service.accepts && service.accepts[0]?.payTo && (
                        <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Payment Recipient</div>
                          <a
                            href={service.price.network.includes('solana') 
                              ? `https://solscan.io/account/${service.accepts[0].payTo}`
                              : `https://basescan.org/address/${service.accepts[0].payTo}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-black hover:text-red-600 transition-colors break-all flex items-center gap-1"
                          >
                            {service.accepts[0].payTo.slice(0, 10)}...{service.accepts[0].payTo.slice(-8)}
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}

                      {/* x402 Readiness Badge */}
                      {service.accepts && service.accepts.length > 0 && (
                        <div className="mb-6 flex items-center gap-2 px-3 py-2 bg-red-50 rounded border border-red-200">
                          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-xs font-medium text-red-700">x402 Protocol</span>
                        </div>
                      )}

                      {/* Status & Metadata */}
                      <div className="mb-6 flex flex-wrap items-center gap-2">
                        {service.status && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            <div className={`w-2 h-2 rounded-full ${
                              service.status === 'online' ? 'bg-red-600 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                            <span className="capitalize">{service.status}</span>
                          </div>
                        )}
                        {service.responseTime && (
                          <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            ~{service.responseTime}ms
                          </div>
                        )}
                        {service.totalCalls !== undefined && service.totalCalls > 0 && (
                          <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            {service.totalCalls.toLocaleString()} calls
                          </div>
                        )}
                        {service.lastUpdated && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{new Date(service.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Price Display - Large */}
                      <div className="mb-6 p-6 bg-gradient-to-br from-red-50 to-white border-l-4 border-red-600">
                        <div className="text-sm text-gray-500 mb-1">Total Cost</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-red-600 font-title">
                            ${service.price.amount}
                          </span>
                          <span className="text-xl text-gray-600">
                            {service.price.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom - Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href="/dapp/service-hub"
                        className="flex-1 px-6 py-4 bg-black text-white hover:bg-red-600 transition-all duration-300 font-medium text-center rounded"
                      >
                        Test Service
                      </Link>
                      <Link
                        href="/docs/clients"
                        className="flex-1 px-6 py-4 bg-white border-2 border-black text-black hover:border-red-600 hover:text-red-600 transition-all duration-300 font-medium text-center rounded"
                      >
                        Get Code
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
