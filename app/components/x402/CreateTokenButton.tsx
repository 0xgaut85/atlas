'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { makeX402Request } from '@/lib/x402-client';
import { calculateDeploymentFee } from '@/lib/cdp-agentkit';

interface TokenCreationFormData {
  name: string;
  symbol: string;
  description: string;
  supply: string;
  network: 'base' | 'solana-mainnet';
  pricePerMint: string;
  deployerAddress: string;
  devSupplyToMint?: string;
}

interface CreateTokenButtonProps {
  formData: TokenCreationFormData;
  onSuccess: (result: {
    contractAddress?: string;
    mintEndpoint?: string;
    explorerLink?: string;
    deploymentFeeTxHash?: string;
    deploymentFeeUSD?: number;
  }) => void;
  onError: (error: string) => void;
}

export function CreateTokenButton({ formData, onSuccess, onError }: CreateTokenButtonProps) {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');

  const handleCreateToken = async () => {
    if (!isConnected || !address) {
      onError('Please connect your wallet first');
      return;
    }

    if (!walletProvider) {
      onError('Wallet provider not available. Please reconnect your wallet.');
      return;
    }

    setIsProcessing(true);
    setStatus('creating');

    try {
      // Calculate deployment fee
      const fee = calculateDeploymentFee(formData.supply, formData.pricePerMint);

      // Make x402 request to create token endpoint
      const response = await makeX402Request(
        walletProvider,
        '/api/token/create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            symbol: formData.symbol,
            description: formData.description,
            supply: formData.supply,
            pricePerMint: formData.pricePerMint,
            network: formData.network,
            deployerAddress: formData.deployerAddress,
            contractAddress: null,
            devSupplyToMint: formData.devSupplyToMint || '0',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Token creation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setStatus('success');
        onSuccess({
          contractAddress: result.contractAddress || undefined,
          mintEndpoint: result.mintEndpoint || undefined,
          explorerLink: result.explorerLink || undefined,
          deploymentFeeTxHash: result.deploymentFeeTxHash || undefined,
          deploymentFeeUSD: result.deploymentFeeUSD || undefined,
        });
      } else {
        throw new Error(result.error || 'Token creation failed');
      }
    } catch (error: any) {
      console.error('Token creation error:', error);
      setStatus('error');
      onError(error.message || 'Token creation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <button
        disabled
        className="w-full px-6 py-4 rounded-lg font-medium text-lg bg-gray-300 text-gray-500 cursor-not-allowed"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={handleCreateToken}
      disabled={isProcessing}
      className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-all ${
        isProcessing
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
      }`}
    >
      {isProcessing 
        ? (status === 'creating' ? 'Processing Payment & Creating Token...' : 'Creating Token...')
        : 'Create & Deploy Mint →'}
    </button>
  );
}

