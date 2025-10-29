'use client';

import EditorialHero from '../../../components/premium/EditorialHero';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ServerPage() {
  return (
    <div className="max-w-none">
      <EditorialHero
        variant="left"
        eyebrow="Server Integration"
        title="Express.js & Python Servers"
        dek="Add x402 payment protection to your Express.js or Python servers. Build monetized APIs in minutes."
        className="mb-24"
      />

      <div className="grid lg:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Express.js
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Use the PayAI Express starter template to bootstrap a ready-to-run x402-enabled server. No payment infrastructure needed.
          </p>
          
          <div className="bg-red-50 border-2 border-dashed border-red-600 p-6 mb-6">
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Installation:</span>
                <span className="font-medium text-black">npx @payai/x402-express-starter</span>
              </div>
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="font-medium text-black">x402-express</span>
              </div>
            </div>
          </div>

          <Link
            href="/docs/server-express"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Express.js Guide
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div>
          <h2 className="font-title text-2xl font-bold text-black mb-6">
            Python
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Use x402 Python SDK with FastAPI, Flask, and any ASGI/WSGI framework. Perfect for machine learning APIs and data services.
          </p>
          
          <div className="bg-red-50 border-2 border-dashed border-red-600 p-6 mb-6">
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Installation:</span>
                <span className="font-medium text-black">pip install x402-python</span>
              </div>
              <div className="flex justify-between">
                <span>Frameworks:</span>
                <span className="font-medium text-black">FastAPI, Flask</span>
              </div>
            </div>
          </div>

          <Link
            href="/docs/server-python"
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Python Guide
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="bg-white border-2 border-dashed border-black p-8 lg:p-12">
        <h2 className="font-title text-2xl font-bold text-black mb-6">
          Quick Start
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-black mb-2">Express.js Example</h3>
            <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`import { paymentMiddleware } from "x402-express";

app.use(
  paymentMiddleware(
    "0x742d35Cc...",
    {
      "GET /weather": {
        price: "$0.001",
        network: "base"
      }
    },
    {
      url: "https://facilitator.payai.network"
    }
  )
);`}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-black mb-2">Python Example</h3>
            <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 overflow-x-auto">
              <pre className="whitespace-pre-wrap">
{`from x402 import require_payment

@app.get("/weather")
@require_payment(price="$0.001", network="base")
async def get_weather():
    return {"temperature": 72}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

