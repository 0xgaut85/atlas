import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '../../x402/middleware';
import { calculateDeploymentFee, verifyTokenDeployment, prepareERC20Deployment } from '@/lib/cdp-agentkit';
import { upsertService } from '@/lib/atlas-tracking';
import { recordPayment } from '@/lib/atlas-tracking';
import { X402_CONFIG } from '@/lib/x402-config';

/**
 * Create Token Mint Endpoint
 * x402-protected endpoint that:
 * 1. Requires deployment fee payment (10 USDC fixed)
 * 2. Prepares token deployment instructions
 * 3. Returns deployment instructions for client-side deployment
 * 4. After deployment, creates x402-protected mint endpoint
 */

const DEPLOYMENT_FEE_USD = 10; // Fixed fee: 10 USDC

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      symbol,
      description,
      supply,
      pricePerMint,
      network,
      deployerAddress,
      contractAddress, // Optional: if contract already deployed
      devSupplyToMint, // Optional: supply to mint for dev address
    } = body;

    // Validate required fields
    if (!name || !symbol || !supply || !pricePerMint || !network || !deployerAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, symbol, supply, pricePerMint, network, deployerAddress',
      }, { status: 400 });
    }

    // Calculate deployment fee (fixed 10 USDC)
    const deploymentFeeUSD = DEPLOYMENT_FEE_USD;
    const deploymentFeeMicro = Math.round(deploymentFeeUSD * 1_000_000);

    // Verify x402 payment for deployment fee
    const verification = await verifyX402Payment(
      req,
      deploymentFeeUSD.toString()
    );

    if (!verification.valid) {
      // Return 402 Payment Required
      return create402Response(verification.error);
    }

    console.log('✅ Deployment fee verified:', {
      deploymentFeeUSD,
      txHash: verification.payment?.transactionHash,
      userAddress: verification.payment?.from,
    });

    // Record deployment fee payment
    try {
      await recordPayment({
        txHash: verification.payment?.transactionHash || 'unknown',
        userAddress: verification.payment?.from?.toLowerCase() || deployerAddress.toLowerCase(),
        merchantAddress: network === 'base' ? X402_CONFIG.payTo : X402_CONFIG.payToSol,
        network: network === 'base' ? 'base' : 'solana-mainnet',
        amountMicro: deploymentFeeMicro,
        currency: 'USDC',
        category: 'registration',
        service: `Token Deployment: ${name} (${symbol})`,
        metadata: {
          tokenName: name,
          tokenSymbol: symbol,
          supply,
          pricePerMint,
          network,
          deploymentFeeUSD,
        },
      });
    } catch (dbError: any) {
      console.error('Failed to record deployment fee:', dbError.message);
      // Continue even if DB recording fails
    }

    // If contract address provided, verify it exists
    if (contractAddress) {
      const isValid = await verifyTokenDeployment(contractAddress, network);
      if (!isValid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid contract address or contract not deployed',
        }, { status: 400 });
      }
    }

    // Prepare deployment instructions
    const deploymentParams = {
      name,
      symbol,
      decimals: 18, // Standard ERC-20 decimals
      initialSupply: BigInt(supply) * BigInt(10 ** 18),
      owner: deployerAddress,
      network,
    };

    const deploymentData = await prepareERC20Deployment(deploymentParams);

    // Create mint endpoint URL
    const mintEndpoint = contractAddress 
      ? `/api/token/${contractAddress}/mint`
      : null; // Will be created after deployment

    // Register service in database (even if contract not deployed yet)
    const serviceId = contractAddress 
      ? `token-${contractAddress.toLowerCase()}`
      : `token-pending-${symbol.toLowerCase()}-${Date.now()}`;

    try {
      await upsertService({
        id: serviceId,
        name: `${name} (${symbol})`,
        description: description || `Token mint endpoint for ${name}`,
        endpoint: mintEndpoint || `/api/token/deploy/${serviceId}/mint`,
        merchantAddress: deployerAddress.toLowerCase(),
        category: 'Tokens',
        network: network === 'base' ? 'base' : 'solana-mainnet',
        priceAmount: pricePerMint.toString(),
        priceCurrency: 'USDC',
        metadata: {
          tokenName: name,
          tokenSymbol: symbol,
          contractAddress: contractAddress || null,
          supply,
          pricePerMint,
          deploymentFeeUSD,
          devSupplyToMint: devSupplyToMint || '0',
          deployedAt: contractAddress ? new Date().toISOString() : null,
          deploymentTxHash: verification.payment?.transactionHash || null,
          deploymentInstructions: deploymentData.deploymentInstructions,
        },
      });
    } catch (dbError: any) {
      console.error('Failed to register service:', dbError.message);
      // Continue even if DB registration fails
    }

    // Return success with deployment instructions
    return NextResponse.json({
      success: true,
      message: `You paid $${deploymentFeeUSD} deployment fee. You can now mint your token.`,
      deploymentFeeUSD,
      deploymentFeeTxHash: verification.payment?.transactionHash,
      contractAddress: contractAddress || null,
      mintEndpoint: mintEndpoint || null,
      deploymentInstructions: deploymentData.deploymentInstructions,
      nextSteps: [
        'Deploy your ERC-20 contract using the provided instructions',
        'Once deployed, update this service with the contract address',
        'The mint endpoint will be automatically created',
      ],
      explorerLink: verification.payment?.transactionHash
        ? network === 'base'
          ? `https://basescan.org/tx/${verification.payment.transactionHash}`
          : `https://solscan.io/tx/${verification.payment.transactionHash}`
        : null,
    });
  } catch (error: any) {
    console.error('❌ Error creating token:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create token',
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check deployment fee and requirements
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const supply = searchParams.get('supply');
  const pricePerMint = searchParams.get('pricePerMint');

  // Return fixed deployment fee
  return NextResponse.json({
    success: true,
    deploymentFeeUSD: DEPLOYMENT_FEE_USD,
    minimumFee: DEPLOYMENT_FEE_USD,
    calculation: {
      fixedFee: DEPLOYMENT_FEE_USD,
      finalFee: DEPLOYMENT_FEE_USD,
    },
  });
}

