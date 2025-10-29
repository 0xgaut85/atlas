'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export function WalletButton() {
  const { address } = useAppKitAccount();
  const { open } = useAppKit();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      {address ? (
        <button
          onClick={open}
          className="bg-black hover:bg-gray-900 rounded-lg text-sm font-medium px-4 py-2 h-auto text-white transition-colors"
        >
          {formatAddress(address)}
        </button>
      ) : (
        <button
          onClick={open}
          className="bg-black hover:bg-gray-900 rounded-lg text-sm font-medium px-4 py-2 h-auto text-white transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </>
  );
}

