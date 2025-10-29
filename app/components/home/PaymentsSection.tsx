'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import GlitchText from '../motion/GlitchText';
import MagneticButton from '../motion/MagneticButton';

export default function PaymentsSection() {
  return (
    <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden">
      {/* Split Background Container */}
      <div className="relative flex flex-col md:flex-row min-h-[600px]">
        {/* Left Half - White Background */}
        <div className="flex-1 bg-white relative">
          <div className="flex items-center justify-center px-6 sm:px-8 md:px-12 py-12 md:py-0 h-full relative z-10">
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 font-title tracking-tight">
                  x402 Payment Protocol
                </h2>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  HTTP-native micropayments for every API request. No subscriptions, no fraud, instant settlement.
                </p>

                {/* Value Props */}
                <ul className="space-y-4 mb-10">
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Pay-per-request pricing with instant blockchain settlement</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Works across Base and Solana with USDC or SOL</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Open standard protocol with drop-in SDKs for all stacks</span>
                  </motion.li>
                </ul>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <MagneticButton>
                    <Link
                      href="/dapp/service-hub"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300"
                    >
                      Start a Paid Session
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link
                      href="/docs/x402-protocol"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-gray-100 border-2 border-black text-black font-medium rounded-lg transition-all duration-300"
                    >
                      How it Works
                    </Link>
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Center Divider Line - Red */}
        <div className="hidden md:block w-[2px] bg-red-600 absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-10" />

        {/* Right Half - Light Grey Background */}
        <div className="flex-1 bg-gray-50 relative">
          <div className="flex items-center justify-center px-6 sm:px-8 md:px-12 py-12 md:py-0 h-full relative z-10">
            <div className="w-full max-w-lg space-y-6">
              {/* Pricing Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-8 border-2 border-dashed border-black relative"
              >
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Pricing</div>
                  <div className="text-4xl font-bold text-black mb-2 font-title">
                    <GlitchText text="$1.00" delay={500} replayOnView inViewThreshold={0.5} />
                  </div>
                  <div className="text-gray-600">per API request</div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      • Instant settlement<br />
                      • No minimum balance<br />
                      • Multi-chain support
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Session Model Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white p-8 border-2 border-dashed border-black relative"
              >
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Session Model</div>
                  <div className="text-4xl font-bold text-black mb-2 font-title">
                    <GlitchText text="1 Hour" delay={800} replayOnView inViewThreshold={0.5} />
                  </div>
                  <div className="text-gray-600">unlimited access</div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      • Pay once, use freely<br />
                      • Auto-renew optional<br />
                      • Cancel anytime
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

