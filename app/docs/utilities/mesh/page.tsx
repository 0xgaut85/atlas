'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    title: 'Service Registration',
    description: 'Register your x402 service with comprehensive metadata and configuration.'
  },
  {
    title: 'Code Generation',
    description: 'Generate integration code for Express.js and Python servers automatically.'
  },
  {
    title: 'Integration Guides',
    description: 'Step-by-step guides for integrating x402 payments into your application.'
  },
  {
    title: 'PayAI Registration',
    description: 'Automatic registration with PayAI facilitator for service discovery.'
  },
  {
    title: 'x402scan Listing',
    description: 'Automatic listing on x402scan.com via PayAI facilitator.'
  },
  {
    title: 'Service Management',
    description: 'Manage registered services, update metadata, and track registration status.'
  }
];

export default function MeshDocsPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="left"
        eyebrow="Atlas Mesh"
        title="Service Registration & Integration"
        dek="Register your x402 services for discovery. Includes code generation, integration guides, and automatic PayAI facilitator registration."
        className="mb-24"
      />

      <div className="grid lg:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Overview
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Atlas Mesh is the developer portal for registering and configuring x402 services. Register once, and your service will be automatically listed on PayAI facilitator and x402scan.com.
          </p>
          <div className="bg-red-50 border-2 border-dashed border-red-600 p-6 mb-6">
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Access Fee:</span>
                <span className="font-medium text-black">$1.00 USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Service Registration:</span>
                <span className="font-medium text-black">$50.00 USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-medium text-black">Base</span>
              </div>
            </div>
          </div>
          <Link
            href="/workspace/atlas-mesh"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Register Service
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Features
          </h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ threshold: 0.35 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-l-4 border-red-600 pl-4 py-2"
              >
                <h3 className="font-medium text-black mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-dashed border-black p-8 lg:p-12">
        <h2 className="font-title text-2xl font-bold text-black mb-6">
          Registration Process
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-black mb-2">Step 1: Fill Registration Form</h3>
            <p className="text-gray-600 mb-2">
              Provide service details:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Service name and description</li>
              <li>API endpoint URL</li>
              <li>Price per request</li>
              <li>Payment recipient address</li>
              <li>Network (Base or Solana)</li>
              <li>Category and metadata</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-black mb-2">Step 2: Pay Registration Fee</h3>
            <p className="text-gray-600">
              Pay $50.00 USDC registration fee. This fee covers PayAI facilitator registration and x402scan.com listing.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-black mb-2">Step 3: Automatic Registration</h3>
            <p className="text-gray-600">
              Your service is automatically registered with PayAI facilitator, which triggers x402scan.com listing within 10-15 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

