'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import MagneticButton from './motion/MagneticButton';
import GlitchText from './motion/GlitchText';

const AtlasHero = dynamic(() => import('./AtlasHero'), { ssr: false });

export default function Hero() {
  const { scrollY } = useScroll();
  
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <motion.section 
      style={{ y: heroY }}
      className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-32 mb-16 md:mb-24 lg:mb-32"
    >
      {/* Three.js Animation Background */}
      <div className="absolute inset-0 z-0 overflow-hidden min-h-[500px]">
        <AtlasHero />
      </div>

      {/* White gradient overlay for text readability */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.9) 100%)',
        }}
      />

      <div className="relative z-10 w-full h-full flex items-center max-w-7xl mx-auto">
        {/* Bold Asymmetric Layout - Nillion Inspired */}
        <div className="w-full px-4 sm:px-6 lg:px-12">
          {/* Large Bold Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[clamp(2.5rem,8vw,9rem)] font-bold leading-[0.9] text-black mb-6 font-title tracking-tight break-words"
          >
            <GlitchText text="Monetize" delay={300} replayOnView inViewThreshold={0.6} /> <span className="text-red-600"><GlitchText text="every" delay={600} replayOnView inViewThreshold={0.6} /></span> <GlitchText text="request." delay={900} replayOnView inViewThreshold={0.6} />
          </motion.h1>

          {/* Subtitle - Asymmetric positioning */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[clamp(1rem,2.5vw,2rem)] font-normal text-white mb-12 leading-tight max-w-5xl break-words"
          >
            Atlas402 turns APIs into instant micropayments—pay-per-request with no subscriptions.
          </motion.p>

          {/* CTA Buttons - Horizontal Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <MagneticButton>
              <Link 
                href="/dapp"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-red-600 text-white font-medium rounded-lg transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:scale-[1.02] text-base sm:text-lg"
              >
                <span>Launch Atlas Hub</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link 
                href="/docs"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-medium rounded-lg border-2 border-black transition-all duration-300 hover:bg-black hover:text-white hover:shadow-lg hover:scale-[1.02] text-base sm:text-lg"
              >
                <span>Explore Docs</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </MagneticButton>
          </motion.div>

          {/* Stats Grid - Horizontal Below Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl"
          >
            <div className="bg-transparent backdrop-blur-sm p-4 sm:p-6 text-center border border-dashed border-white/30 h-full">
              <div className="text-2xl sm:text-3xl font-bold mb-2 text-white">x402</div>
              <div className="text-xs text-gray-300 font-light">Protocol</div>
            </div>
            <div className="bg-transparent backdrop-blur-sm p-4 sm:p-6 text-center border border-dashed border-white/30 h-full">
              <div className="text-2xl sm:text-3xl font-bold mb-2 text-white">2 Chains</div>
              <div className="text-xs text-gray-300 font-light">Live</div>
            </div>
            <div className="bg-transparent backdrop-blur-sm p-4 sm:p-6 text-center border border-dashed border-white/30 h-full">
              <div className="text-2xl sm:text-3xl font-bold mb-2 text-white">6 Utilities</div>
              <div className="text-xs text-gray-300 font-light">Tools</div>
            </div>
            <div className="bg-transparent backdrop-blur-sm p-4 sm:p-6 text-center border border-dashed border-white/30 h-full">
              <div className="text-2xl sm:text-3xl font-bold mb-2 text-white">Beta</div>
              <div className="text-xs text-gray-300 font-light">Status</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
