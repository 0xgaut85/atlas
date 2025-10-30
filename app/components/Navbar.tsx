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
                    href="/workspace"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Atlas Workspace
                  </Link>
                  <Link
                    href="/workspace/atlas-foundry"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Atlas Foundry
                  </Link>
                  <Link
                    href="/workspace/atlas-index"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Atlas Index
                  </Link>
                  <Link
                    href="/workspace/atlas-mesh"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-black/10"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Atlas Mesh
                  </Link>
                  <Link
                    href="/workspace/atlas-operator"
                    className="block px-4 py-3 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setHubDropdownOpen(false)}
                  >
                    Atlas Operator
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
                    href="https://dexscreener.com/solana/4k1jvo15jmopit7tgakuzyny5mpyfykmvnkq5uyscqkt"
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
              href="https://t.me/atlas402community" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors duration-300 text-base font-light tracking-wide"
            >
              Telegram
            </a>
            <a 
              href="#" 
              className="text-gray-400 cursor-not-allowed transition-colors duration-300 text-base font-light tracking-wide flex items-center gap-2"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord
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
                href="https://t.me/atlas402community" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center"
              >
                Telegram
              </a>
              <a 
                href="#" 
                className="text-gray-400 cursor-not-allowed transition-colors duration-300 py-3 px-2 font-light min-h-[44px] flex items-center gap-2"
                onClick={(e) => e.preventDefault()}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
