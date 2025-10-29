'use client';

import StickySynopsis from '../../components/premium/StickySynopsis';
import { motion } from 'framer-motion';

const synopsisItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'providers', label: 'Service Providers' },
  { id: 'consumers', label: 'Consumers' },
  { id: 'example', label: 'Quick Example' },
  { id: 'next-steps', label: 'Next Steps' }
];

export default function QuickStartPage() {
  return (
    <div className="max-w-none">
      <StickySynopsis items={synopsisItems}>
        <div>
          {/* Overview */}
          <section id="overview" className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ threshold: 0.35 }}
              className="mb-16"
            >
              <h1 className="font-title text-4xl lg:text-6xl font-bold text-black mb-6 leading-tight">
                Quick Start
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Deploy your first x402-enabled service or start consuming paid APIs in under 5 minutes.
              </p>
              <div className="bg-white border-2 border-dashed border-black p-8">
                <h2 className="font-title text-2xl font-bold text-black mb-4">Choose Your Path</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Building a service to monetize? Or consuming existing services? Pick your path and get started.
                </p>
              </div>
            </motion.div>
          </section>

          {/* Service Providers */}
          <section id="providers" className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ threshold: 0.35 }}
            >
              <h2 className="font-title text-3xl lg:text-4xl font-bold text-black mb-6">
                Service Providers
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Launch an API that accepts x402 micropayments:
              </p>

              <div className="space-y-6">
                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      1
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Select Framework</h3>
                  </div>
                  <div className="pl-14 space-y-3">
                    <a href="/docs/server-express" className="block text-red-500 hover:text-red-600 transition-colors font-medium">
                      → Express.js / Node.js
                    </a>
                    <a href="/docs/server-python" className="block text-red-500 hover:text-red-600 transition-colors font-medium">
                      → Python (FastAPI/Flask)
                    </a>
                  </div>
                </div>

                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      2
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Install Package</h3>
                  </div>
                  <p className="text-gray-600 pl-14">Add the x402 middleware to your project via npm or pip</p>
                </div>

                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      3
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Configure Middleware</h3>
                  </div>
                  <p className="text-gray-600 pl-14">Set your payment address and facilitator endpoint in the middleware</p>
                </div>

                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      4
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Deploy</h3>
                  </div>
                  <p className="text-gray-600 pl-14">Push to production and start accepting micropayments instantly</p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Consumers */}
          <section id="consumers" className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ threshold: 0.35 }}
            >
              <h2 className="font-title text-3xl lg:text-4xl font-bold text-black mb-6">
                Consumers
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Start calling x402-protected APIs:
              </p>

              <div className="space-y-6">
                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      1
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Discover Services</h3>
                  </div>
                  <p className="text-gray-600 pl-14">
                    Browse the <a href="/workspace" className="text-red-500 hover:text-red-600 transition-colors font-medium">marketplace</a> to find AI services, data APIs, and specialized tools
                  </p>
                </div>

                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      2
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Test Free</h3>
                  </div>
                  <p className="text-gray-600 pl-14">Use built-in testing interfaces to validate service behavior before spending</p>
                </div>

                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      3
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Connect Wallet</h3>
                  </div>
                  <p className="text-gray-600 pl-14">Link your MetaMask, Phantom, or preferred wallet for transactions</p>
                </div>

                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      4
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Install Client</h3>
                  </div>
                  <p className="text-gray-600 pl-14">Add the x402 client library to handle payments automatically</p>
                </div>

                <div className="bg-white border-2 border-dashed border-black p-8 hover:border-red-500 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                      5
                    </div>
                    <h3 className="font-title text-xl font-bold text-black">Start Transacting</h3>
                  </div>
                  <p className="text-gray-600 pl-14">Make API calls with automatic payment handling - just use standard HTTP methods</p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Quick Example */}
          <section id="example" className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ threshold: 0.35 }}
            >
              <h2 className="font-title text-3xl lg:text-4xl font-bold text-black mb-8">
                Quick Example
              </h2>

              <div className="bg-white border-2 border-dashed border-black p-8">
                <h3 className="font-title text-xl font-bold text-black mb-4">Server (Express.js)</h3>
                <div className="bg-black rounded-lg p-6 font-mono text-sm text-gray-300 border border-white/[0.08] overflow-x-auto mb-6">
                  <pre className="whitespace-pre-wrap">
{`import { x402Middleware } from '@payai/x402-server';

app.use('/api/*', x402Middleware({
  payTo: "0x742d35Cc...",
  network: "base"
}));

app.get('/api/data', (req, res) => {
  res.json({ result: "paid data" });
});`}
                  </pre>
                </div>

                <h3 className="font-title text-xl font-bold text-black mb-4">Client (Node.js)</h3>
                <div className="bg-black rounded-lg p-6 font-mono text-sm text-gray-300 border border-white/[0.08] overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
{`import { X402Client } from '@payai/x402-client';

const client = new X402Client({
  signer: wallet,
  network: "base"
});

const data = await client.get('https://api.example.com/api/data');
console.log(data);`}
                  </pre>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Next Steps */}
          <section id="next-steps">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ threshold: 0.35 }}
              className="bg-white border-2 border-dashed border-black p-8 lg:p-12 text-center"
            >
              <h2 className="font-title text-2xl lg:text-3xl font-bold text-black mb-4">
                Dive Deeper
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Explore comprehensive guides, API references, and integration examples for production deployments.
              </p>
              <a 
                href="/docs/server-express"
                className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-300"
              >
                Full Documentation
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>
          </section>
        </div>
      </StickySynopsis>
    </div>
  );
}
