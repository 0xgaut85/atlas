'use client';

import { useState } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { X402Service } from '@/lib/payai-client';
import { makeX402Request } from '@/lib/x402-client';

interface PurchaseServiceButtonProps {
  service: X402Service;
  onSuccess?: (txHash: string) => void;
}

const PURCHASE_FEE_USD = 0.5; // $0.5 USDC platform fee

export function PurchaseServiceButton({ service, onSuccess }: PurchaseServiceButtonProps) {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'fee' | 'service'>('fee');
  const [error, setError] = useState<string | null>(null);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);

  const servicePrice = parseFloat(service.price.amount);
  const totalPrice = PURCHASE_FEE_USD + servicePrice;

  const handlePurchase = async () => {
    if (!address || !walletProvider) {
      setError('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Pay platform fee via x402-protected endpoint
      console.log('🌐 Step 1: Paying platform fee...');
      setStep('fee');
      
      let feeResponse: Response;
      try {
        feeResponse = await makeX402Request(
          walletProvider,
          '/api/x402/payment/service-payment',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: PURCHASE_FEE_USD.toString(),
              serviceName: `Platform Fee: ${service.name}`,
              serviceId: `fee-${service.id}`,
              endpoint: service.endpoint,
              category: 'service',
              metadata: {
                purchaseType: 'service_purchase_fee',
                revenue: true,
              },
            }),
          }
        );
      } catch (fetchError: any) {
        console.error('❌ Fee payment fetch error:', fetchError);
        throw new Error(`Failed to connect to payment endpoint: ${fetchError.message}`);
      }

      if (!feeResponse.ok) {
        const errorText = await feeResponse.text().catch(() => 'Unknown error');
        throw new Error(`Platform fee payment failed: ${feeResponse.status} ${feeResponse.statusText} - ${errorText}`);
      }

      const feeData = await feeResponse.json();
      console.log('✅ Platform fee paid:', feeData);
      
      // Step 2: Pay service price via x402-protected endpoint
      console.log('🌐 Step 2: Paying service price...');
      setStep('service');
      
      let serviceResponse: Response;
      try {
        serviceResponse = await makeX402Request(
          walletProvider,
          '/api/x402/payment/service-payment',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: servicePrice.toString(),
              serviceName: service.name,
              serviceId: service.id,
              endpoint: service.endpoint,
              category: 'service',
              metadata: {
                purchaseType: 'service_purchase',
                serviceEndpoint: service.endpoint,
              },
            }),
          }
        );
      } catch (fetchError: any) {
        console.error('❌ Service payment fetch error:', fetchError);
        throw new Error(`Failed to connect to payment endpoint: ${fetchError.message}`);
      }

      if (!serviceResponse.ok) {
        const errorText = await serviceResponse.text().catch(() => 'Unknown error');
        throw new Error(`Service payment failed: ${serviceResponse.status} ${serviceResponse.statusText} - ${errorText}`);
      }

      const serviceData = await serviceResponse.json();
      setPaymentTxHash(serviceData.payment?.transactionHash || 'unknown');
      console.log('✅ Service payment successful:', serviceData);

      // Step 3: Call the actual service endpoint (only if it's our own endpoint)
      // Skip external endpoints to avoid CORS/network errors
      if (service.endpoint) {
        const isExternalEndpoint = service.endpoint.startsWith('http://') || service.endpoint.startsWith('https://');
        const isOurEndpoint = service.endpoint.startsWith('/api/');
        
        if (isExternalEndpoint && !isOurEndpoint) {
          // External service endpoint - payment succeeded, skip service call
          console.log('⚠️ External service endpoint detected, skipping service call:', service.endpoint);
          console.log('✅ Payment successful - external services must be accessed directly');
          
          // Still record the service purchase
          try {
            await fetch('/api/admin/services', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: service.id,
                name: service.name,
                description: service.description,
                endpoint: service.endpoint,
                merchantAddress: service.accepts?.[0]?.payTo || service.accepts?.[0]?.payTo,
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
                  externalService: true,
                },
              }),
            });
            console.log('✅ Service added to services table:', service.id);
          } catch (serviceError) {
            console.error('Failed to record service:', serviceError);
          }
          
          if (onSuccess) {
            onSuccess(paymentTxHash || 'unknown');
          }
        } else if (isOurEndpoint) {
          // Our own endpoint - safe to call
          try {
            console.log('🌐 Step 3: Calling service endpoint:', service.endpoint);
            const serviceCallResponse = await makeX402Request(
              walletProvider,
              service.endpoint,
              { method: 'GET' }
            );

            if (!serviceCallResponse.ok) {
              throw new Error(`Service call failed: ${serviceCallResponse.status} ${serviceCallResponse.statusText}`);
            }

            const serviceCallData = await serviceCallResponse.json();
            console.log('✅ Service call successful:', serviceCallData);

            // Record service purchase
            try {
              await fetch('/api/admin/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: service.id,
                  name: service.name,
                  description: service.description,
                  endpoint: service.endpoint,
                  merchantAddress: service.accepts?.[0]?.payTo || service.accepts?.[0]?.payTo,
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
            }

            if (onSuccess) {
              onSuccess(paymentTxHash || 'unknown');
            }
          } catch (serviceCallError: any) {
            console.error('Service call error:', serviceCallError);
            // Payment succeeded, but service call failed - still mark as success
            if (onSuccess) {
              onSuccess(paymentTxHash || 'unknown');
            }
          }
        } else {
          // Relative path but not our API - skip for safety
          console.log('⚠️ Unknown endpoint format, skipping service call:', service.endpoint);
          if (onSuccess) {
            onSuccess(paymentTxHash || 'unknown');
          }
        }
      } else {
        // No endpoint - payment successful
        if (onSuccess) {
          onSuccess(paymentTxHash || 'unknown');
        }
      }

      setIsProcessing(false);
    } catch (err: any) {
      const errorMsg = err.message || 'Purchase failed';
      setError(errorMsg);
      setIsProcessing(false);
    }
  };

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
        disabled={isProcessing}
        className="w-full px-6 py-4 bg-black text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-medium text-center rounded"
      >
        {isProcessing 
          ? (step === 'fee' ? 'Paying platform fee...' : 'Paying service & calling...')
          : `Purchase - $${totalPrice.toFixed(2)} USDC`}
      </button>
      <div className="mt-1 text-xs text-gray-500 text-center">
        {servicePrice > 0 && `Fee: $${PURCHASE_FEE_USD} + Service: $${servicePrice.toFixed(2)}`}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
      {step === 'service' && paymentTxHash && !isProcessing && (
        <p className="mt-2 text-xs text-green-600 text-center">✅ Purchase successful!</p>
      )}
    </div>
  );
}

