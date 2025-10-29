'use client';

import { X402Service } from '@/lib/payai-client';
import { useState, useEffect } from 'react';
import { readBaseTokenContract, readSolanaTokenContract, extractContractAddress, TokenContractData } from '@/lib/token-contract-reader';

interface TokenCardProps {
  service: X402Service;
  onMint: () => void;
}

export function TokenCard({ service, onMint }: TokenCardProps) {
  const [imageError, setImageError] = useState(false);
  const [contractData, setContractData] = useState<TokenContractData | null>(null);
  const [loadingContract, setLoadingContract] = useState(true);

  // Fetch real contract data on mount
  useEffect(() => {
    const fetchContractData = async () => {
      const contractAddress = extractContractAddress(service);
      
      if (!contractAddress) {
        setLoadingContract(false);
        return;
      }

      try {
        const response = await fetch('/api/token-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contractAddress, 
            network: service.price.network 
          }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          // Enrich with payment details from service.accepts
          const enrichedData = { 
            ...result.data,
            payTo: service.accepts?.[0]?.payTo,
            scheme: service.accepts?.[0]?.scheme,
          };
          setContractData(enrichedData);
        }
      } catch (error) {
        console.error('Error fetching contract data:', error);
      } finally {
        setLoadingContract(false);
      }
    };

    fetchContractData();
  }, [service]);

  // Extract domain from endpoint for preview
  const getWebsiteUrl = (endpoint: string) => {
    try {
      const url = new URL(endpoint);
      return `${url.protocol}//${url.hostname}`;
    } catch {
      return null;
    }
  };

  const websiteUrl = getWebsiteUrl(service.endpoint);
  
  // Use screenshot API service for website preview
  const getScreenshotUrl = (url: string) => {
    return `https://api.apiflash.com/v1/urltoimage?access_key=182f19ef948340c29ef9b9eada082156&url=${encodeURIComponent(url)}&format=png&width=1280&height=720`;
  };

  return (
    <div className="group bg-white border-2 border-black hover:border-red-600 transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
      {/* Left - Website Preview */}
      <div className="md:w-2/5 relative h-64 md:h-auto bg-gray-100 overflow-hidden flex-shrink-0">
        {websiteUrl && !imageError ? (
          <div className="relative w-full h-full">
            <img
              src={getScreenshotUrl(websiteUrl)}
              alt={`${service.name} preview`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent group-hover:from-red-600/30 transition-all" />
            
            {/* Website URL badge */}
            <div className="absolute bottom-4 left-4 right-4">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm text-black text-xs rounded border border-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Visit Website
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">No Preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Right - Token Info */}
      <div className="md:w-3/5 p-8 flex flex-col justify-between">
        {/* Top - Info */}
        <div>
          {/* Token Name & Network */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-black group-hover:text-red-600 transition-colors font-title mb-2">
                {service.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  {service.price.network}
                </span>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className="text-sm text-gray-600">{service.category || 'Token'}</span>
              </div>
            </div>
          </div>

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
              {contractData?.scheme && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Scheme</span>
                  <span className="font-medium text-black">{contractData.scheme}</span>
                </div>
              )}
            </div>
          </div>

          {/* On-Chain Token Data */}
          {contractData && contractData.totalSupply && (
            <div className="mb-6 space-y-3">
              {/* Token Name & Symbol */}
              {(contractData.name || contractData.symbol) && (
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Token</div>
                  <div className="text-sm font-bold text-black">
                    {contractData.name || service.name}
                    {contractData.symbol && <span className="ml-2 text-gray-500 font-normal">({contractData.symbol})</span>}
                  </div>
                </div>
              )}

              {/* Total Supply & Max Supply with Progress Bar */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Current Supply</div>
                    <div className="text-sm font-bold text-black">{contractData.totalSupply}</div>
                  </div>
                  {contractData.maxSupply && (
                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Max Supply</div>
                      <div className="text-sm font-bold text-black">{contractData.maxSupply}</div>
                    </div>
                  )}
                </div>
                
                {/* Supply Progress Bar */}
                {contractData.maxSupply && contractData.totalSupplyRaw && (
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Minted</span>
                      <span>{Math.round((contractData.totalSupplyRaw / parseFloat(contractData.maxSupply.replace(/,/g, ''))) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-red-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, (contractData.totalSupplyRaw / parseFloat(contractData.maxSupply.replace(/,/g, ''))) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Decimals */}
              {contractData.decimals !== undefined && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm text-gray-600">Decimals</span>
                  <span className="text-sm font-bold text-black">{contractData.decimals}</span>
                </div>
              )}

              {/* Contract Address */}
              {contractData.contractAddress && (
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Contract Address</div>
                  <a
                    href={service.price.network.includes('solana') 
                      ? `https://solscan.io/token/${contractData.contractAddress}`
                      : `https://basescan.org/address/${contractData.contractAddress}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-black hover:text-red-600 transition-colors break-all flex items-center gap-1"
                  >
                    {contractData.contractAddress}
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Payment Recipient */}
              {contractData.payTo && (
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Payment Recipient</div>
                  <a
                    href={service.price.network.includes('solana') 
                      ? `https://solscan.io/account/${contractData.payTo}`
                      : `https://basescan.org/address/${contractData.payTo}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-black hover:text-red-600 transition-colors break-all flex items-center gap-1"
                  >
                    {contractData.payTo.slice(0, 10)}...{contractData.payTo.slice(-8)}
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Verified Badge */}
              {contractData.verified && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded border border-red-200">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs font-medium text-red-700">Verified Contract</span>
                </div>
              )}
            </div>
          )}

          {/* Metadata Footer */}
          {service.lastUpdated && (
            <div className="mb-6 text-xs text-gray-500 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border border-gray-200">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated: {new Date(service.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}

          {/* Loading state for contract data */}
          {loadingContract && !contractData && (
            <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Loading contract data...</span>
            </div>
          )}

          {/* Price Display - Large */}
          <div className="mb-6 p-6 bg-gradient-to-br from-red-50 to-white border-l-4 border-red-600">
            <div className="text-sm text-gray-500 mb-1">Mint Price</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-red-600 font-title">
                ${service.price.amount}
              </span>
              <span className="text-lg text-gray-600">
                {service.price.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom - Mint Button */}
        <button
          onClick={onMint}
          className="w-full px-8 py-4 bg-black text-white hover:bg-red-600 transition-all duration-300 font-medium text-lg rounded group-hover:shadow-xl"
        >
          Mint Token →
        </button>
      </div>
    </div>
  );
}
