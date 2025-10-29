'use client';

import Link from 'next/link';

export default function ExamplesPage() {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-normal text-black mb-4">
        Code Examples
      </h1>

      <p className="text-base text-gray-700 leading-relaxed mb-8">
        Complete code examples for building and consuming x402 services. Copy, paste, and customize for your use case.
      </p>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Simple AI Service</h2>

      <p className="text-sm text-gray-700 mb-4">
        A minimal AI text generation service with x402 payments:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`// server.ts
import express from 'express';
import { paymentMiddleware } from 'x402-express';
import OpenAI from 'openai';

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(
  paymentMiddleware(
    process.env.WALLET_ADDRESS as \`0x\${string}\`,
    {
      'POST /generate': {
        price: '$0.05',
        network: 'base'
      }
    },
    {
      url: 'https://facilitator.payai.network'
    }
  )
);

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  
  res.json({
    result: completion.choices[0].message.content
  });
});

app.listen(3000, () => {
  console.log('AI service running on port 3000');
});`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Image Processing Service</h2>

      <p className="text-sm text-gray-700 mb-4">
        Python service for image processing with dynamic pricing:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`# server.py
from fastapi import FastAPI, File, UploadFile
from x402 import X402Middleware, require_payment
from PIL import Image
import io

app = FastAPI()

x402 = X402Middleware(
    wallet_address=os.getenv("WALLET_ADDRESS"),
    network="base",
    facilitator_url="https://facilitator.payai.network"
)

app.add_middleware(x402)

def calculate_price(size):
    # Price based on image size
    if size < 1_000_000:  # < 1MB
        return "$1.00"
    elif size < 5_000_000:  # < 5MB
        return "$0.05"
    else:
        return "$0.10"

@app.post("/resize")
@require_payment(price=lambda req: calculate_price(req.content_length))
async def resize_image(
    file: UploadFile,
    width: int,
    height: int
):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    resized = image.resize((width, height))
    
    output = io.BytesIO()
    resized.save(output, format='PNG')
    output.seek(0)
    
    return {
        "image": output.getvalue(),
        "size": len(output.getvalue())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Data API Client</h2>

      <p className="text-sm text-gray-700 mb-4">
        Client application consuming x402 data APIs:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`// client.ts
import { X402Client } from 'x402-client';
import { ethers } from 'ethers';

async function main() {
  // Connect wallet
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Initialize x402 client
  const client = new X402Client({
    signer,
    network: 'base',
    maxPayment: '0.1' // Max 0.1 ETH per request
  });
  
  try {
    // Fetch weather data
    const weatherResponse = await client.get(
      'https://api.example.com/weather?city=NYC'
    );
    const weather = await weatherResponse.json();
    console.log('Weather:', weather);
    
    // Fetch financial data
    const stockResponse = await client.get(
      'https://api.example.com/stocks/AAPL'
    );
    const stock = await stockResponse.json();
    console.log('Stock price:', stock.price);
    
    // Generate AI content
    const aiResponse = await client.post(
      'https://api.example.com/generate',
      {
        body: JSON.stringify({ prompt: 'Write a poem' }),
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const ai = await aiResponse.json();
    console.log('AI result:', ai.result);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">React Application</h2>

      <p className="text-sm text-gray-700 mb-4">
        Complete React app with x402 integration:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`// App.tsx
import { X402Provider, useX402 } from 'x402-react';
import { useWallet } from '@rainbow-me/rainbowkit';
import { useState } from 'react';

function DataFetcher() {
  const { client } = useX402();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchPremiumData = async () => {
    setLoading(true);
    try {
      const response = await client.get(
        'https://api.example.com/premium-data'
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={fetchPremiumData} disabled={loading}>
        {loading ? 'Fetching...' : 'Get Premium Data ($1.00)'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

function App() {
  const { signer } = useWallet();
  
  return (
    <X402Provider signer={signer} network="base">
      <div className="app">
        <h1>x402 Demo App</h1>
        <DataFetcher />
      </div>
    </X402Provider>
  );
}

export default App;`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Batch Processing</h2>

      <p className="text-sm text-gray-700 mb-4">
        Process multiple paid requests efficiently:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`// batch-client.ts
import { X402Client } from 'x402-client';

async function processBatch(urls: string[]) {
  const client = new X402Client({ signer, network: 'base' });
  
  // Process all requests in parallel
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await client.get(url);
        return await response.json();
      } catch (error) {
        return { error: error.message, url };
      }
    })
  );
  
  // Calculate total cost
  const totalCost = results.length * 0.001; // Assuming $0.001 each
  console.log(\`Processed \${results.length} requests for $\${totalCost}\`);
  
  return results;
}

// Usage
const urls = [
  'https://api.example.com/data/1',
  'https://api.example.com/data/2',
  'https://api.example.com/data/3',
];

const results = await processBatch(urls);`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">Multi-Network Service</h2>

      <p className="text-sm text-gray-700 mb-4">
        Accept payments on multiple blockchain networks:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`// multi-network.ts
import express from 'express';
import { paymentMiddleware } from 'x402-express';

const app = express();

// Accept payments on Base, Polygon, or Solana
app.use(
  paymentMiddleware(
    {
      base: '0xYourBaseAddress',
      polygon: '0xYourPolygonAddress',
      solana: 'YourSolanaAddress'
    },
    {
      'GET /data': {
        price: '$0.001',
        networks: ['base', 'polygon', 'solana'] // Accept any
      }
    }
  )
);

app.get('/data', (req, res) => {
  // Check which network was used
  const network = req.headers['x-payment-network'];
  
  res.json({
    data: 'Your data',
    paidOn: network
  });
});

app.listen(3000);`}
        </pre>
      </div>

      <h2 className="text-2xl font-normal text-black mb-4 mt-8">CLI Tool</h2>

      <p className="text-sm text-gray-700 mb-4">
        Command-line tool using x402 services:
      </p>

      <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-xs text-white/90 mb-8 overflow-x-auto not-prose">
        <pre className="whitespace-pre-wrap">
{`#!/usr/bin/env node
// cli.ts
import { X402Client } from 'x402-client';
import { ethers } from 'ethers';
import { Command } from 'commander';

const program = new Command();

program
  .name('x402-cli')
  .description('CLI tool for x402 services')
  .version('1.0.0');

program
  .command('weather <city>')
  .description('Get weather data')
  .action(async (city) => {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const client = new X402Client({ signer: wallet, network: 'base' });
    
    const response = await client.get(
      \`https://api.example.com/weather?city=\${city}\`
    );
    const data = await response.json();
    
    console.log(\`Weather in \${city}:\`);
    console.log(\`Temperature: \${data.temperature}°F\`);
    console.log(\`Condition: \${data.condition}\`);
  });

program
  .command('generate <prompt>')
  .description('Generate AI content')
  .action(async (prompt) => {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const client = new X402Client({ signer: wallet, network: 'base' });
    
    const response = await client.post(
      'https://api.example.com/generate',
      {
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const data = await response.json();
    
    console.log(data.result);
  });

program.parse();`}
        </pre>
      </div>

      <div className="relative rounded-2xl p-6 text-black not-prose overflow-hidden">
        {/* Enhanced gradient background - black to yellow */}
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
          <h3 className="text-lg font-normal mb-2">More Examples</h3>
          <p className="text-sm opacity-90 mb-4">
            Check out our GitHub repository for more examples and starter templates.
          </p>
          <a
            href="https://github.com/nova402"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-normal hover:shadow-lg transition-all"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
