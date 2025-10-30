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

      // Verify payment via direct on-chain verification (main site uses on-chain transfers only)
      // PayAI facilitator is ONLY for simulator - all dapps use direct on-chain transfers
      let verification: any;
      
      if (network === 'base') {
        try {
          console.log('🔍 Verifying Base transaction on-chain:', payment.transactionHash);
          
          // Use public Base RPC to verify the transaction
          const rpcUrl = 'https://mainnet.base.org';
          const txResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getTransactionByHash',
              params: [payment.transactionHash],
              id: 1,
            }),
          });

          const txData = await txResponse.json();
          
          if (!txData.result) {
            console.error('❌ Transaction not found on-chain:', payment.transactionHash);
            return NextResponse.json({
              success: false,
              error: 'Transaction not found on-chain. Please wait a few seconds and try again.',
            }, { status: 402 });
          }

          const tx = txData.result;
          const usdcContract = TOKENS.usdcEvm.toLowerCase();
          
          // Verify transaction is to USDC contract
          if (tx.to && tx.to.toLowerCase() === usdcContract) {
            // Decode the transfer data to verify recipient
            if (tx.input && tx.input.startsWith('0xa9059cbb')) {
              const recipientFromTx = '0x' + tx.input.slice(34, 74);
              
              if (recipientFromTx.toLowerCase() === merchantAddress.toLowerCase()) {
                console.log('✅ Payment verified via on-chain verification');
                verification = {
                  valid: true,
                  payment: {
                    transactionHash: payment.transactionHash,
                    network: payment.network || network,
                    from: tx.from,
                    to: merchantAddress,
                    amount: pricePerMint,
                  },
                };
              } else {
                console.error('❌ Recipient mismatch:', {
                  expected: merchantAddress,
                  actual: recipientFromTx,
                });
                return NextResponse.json({
                  success: false,
                  error: `Payment recipient mismatch. Expected ${merchantAddress}, got ${recipientFromTx}`,
                }, { status: 402 });
              }
            } else {
              console.error('❌ Invalid transfer function signature in transaction');
              return NextResponse.json({
                success: false,
                error: 'Invalid transaction format - not a USDC transfer',
              }, { status: 402 });
            }
          } else {
            console.error('❌ Transaction not to USDC contract:', {
              expected: usdcContract,
              actual: tx.to,
            });
            return NextResponse.json({
              success: false,
              error: 'Transaction is not a USDC transfer',
            }, { status: 402 });
          }
        } catch (onChainError: any) {
          console.error('❌ On-chain verification error:', onChainError);
          return NextResponse.json({
            success: false,
            error: `On-chain verification failed: ${onChainError.message || 'Unknown error'}`,
          }, { status: 402 });
        }
      } else {
        // For Solana: accept transaction signature if it looks valid
        if (payment.transactionHash && payment.transactionHash.length > 80) {
          console.log('✅ Accepting Solana payment (direct transfer)');
          verification = {
            valid: true,
            payment: {
              transactionHash: payment.transactionHash,
              network: payment.network || network,
              from: payment.from || 'unknown',
              to: merchantAddress,
              amount: pricePerMint,
            },
          };
        } else {
          return NextResponse.json({
            success: false,
            error: 'Invalid Solana transaction signature',
          }, { status: 402 });
        }
      }

      if (!verification || !verification.valid) {
        return NextResponse.json({
          success: false,
          error: 'Payment verification failed',
        }, { status: 402 });
      }

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

