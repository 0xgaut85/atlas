'use client';

import { FC, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { wagmiAdapter } from '../config/wagmi';
import '../config/appkit'; // Initialize AppKit

interface WalletProviderProps {
  children: ReactNode;
  cookies: string | null;
}

// Create a client for react-query
const queryClient = new QueryClient();

export const WalletProvider: FC<WalletProviderProps> = ({ children, cookies }) => {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Export alias for backward compatibility
export const WalletContextProvider = WalletProvider;