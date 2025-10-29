'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseUnits, encodeFunctionData, erc20Abi } from 'viem';
import { X402Service } from '@/lib/payai-client';
import { USDC_CONTRACT_ADDRESS, getNetworkChainId, getNetworkName } from '@/lib/x402-utils';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';
import { makeX402Request } from '@/lib/x402-client';

interface PurchaseServiceButtonProps {
  service: X402Service;
  onSuccess?: (txHash: string) => void;
}

const PURCHASE_FEE_MICRO = 500000; // 0.5 USDC in micro units

export function PurchaseServiceButton({ service, onSuccess }: PurchaseServiceButtonProps) {
  const { address, caipAddress } = useAppKitAccount();
  const { switchChain } = useSwitchChain();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  
  const chainId = caipAddress ? parseInt(caipAddress.split(':')[1]) : undefined;
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'fee' | 'x402'>('fee');
  const [error, setError] = useState<string | null>(null);
  const [x402Result, setX402Result] = useState<any>(null);
  
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

  // Handle fee payment success - then make x402 call to service
  useEffect(() => {
    if (isPaymentSuccess && paymentData && step === 'fee') {
      // Record fee payment in database
      const recordFeeAndCallService = async () => {
        try {
          // Record fee payment
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
              service: `Purchase Fee: ${service.name}`,
              metadata: {
                serviceId: service.id,
                endpoint: service.endpoint,
                purchaseType: 'service_purchase_fee',
                revenue: true,
              },
            }),
          });
          console.log('✅ Service purchase fee recorded:', paymentData);
          
          // Now make actual x402 payment call to the service
          if (walletProvider && service.endpoint) {
            setStep('x402');
            setIsProcessing(true);
            
            try {
              console.log('🌐 Making x402 payment call to service:', service.endpoint);
              const x402Response = await makeX402Request(
                walletProvider,
                service.endpoint,
                { method: 'GET' }
              );
              
              if (!x402Response.ok) {
                throw new Error(`x402 call failed: ${x402Response.status} ${x402Response.statusText}`);
              }
              
              const x402Data = await x402Response.json();
              setX402Result(x402Data);
              console.log('✅ x402 service call successful:', x402Data);
              
              // Record the service purchase in services table
              try {
                await fetch('/api/admin/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    endpoint: service.endpoint,
                    merchantAddress: service.accepts?.[0]?.payTo || payToAddress,
                    category: service.category,
                    network: service.price.network,
                    priceAmount: service.price.amount,
                    priceCurrency: service.price.currency,
                    metadata: {
                      ...service.metadata,
                      accepts: service.accepts,
                      purchased: true,
                      purchasedAt: new Date().toISOString(),
                      purchasedBy: address,
                      x402PaymentCompleted: true,
                    },
                  }),
                });
                console.log('✅ Service added to services table:', service.id);
              } catch (serviceError) {
                console.error('Failed to record service:', serviceError);
                // Don't fail if service recording fails
              }
              
              if (onSuccess) {
                onSuccess(paymentData);
              }
            } catch (x402Error: any) {
              console.error('x402 service call error:', x402Error);
              setError(`Service call failed: ${x402Error.message}`);
            } finally {
              setIsProcessing(false);
            }
          } else {
            setError('Wallet provider not available or service endpoint missing');
            setIsProcessing(false);
          }
        } catch (e) {
          console.error('Failed to record service purchase:', e);
          setIsProcessing(false);
        }
      };
      
      recordFeeAndCallService();
    }
  }, [isPaymentSuccess, paymentData, step, walletProvider, service, address, payToAddress, onSuccess]);

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
          ? (step === 'fee' ? 'Paying fee...' : 'Calling service...')
          : `Purchase Service - $0.50 USDC`}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
      {step === 'x402' && isPaymentSuccess && !isProcessing && (
        <p className="mt-2 text-xs text-green-600 text-center">✅ Fee paid! Service called successfully!</p>
      )}
      {x402Result && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          Service response received
        </div>
      )}
    </div>
  );
}

