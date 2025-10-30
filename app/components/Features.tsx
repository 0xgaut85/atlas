'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import HoverRevealCard from './motion/HoverRevealCard';

const AtlasStatue = dynamic(() => import('./AtlasStatue'), { ssr: false });

export default function Features() {
  return (
    <>
      {/* How It Works Section - Split Screen Layout */}
      <section className="relative py-12 sm:py-16 md:py-28 lg:py-36 overflow-hidden mt-12 sm:mt-16 md:mt-24 lg:mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 relative z-10 px-4 sm:px-6"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight text-black font-title">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light px-2">
            Pay-per-request creates value through instant settlements and transparent pricing
          </p>
        </motion.div>

        {/* Split Background Container */}
        <div className="relative flex flex-col md:flex-row min-h-[800px] sm:min-h-[1000px] md:min-h-[1000px]">
          {/* Left Half - All 4 Boxes */}
          <div className="flex-1 bg-white relative">
            <div className="flex items-center justify-center px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-20 h-full relative z-10">
              <div className="w-full max-w-2xl space-y-3 sm:space-y-4 md:space-y-5">
                {/* Service Providers Box */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white p-4 sm:p-6 md:p-8 border-2 border-dashed border-black relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-[2px] bg-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 text-black">Service Providers</h3>
                      <p className="text-gray-700 font-light leading-relaxed text-xs sm:text-sm">
                        Deploy APIs and AI services with instant micropayments. Get paid for every request, no subscriptions needed.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Developers Box */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white p-4 sm:p-6 md:p-8 border-2 border-dashed border-black relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-[2px] bg-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-black">Developers</h3>
                      <p className="text-gray-700 font-light leading-relaxed text-sm">
                        Access premium services without subscriptions. Pay only for what you use with transparent on-chain pricing.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Protocol Box */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white p-4 sm:p-6 md:p-8 border-2 border-dashed border-black relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-[2px] bg-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-black">x402 Protocol</h3>
                      <p className="text-gray-700 font-light leading-relaxed text-sm">
                        Standards-based HTTP payment protocol. Works across multiple blockchains with instant settlement.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Discovery Box */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white p-4 sm:p-6 md:p-8 border-2 border-dashed border-black relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-[2px] bg-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-black">Discovery</h3>
                      <p className="text-gray-700 font-light leading-relaxed text-sm">
                        Browse and discover services across the ecosystem. Test before you buy with transparent pricing.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Half - Atlas Statue 3D Model */}
          <div className="flex-1 relative overflow-hidden bg-white">
            <div className="absolute inset-0">
              <AtlasStatue />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section - Asymmetric Grid */}
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 border-t border-black/10">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight text-black font-title">
              Key Features
            </h2>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <HoverRevealCard delay={0.1} className="h-full">
              <div className="bg-white p-6 sm:p-8 md:p-10 border-2 border-dashed border-black h-full relative">
                <div className="mb-6">
                  <span className="text-xl font-bold text-red-600 tracking-wider">[1]</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black">Pay-Per-Request</h3>
                <p className="text-gray-700 font-light leading-relaxed text-sm sm:text-base">
                  Only pay for what you use. No subscriptions, no upfront costs. True micropayments for API calls with instant on-chain settlement.
                </p>
              </div>
            </HoverRevealCard>

            {/* Feature 2 */}
            <HoverRevealCard delay={0.2} className="h-full">
              <div className="bg-white p-6 sm:p-8 md:p-10 border-2 border-dashed border-black h-full relative">
                <div className="mb-6">
                  <span className="text-xl font-bold text-red-600 tracking-wider">[2]</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">Base & Solana Live</h3>
                <p className="text-gray-700 font-light leading-relaxed">
                  Native support for Base and Solana mainnet. Pay with USDC or SOL instantly. More chains coming soon.
                </p>
              </div>
            </HoverRevealCard>

            {/* Feature 3 */}
            <HoverRevealCard delay={0.3} className="h-full">
              <div className="bg-white p-6 sm:p-8 md:p-10 border-2 border-dashed border-black h-full relative">
                <div className="mb-6">
                  <span className="text-xl font-bold text-red-600 tracking-wider">[3]</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">Instant Settlement</h3>
                <p className="text-gray-700 font-light leading-relaxed">
                  Payments settle in real-time on-chain. No delays, no chargebacks, no intermediaries. Complete transparency for all transactions.
                </p>
              </div>
            </HoverRevealCard>

            {/* Feature 4 */}
            <HoverRevealCard delay={0.4} className="h-full">
              <div className="bg-white p-6 sm:p-8 md:p-10 border-2 border-dashed border-black h-full relative">
                <div className="mb-6">
                  <span className="text-xl font-bold text-red-600 tracking-wider">[4]</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-black">Developer First</h3>
                <p className="text-gray-700 font-light leading-relaxed">
                  Simple integration with powerful SDKs. From testing to production in minutes, not months. Comprehensive documentation included.
                </p>
              </div>
            </HoverRevealCard>
          </div>
        </div>
      </section>
    </>
  );
}
