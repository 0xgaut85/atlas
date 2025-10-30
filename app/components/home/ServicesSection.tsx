'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { staggerContainer, staggerItem } from '../motion/variants';

export default function ServicesSection() {
  return (
    <section className="relative py-20 md:py-28 lg:py-36 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-4 font-title tracking-tight">
            Powerful Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to build, deploy, and scale x402-powered applications
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Atlas Foundry */}
          <motion.div
            variants={staggerItem}
            className="h-full"
          >
            <Link href="/workspace/atlas-foundry" className="block group h-full">
              <div className="bg-white p-8 border-2 border-dashed border-black hover:border-red-600 transition-all duration-300 h-full min-h-[280px] relative flex flex-col">
                <div className="flex-1 flex flex-col">
                  <div className="text-red-600 font-bold text-sm mb-4">[01]</div>
                  <h3 className="text-2xl font-bold text-black mb-4 font-title">Atlas Foundry</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed flex-1">
                    Forge and deploy x402-native assets with instant micropayment capabilities built in.
                  </p>
                  <div className="flex items-center gap-2 text-red-600 font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Explore</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Atlas Index */}
          <motion.div
            variants={staggerItem}
            className="h-full"
          >
            <Link href="/workspace/atlas-index" className="block group h-full">
              <div className="bg-white p-8 border-2 border-dashed border-black hover:border-red-600 transition-all duration-300 h-full min-h-[280px] relative flex flex-col">
                <div className="flex-1 flex flex-col">
                  <div className="text-red-600 font-bold text-sm mb-4">[02]</div>
                  <h3 className="text-2xl font-bold text-black mb-4 font-title">Atlas Index</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed flex-1">
                    Discover and test x402 services across categories. Filter by network, category, and price. Real-time service discovery from Atlas402 facilitator.
                  </p>
                  <div className="flex items-center gap-2 text-red-600 font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Explore</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Atlas Mesh */}
          <motion.div
            variants={staggerItem}
            className="h-full"
          >
            <Link href="/workspace/atlas-mesh" className="block group h-full">
              <div className="bg-white p-8 border-2 border-dashed border-black hover:border-red-600 transition-all duration-300 h-full min-h-[280px] relative flex flex-col">
                <div className="flex-1 flex flex-col">
                  <div className="text-red-600 font-bold text-sm mb-4">[03]</div>
                  <h3 className="text-2xl font-bold text-black mb-4 font-title">Atlas Mesh</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed flex-1">
                    Register and configure services for the x402 economy. Connect once, monetize everywhere.
                  </p>
                  <div className="flex items-center gap-2 text-red-600 font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Explore</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

