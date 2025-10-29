'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X402Service } from '@/lib/payai-client';
import { ServiceCard } from './ServiceCard';

interface ServiceMarketplaceProps {
  onTestService: (serviceId: string) => void;
  onGetCode: (serviceId: string) => void;
  onPayAndUse?: (serviceId: string) => void;
  isTestingActive?: boolean;
}

export function ServiceMarketplace({ onTestService, onGetCode, onPayAndUse, isTestingActive = false }: ServiceMarketplaceProps) {
  const router = useRouter();
  const [services, setServices] = useState<X402Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<X402Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showAll, setShowAll] = useState(false); // New state for "Load More"

  const categories = ['All', 'AI', 'Content', 'Development', 'Data', 'Tokens', 'Gaming', 'Social', 'Other'];
  const networks = ['All', 'base', 'base-sepolia', 'solana-mainnet', 'solana-devnet', 'polygon', 'peaq'];
  const [serviceType, setServiceType] = useState<'all' | 'production' | 'test'>('all');

  // Display only first 9 services unless "Load More" is clicked
  const displayedServices = showAll ? filteredServices : filteredServices.slice(0, 9);
  const hasMore = filteredServices.length > 9;

  // Fetch services on component mount
  useEffect(() => {
    fetchServices(); // Initial load
    
    // Auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing services...');
      fetchServices();
    }, 60000); // 60 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Filter services when filters change
  useEffect(() => {
    applyFilters();
    setShowAll(false); // Reset to show only 9 when filters change
  }, [services, selectedCategory, selectedNetwork, searchQuery, serviceType]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/x402/discover');
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
        setLastRefresh(new Date());
      } else {
        setError(data.error || 'Failed to load services');
      }
    } catch (err) {
      setError('Failed to connect to x402 services');
      console.error('Service fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Service type filter (production vs test)
    if (serviceType === 'production') {
      filtered = filtered.filter(service => 
        !service.id.includes('echo-merchant') && 
        !service.name.toLowerCase().includes('test') && 
        !service.name.toLowerCase().includes('echo') &&
        !service.description.toLowerCase().includes('free testing')
      );
    } else if (serviceType === 'test') {
      filtered = filtered.filter(service => 
        service.id.includes('echo-merchant') || 
        service.name.toLowerCase().includes('test') || 
        service.name.toLowerCase().includes('echo') ||
        service.description.toLowerCase().includes('free testing')
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Network filter
    if (selectedNetwork !== 'All') {
      filtered = filtered.filter(service => service.price.network === selectedNetwork);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  // Count production vs test services
  const productionCount = services.filter(s => 
    !s.id.includes('echo-merchant') && 
    !s.name.toLowerCase().includes('test') && 
    !s.name.toLowerCase().includes('echo') &&
    !s.description.toLowerCase().includes('free testing')
  ).length;
  const testCount = services.filter(s => 
    s.id.includes('echo-merchant') || 
    s.name.toLowerCase().includes('test') || 
    s.name.toLowerCase().includes('echo') ||
    s.description.toLowerCase().includes('free testing')
  ).length;

  const handleRefresh = () => {
    fetchServices();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-light">Discovering x402 services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-black/40 backdrop-blur-sm border border-white/[0.15] rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-white font-light mb-2">Connection Error</h3>
          <p className="text-gray-400 text-sm mb-4 font-light">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-light"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-white">x402 Service Marketplace</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-400 font-light">
              {filteredServices.length} services available
            </p>
            <span className="text-gray-700">|</span>
            <p className="text-red-600 font-light">
              {productionCount} Production
            </p>
            <p className="text-gray-400 font-light">
              {testCount} Test
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="inline-flex items-center gap-2 text-red-600 font-light">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              <span>Live</span>
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-gray-500 font-light">
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-gray-600 text-xs font-light">
              (auto-refresh: 60s)
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 border border-white/20 text-white rounded hover:bg-white/10 transition-all font-light"
        >
          Refresh
        </button>
      </div>

      {/* Service Type Filter */}
      <div>
        <div className="flex gap-3">
          <button
            onClick={() => setServiceType('all')}
            className={`px-6 py-3 rounded font-light transition-all ${
              serviceType === 'all'
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Services ({services.length})
          </button>
          <button
            onClick={() => setServiceType('production')}
            className={`px-6 py-3 rounded font-light transition-all ${
              serviceType === 'production'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-gray-400 border border-red-600/30 hover:bg-red-600/20 hover:text-white'
            }`}
          >
            Production ({productionCount})
          </button>
          <button
            onClick={() => setServiceType('test')}
            className={`px-6 py-3 rounded font-light transition-all ${
              serviceType === 'test'
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Test ({testCount})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/40 backdrop-blur-sm border border-white/[0.15] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-light text-white mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full px-4 py-3 border border-white/20 rounded focus:outline-none focus:border-red-600 bg-white/5 text-white placeholder-gray-500 font-light"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-light text-white mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded focus:outline-none focus:border-red-600 bg-white/5 text-white font-light"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-black">{cat}</option>
              ))}
            </select>
          </div>

          {/* Network Filter */}
          <div>
            <label className="block text-sm font-light text-white mb-2">Network</label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded focus:outline-none focus:border-red-600 bg-white/5 text-white font-light"
            >
              {networks.map(net => (
                <option key={net} value={net} className="bg-black">{net}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State - No Production Services Yet */}
      {filteredServices.length === 0 && serviceType === 'production' && (
        <div className="text-center py-16 bg-black/40 backdrop-blur-sm border border-white/[0.15] rounded-lg">
          <h3 className="text-2xl font-light text-white mb-4">
            Be the First to List Your x402 Service
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto font-light">
            The x402 ecosystem is growing. Deploy your x402-enabled API and register it here 
            to be discovered by users worldwide.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/docs/quickstart')}
              className="px-6 py-3 bg-white/10 text-white rounded hover:bg-white/20 transition-colors font-light border border-white/10"
            >
              View x402 Quickstart
            </button>
            <button
              onClick={() => {/* Service registration modal */}}
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-light"
            >
              Register Your Service
            </button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            <p className="font-light">Using Echo Merchant? Switch to Test tab to test x402 protocol</p>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length === 0 && serviceType !== 'production' ? (
        <div className="text-center py-12">
          <h3 className="text-white font-light mb-2">No services found</h3>
          <p className="text-gray-400 font-light">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : filteredServices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onTest={onTestService}
                onGetCode={onGetCode}
                onPayAndUse={onPayAndUse}
                isTestingActive={isTestingActive}
              />
            ))}
          </div>
          
          {/* Load More Button */}
          {!showAll && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAll(true)}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-red-600 text-white rounded-lg transition-all duration-300 font-light text-lg group"
              >
                <span className="flex items-center gap-3">
                  Load More
                  <span className="text-gray-400 text-sm">
                    ({filteredServices.length - 9} more)
                  </span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
