'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { encodeFunctionData, erc20Abi } from 'viem';
import { USDC_CONTRACT_ADDRESS, getNetworkChainId, getNetworkName } from '@/lib/x402-utils';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';

interface MintFeeHandlerProps {
  network: 'base' | 'solana-mainnet';
  onSuccess: (txHash: string) => void;
  onError?: (error: string) => void;
}

const MINT_FEE_MICRO = 250000; // 0.25 USDC in micro units

export function MintFeeHandler({ network, onSuccess, onError }: MintFeeHandlerProps) {
  const { address, caipAddress } = useAppKitAccount();
  const { switchChain } = useSwitchChain();
  
  const chainId = caipAddress ? parseInt(caipAddress.split(':')[1]) : undefined;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Determine payment recipient - use Atlas402's address (revenue)
  const payToAddress = network === 'base' 
    ? X402_CONFIG.payTo 
    : X402_CONFIG.payToSol;
  const usdcAddress = USDC_CONTRACT_ADDRESS[network];
  const targetChainId = getNetworkChainId(network);
  const networkName = getNetworkName(network);

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

  const handleMintFee = async () => {
    if (!address) {
      const err = 'Please connect your wallet';
      setError(err);
      if (onError) onError(err);
      return;
    }

    if (!usdcAddress || !payToAddress) {
      const err = 'Payment configuration incomplete';
      setError(err);
      if (onError) onError(err);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Check if user is on correct network
      if (chainId !== targetChainId) {
        const err = `Please switch to ${networkName} network`;
        setError(err);
        if (switchChain) {
          await switchChain({ chainId: targetChainId });
        }
        setIsProcessing(false);
        if (onError) onError(err);
        return;
      }

      // Encode USDC transfer: transfer(address to, uint256 amount)
      const paymentAmount = BigInt(MINT_FEE_MICRO);
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
      const errorMsg = err.message || 'Mint fee payment failed';
      setError(errorMsg);
      setIsProcessing(false);
      if (onError) onError(errorMsg);
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
              network: network,
              from: address,
              to: payToAddress,
              amountMicro: MINT_FEE_MICRO,
              category: 'mint',
              service: 'Token Mint Fee',
              metadata: {
                purchaseType: 'token_mint_fee',
                revenue: true,
              },
            }),
          });
          console.log('✅ Mint fee recorded:', paymentData);
        } catch (e) {
          console.error('Failed to record mint fee:', e);
        }
      };
      
      recordRevenue();
      onSuccess(paymentData);
      setIsProcessing(false);
    }
  }, [isPaymentSuccess, paymentData, onSuccess, address, payToAddress, network]);

  // Handle payment errors
  useEffect(() => {
    if (paymentError) {
      const errorMsg = paymentError.message;
      setError(errorMsg);
      setIsProcessing(false);
      if (onError) onError(errorMsg);
    }
  }, [paymentError, onError]);

  // Return component JSX instead of hook interface
  if (!address) {
    return (
      <div>
        <button
          disabled
          className="w-full px-6 py-3 bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg font-medium"
        >
          Connect Wallet to Pay Mint Fee
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleMintFee}
        disabled={isProcessing || isPaymentPending || isPaymentConfirming}
        className="w-full px-6 py-3 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
      >
        {isProcessing || isPaymentPending || isPaymentConfirming 
          ? 'Processing Mint Fee...' 
          : 'Pay $0.25 USDC Mint Fee'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
      {isPaymentSuccess && (
        <p className="mt-2 text-sm text-green-600 text-center">Mint fee paid! Proceeding to mint...</p>
      )}
    </div>
  );
}

