export interface PaymentRequirements {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: Record<string, any> | null;
}

export interface PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: Record<string, any>;
}

export interface VerificationResult {
  isValid: boolean;
  invalidReason?: string | null;
}

export interface VerificationOptions {
  paymentPayload: PaymentPayload;
  requirements: PaymentRequirements;
  facilitatorUrl?: string;
  rpcUrl?: string;
}

export async function verifyPayment(options: VerificationOptions): Promise<VerificationResult> {
  const { paymentPayload, requirements, facilitatorUrl, rpcUrl } = options;

  if (facilitatorUrl) {
    return verifyViaFacilitator(paymentPayload, requirements, facilitatorUrl);
  }

  if (requirements.scheme === 'x402+eip712') {
    return verifyEIP712Payment(paymentPayload, requirements, rpcUrl);
  }

  if (requirements.scheme === 'x402+solana') {
    return verifySolanaPayment(paymentPayload, requirements, rpcUrl);
  }

  return {
    isValid: false,
    invalidReason: `Unsupported scheme: ${requirements.scheme}`,
  };
}

async function verifyViaFacilitator(
  paymentPayload: PaymentPayload,
  requirements: PaymentRequirements,
  facilitatorUrl: string
): Promise<VerificationResult> {
  const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

  const response = await fetch(`${facilitatorUrl}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      x402Version: 1,
      paymentHeader,
      paymentRequirements: requirements,
    }),
  });

  const result = await response.json();
  return {
    isValid: result.isValid || false,
    invalidReason: result.invalidReason || null,
  };
}

async function verifyEIP712Payment(
  paymentPayload: PaymentPayload,
  requirements: PaymentRequirements,
  rpcUrl?: string
): Promise<VerificationResult> {
  const rpc = rpcUrl || (requirements.network === 'base' ? 'https://mainnet.base.org' : 'https://mainnet.infura.io/v3/...');
  const txHash = paymentPayload.payload.transactionHash;

  if (!txHash) {
    return {
      isValid: false,
      invalidReason: 'Missing transaction hash',
    };
  }

  try {
    const response = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    const result = await response.json();
    const receipt = result.result;

    if (!receipt || receipt.status !== '0x1') {
      return {
        isValid: false,
        invalidReason: 'Transaction failed or not found',
      };
    }

    if (receipt.to?.toLowerCase() !== requirements.payTo.toLowerCase()) {
      return {
        isValid: false,
        invalidReason: 'Recipient address mismatch',
      };
    }

    return {
      isValid: true,
    };
  } catch (error: any) {
    return {
      isValid: false,
      invalidReason: error.message || 'RPC verification failed',
    };
  }
}

async function verifySolanaPayment(
  paymentPayload: PaymentPayload,
  requirements: PaymentRequirements,
  rpcUrl?: string
): Promise<VerificationResult> {
  const rpc = rpcUrl || 'https://api.mainnet-beta.solana.com';
  const signature = paymentPayload.payload.signature;

  if (!signature) {
    return {
      isValid: false,
      invalidReason: 'Missing transaction signature',
    };
  }

  try {
    const response = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          signature,
          {
            encoding: 'json',
            maxSupportedTransactionVersion: 0,
          },
        ],
      }),
    });

    const result = await response.json();
    const transaction = result.result;

    if (!transaction || transaction.meta?.err) {
      return {
        isValid: false,
        invalidReason: 'Transaction failed or not found',
      };
    }

    return {
      isValid: true,
    };
  } catch (error: any) {
    return {
      isValid: false,
      invalidReason: error.message || 'RPC verification failed',
    };
  }
}

export { verifyPayment as default };




