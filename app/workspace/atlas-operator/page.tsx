'use client';

import { useState, useEffect } from 'react';
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import Link from 'next/link';
import { PaymentGateModal } from '../../components/x402/PaymentGateModal';
import { PaymentStatusBar } from '../../components/x402/PaymentStatusBar';
import { hasValidSession } from '@/lib/x402-session';
import { ManageWallet } from '../../components/ManageWallet';
import { makeUSDCTransfer } from '@/lib/x402-client';
import { X402_CONFIG } from '@/lib/x402-config';
import GlitchText from '../../components/motion/GlitchText';

export default function AtlasOperatorPage() {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useAppKitDisconnect();
  const { open } = useAppKit();
  const { walletProvider } = useAppKitProvider('eip155');
  const [mounted, setMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; paymentIntent?: any }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<any>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionValid = hasValidSession('atlas-operator');
    setHasAccess(sessionValid);
    if (!sessionValid) {
      setShowPaymentModal(true);
    } else {
      // Welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Welcome to Atlas Operator. I can help you discover services, execute transactions, and navigate the x402 ecosystem. What would you like to do?'
        }
      ]);
    }
  }, []);

  const handlePaymentSuccess = () => {
    setHasAccess(true);
    setShowPaymentModal(false);
    setMessages([
      {
        role: 'assistant',
        content: 'Welcome to Atlas Operator. I can help you discover services, execute transactions, and navigate the x402 ecosystem. What would you like to do?'
      }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Chat API error:', response.status, errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.message) {
        throw new Error('No message in response');
      }

      // Check if the message contains a payment intent (JSON structure)
      let paymentIntent = null;
      const intentMatch = data.message.match(/\{[^{}]*"type"\s*:\s*"payment_intent"[^{}]*\}/);
      if (intentMatch) {
        try {
          paymentIntent = JSON.parse(intentMatch[0]);
          console.log('💳 Payment intent detected:', paymentIntent);
        } catch (e) {
          console.error('Failed to parse payment intent:', e);
        }
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, paymentIntent }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message || 'Unknown error occurred. Please try again.'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const executePayment = async (intent: any) => {
    if (!walletProvider || !address) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please connect your wallet to execute payments.'
      }]);
      return;
    }

    setPaymentProcessing(true);
    console.log('Executing payment:', intent);

    try {
      const feeDestination = intent.network === 'base' ? X402_CONFIG.payTo : X402_CONFIG.payToSol;
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Processing payment:\n■ Sending $1 USDC fee to protocol...\n■ Sending $${(intent.amountMicro / 1_000_000).toFixed(2)} USDC to ${intent.to}...\n\nPlease confirm both transactions in your wallet.`
      }]);

      // Step 1: Pay $1 fee to protocol
      console.log('Step 1: Paying $1 USDC fee...');
      const feeTxHash = await makeUSDCTransfer(
        walletProvider,
        feeDestination,
        1_000_000, // $1 USDC in micro units
        intent.network === 'base' ? 'base' : 'solana-mainnet'
      );
      console.log('Fee payment tx:', feeTxHash);

      // Step 2: Pay the actual amount to the merchant
      console.log('Step 2: Paying action amount...');
      const actionTxHash = await makeUSDCTransfer(
        walletProvider,
        intent.to,
        intent.amountMicro,
        intent.network === 'base' ? 'base' : 'solana-mainnet'
      );
      console.log('Action payment tx:', actionTxHash);

      // Track both payments
      try {
        // Track the $1 fee
        await fetch('/api/admin/payment-tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: feeTxHash,
            network: intent.network === 'base' ? 'base' : 'solana-mainnet',
            from: address,
            to: feeDestination,
            amountMicro: 1_000_000,
            category: 'access',
            service: 'Atlas Operator Fee',
            metadata: { operatorAction: true }
          })
        });
        
        // Track the action payment
        await fetch('/api/admin/payment-tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: actionTxHash,
            network: intent.network === 'base' ? 'base' : 'solana-mainnet',
            from: address,
            to: intent.to,
            amountMicro: intent.amountMicro,
            category: 'service',
            service: intent.description || 'Operator Action',
            metadata: { operatorAction: true, paymentIntent: intent }
          })
        });
        console.log('✅ Operator payments tracked');
      } catch (e) {
        console.error('Failed to track operator payments:', e);
      }

      if (address) {
        try {
          await fetch('/api/admin/user-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress: address.toLowerCase(),
              eventType: 'operator_action',
              network: intent.network,
              referenceId: intent.id || intent.to,
              amountMicro: intent.amountMicro,
              metadata: {
                memo: intent.memo,
                paymentIntent: intent,
                feeTxHash,
                actionTxHash,
              },
            }),
          });
        } catch (err) {
          console.error('Failed to record operator event:', err);
        }
      }

      // Success!
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Payment completed successfully!\n\nFee transaction: ${feeTxHash}\nAction transaction: ${actionTxHash}\n\n${intent.memo || 'Transaction complete.'}\n\nDashboards will update in a few moments...`
      }]);

      // Wait for settlement and refresh dashboards
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Dashboards refreshing...');
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Payment failed: ${error.message || 'Unknown error'}. Please try again.`
      }]);
    } finally {
      setPaymentProcessing(false);
      setPendingPayment(null);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <div className="min-h-screen bg-white text-black pt-24 pb-20">
      {/* Back Button - Top Right */}
      <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-50">
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-lg"
        >
          <span className="text-sm sm:text-base font-medium">Back</span>
          <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:translate-x-1">↩</span>
        </Link>
      </div>

      {/* Manage Wallet - Below Back Button */}
      <ManageWallet />

      <PaymentGateModal
        pageName="Atlas Operator"
        pageId="atlas-operator"
        isOpen={showPaymentModal && isConnected}
        onSuccess={handlePaymentSuccess}
        onClose={() => setShowPaymentModal(false)}
        userAddress={address}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {hasAccess && <PaymentStatusBar pageId="atlas-operator" pageName="Atlas Operator" />}

        {!hasAccess && (
          <div className="mb-12 p-8 border-2 border-dashed border-red-600 bg-red-50">
            <h2 className="text-2xl font-bold text-black mb-3 font-title">Access Required</h2>
            <p className="text-gray-700 mb-4">
              Atlas Operator requires x402 payment. Pay $1.00 USDC for 1 hour of access.
            </p>
            {!isConnected ? (
              <button
                onClick={() => open()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium"
              >
                Connect Wallet to Continue
              </button>
            ) : (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium"
              >
                Pay to Access
              </button>
            )}
          </div>
        )}

        {hasAccess && (
          <>
            <div className="mb-8">
              <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold text-black mb-4 font-title leading-[0.9]">
                <GlitchText text="Atlas" delay={300} replayOnView inViewThreshold={0.6} />{' '}
                <span className="text-red-600">
                  <GlitchText text="Operator" delay={600} replayOnView inViewThreshold={0.6} />
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Autonomous AI operator with full access to x402 services. Execute workflows on your behalf with approval guardrails.
              </p>
            </div>

            {/* Chat Interface */}
            <div className="border-2 border-dashed border-black bg-white mb-8" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        msg.role === 'user'
                          ? 'bg-red-600 text-white p-4 rounded-lg'
                          : 'bg-gray-100 text-black border border-gray-300 p-4 rounded-lg'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                      {msg.paymentIntent && (
                        <button
                          onClick={() => executePayment(msg.paymentIntent)}
                          disabled={paymentProcessing}
                          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium text-sm"
                        >
                          {paymentProcessing ? 'Processing...' : `Execute Payment ($${(msg.paymentIntent.amountMicro / 1_000_000).toFixed(2)} USDC + $1 fee)`}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-black border border-gray-300 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t-2 border-dashed border-black p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Atlas Operator anything about x402 services..."
                    className="flex-1 px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-black"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 border-2 border-dashed border-black bg-gray-50">
                <h3 className="text-xl font-bold text-black mb-3 font-title">Service Discovery</h3>
                <p className="text-gray-600 text-sm">
                  Ask the operator to find services, compare pricing, and recommend solutions for your use case.
                </p>
              </div>
              <div className="p-6 border-2 border-dashed border-black bg-gray-50">
                <h3 className="text-xl font-bold text-black mb-3 font-title">Transaction Execution</h3>
                <p className="text-gray-600 text-sm">
                  Execute multi-step workflows with approval gates. The operator handles payment verification and service calls.
                </p>
              </div>
              <div className="p-6 border-2 border-dashed border-black bg-gray-50">
                <h3 className="text-xl font-bold text-black mb-3 font-title">Autonomous Operations</h3>
                <p className="text-gray-600 text-sm">
                  Set up automated workflows that run on your behalf with predefined budgets and guardrails.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
