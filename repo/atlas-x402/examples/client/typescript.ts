import { x402Fetch } from '@atlas402/x402-client';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

async function main() {
  const walletClient = createWalletClient({
    chain: base,
    transport: http(),
  });

  const response = await x402Fetch('http://localhost:3000/api/weather', {
    walletClient,
    network: 'base',
  });

  const data = await response.json();
  console.log('Weather data:', data);
}

main().catch(console.error);






