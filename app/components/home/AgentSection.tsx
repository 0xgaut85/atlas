'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { staggerContainer, staggerItem } from '../motion/variants';
import MagneticButton from '../motion/MagneticButton';

export default function AgentSection() {
  return (
    <section className="relative py-20 md:py-28 lg:py-36 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Heading and Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 font-title tracking-tight">
              Atlas Operator
            </h2>
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              An AI agent that executes blockchain transactions with your approval. Built on Anthropic Claude, secured by x402 payments.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The agent can discover services, initiate payments, and handle complex multi-step workflows—all while keeping you in control with transaction guardrails and approval prompts.
            </p>

            <MagneticButton>
              <Link
                href="/workspace/atlas-operator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300"
              >
                Try the Operator
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </MagneticButton>
          </motion.div>

          {/* Right: Feature Cards Staggered */}
          <motion.div 
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              variants={staggerItem}
              className="bg-gray-50 p-6 border-2 border-dashed border-black relative h-[140px] flex items-center"
            >
              <div className="w-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-red-600 text-white font-bold rounded">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black mb-2 font-title">Natural Language</h3>
                    <p className="text-gray-600 text-sm">
                      Describe what you want in plain English. The agent understands context and intent.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-gray-50 p-6 border-2 border-dashed border-black relative h-[140px] flex items-center"
            >
              <div className="w-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-red-600 text-white font-bold rounded">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black mb-2 font-title">Transaction Approval</h3>
                    <p className="text-gray-600 text-sm">
                      Every blockchain action requires your explicit approval before execution.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="bg-gray-50 p-6 border-2 border-dashed border-black relative h-[140px] flex items-center"
            >
              <div className="w-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-red-600 text-white font-bold rounded">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black mb-2 font-title">Multi-Chain</h3>
                    <p className="text-gray-600 text-sm">
                      Works across Base and Solana. The agent handles network switching automatically.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

