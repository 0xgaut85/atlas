import { AtlasFoundry } from '../core/foundry';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

async function main() {
  const walletClient = createWalletClient({
    chain: base,
    transport: http(),
  });

  const foundry = new AtlasFoundry({
    facilitatorUrl: 'https://facilitator.payai.network',
  });

  await foundry.initializeEVM(walletClient);

  const token = await foundry.createToken({
    name: 'My Service Token',
    symbol: 'MST',
    supply: '1000000',
    pricePerMint: '10.00',
    network: 'base',
    deployerAddress: '0x1234567890123456789012345678901234567890',
  });

  console.log('Token created:', token);
}

main().catch(console.error);

