import { createWalletClient, http, parseUnits } from 'viem';
import { base } from 'viem/chains';
import { Connection, PublicKey } from '@solana/web3.js';

export interface X402FetchOptions {
  walletClient?: any;
  solanaWallet?: any;
  network: 'base' | 'solana-mainnet';
  facilitatorUrl?: string;
}

export async function x402Fetch(
  url: string,
  options: X402FetchOptions & RequestInit
): Promise<Response> {
  const { walletClient, solanaWallet, network, facilitatorUrl, ...fetchOptions } = options;

  let response = await fetch(url, fetchOptions);

  if (response.status === 402) {
    const paymentRequirements = await response.json();
    const requirement = paymentRequirements.accepts?.[0];

    if (!requirement) {
      throw new Error('No payment requirements provided');
    }

    const paymentPayload = await createPayment(requirement, {
      walletClient,
      solanaWallet,
      network,
    });

    const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

    response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        'x-payment': paymentHeader,
      },
    });
  }

  return response;
}

async function createPayment(
  requirement: any,
  options: { walletClient?: any; solanaWallet?: any; network: string }
): Promise<any> {
  if (requirement.scheme === 'x402+eip712' && options.walletClient) {
    return createEIP712Payment(requirement, options.walletClient);
  } else if (requirement.scheme === 'x402+solana' && options.solanaWallet) {
    return createSolanaPayment(requirement, options.solanaWallet);
  }

  throw new Error('No wallet available for payment scheme');
}

async function createEIP712Payment(requirement: any, walletClient: any): Promise<any> {
  const [account] = await walletClient.getAddresses();
  
  const hash = await walletClient.sendTransaction({
    account,
    to: requirement.payTo as `0x${string}`,
    value: BigInt(0),
    data: encodeUSDCTransfer(requirement.payTo, requirement.maxAmountRequired),
  });

  return {
    x402Version: 1,
    scheme: requirement.scheme,
    network: requirement.network,
    payload: {
      transactionHash: hash,
      amount: requirement.maxAmountRequired,
      currency: 'USDC',
      payTo: requirement.payTo,
      chainId: requirement.network === 'base' ? 8453 : 1,
    },
  };
}

async function createSolanaPayment(requirement: any, wallet: any): Promise<any> {
  return {
    x402Version: 1,
    scheme: requirement.scheme,
    network: requirement.network,
    payload: {
      signature: 'transaction-signature',
      amount: requirement.maxAmountRequired,
      currency: 'USDC',
      payTo: requirement.payTo,
    },
  };
}

function encodeUSDCTransfer(to: string, amount: string): `0x${string}` {
  return '0x' as `0x${string}`;
}

