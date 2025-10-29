'use client';

import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ManageWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  const handleChangeWallet = () => {
    open({ view: 'Account' });
  };

  return (
    <div className="fixed top-20 right-6 sm:top-24 sm:right-8 z-[60]">
      {/* Dropdown Container */}
      <div className="relative">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-black hover:bg-gray-50 transition-all duration-300 shadow-lg"
        >
          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm sm:text-base font-medium text-black">Manage Wallet</span>
          <svg 
            className={`w-4 h-4 text-black transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-black shadow-xl z-[70]"
            >
              {/* Connected State */}
              {isConnected && address && (
                <div className="p-4 border-b-2 border-dashed border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-500">Connected</span>
                  </div>
                  <div className="text-xs font-mono text-black break-all bg-gray-50 p-2 rounded">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="p-2">
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-medium text-black"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect Wallet
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleChangeWallet}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-medium text-black"
                    >
                      <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Change Wallet
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors text-sm font-medium text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Disconnect Wallet
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

