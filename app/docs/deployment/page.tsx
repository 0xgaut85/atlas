'use client';

import Link from 'next/link';

export default function DeploymentPage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-normal text-black mb-4">
        Deployment Guide
      </h1>

      <p className="text-base text-gray-700 leading-relaxed mb-8">
        Deploy your x402-enabled service to production and list it on the Atlas402 marketplace.
      </p>

      <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-2 border-dashed border-black mb-8 not-prose">
        <h2 className="text-lg font-normal text-black mb-2">Production Checklist</h2>
        <ul className="text-sm text-gray-700 space-y-1 m-0">
          <li>• Switch from testnet to mainnet</li>
          <li>• Configure environment variables</li>
          <li>• Set up monitoring and logging</li>
          <li>• Deploy to hosting provider</li>
          <li>• Register on Atlas402 marketplace</li>
        </ul>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Environment Configuration</h2>

      <p className="text-sm text-gray-700 mb-4">
        Update your environment variables for production:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 not-prose overflow-x-auto">
        <pre className="whitespace-pre-wrap">
{`# Production Environment
NODE_ENV=production

# Wallet address to receive payments
WALLET_ADDRESS=0xYourMainnetWalletAddress

# Network (switch from testnet to mainnet)
NETWORK=base  # was base-sepolia

# Facilitator
FACILITATOR_URL=https://facilitator.payai.network

# Required for Base mainnet
CDP_API_KEY_ID=your_coinbase_developer_platform_key
CDP_API_KEY_SECRET=your_coinbase_developer_platform_secret

# Optional: Custom RPC for better performance
BASE_RPC_URL=https://mainnet.base.org
# or use a paid RPC like Alchemy/Infura
# BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Hosting Options</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8 not-prose">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Vercel</h3>
          <p className="text-sm text-gray-700 mb-3">Best for Next.js and serverless APIs</p>
          <div className="bg-[#1E1E1E] rounded-lg p-3 font-mono text-xs text-white/90">
            <code>vercel deploy --prod</code>
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Railway</h3>
          <p className="text-sm text-gray-700 mb-3">Simple deployment for any stack</p>
          <div className="bg-[#1E1E1E] rounded-lg p-3 font-mono text-xs text-white/90">
            <code>railway up</code>
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Fly.io</h3>
          <p className="text-sm text-gray-700 mb-3">Global edge deployment</p>
          <div className="bg-[#1E1E1E] rounded-lg p-3 font-mono text-xs text-white/90">
            <code>fly deploy</code>
          </div>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">AWS / GCP</h3>
          <p className="text-sm text-gray-700 mb-3">Full control with cloud providers</p>
          <p className="text-xs text-gray-600 m-0">Use ECS, Lambda, Cloud Run, etc.</p>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Docker Deployment</h2>

      <p className="text-sm text-gray-700 mb-4">
        Containerize your service for consistent deployments:
      </p>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-4">
        <h3 className="text-sm font-normal text-black mb-3">Dockerfile</h3>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose overflow-x-auto">
          <pre className="whitespace-pre-wrap">
{`FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "dist/index.js"]`}
          </pre>
        </div>
      </div>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-8">
        <h3 className="text-sm font-normal text-black mb-3">Build & Run</h3>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
          <pre className="whitespace-pre-wrap">
{`# Build image
docker build -t my-x402-service .

# Run container
docker run -d \\
  -p 3000:3000 \\
  -e WALLET_ADDRESS=0x... \\
  -e NETWORK=base \\
  -e CDP_API_KEY_ID=... \\
  -e CDP_API_KEY_SECRET=... \\
  my-x402-service`}
          </pre>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Performance Optimization</h2>

      <div className="space-y-3 mb-8">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Use Paid RPC</h3>
          <p className="text-sm text-gray-700">
            Free public RPCs have rate limits. Use Alchemy, Infura, or QuickNode for production.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Cache Payment Verifications</h3>
          <p className="text-sm text-gray-700">
            Cache verified transactions to avoid redundant blockchain queries.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Enable Compression</h3>
          <p className="text-sm text-gray-700">
            Use gzip/brotli compression to reduce response sizes and improve speed.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Set Timeouts</h3>
          <p className="text-sm text-gray-700">
            Configure appropriate timeouts for facilitator calls to prevent hanging requests.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Monitoring & Logging</h2>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`// Add logging to track payments
app.use(
  paymentMiddleware(
    walletAddress,
    routes,
    {
      url: facilitatorUrl,
      onPaymentReceived: (txHash, amount, network) => {
        console.log(\`Payment received: \${amount} on \${network}\`);
        console.log(\`Transaction: \${txHash}\`);
        
        // Send to analytics
        analytics.track('payment_received', {
          txHash,
          amount,
          network,
          timestamp: Date.now()
        });
      },
      onPaymentFailed: (error, txHash) => {
        console.error(\`Payment failed: \${error}\`);
        
        // Alert on failures
        errorTracking.captureException(error);
      }
    }
  )
);`}
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-black mb-4 mt-8 font-title">Register on Atlas402</h2>

      <p className="text-sm text-gray-700 mb-4">
        Once your service is deployed, register it on the marketplace:
      </p>

      <div className="space-y-3 mb-8">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              1
            </div>
            <h3 className="text-sm font-normal text-black m-0">Visit Marketplace</h3>
          </div>
          <p className="text-sm text-gray-700 m-0 pl-10">
            Go to <Link href="/workspace" className="text-red-600 hover:text-red-700">Atlas Workspace</Link> and click "Register Service"
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              2
            </div>
            <h3 className="text-sm font-normal text-black m-0">Fill Service Details</h3>
          </div>
          <ul className="text-sm text-gray-700 space-y-1 m-0 pl-10">
            <li>• Service name and description</li>
            <li>• API endpoint URL</li>
            <li>• Pricing information</li>
            <li>• Category and tags</li>
          </ul>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 bg-red-600 text-black rounded-lg flex items-center justify-center text-xs font-normal">
              3
            </div>
            <h3 className="text-sm font-normal text-black m-0">Test & Publish</h3>
          </div>
          <p className="text-sm text-gray-700 m-0 pl-10">
            Verify your service works correctly, then publish to the marketplace
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Security Best Practices</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8 not-prose">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Environment Variables</h3>
          <p className="text-sm text-gray-700">
            Never commit secrets to git. Use environment variables or secret managers.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Rate Limiting</h3>
          <p className="text-sm text-gray-700">
            Implement rate limiting to prevent abuse even after payment verification.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">HTTPS Only</h3>
          <p className="text-sm text-gray-700">
            Always use HTTPS in production to protect payment headers and data.
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Input Validation</h3>
          <p className="text-sm text-gray-700">
            Validate and sanitize all inputs even for paid endpoints.
          </p>
        </div>
      </div>

      <div className="relative rounded-2xl p-6 text-black not-prose overflow-hidden">
        {/* Enhanced gradient background - black to green */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-[#0a0a0a] via-[#1a1a1a] to-red-600" />
        
        {/* Heavy grain texture overlay - increased for more visibility */}
        <div 
          className="absolute inset-0 opacity-[0.2] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px'
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='7' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px'
          }}
        />
        
        <div className="relative z-10">
          <h3 className="text-lg font-normal mb-2">Ready to Launch?</h3>
          <p className="text-sm opacity-90 mb-4">
            Deploy your service and start earning from x402 payments.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dapp"
              className="px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-normal hover:shadow-lg transition-all"
            >
              Register Service
            </Link>
            <Link
              href="/docs"
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-black rounded-xl text-sm font-normal hover:bg-white/20 transition-all"
            >
              Back to Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
