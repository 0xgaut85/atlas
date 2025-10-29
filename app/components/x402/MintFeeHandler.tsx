'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { encodeFunctionData, erc20Abi } from 'viem';
import { USDC_CONTRACT_ADDRESS, getNetworkChainId, getNetworkName } from '@/lib/x402-utils';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';
import { makeX402Request } from '@/lib/x402-client';
import { X402Service } from '@/lib/payai-client';

interface MintFeeHandlerProps {
  network: 'base' | 'solana-mainnet';
  service?: X402Service; // Optional: service to call after fee payment
  onSuccess: (txHash: string) => void;
  onError?: (error: string) => void;
}

const MINT_FEE_MICRO = 250000; // 0.25 USDC in micro units

export function MintFeeHandler({ network, service, onSuccess, onError }: MintFeeHandlerProps) {
  const { address, caipAddress } = useAppKitAccount();
  const { switchChain } = useSwitchChain();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  
  const chainId = caipAddress ? parseInt(caipAddress.split(':')[1]) : undefined;
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'fee' | 'x402'>('fee');
  const [error, setError] = useState<string | null>(null);
  const [x402Result, setX402Result] = useState<any>(null);
  
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

  // Handle fee payment success - then make x402 call to token mint endpoint if service provided
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
              network: network,
              from: address,
              to: payToAddress,
              amountMicro: MINT_FEE_MICRO,
              category: 'mint',
              service: service ? `Mint Fee: ${service.name}` : 'Token Mint Fee',
              metadata: {
                purchaseType: 'token_mint_fee',
                revenue: true,
                serviceId: service?.id,
              },
            }),
          });
          console.log('✅ Mint fee recorded:', paymentData);
          
          // If service endpoint is provided, make x402 call to mint the token
          if (service && walletProvider && service.endpoint) {
            setStep('x402');
            setIsProcessing(true);
            
            try {
              console.log('🌐 Making x402 payment call to token mint endpoint:', service.endpoint);
              const x402Response = await makeX402Request(
                walletProvider,
                service.endpoint,
                { method: 'GET' }
              );
              
              if (!x402Response.ok) {
                throw new Error(`x402 mint call failed: ${x402Response.status} ${x402Response.statusText}`);
              }
              
              const x402Data = await x402Response.json();
              setX402Result(x402Data);
              console.log('✅ x402 token mint call successful:', x402Data);
              
              // Record the mint event
              try {
                const amountMicro = Number(service.accepts?.[0]?.maxAmountRequired || 0);
                await fetch('/api/admin/user-events', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userAddress: address?.toLowerCase(),
                    eventType: 'token_minted',
                    network: service.price?.network,
                    referenceId: service.id,
                    amountMicro: amountMicro || undefined,
                    metadata: {
                      tokenName: service.name,
                      serviceId: service.id,
                      endpoint: service.endpoint,
                      txHash: paymentData,
                      x402PaymentCompleted: true,
                    },
                  }),
                });
                console.log('✅ Mint event recorded');
              } catch (eventError) {
                console.error('Failed to record mint event:', eventError);
              }
              
              onSuccess(paymentData);
            } catch (x402Error: any) {
              console.error('x402 mint call error:', x402Error);
              setError(`Token mint failed: ${x402Error.message}`);
              if (onError) onError(x402Error.message);
            } finally {
              setIsProcessing(false);
            }
          } else {
            // No service endpoint - just report fee payment success
            onSuccess(paymentData);
            setIsProcessing(false);
          }
        } catch (e) {
          console.error('Failed to record mint fee:', e);
          setIsProcessing(false);
        }
      };
      
      recordFeeAndCallService();
    }
  }, [isPaymentSuccess, paymentData, step, walletProvider, service, address, payToAddress, network, onSuccess, onError]);

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
          ? (step === 'fee' ? 'Processing Mint Fee...' : 'Minting token...')
          : 'Pay $0.25 USDC Mint Fee'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
      {step === 'x402' && isPaymentSuccess && !isProcessing && (
        <p className="mt-2 text-sm text-green-600 text-center">✅ Fee paid! Token minted successfully!</p>
      )}
      {!service && isPaymentSuccess && (
        <p className="mt-2 text-sm text-green-600 text-center">Mint fee paid! Proceeding to mint...</p>
      )}
      {x402Result && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          Token mint response received
        </div>
      )}
    </div>
  );
}

