'use client';

import Link from 'next/link';

export default function PythonServerPage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-normal text-black mb-4">
        Python Server
      </h1>

      <p className="text-base text-gray-700 leading-relaxed mb-8">
        Add x402 payments to your FastAPI or Flask server. Perfect for AI services, data APIs, and Python-based backends.
      </p>

      <div className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-2 border-dashed border-black mb-8 not-prose">
        <h2 className="text-lg font-normal text-black mb-2">Python Support</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          The x402 Python SDK works with FastAPI, Flask, and any ASGI/WSGI framework. 
          Perfect for machine learning APIs, data services, and Python-based microservices.
        </p>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Installation</h2>

      <div className="space-y-3 mb-8 not-prose">
        <div>
          <p className="text-xs font-normal text-gray-600 mb-2">pip</p>
          <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90">
            <code>pip install x402-python</code>
          </div>
        </div>

        <div>
          <p className="text-xs font-normal text-gray-600 mb-2">poetry</p>
          <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90">
            <code>poetry add x402-python</code>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">FastAPI Example</h2>

      <p className="text-sm text-gray-700 mb-4">
        Add x402 payment protection to your FastAPI endpoints:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`from fastapi import FastAPI, Depends
from x402 import X402Middleware, require_payment
import os

app = FastAPI()

# Initialize x402 middleware
x402 = X402Middleware(
    wallet_address=os.getenv("WALLET_ADDRESS"),
    network="base-sepolia",
    facilitator_url="https://facilitator.payai.network"
)

# Apply middleware globally
app.add_middleware(x402)

# Protect specific endpoints
@app.get("/weather")
@require_payment(price="$0.001", network="base-sepolia")
async def get_weather():
    return {
        "temperature": 72,
        "condition": "sunny",
        "humidity": 45
    }

@app.post("/ai/generate")
@require_payment(price="$0.05", network="base-sepolia")
async def generate_ai_content(prompt: str):
    # Your AI generation logic
    return {
        "generated": f"AI response to: {prompt}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Flask Example</h2>

      <p className="text-sm text-gray-700 mb-4">
        Use x402 with Flask applications:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`from flask import Flask, jsonify
from x402 import X402Middleware, require_payment
import os

app = Flask(__name__)

# Initialize x402
x402 = X402Middleware(
    wallet_address=os.getenv("WALLET_ADDRESS"),
    network="base-sepolia",
    facilitator_url="https://facilitator.payai.network"
)

# Apply middleware
app.wsgi_app = x402(app.wsgi_app)

@app.route("/data")
@require_payment(price="$0.002", network="base-sepolia")
def get_data():
    return jsonify({
        "data": "Premium data content",
        "timestamp": "2025-01-01T00:00:00Z"
    })

@app.route("/analytics")
@require_payment(price="$1.00", network="base-sepolia")
def get_analytics():
    return jsonify({
        "metrics": {
            "users": 1000,
            "revenue": 50000
        }
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Configuration</h2>

      <p className="text-sm text-gray-700 mb-4">
        Set up your environment variables:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 not-prose">
        <pre className="whitespace-pre-wrap">
{`# .env
WALLET_ADDRESS=0x... # Your wallet address to receive payments
NETWORK=base-sepolia # or base, polygon, solana
FACILITATOR_URL=https://facilitator.payai.network

# For Base mainnet (optional)
CDP_API_KEY_ID=your_cdp_key_id
CDP_API_KEY_SECRET=your_cdp_key_secret`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Advanced Usage</h2>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-4">
        <h3 className="text-sm font-normal text-black mb-3">Custom Pricing Logic</h3>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
          <pre className="whitespace-pre-wrap">
{`@app.get("/dynamic-pricing")
@require_payment(
    price=lambda request: calculate_price(request),
    network="base-sepolia"
)
async def dynamic_endpoint(request):
    return {"result": "content"}

def calculate_price(request):
    # Custom pricing based on request parameters
    size = request.query_params.get("size", "small")
    prices = {"small": "$0.001", "large": "$1.00"}
    return prices.get(size, "$0.001")`}
          </pre>
        </div>
      </div>

      <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black mb-8">
        <h3 className="text-sm font-normal text-black mb-3">Multiple Networks</h3>
        <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 not-prose">
          <pre className="whitespace-pre-wrap">
{`# Accept payment on multiple networks
@app.get("/multi-network")
@require_payment(
    price="$0.001",
    networks=["base-sepolia", "polygon", "solana"]
)
async def multi_network_endpoint():
    return {"data": "available on multiple chains"}`}
          </pre>
        </div>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Use Cases</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8 not-prose">
        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">AI & ML Services</h3>
          <p className="text-sm text-gray-700">
            Monetize GPT models, image generation, data analysis, and machine learning inference APIs
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Data APIs</h3>
          <p className="text-sm text-gray-700">
            Charge per query for financial data, weather data, market analytics, and real-time feeds
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Scraping Services</h3>
          <p className="text-sm text-gray-700">
            Monetize web scraping, data extraction, and content aggregation endpoints
          </p>
        </div>

        <div className="bg-white backdrop-blur-sm rounded-xl p-5 border border-2 border-dashed border-black">
          <h3 className="text-sm font-normal text-black mb-2">Processing APIs</h3>
          <p className="text-sm text-gray-700">
            Charge for PDF generation, image processing, video conversion, and data transformation
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
          <h3 className="text-lg font-normal mb-2">Deploy Your Python Service</h3>
          <p className="text-sm opacity-90 mb-4">
            Ready to deploy? Learn about client integration and production deployment.
          </p>
          <div className="flex gap-3">
            <Link
              href="/docs/clients"
              className="px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-normal hover:shadow-lg transition-all"
            >
              Client Integration
            </Link>
            <Link
              href="/docs/deployment"
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-black rounded-xl text-sm font-normal hover:bg-white/20 transition-all"
            >
              Deployment Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
