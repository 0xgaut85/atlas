import { cookieStorage, createStorage, http } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, bsc, bscTestnet } from '@reown/appkit/networks';

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'bb1ac17de596e3590a24a476c5cb419c';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [base, baseSepolia, bsc, bscTestnet] as const;

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
});

export const config = wagmiAdapter.wagmiConfig;

