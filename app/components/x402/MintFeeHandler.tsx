'use client';

import { useState } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { makeX402Request } from '@/lib/x402-client';
import { X402Service } from '@/lib/payai-client';

interface MintFeeHandlerProps {
  network: 'base' | 'solana-mainnet';
  service?: X402Service; // Optional: service to call after fee payment
  onSuccess: (txHash: string) => void;
  onError?: (error: string) => void;
}

const MINT_FEE_USD = 0.25; // $0.25 USDC mint fee

export function MintFeeHandler({ network, service, onSuccess, onError }: MintFeeHandlerProps) {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'fee' | 'x402'>('fee');
  const [error, setError] = useState<string | null>(null);
  const [x402Result, setX402Result] = useState<any>(null);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);

  const handleMintFee = async () => {
    if (!address || !walletProvider) {
      const err = 'Please connect your wallet';
      setError(err);
      if (onError) onError(err);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Make x402 payment call to mint fee endpoint
      console.log('🌐 Making x402 payment call to mint fee endpoint...');
      const x402Response = await makeX402Request(
        walletProvider,
        '/api/x402/payment/mint-fee',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: service?.id,
            serviceName: service?.name,
            tokenName: service?.name,
          }),
        }
      );
      
      if (!x402Response.ok) {
        const errorText = await x402Response.text().catch(() => 'Unknown error');
        throw new Error(`Mint fee payment failed: ${x402Response.status} ${x402Response.statusText} - ${errorText}`);
      }
      
      const x402Data = await x402Response.json();
      setPaymentTxHash(x402Data.payment?.transactionHash || 'unknown');
      console.log('✅ Mint fee paid successfully:', x402Data);
    
      // If service endpoint is provided, make x402 call to mint the token
      if (service && service.endpoint) {
        setStep('x402');
        
        try {
          console.log('🌐 Making x402 payment call to token mint endpoint:', service.endpoint);
          const mintResponse = await makeX402Request(
            walletProvider,
            service.endpoint,
            { method: 'GET' }
          );
          
          if (!mintResponse.ok) {
            throw new Error(`x402 mint call failed: ${mintResponse.status} ${mintResponse.statusText}`);
          }
          
          const mintData = await mintResponse.json();
          setX402Result(mintData);
          console.log('✅ x402 token mint call successful:', mintData);
          
          // Record the mint event
          try {
            const amountMicro = Number(service.accepts?.[0]?.maxAmountRequired || 0);
            await fetch('/api/admin/user-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userAddress: address.toLowerCase(),
                eventType: 'token_minted',
                network: service.price?.network,
                referenceId: service.id,
                amountMicro: amountMicro || undefined,
                metadata: {
                  tokenName: service.name,
                  serviceId: service.id,
                  endpoint: service.endpoint,
                  txHash: paymentTxHash,
                  x402PaymentCompleted: true,
                },
              }),
            });
            console.log('✅ Mint event recorded');
          } catch (eventError) {
            console.error('Failed to record mint event:', eventError);
          }
          
          onSuccess(paymentTxHash || 'unknown');
        } catch (x402Error: any) {
          console.error('x402 mint call error:', x402Error);
          setError(`Token mint failed: ${x402Error.message}`);
          if (onError) onError(x402Error.message);
        } finally {
          setIsProcessing(false);
        }
      } else {
        // No service endpoint - just report fee payment success
        onSuccess(paymentTxHash || 'unknown');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('❌ Mint fee error details:', err);
      const errorMsg = err.message || 'Mint fee payment failed';
      // Improve error message for network errors
      if (errorMsg.includes('Failed to connect') || errorMsg.includes('fetch')) {
        setError(`Network error: Could not connect to payment endpoint. Please try again.`);
      } else {
        setError(errorMsg);
      }
      setIsProcessing(false);
      if (onError) onError(errorMsg);
    }
  };

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
        disabled={isProcessing}
        className="w-full px-6 py-3 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
      >
        {isProcessing 
          ? (step === 'fee' ? 'Processing Mint Fee...' : 'Minting token...')
          : `Pay $${MINT_FEE_USD} USDC Mint Fee`}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
      {step === 'x402' && paymentTxHash && !isProcessing && (
        <p className="mt-2 text-sm text-green-600 text-center">✅ Fee paid! Token minted successfully!</p>
      )}
      {!service && paymentTxHash && (
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