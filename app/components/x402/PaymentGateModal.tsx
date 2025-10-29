'use client';

import { useState } from 'react';
import { useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-wagmi';
import { makeX402Request } from '@/lib/x402-client';
import { storeSession } from '@/lib/x402-session';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';
import Image from 'next/image';

interface PaymentGateModalProps {
  pageName: string;
  pageId: string;
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
  userAddress?: string | null;
}

export function PaymentGateModal({ pageName, pageId, isOpen, onSuccess, onClose, userAddress }: PaymentGateModalProps) {
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  const { walletProvider: solanaProvider } = useAppKitProvider<any>('solana');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'signing' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [network, setNetwork] = useState<'base' | 'solana-mainnet'>('base');

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (network === 'base' && !walletProvider) {
      setError('Please connect your wallet first');
      return;
    }
    if (network === 'solana-mainnet' && !solanaProvider) {
      setError('Please connect your Solana wallet');
      return;
    }

    setLoading(true);
    setPaymentStatus('signing');
    setError('');

    try {
      console.log(`Processing payment for ${pageName}...`);
      
      setPaymentStatus('verifying');

      let response: Response;

      if (network === 'base') {
        // EVM flow
        response = await makeX402Request(
          walletProvider as Provider,
          '/api/atlas-index',
          { method: 'GET' }
        );
      } else {
        // Solana flow: create SPL USDC transfer client-side, then call protected API with x-payment payload
        const amount = 1_000_000; // 1.00 USDC
        const mint = TOKENS.usdcSol;
        const recipient = X402_CONFIG.payToSol;

        const signature = await (async () => {
          try {
            // Dynamically import to avoid SSR issues
            const { PublicKey, Transaction, Connection } = await import('@solana/web3.js');
            const { 
              getMint,
              getAssociatedTokenAddress, 
              createAssociatedTokenAccountInstruction,
              createTransferInstruction, 
              TOKEN_PROGRAM_ID,
              TOKEN_2022_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            } = await import('@solana/spl-token');

            const payer = solanaProvider?.publicKey ? new PublicKey(solanaProvider.publicKey) : undefined;
            if (!payer) throw new Error('Solana wallet not connected');

            // Create connection to Solana mainnet (using Helius RPC)
            const connection = new Connection(
              'https://mainnet.helius-rpc.com/?api-key=e5af1d68-c89f-4bbf-bfc1-c12dd6cbbee2',
              'confirmed'
            );

            const mintPk = new PublicKey(mint);
            const recipientPk = new PublicKey(recipient);
            
            // CRITICAL: Fetch mint info to get the correct program ID
            const mintInfo = await getMint(connection, mintPk);
            const tokenProgramId = mintInfo.tlvData.length > 0 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
            
            console.log('Token Program:', tokenProgramId.toBase58());
            console.log('Is Token-2022:', mintInfo.tlvData.length > 0);
            
            // Get ATAs with the correct program ID
            const fromAta = await getAssociatedTokenAddress(
              mintPk,
              payer,
              false,
              tokenProgramId,
              ASSOCIATED_TOKEN_PROGRAM_ID
            );
            
            const toAta = await getAssociatedTokenAddress(
              mintPk,
              recipientPk,
              false,
              tokenProgramId,
              ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const tx = new Transaction();

            // Check if recipient's ATA exists, if not, create it
            const toAtaInfo = await connection.getAccountInfo(toAta);
            if (!toAtaInfo) {
              console.log('Creating recipient ATA with program:', tokenProgramId.toBase58());
              const createAtaIx = createAssociatedTokenAccountInstruction(
                payer,              // payer
                toAta,              // ata
                recipientPk,        // owner
                mintPk,             // mint
                tokenProgramId,     // token program
                ASSOCIATED_TOKEN_PROGRAM_ID  // associated token program
              );
              tx.add(createAtaIx);
            }

            // Add transfer instruction with the correct program
            const transferIx = createTransferInstruction(
              fromAta,
              toAta,
              payer,
              amount,
              [],
              tokenProgramId  // Use the detected token program
            );
            tx.add(transferIx);
            
            tx.feePayer = payer;
            
            // Get recent blockhash from our own connection
            const { blockhash } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            
            // Sign transaction with wallet
            const signedTx = await solanaProvider.signTransaction(tx);
            
            // Send the signed transaction
            const txSignature = await connection.sendRawTransaction(signedTx.serialize());
            
            console.log('Solana USDC transfer sent:', txSignature);
            return txSignature;
          } catch (e: any) {
            console.error('Solana payment error details:', e);
            throw new Error(e?.message || 'Solana payment failed');
          }
        })();

        response = await fetch('/api/atlas-index', {
          method: 'GET',
          headers: {
            'x-payment': JSON.stringify({
              network: 'solana-mainnet',
              transactionHash: signature,
              amount: String(amount),
              mint,
              recipient,
            })
          }
        });
      }

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      setPaymentStatus('success');
      
      // Store session
      const txHash = data.payment?.signature || `session_${Date.now()}`;
      storeSession(pageId, txHash);
      
      let trackedFrom: string | undefined;

      // Track the payment for analytics
      try {
        const trackPayload: any = {
          network,
          amountMicro: 1_000_000,
          category: 'access',
          service: pageName,
          metadata: { pageId }
        };
        
        const normalizedUser = userAddress ? userAddress.toLowerCase() : undefined;

        if (network === 'base' && data.payment?.transactionHash) {
          trackPayload.txHash = data.payment.transactionHash;
          trackPayload.from = data.payment.from?.toLowerCase();
          trackPayload.to = data.payment.to;
        } else if (network === 'base' && walletProvider) {
          try {
            const accounts = await walletProvider.request({ method: 'eth_accounts' });
            if (accounts && accounts[0]) {
              trackPayload.from = accounts[0].toLowerCase();
            }
          } catch (err) {
            console.warn('Failed to fetch EVM account', err);
          }
        } else if (network === 'solana-mainnet') {
          trackPayload.txHash = txHash;
          // Get wallet addresses from providers
          if (solanaProvider?.publicKey) {
            trackPayload.from = solanaProvider.publicKey.toString();
          }
          trackPayload.to = X402_CONFIG.payToSol;
        }

        if (normalizedUser) {
          trackPayload.from = normalizedUser;
        } else if (trackPayload.from) {
          trackPayload.from = trackPayload.from.toLowerCase();
        }
        
        trackedFrom = trackPayload.from;

        await fetch('/api/admin/payment-tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackPayload)
        });
        console.log('✅ Payment tracked:', txHash);
      } catch (e) {
        console.error('Failed to track payment:', e);
      }

      const actor = userAddress ? userAddress.toLowerCase() : undefined;
      const eventAddress = actor || trackedFrom;

      if (eventAddress) {
        try {
          await fetch('/api/admin/user-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress: eventAddress,
              eventType: 'access_granted',
              network,
              referenceId: pageId,
              amountMicro: 1_000_000,
              metadata: {
                pageId,
                pageName,
                txHash,
              },
            }),
          });
        } catch (error) {
          console.error('Failed to log access event:', error);
        }
      }
      
      // Wait a moment to show success state
      setTimeout(() => {
        onSuccess();
      }, 1000);
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentStatus('error');
      setError(err.message || 'Payment failed. Please try again.');
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
      case 'success': return 'Payment verified! Granting access...';
      case 'error': return `Error: ${error}`;
      default: return 'Pay to unlock this feature';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-dashed border-black max-w-md w-full p-8 relative">
        {/* Close button */}
        {onClose && !loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.jpg"
            alt="Atlas402"
            width={64}
            height={64}
            className="w-16 h-16 rounded-lg"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-black text-center mb-1 font-title">
          Atlas402 Access
        </h2>
        <p className="text-gray-700 text-center text-sm mb-6">Pay once. 1-hour access.</p>

        {/* Network selector */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setNetwork('base')}
            className={`py-2 text-sm border-2 border-dashed ${network==='base' ? 'border-red-600 text-red-600' : 'border-black text-black'} transition-colors`}
          >
            Base Mainnet
          </button>
          <button
            onClick={() => setNetwork('solana-mainnet')}
            className={`py-2 text-sm border-2 border-dashed ${network==='solana-mainnet' ? 'border-red-600 text-red-600' : 'border-black text-black'} transition-colors`}
          >
            Solana Mainnet
          </button>
        </div>

        {/* Payment Details */}
        <div className="bg-white border-2 border-dashed border-black p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 text-sm">Amount</span>
            <span className="text-black text-lg font-medium">$1.00 USDC</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 text-sm">Network</span>
            <span className="text-black text-sm">{network==='base' ? 'Base Mainnet' : 'Solana Mainnet'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Valid For</span>
            <span className="text-black text-sm">1 Hour</span>
          </div>
        </div>

        {/* Status */}
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

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || paymentStatus === 'success'}
          className={`w-full py-3 rounded-lg text-sm transition-all duration-300 ${
            loading || paymentStatus === 'success'
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {loading ? 'Processing...' : paymentStatus === 'success' ? 'Access Granted!' : 'Pay $1.00 USDC'}
        </button>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-gray-600">
          <p>Non-custodial via x402 • Atlas402</p>
        </div>
      </div>
    </div>
  );
}

