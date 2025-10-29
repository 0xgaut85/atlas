'use client';

import { useState } from 'react';
import { useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { makeX402Request } from '@/lib/x402-client';

interface X402PaymentPanelProps {
  isConnected: boolean;
  onConnectWallet: () => void;
}

export function X402PaymentPanel({ isConnected, onConnectWallet }: X402PaymentPanelProps) {
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'signing' | 'verifying' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testProtectedEndpoint = async (endpoint: string, name: string) => {
    if (!isConnected || !walletProvider) {
      onConnectWallet();
      return;
    }

    setLoading(true);
    setPaymentStatus('signing');
    setError('');
    setResult(null);

    try {
      console.log(`Testing ${name} endpoint...`);
      
      setPaymentStatus('verifying');
      const response = await makeX402Request(
        walletProvider,
        endpoint,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setPaymentStatus('success');
      setResult(data);
      console.log(`${name} response:`, data);
      
    } catch (err: any) {
      console.error(`${name} error:`, err);
      setPaymentStatus('error');
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'signing': return 'text-black';
      case 'verifying': return 'text-black';
      case 'success': return 'text-red-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-700';
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'signing': return 'Sign payment message in your wallet...';
      case 'verifying': return 'Verifying payment...';
      case 'success': return 'Payment verified! Access granted.';
      case 'error': return `Error: ${error}`;
      default: return 'Ready to test x402 protected endpoints';
    }
  };

  return (
    <div className="bg-white border-2 border-dashed border-black p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-black mb-2 font-title">
          x402 Protected Services
        </h3>
        <p className="text-sm text-gray-700">
          Access Atlas402 services with automatic x402 payments ($1.00 USDC on Base or Solana)
        </p>
      </div>

      {/* Status Indicator */}
      <div className={`mb-6 p-4 bg-white border-2 border-dashed border-black ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          {loading && (
            <svg className="animate-spin h-4 w-4 text-red-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span className="text-sm">{getStatusMessage()}</span>
        </div>
      </div>

      {/* Service Access Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => testProtectedEndpoint('/api/service-hub', 'Service Hub')}
          disabled={loading}
          className="w-full px-4 py-3 bg-white hover:bg-gray-50 border-2 border-dashed border-black text-black text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Access Service Hub API
        </button>
        
        <button
          onClick={() => testProtectedEndpoint('/api/token-indexer', 'Token Indexer')}
          disabled={loading}
          className="w-full px-4 py-3 bg-white hover:bg-gray-50 border-2 border-dashed border-black text-black text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Access Token Indexer API
        </button>
        
        <button
          onClick={() => testProtectedEndpoint('/api/agent', 'AI Agent')}
          disabled={loading}
          className="w-full px-4 py-3 bg-white hover:bg-gray-50 border-2 border-dashed border-black text-black text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Access AI Agent API
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-2 font-light">Response:</div>
          <pre className="text-xs text-green-400 font-mono overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 pt-4 border-t-2 border-dashed border-black/20">
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Each API call costs $1.00 USDC</p>
          <p>• Payments are verified via x402 protocol</p>
          <p>• Your wallet will prompt you to sign the payment</p>
          <p>• Payments settle to: 0x8bee...caed</p>
        </div>
      </div>
    </div>
  );
}

