import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '../../x402/middleware';
import { verifyTokenDeployment } from '@/lib/cdp-agentkit';
import { listServices, upsertService } from '@/lib/atlas-tracking';
import { recordPayment } from '@/lib/atlas-tracking';
import { X402_CONFIG, TOKENS } from '@/lib/x402-config';

/**
 * Token Mint Endpoint
 * x402-protected endpoint that allows users to mint tokens
 * Requires payment of pricePerMint USDC to the token deployer
 */

export async function GET(
  req: NextRequest,
  { params }: { params: { contractAddress: string } }
) {
  try {
    const contractAddress = params.contractAddress;
    
    if (!contractAddress) {
      return NextResponse.json({
        success: false,
        error: 'Contract address required',
      }, { status: 400 });
    }

    // Load token metadata from database
    const serviceId = `token-${contractAddress.toLowerCase()}`;
    const services = await listServices();
    const service = services.find(s => s.id === serviceId);

    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Token not found. Please register the token first.',
      }, { status: 404 });
    }

    // Verify contract exists on-chain
    const network = service.network === 'base' ? 'base' : 'solana-mainnet';
    const contractExists = await verifyTokenDeployment(contractAddress, network);
    
    if (!contractExists) {
      return NextResponse.json({
        success: false,
        error: 'Contract not deployed or invalid address',
      }, { status: 400 });
    }

    // Get price per mint from service metadata
    const pricePerMint = Number(service.priceAmount || service.metadata?.pricePerMint || '0');
    const priceMicro = Math.round(pricePerMint * 1_000_000);

    if (priceMicro <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid mint price configured',
      }, { status: 400 });
    }

    // Get merchant address (deployer)
    const merchantAddress = service.merchantAddress || service.metadata?.merchantAddress;
    
    if (!merchantAddress) {
      return NextResponse.json({
        success: false,
        error: 'Token merchant address not configured',
      }, { status: 500 });
    }

    // Check for payment header
    const paymentHeader = req.headers.get('x-payment');
    
    if (!paymentHeader) {
      // Return 402 Payment Required with deployer address as recipient
      const accepts = [];
      
      const url = new URL(req.url);
      const resourceUrl = url.toString();
      
      if (network === 'base') {
        accepts.push({
          scheme: 'exact', // x402scan requires "exact"
          network: 'base',
          maxAmountRequired: priceMicro.toString(),
          resource: resourceUrl,
          description: `Payment required to mint ${service.name || 'token'}`,
          mimeType: 'application/json',
          payTo: merchantAddress, // Deployer address, not protocol
          maxTimeoutSeconds: 60,
          asset: TOKENS.usdcEvm,
          extra: {
            scheme: 'x402+eip712', // Keep original scheme in extra
            name: 'USDC',
            version: '2',
          },
        });
      } else if (network === 'solana-mainnet') {
        accepts.push({
          scheme: 'exact', // x402scan requires "exact"
          network: 'solana-mainnet',
          maxAmountRequired: priceMicro.toString(),
          resource: resourceUrl,
          description: `Payment required to mint ${service.name || 'token'}`,
          mimeType: 'application/json',
          payTo: merchantAddress, // Deployer address, not protocol
          maxTimeoutSeconds: 60,
          asset: TOKENS.usdcSol,
          extra: {
            scheme: 'x402+solana', // Keep original scheme in extra
            name: 'USDC',
          },
        });
      }

      return new Response(
        JSON.stringify({
          x402Version: 1,
          error: null, // x402scan prefers null
          accepts,
        }),
        {
          status: 402,
          headers: {
            'Content-Type': 'application/json',
            'x-payment-required': JSON.stringify({ accepts }),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, x-payment',
          },
        }
      );
    }

    // Verify payment (custom verification for deployer address)
    try {
      const payment = JSON.parse(paymentHeader);
      
      if (!payment.transactionHash) {
        return NextResponse.json({
          success: false,
          error: 'Invalid payment header',
        }, { status: 400 });
      }

      // Verify payment via PayAI facilitator
      const { payaiClient } = await import('@/lib/payai-client');
      const facilitatorVerification = await payaiClient.verifyPayment({
        txHash: payment.transactionHash,
        network: network,
        expectedAmount: priceMicro.toString(),
        expectedRecipient: merchantAddress.toLowerCase(), // Deployer address
        tokenAddress: network === 'base' ? TOKENS.usdcEvm : TOKENS.usdcSol,
      });

      if (!facilitatorVerification.success || !facilitatorVerification.data?.valid) {
        return NextResponse.json({
          success: false,
          error: 'Payment verification failed',
        }, { status: 402 });
      }

      // Payment verified - use facilitator data
      const verification = {
        valid: true,
        payment: {
          transactionHash: payment.transactionHash,
          network: payment.network || network,
          from: facilitatorVerification.data?.tx?.from || payment.from,
          to: merchantAddress,
          amount: pricePerMint,
        },
      };

      // Payment verified - record mint transaction
      const userAddress = verification.payment?.from || 'unknown';
      
      try {
        // Record mint payment (to deployer)
        await recordPayment({
          txHash: verification.payment?.transactionHash || 'unknown',
          userAddress: userAddress.toLowerCase(),
          merchantAddress: service.merchantAddress?.toLowerCase() || '',
          network: network === 'base' ? 'base' : 'solana-mainnet',
          amountMicro: priceMicro,
          currency: 'USDC',
          category: 'mint',
          service: service.name,
          metadata: {
            contractAddress,
            tokenSymbol: service.metadata?.tokenSymbol,
            tokensMinted: 1,
            mintPrice: pricePerMint,
          },
        });

        // Record mint event
        const { recordUserEvent } = await import('@/lib/atlas-tracking');
        await recordUserEvent({
          userAddress: userAddress.toLowerCase(),
          eventType: 'token_minted',
          network: network === 'base' ? 'base' : 'solana-mainnet',
          referenceId: serviceId,
          amountMicro: priceMicro,
          metadata: {
            contractAddress,
            tokenName: service.name,
            tokenSymbol: service.metadata?.tokenSymbol,
            mintPrice: pricePerMint,
            txHash: verification.payment?.transactionHash,
          },
        });
      } catch (dbError: any) {
        console.error('Failed to record mint:', dbError.message);
        // Continue even if DB recording fails
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Token minted successfully',
        contractAddress,
        tokenName: service.name,
        tokenSymbol: service.metadata?.tokenSymbol,
        tokensMinted: 1,
        mintPrice: pricePerMint,
        payment: {
          txHash: verification.payment?.transactionHash,
          network: verification.payment?.network,
          amount: pricePerMint,
          currency: 'USDC',
        },
        explorerLink: verification.payment?.transactionHash
          ? network === 'base'
            ? `https://basescan.org/tx/${verification.payment.transactionHash}`
            : `https://solscan.io/tx/${verification.payment.transactionHash}`
          : null,
      });
    } catch (verifyError: any) {
      console.error('Payment verification error:', verifyError);
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed',
      }, { status: 402 });
    }
  } catch (error: any) {
    console.error('❌ Error minting token:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to mint token',
    }, { status: 500 });
  }
}

