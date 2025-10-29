'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseUnits, encodeFunctionData, erc20Abi } from 'viem';
import { X402Service } from '@/lib/payai-client';
import { USDC_CONTRACT_ADDRESS, getNetworkChainId, getNetworkName } from '@/lib/x402-utils';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';

interface PurchaseServiceButtonProps {
  service: X402Service;
  onSuccess?: (txHash: string) => void;
}

const PURCHASE_FEE_MICRO = 500000; // 0.5 USDC in micro units

export function PurchaseServiceButton({ service, onSuccess }: PurchaseServiceButtonProps) {
  const { address, caipAddress } = useAppKitAccount();
  const { switchChain } = useSwitchChain();
  
  const chainId = caipAddress ? parseInt(caipAddress.split(':')[1]) : undefined;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Determine payment recipient - use Atlas402's address (revenue)
  const payToAddress = service.price.network === 'base' 
    ? X402_CONFIG.payTo 
    : X402_CONFIG.payToSol;
  const usdcAddress = USDC_CONTRACT_ADDRESS[service.price.network];
  const targetChainId = getNetworkChainId(service.price.network);
  const networkName = getNetworkName(service.price.network);

  // Send payment transaction
  const { 
    sendTransaction: sendPayment, 
    data: paymentData,
    isPending: isPaymentPending,
    error: paymentError 
  } = useSendTransaction();

  // Wait for payment confirmation
  const { isLoading: isPaymentConfirming, isSuccess: isPaymentSuccess } = useWaitForTransactionReceipt({
    hash: paymentData,
  });

  const handlePurchase = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!usdcAddress || !payToAddress) {
      setError('Service payment configuration incomplete');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Check if user is on correct network
      if (chainId !== targetChainId) {
        setError(`Please switch to ${networkName} network`);
        if (switchChain) {
          await switchChain({ chainId: targetChainId });
        }
        setIsProcessing(false);
        return;
      }

      // Encode USDC transfer: transfer(address to, uint256 amount)
      const paymentAmount = BigInt(PURCHASE_FEE_MICRO);
      const paymentDataEncoded = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [payToAddress as `0x${string}`, paymentAmount],
      });

      // Send payment transaction
      sendPayment({
        to: usdcAddress as `0x${string}`,
        data: paymentDataEncoded,
      });
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  // Handle payment success
  useEffect(() => {
    if (isPaymentSuccess && paymentData) {
      // Record payment in database as revenue
      const recordRevenue = async () => {
        try {
          await fetch('/api/admin/payment-tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              txHash: paymentData,
              network: service.price.network,
              from: address,
              to: payToAddress,
              amountMicro: PURCHASE_FEE_MICRO,
              category: 'service',
              service: `Purchase: ${service.name}`,
              metadata: {
                serviceId: service.id,
                endpoint: service.endpoint,
                purchaseType: 'service_purchase',
                revenue: true,
              },
            }),
          });
          console.log('✅ Service purchase recorded:', paymentData);
        } catch (e) {
          console.error('Failed to record service purchase:', e);
        }
      };
      
      recordRevenue();
      
      if (onSuccess) {
        onSuccess(paymentData);
      }
      setIsProcessing(false);
    }
  }, [isPaymentSuccess, paymentData, onSuccess, address, payToAddress, service]);

  // Handle payment errors
  useEffect(() => {
    if (paymentError) {
      setError(paymentError.message);
      setIsProcessing(false);
    }
  }, [paymentError]);

  if (!address) {
    return (
      <button
        disabled
        className="flex-1 px-6 py-4 bg-gray-300 text-gray-500 cursor-not-allowed transition-all duration-300 font-medium text-center rounded"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex-1">
      <button
        onClick={handlePurchase}
        disabled={isProcessing || isPaymentPending || isPaymentConfirming}
        className="w-full px-6 py-4 bg-black text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-medium text-center rounded"
      >
        {isProcessing || isPaymentPending || isPaymentConfirming 
          ? 'Processing...' 
          : `Purchase Service - $0.50 USDC`}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
      {isPaymentSuccess && (
        <p className="mt-2 text-xs text-green-600 text-center">Purchase successful!</p>
      )}
    </div>
  );
}

