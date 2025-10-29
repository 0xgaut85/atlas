'use client';

import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, networks as evmNetworks, projectId } from './wagmi';
import { solanaAdapter, solanaNetworks } from './solana';

const metadata = {
  name: 'Atlas402',
  description: 'x402 protocol infrastructure',
  url: 'https://atlas402.com',
  icons: ['/logox.png'],
};

// Combine all networks
const networks = [...evmNetworks, ...solanaNetworks] as const;

// Create the modal - this initializes AppKit globally
createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  networks,
  defaultNetwork: evmNetworks[0], // Base mainnet
  metadata,
  projectId,
  features: {
    analytics: true
  }
});

