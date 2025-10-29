import { Request, Response, NextFunction } from 'express';
import { verifyPayment } from '@atlas402/x402-server';

export interface X402Config {
  price: string;
  network: 'base' | 'solana-mainnet';
  merchantAddress: string;
  facilitatorUrl?: string;
  timeoutSeconds?: number;
}

export function x402Middleware(config: X402Config) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const paymentHeader = req.headers['x-payment'] as string;

    if (!paymentHeader) {
      return res.status(402).json({
        x402Version: 1,
        accepts: [{
          scheme: config.network === 'base' ? 'x402+eip712' : 'x402+solana',
          network: config.network,
          maxAmountRequired: Math.round(parseFloat(config.price) * 1_000_000).toString(),
          resource: req.url,
          description: `Payment required for ${req.url}`,
          mimeType: 'application/json',
          payTo: config.merchantAddress,
          maxTimeoutSeconds: config.timeoutSeconds || 60,
          asset: config.network === 'base'
            ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
            : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          extra: config.network === 'base' ? { name: 'USDC', version: '2' } : null,
        }],
        error: null,
      });
    }

    try {
      const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
      const paymentPayload = JSON.parse(decoded);

      const verification = await verifyPayment({
        paymentPayload,
        requirements: {
          scheme: config.network === 'base' ? 'x402+eip712' : 'x402+solana',
          network: config.network,
          maxAmountRequired: Math.round(parseFloat(config.price) * 1_000_000).toString(),
          payTo: config.merchantAddress,
          asset: config.network === 'base'
            ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
            : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        },
        facilitatorUrl: config.facilitatorUrl || 'https://facilitator.payai.network',
      });

      if (!verification.isValid) {
        return res.status(402).json({
          x402Version: 1,
          accepts: [{
            scheme: config.network === 'base' ? 'x402+eip712' : 'x402+solana',
            network: config.network,
            maxAmountRequired: Math.round(parseFloat(config.price) * 1_000_000).toString(),
            resource: req.url,
            description: `Payment required for ${req.url}`,
            mimeType: 'application/json',
            payTo: config.merchantAddress,
            maxTimeoutSeconds: config.timeoutSeconds || 60,
            asset: config.network === 'base'
              ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
              : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            extra: config.network === 'base' ? { name: 'USDC', version: '2' } : null,
          }],
          error: verification.invalidReason || 'Payment verification failed',
        });
      }

      (req as any).x402Payment = {
        verified: true,
        txHash: paymentPayload.payload.transactionHash || paymentPayload.payload.signature,
        amount: paymentPayload.payload.amount,
      };

      next();
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Payment processing error',
      });
    }
  };
}

