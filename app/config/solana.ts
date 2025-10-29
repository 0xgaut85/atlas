import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana, solanaTestnet } from '@reown/appkit/networks';

export const solanaNetworks = [solana, solanaTestnet] as const;

export const solanaAdapter = new SolanaAdapter({
  networks: solanaNetworks
});

