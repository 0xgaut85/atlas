import { NextRequest, NextResponse } from 'next/server';

/**
 * x402 Code Generator
 * 
 * Generates ready-to-use x402 server code for various frameworks
 * FREE utility - no payment required (drives adoption)
 */

const codeTemplates: Record<string, any> = {
  'express': {
    name: 'Express.js (Node.js)',
    language: 'javascript',
    code: `// Install: npm install express
const express = require('express');
const { x402Middleware } = require('@atlas402/x402-server');

const app = express();

// x402 middleware configuration
const x402Config = {
  price: '1.00', // Price in USDC
  network: 'base', // 'base' or 'solana-mainnet'
  merchantAddress: 'YOUR_MERCHANT_ADDRESS', // Your Base or Solana address
  facilitatorUrl: 'https://facilitator.payai.network', // Optional
};

// Apply x402 middleware to protected route
app.get('/api/my-service', x402Middleware(x402Config), (req, res) => {
  // Your service logic here
  res.json({
    success: true,
    data: 'Your protected content',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
  },
  'fastapi': {
    name: 'FastAPI (Python)',
    language: 'python',
    code: `# Install: pip install fastapi uvicorn @atlas402/x402-server
from fastapi import FastAPI, Request
from x402_server import x402_middleware

app = FastAPI()

# x402 middleware configuration
x402_config = {
    "price": "1.00",  # Price in USDC
    "network": "base",  # 'base' or 'solana-mainnet'
    "merchant_address": "YOUR_MERCHANT_ADDRESS",  # Your Base or Solana address
    "facilitator_url": "https://facilitator.payai.network",  # Optional
}

@app.get("/api/my-service")
async def my_service(request: Request):
    # Verify payment
    await x402_middleware(request, x402_config)
    
    # Your service logic here
    return {
        "success": True,
        "data": "Your protected content"
    }

# Run: uvicorn main:app --reload`,
  },
  'flask': {
    name: 'Flask (Python)',
    language: 'python',
    code: `# Install: pip install flask @atlas402/x402-server
from flask import Flask, request, jsonify
from x402_server import verify_x402_payment

app = Flask(__name__)

# x402 configuration
X402_CONFIG = {
    "price": "1.00",  # Price in USDC
    "network": "base",  # 'base' or 'solana-mainnet'
    "merchant_address": "YOUR_MERCHANT_ADDRESS",  # Your Base or Solana address
    "facilitator_url": "https://facilitator.payai.network",  # Optional
}

@app.route('/api/my-service', methods=['GET'])
def my_service():
    # Verify payment
    verification = verify_x402_payment(request, X402_CONFIG)
    if not verification['valid']:
        return jsonify({
            "x402Version": 1,
            "accepts": [{
                "scheme": "exact",
                "network": X402_CONFIG["network"],
                "maxAmountRequired": str(int(float(X402_CONFIG["price"]) * 1_000_000)),
                "payTo": X402_CONFIG["merchant_address"],
                "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" if X402_CONFIG["network"] == "base" else "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "mimeType": "application/json",
            }]
        }), 402
    
    # Your service logic here
    return jsonify({
        "success": True,
        "data": "Your protected content"
    })

if __name__ == '__main__':
    app.run(debug=True)`,
  },
  'nextjs': {
    name: 'Next.js API Route',
    language: 'typescript',
    code: `// app/api/my-service/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '@/lib/x402-middleware';

export async function GET(request: NextRequest) {
  // Verify payment
  const verification = await verifyX402Payment(request, '$1.00');
  
  if (!verification.valid) {
    return create402Response(request, '$1.00', 'Description of your service', ['base']);
  }

  // Your service logic here
  return NextResponse.json({
    success: true,
    data: 'Your protected content',
  });
}`,
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const framework = searchParams.get('framework') || 'express';

  if (!codeTemplates[framework]) {
    return NextResponse.json({
      success: false,
      error: 'Invalid framework',
      availableFrameworks: Object.keys(codeTemplates),
    }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    framework: codeTemplates[framework].name,
    language: codeTemplates[framework].language,
    code: codeTemplates[framework].code,
    frameworks: Object.keys(codeTemplates).map(key => ({
      id: key,
      name: codeTemplates[key].name,
    })),
  });
}

// POST endpoint to customize code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { framework, price, network, merchantAddress } = body;

    if (!codeTemplates[framework]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid framework',
        availableFrameworks: Object.keys(codeTemplates),
      }, { status: 400 });
    }

    let code = codeTemplates[framework].code;
    
    // Replace placeholders
    code = code.replace(/YOUR_MERCHANT_ADDRESS/g, merchantAddress || 'YOUR_MERCHANT_ADDRESS');
    code = code.replace(/\$1\.00/g, price || '$1.00');
    code = code.replace(/'base'/g, `'${network || 'base'}'`);
    code = code.replace(/"base"/g, `"${network || 'base'}"`);

    return NextResponse.json({
      success: true,
      framework: codeTemplates[framework].name,
      language: codeTemplates[framework].language,
      code,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

