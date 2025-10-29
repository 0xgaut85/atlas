'use client';

import { useState } from 'react';
import { X402Service } from '@/lib/payai-client';

interface ServiceCardProps {
  service: X402Service;
  onTest: (serviceId: string) => void;
  onGetCode: (serviceId: string) => void;
  onPayAndUse?: (serviceId: string) => void;
  isTestingActive?: boolean;
}

export function ServiceCard({ service, onTest, onGetCode, onPayAndUse, isTestingActive = false }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-red-600';
      case 'offline': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price: any) => {
    return `$${price.amount} ${price.currency}`;
  };

  const isEchoMerchant = service.id.includes('echo-merchant') || service.endpoint.includes('x402.payai.network');
  
  return (
    <div className="service-card-wrapper relative">
      <div 
        className={`relative bg-black/80 backdrop-blur-sm border transition-all duration-300 p-6 h-full ${
          isHovered ? 'border-red-600' : 'border-white/[0.15]'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Corner markers - matching landing page style */}
        <div className="corner-top-left" />
        <div className="corner-top-right" />
        <div className="corner-bottom-left" />
        <div className="corner-bottom-right" />

        {/* Type Badge */}
        <div className="mb-4">
          {isEchoMerchant ? (
            <span className="px-3 py-1 bg-white/10 text-white text-xs font-light rounded border border-white/20">
              TEST SERVICE - FREE
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-light rounded">
              PRODUCTION
            </span>
          )}
        </div>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-light text-lg text-white mb-1">{service.name}</h3>
            <span className="text-sm text-gray-400">{service.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)} ${service.status === 'online' ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-gray-500 capitalize">{service.status}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-light">
          {service.description}
        </p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded p-3 border border-white/10">
            <div className="text-xs text-gray-500 mb-1 font-light">Price</div>
            <div className="text-sm font-light text-white">{formatPrice(service.price)}</div>
          </div>
          <div className="bg-white/5 rounded p-3 border border-white/10">
            <div className="text-xs text-gray-500 mb-1 font-light">Network</div>
            <div className="text-sm font-light text-white">{service.price.network}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isEchoMerchant && (
            <button
              onClick={() => onTest(service.id)}
              disabled={service.status !== 'online' || isTestingActive}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light border border-white/10"
            >
              {isTestingActive ? 'Testing...' : 'Test Free'}
            </button>
          )}
          {!isEchoMerchant && onPayAndUse && (
            <button
              onClick={() => onPayAndUse(service.id)}
              disabled={service.status !== 'online'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light"
            >
              Pay & Use
            </button>
          )}
          <button
            onClick={() => onGetCode(service.id)}
            className="flex-1 px-4 py-2 border border-white/20 text-white rounded hover:bg-white/10 transition-colors text-sm font-light"
          >
            Get Code
          </button>
        </div>
      </div>
    </div>
  );
}
