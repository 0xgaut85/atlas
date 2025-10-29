'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import { motion } from 'framer-motion';
import Link from 'next/link';

const capabilities = [
  {
    title: 'Natural Language Interface',
    description: 'Interact with Atlas Operator using conversational commands. Ask questions, request actions, and get responses.'
  },
  {
    title: 'Service Discovery',
    description: 'Operator can discover and list available x402 services based on your needs.'
  },
  {
    title: 'Token Minting',
    description: 'Execute token minting workflows with approval guardrails and payment handling.'
  },
  {
    title: 'Payment Execution',
    description: 'Make payments to x402 services automatically with transaction verification.'
  },
  {
    title: 'Workflow Automation',
    description: 'Execute complex workflows involving multiple services and transactions.'
  },
  {
    title: 'Approval Guardrails',
    description: 'All actions require explicit approval before execution to prevent unauthorized transactions.'
  }
];

export default function OperatorDocsPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="left"
        eyebrow="Atlas Operator"
        title="AI-Powered Automation"
        dek="Autonomous AI operator with full access to x402 services. Execute workflows, mint tokens, and interact with services with approval guardrails.'
        className="mb-24"
      />

      <div className="grid lg:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Overview
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Atlas Operator is an AI-powered assistant that can execute workflows and interact with x402 services on your behalf. All actions require explicit approval before execution.
          </p>
          <div className="bg-red-50 border-2 border-dashed border-red-600 p-6 mb-6">
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Access Fee:</span>
                <span className="font-medium text-black">$1.00 USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Protocol Fee:</span>
                <span className="font-medium text-black">$1.00 USDC per action</span>
              </div>
              <div className="flex justify-between">
                <span>Networks:</span>
                <span className="font-medium text-black">Base, Solana</span>
              </div>
            </div>
          </div>
          <Link
            href="/workspace/atlas-operator"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Open Operator
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Capabilities
          </h2>
          <div className="space-y-4">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ threshold: 0.35 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-l-4 border-red-600 pl-4 py-2"
              >
                <h3 className="font-medium text-black mb-1">{capability.title}</h3>
                <p className="text-sm text-gray-600">{capability.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-dashed border-black p-8 lg:p-12">
        <h2 className="font-title text-2xl font-bold text-black mb-6">
          Usage
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-black mb-2">Conversational Interface</h3>
            <p className="text-gray-600 mb-2">
              Chat with Atlas Operator using natural language. Examples:
            </p>
            <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-300 space-y-2 text-sm">
              <div className="font-mono text-gray-700">"List available tokens"</div>
              <div className="font-mono text-gray-700">"Mint 100 tokens of TokenX"</div>
              <div className="font-mono text-gray-700">"Show me AI services"</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-black mb-2">Payment Execution</h3>
            <p className="text-gray-600">
              When you request an action that requires payment, Operator will create a payment intent object. You must approve the transaction in your wallet before execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

