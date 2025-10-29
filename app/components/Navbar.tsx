'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hubDropdownOpen, setHubDropdownOpen] = useState(false);
  const [novaDropdownOpen, setNovaDropdownOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setNavVisible(true);
      } else if (currentScrollY > prevScrollY) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: navVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 border-b border-black/10"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/logosvg.svg" 
              alt="Atlas402" 
              width={72} 
              height={72}
              className="w-[72px] h-[72px] transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-2xl font-normal text-black font-title tracking-wide">Atlas402</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link 
              href="/docs" 
              className="text-gray-600 hover:text-black transition-colors duration-300 text-base font-light tracking-wide"
            >
              Docs
            </Link>
            
            {/* Atlas Hub Dropdown */}
            <div className="relative">
              <button
                onClick={() => setHubDropdownOpen(!hubDropdownOpen)}
                onBlur={() => setTimeout(() => setHubDropdownOpen(false), 200)}
                className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors duration-300 text-base font-light tracking-wide"
              >
                <span>Atlas Hub</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${hubDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {hubDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white backdrop-blur-xl border border-black/10 rounded-lg shadow-xl overflow-hidden">
                  <Link
                    href="/dapp"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Hub Home
                  </Link>
                  <Link
                    href="/dapp/service-hub"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Service Hub
                  </Link>
                  <Link
                    href="/dapp/token-mint"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Token Mint
                  </Link>
                  <Link
                    href="/dapp/token-indexer"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    x402 Indexer
                  </Link>
                  <Link
                    href="/dapp/integration-layer"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Integration Layer
                  </Link>
                  <Link
                    href="/dapp/agent"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Atlas Native Agent
                  </Link>
                </div>
              )}
            </div>

            {/* $ATLAS Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNovaDropdownOpen(!novaDropdownOpen)}
                onBlur={() => setTimeout(() => setNovaDropdownOpen(false), 200)}
                className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors duration-300 text-base font-light tracking-wide"
              >
                <span>$ATLAS</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${novaDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {novaDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white backdrop-blur-xl border border-black/10 rounded-lg shadow-xl overflow-hidden">
                  <Link
                    href="/atlas-mint"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setNovaDropdownOpen(false)}
                  >
                    $ATLAS Mint
                  </Link>
                  <a
                    href="https://dexscreener.com/solana/5kwqfa3rtzrdiyvfyspemnyudhbzmilbucyd1em4rrzs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setNovaDropdownOpen(false)}
                  >
                    Dexscreener
                  </a>
                  <div className="px-4 py-3 text-xs">
                    <div className="text-gray-500 mb-1">Contract Address</div>
                    <div className="font-mono text-gray-300 break-all">
                      Bt7rUdZ62TWyHB5HsBjLhFqQ3VDg42VUb5Ttwiqvpump
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              href="/roadmap" 
              className="text-gray-600 hover:text-black transition-colors duration-300 text-base font-light tracking-wide"
            >
              Roadmap
            </Link>
            <a 
              href="https://github.com/atlas402" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors duration-300 text-base font-light tracking-wide"
            >
              GitHub
            </a>
            <a 
              href="https://x.com/atlas402dotcom" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors duration-300 text-base font-light tracking-wide"
            >
              Twitter
            </a>
            <a 
              href="https://t.me/xatlas402" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors duration-300 text-base font-light tracking-wide"
            >
              Telegram
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-black p-3 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-6 border-t border-black/10"
          >
            <div className="flex flex-col gap-3">
              <Link 
                href="/docs" 
                className="text-gray-600 hover:text-black transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </Link>
              <Link 
                href="/dapp" 
                className="text-gray-600 hover:text-black transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Atlas Hub
              </Link>
              <a 
                href="https://dexscreener.com/solana/5kwqfa3rtzrdiyvfyspemnyudhbzmilbucyd1em4rrzs" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center"
              >
                $ATLAS
              </a>
              <Link 
                href="/roadmap" 
                className="text-gray-600 hover:text-black transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Roadmap
              </Link>
              <a 
                href="https://github.com/atlas402" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center"
              >
                GitHub
              </a>
              <a 
                href="https://x.com/atlas402dotcom" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center"
              >
                Twitter
              </a>
              <a 
                href="https://t.me/xatlas402" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center"
              >
                Telegram
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
