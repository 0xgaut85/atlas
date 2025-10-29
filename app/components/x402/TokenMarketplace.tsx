'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X402Service } from '@/lib/payai-client';
import { motion } from 'framer-motion';

interface TokenMarketplaceProps {
  onMintToken: (serviceId: string) => void;
}

interface TokenData {
  totalSupply?: string;
  totalSupplyRaw?: number;
  maxSupply?: string;
  verified?: boolean;
  isX402Deployment?: boolean;
  registeredOnPayAI?: boolean;
}

export function TokenMarketplace({ onMintToken }: TokenMarketplaceProps) {
  const router = useRouter();
  const [atlasMints, setAtlasMints] = useState<X402Service[]>([]);
  const [marketplaceTokens, setMarketplaceTokens] = useState<X402Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [tokenDataMap, setTokenDataMap] = useState<Record<string, TokenData>>({});
  const [loadingTokenData, setLoadingTokenData] = useState<Record<string, boolean>>({});

  const networks = ['All', 'base', 'solana-mainnet'];

  useEffect(() => {
    fetchAllTokens();
    
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing tokens...');
      fetchAllTokens();
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [atlasMints, marketplaceTokens, selectedNetwork, searchQuery]);

  const fetchAllTokens = async () => {
    try {
      setLoading(true);
      
      // Fetch Atlas Mints from database (priority)
      const [atlasRes, marketplaceRes] = await Promise.all([
        fetch('/api/admin/x402/services'),
        fetch('/api/x402/discover'),
      ]);

      const atlasData = await atlasRes.json();
      const marketplaceData = await marketplaceRes.json();

      // Filter Atlas services for tokens created via our platform
      let atlasTokens: X402Service[] = [];
      if (atlasData.success && atlasData.data) {
        const tokens = atlasData.data.filter((service: any) => 
          service.category === 'Tokens' || service.metadata?.tokenSymbol
        );
        
        // Convert to X402Service format
        atlasTokens = tokens.map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          endpoint: service.endpoint || '',
          price: {
            amount: service.priceAmount || service.metadata?.pricePerMint || '0',
            currency: (service.priceCurrency || 'USDC') as 'USDC' | 'SOL',
            network: service.network || 'base',
          },
          category: service.category || 'Tokens',
          status: 'online' as const,
          accepts: service.accepts || service.metadata?.accepts || [{
            asset: service.network === 'base' ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            payTo: service.merchantAddress || '',
            network: service.network || 'base',
            maxAmountRequired: ((Number(service.priceAmount || service.metadata?.pricePerMint || 0)) * 1_000_000).toString(),
            scheme: service.network === 'base' ? 'x402+eip712' : 'x402+solana',
          }],
          metadata: service.metadata,
        }));
        
        setAtlasMints(atlasTokens);
        console.log(`✅ Loaded ${atlasTokens.length} Atlas Mints from database`);
      }

      // Filter marketplace tokens (from Atlas Network facilitator)
      if (marketplaceData.success && marketplaceData.services) {
        const tokens = marketplaceData.services.filter((service: X402Service) => 
          service.category === 'Tokens'
        );
        // Remove tokens that are already in Atlas Mints (by endpoint or ID)
        const atlasEndpoints = new Set(atlasTokens.map(t => t.endpoint));
        const atlasIds = new Set(atlasTokens.map(t => t.id));
        const uniqueTokens = tokens.filter(token => 
          !atlasEndpoints.has(token.endpoint) && !atlasIds.has(token.id)
        );
        setMarketplaceTokens(uniqueTokens);
        console.log(`✅ Loaded ${uniqueTokens.length} marketplace tokens from Atlas Network`);
      }

      setError(null);
      setLastRefresh(new Date());
      
      // Fetch token data for each token
      const allTokens = [...atlasTokens, ...uniqueTokens];
      fetchTokenDataForTokens(allTokens);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Unable to connect to token sources');
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenDataForTokens = async (tokens: X402Service[]) => {
    for (const token of tokens) {
      if (!token.metadata?.contractAddress && !token.endpoint) continue;
      
      try {
        setLoadingTokenData(prev => ({ ...prev, [token.id]: true }));
        
        // Extract contract address from endpoint or metadata
        const contractAddress = token.metadata?.contractAddress || 
          (token.endpoint.includes('/token/') ? token.endpoint.split('/token/')[1]?.split('/')[0] : null);
        
        if (!contractAddress) {
          setLoadingTokenData(prev => ({ ...prev, [token.id]: false }));
          continue;
        }

        // Fetch token data
        const tokenDataRes = await fetch('/api/token-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractAddress,
            network: token.price?.network || 'base',
          }),
        });

        if (tokenDataRes.ok) {
          const tokenDataResult = await tokenDataRes.json();
          if (tokenDataResult.success) {
            const data = tokenDataResult.data;
            
            // Check if token endpoint is registered on PayAI facilitator (cortex check)
            const isRegistered = await checkTokenRegistration(token.endpoint);
            
            // Check if it's an x402 deployment mint (has our endpoint pattern)
            const isX402Deployment = token.endpoint.includes('/api/token/') && 
              token.endpoint.includes('/mint') &&
              (token.endpoint.includes('api.atlas402.com') || token.endpoint.includes('atlas402.com'));
            
            setTokenDataMap(prev => ({
              ...prev,
              [token.id]: {
                ...data,
                isX402Deployment,
                registeredOnPayAI: isRegistered,
              },
            }));
          }
        }
      } catch (err) {
        console.error(`Error fetching token data for ${token.id}:`, err);
      } finally {
        setLoadingTokenData(prev => ({ ...prev, [token.id]: false }));
      }
    }
  };

  const checkTokenRegistration = async (endpoint: string): Promise<boolean> => {
    try {
      // Check PayAI facilitator discovery endpoint
      const discoveryUrl = 'https://facilitator.payai.network/discovery/resources';
      const response = await fetch(discoveryUrl);
      
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        
        // Check if endpoint is registered
        return items.some((item: any) => 
          item.resource === endpoint || 
          item.resource?.includes(endpoint.replace('https://', '').replace('http://', ''))
        );
      }
    } catch (err) {
      console.error('Error checking token registration:', err);
    }
    return false;
  };

  const applyFilters = () => {
    // Filters are applied in the render, we keep the full lists here
    // This allows us to show both sections separately
  };

  const filterTokens = (tokens: X402Service[]) => {
    let filtered = [...tokens];

    // Network filter
    if (selectedNetwork !== 'All') {
      filtered = filtered.filter(service => service.price.network === selectedNetwork);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const handleRefresh = () => {
    fetchAllTokens();
  };

  const filteredAtlasMints = filterTokens(atlasMints);
  const filteredMarketplaceTokens = filterTokens(marketplaceTokens);
  const totalTokens = filteredAtlasMints.length + filteredMarketplaceTokens.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading tokens...</p>
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
            <h2 className="text-2xl font-bold text-black font-title">Browse Tokens</h2>
            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
              {totalTokens} Available
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tokens..."
            className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
            />
          </div>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
          className="px-4 py-3 border-2 border-black rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 min-w-[200px]"
            >
              {networks.map(net => (
            <option key={net} value={net}>{net === 'All' ? 'All Networks' : net}</option>
              ))}
            </select>
      </div>

      {/* Atlas Mints Section - Priority */}
      {filteredAtlasMints.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b-2 border-red-600">
            <h3 className="text-2xl font-bold text-black font-title">Atlas Mints</h3>
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded">
              {filteredAtlasMints.length} Created via Atlas
            </span>
          </div>
          {renderTokenCards(filteredAtlasMints)}
        </div>
      )}

      {/* Token Marketplace Section */}
      {filteredMarketplaceTokens.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b-2 border-gray-300">
            <h3 className="text-2xl font-bold text-black font-title">Token Marketplace</h3>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
              {filteredMarketplaceTokens.length} From Atlas Network
            </span>
          </div>
          {renderTokenCards(filteredMarketplaceTokens)}
        </div>
      )}

      {/* Empty State */}
      {totalTokens === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-black mb-2 font-title">No Tokens Found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedNetwork !== 'All' 
              ? 'Try adjusting your filters'
              : 'No x402 tokens available yet'}
          </p>
        </div>
      )}
    </div>
  );

  function renderTokenCards(services: X402Service[]) {
    return (
      <div className="space-y-6">
        {services.map((service, index) => {
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No Preview Available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right - Token Info */}
                <div className="md:w-3/5 p-8 flex flex-col justify-between">
                  {/* Top - Info */}
                  <div>
                    {/* Token Name */}
                    <h3 className="text-3xl font-bold text-black group-hover:text-red-600 transition-colors font-title mb-4">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Mint Details */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-white border-l-4 border-black">
                      <h4 className="text-xs font-bold text-black mb-3 uppercase tracking-wide">Mint Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price</span>
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

                    {/* Mint Progress */}
                    {(() => {
                      const tokenData = tokenDataMap[service.id];
                      if (tokenData && tokenData.totalSupplyRaw && tokenData.maxSupply) {
                        const minted = tokenData.totalSupplyRaw;
                        const maxSupply = parseFloat(tokenData.maxSupply.replace(/,/g, '')) || 0;
                        const progressPercent = maxSupply > 0 ? Math.min(100, (minted / maxSupply) * 100) : 0;
                        const pricePerMint = Number(service.price.amount || 0);
                        const totalValueUSDC = minted * pricePerMint;
                        
                        return (
                          <div className="mb-6 p-4 bg-gradient-to-br from-red-50 to-white border-l-4 border-red-600">
                            <h4 className="text-xs font-bold text-black mb-3 uppercase tracking-wide">Mint Progress</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Minted</span>
                                <span className="font-bold text-black">
                                  {minted.toLocaleString()} / {tokenData.maxSupply}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div 
                                  className="bg-red-600 h-full transition-all duration-500 rounded-full"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{progressPercent.toFixed(1)}%</span>
                                <span>{maxSupply > 0 ? `${(maxSupply - minted).toLocaleString()} remaining` : ''}</span>
                              </div>
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Total Value Minted</span>
                                  <span className="font-bold text-red-600">
                                    ${totalValueUSDC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* x402 Deployment & Registration Status */}
                    {(() => {
                      const tokenData = tokenDataMap[service.id];
                      if (tokenData) {
                        return (
                          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                            <h4 className="text-xs font-bold text-black mb-3 uppercase tracking-wide">x402 Status</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">x402 Deployment</span>
                                <span className={`font-medium ${tokenData.isX402Deployment ? 'text-green-600' : 'text-gray-400'}`}>
                                  {tokenData.isX402Deployment ? '✓ Yes' : '✗ No'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Registered on PayAI (Cortex)</span>
                                <span className={`font-medium ${tokenData.registeredOnPayAI ? 'text-green-600' : 'text-red-600'}`}>
                                  {tokenData.registeredOnPayAI ? '✓ Yes' : '✗ No'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

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
                      <div className="text-sm text-gray-500 mb-1">Mint Price</div>
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

                  {/* Bottom - Mint Button */}
                  <button
                    onClick={() => onMintToken(service.id)}
                    className="w-full px-8 py-4 bg-black text-white hover:bg-red-600 transition-all duration-300 font-medium text-lg rounded group-hover:shadow-xl"
                  >
                    Mint Token →
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }
}
