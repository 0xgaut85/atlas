'use client';

import { useState } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { makeX402Request } from '@/lib/x402-client';
import { X402Service } from '@/lib/payai-client';
import { getNetworkName } from '@/lib/x402-utils';

interface RealPaymentHandlerProps {
  service: X402Service;
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
  title?: string; // Optional title, defaults to "Pay & Use Service"
  actionText?: string; // Optional action text, defaults to "Send Payment"
  successText?: string; // Optional success text, defaults to "Payment Successful!"
}

type PaymentStep = 'pay' | 'paying' | 'calling-service' | 'success' | 'error';

export function RealPaymentHandler({ 
  service, 
  onSuccess, 
  onError, 
  onClose,
  title = "Pay & Use Service",
  actionText = "Send Payment",
  successText = "Payment Successful!"
}: RealPaymentHandlerProps) {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  
  const [step, setStep] = useState<PaymentStep>('pay');
  const [error, setError] = useState<string | null>(null);
  const [paymentTxHash, setPaymentTxHash] = useState<string>('');

  const amountMicro = Number(service.accepts?.[0]?.maxAmountRequired || '1000000');
  const amountUSD = (amountMicro / 1_000_000).toFixed(2);
  const networkName = getNetworkName(service.price.network);

  const handlePayment = async () => {
    if (!address || !walletProvider) {
      const err = 'Please connect your wallet';
      setError(err);
      setStep('error');
      onError(err);
      return;
    }

    setStep('paying');
    setError(null);

    try {
      // Step 1: Pay via x402-protected service payment endpoint
      console.log('🌐 Making x402 payment call to service payment endpoint...');
      const paymentResponse = await makeX402Request(
        walletProvider,
        '/api/x402/payment/service-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountUSD,
            serviceName: service.name,
            serviceId: service.id,
            endpoint: service.endpoint,
            category: 'service',
          }),
        }
      );
      
      if (!paymentResponse.ok) {
        throw new Error(`Service payment failed: ${paymentResponse.status} ${paymentResponse.statusText}`);
      }
      
      const paymentData = await paymentResponse.json();
      setPaymentTxHash(paymentData.payment?.transactionHash || 'unknown');
      console.log('✅ Service payment successful:', paymentData);
      
      // Step 2: If service endpoint is provided, call the actual service
      if (service.endpoint) {
        setStep('calling-service');
        
        try {
          console.log('🌐 Calling service endpoint:', service.endpoint);
          const serviceResponse = await makeX402Request(
            walletProvider,
            service.endpoint,
            { method: 'GET' }
          );
          
          if (!serviceResponse.ok) {
            throw new Error(`Service call failed: ${serviceResponse.status} ${serviceResponse.statusText}`);
          }
          
          const serviceData = await serviceResponse.json();
          console.log('✅ Service call successful:', serviceData);
          
          setStep('success');
          onSuccess(paymentTxHash || 'unknown');
        } catch (serviceError: any) {
          console.error('Service call error:', serviceError);
          // Payment succeeded, but service call failed - still show success
          setStep('success');
          onSuccess(paymentTxHash || 'unknown');
        }
      } else {
        // No service endpoint - just report payment success
        setStep('success');
        onSuccess(paymentTxHash || 'unknown');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Payment failed';
      setError(errorMsg);
      setStep('error');
      onError(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-white border-2 border-dashed border-black max-w-lg w-full p-8">
        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none rounded-lg"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px'
          }}
        />

        <div className="relative z-10">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-black mb-6 font-title">{title}</h2>

          {/* Service Details */}
          <div className="bg-white rounded-none p-4 mb-6 border-2 border-dashed border-black">
            <h3 className="font-bold text-black mb-2 font-title">{service.name}</h3>
            <p className="text-sm text-gray-700 mb-3">{service.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price:</span>
              <span className="text-black font-medium">{service.price.amount} {service.price.currency}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Network:</span>
              <span className="text-black">{networkName}</span>
            </div>
          </div>

          {/* Payment Steps */}
          <div className="space-y-4">
            {/* Pay Button */}
            {(step === 'pay' || step === 'paying' || step === 'calling-service') && (
              <div className="border-2 border-dashed border-black p-4 bg-white">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {step === 'pay' ? '1' : step === 'paying' ? '1' : '2'}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-bold text-black mb-2">
                      {step === 'pay' || step === 'paying' ? actionText : 'Calling Service...'}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {step === 'pay' || step === 'paying' 
                        ? `Pay ${amountUSD} USDC ${title.toLowerCase().includes('mint') ? 'to mint the token' : 'to use the service'}`
                        : 'Processing service request...'}
                    </p>
                    {step === 'pay' && (
                      <button
                        onClick={handlePayment}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {actionText}
                      </button>
                    )}
                    {(step === 'paying' || step === 'calling-service') && (
                      <div className="w-full px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-center">
                        {step === 'paying' ? 'Processing payment...' : 'Calling service...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success */}
            {step === 'success' && (
              <div className="border-2 border-dashed border-black p-4 bg-white">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-black mb-2">{successText}</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Your transaction has been processed
                  </p>
                  {paymentTxHash && (
                    <a
                      href={`https://basescan.org/tx/${paymentTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      View Transaction →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {step === 'error' && error && (
              <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/10">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-light text-red-400 mb-1">Payment Failed</h4>
                    <p className="text-sm text-red-300/80 font-light">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}