import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// IMPORTANT: Load ONLY from Vercel environment variables
// Do NOT use local .env files - Vercel injects variables at runtime
// In production, process.env is populated by Vercel's environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Detailed logging for debugging (without exposing full key)
const keyPrefix = ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'MISSING';
const keyLength = ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.length : 0;
const isValidFormat = ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.startsWith('sk-ant-') : false;

console.log('🔍 Environment Debug:', {
  isVercel: !!process.env.VERCEL,
  hasKey: !!ANTHROPIC_API_KEY,
  keyPrefix,
  keyLength,
  isValidFormat,
  nodeEnv: process.env.NODE_ENV,
  allEnvKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC')).join(', ')
});

// Validate that the API key is loaded from Vercel
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY is not set in Vercel environment variables');
  console.error('Please check: https://vercel.com/gauthiers-projects-fae77e6c/atlas402/settings/environment-variables');
}

// Validate API key format
if (ANTHROPIC_API_KEY && !isValidFormat) {
  console.error('⚠️ ANTHROPIC_API_KEY format appears invalid - should start with "sk-ant-"');
  console.error('Key prefix:', keyPrefix);
}

// Initialize Anthropic client ONLY with Vercel environment variable
// No fallback, no local file loading - only Vercel env vars
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: ANTHROPIC_API_KEY.trim(), // Trim any whitespace that might cause issues
}) : null;

// Use latest Claude models (claude-3-opus-20240229 is deprecated, migrating to claude-3-5-opus)
const MODEL_CANDIDATES: string[] = ['claude-3-5-opus-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'];

async function createWithFallback(client: Anthropic, params: any) {
  let lastErr: any = null;
  for (const model of MODEL_CANDIDATES) {
    try {
      console.log(`🤖 Anthropic: trying model ${model}`);
      const res = await client.messages.create({ ...params, model });
      console.log(`✅ Anthropic: using model ${model}`);
      return res;
    } catch (e: any) {
      console.error(`❌ Model ${model} failed:`, e?.message || e);
      lastErr = e;
      const msg = e?.message || '';
      // If model not found, continue to next candidate; otherwise rethrow
      if (msg.includes('not_found_error') || msg.includes('model')) {
        continue;
      }
      // For other errors (rate limit, auth, etc), throw immediately
      throw e;
    }
  }
  // If all models failed with not_found_error
  throw lastErr || new Error('All Anthropic models failed');
}

// Helper functions to fetch data from our utilities
async function getX402Services() {
  try {
    // Use absolute URL or import the API logic directly
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/x402/discover`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    console.log('Services fetched:', data.services?.length || 0);
    return data.success ? data.services : [];
  } catch (error) {
    console.error('Error fetching services:', error);
    // Return empty array on error instead of failing
    return [];
  }
}

async function getTokenList() {
  try {
    // Use the foundry catalog endpoint which properly filters for tokens
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const response = await fetch(`${baseUrl}/api/foundry/catalog`, { cache: 'no-store' });
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log(`✅ getTokenList found ${data.data.length} tokens`);
      if (data.data.length > 0) {
        console.log('📋 Sample tokens:', data.data.slice(0, 3).map((t: any) => ({ name: t.name, network: t.network })));
      }
      return data.data;
    }
    console.log('No tokens found in response');
    return [];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}

async function searchWeb(query: string) {
  try {
    // Use DuckDuckGo Instant Answer API for web search
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = await response.json();
    
    // Parse results
    const results = {
      query,
      abstractText: data.AbstractText || '',
      abstractSource: data.AbstractSource || '',
      abstractURL: data.AbstractURL || '',
      relatedTopics: (data.RelatedTopics || []).slice(0, 5).map((topic: any) => ({
        text: topic.Text || '',
        url: topic.FirstURL || ''
      })),
      timestamp: new Date().toISOString()
    };
    
    console.log('Web search results for:', query);
    return results;
  } catch (error) {
    console.error('Web search error:', error);
    return { error: 'Web search failed', query };
  }
}

async function getProtocolRevenue(windowDays: number = 1) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const response = await fetch(`${baseUrl}/api/admin/x402/revenue?days=${windowDays}`, { cache: 'no-store' });
    const data = await response.json();
    console.log(`💰 Revenue data fetched for ${windowDays} days`);
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return null;
  }
}

async function getProtocolActivity(windowDays: number = 7) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const response = await fetch(`${baseUrl}/api/admin/x402/activity?days=${windowDays}`, { cache: 'no-store' });
    const data = await response.json();
    console.log(`📊 Activity data fetched for ${windowDays} days`);
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching activity:', error);
    return null;
  }
}

async function listTokens(network?: string, category?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const params = new URLSearchParams();
    if (network) params.append('network', network);
    if (category) params.append('category', category);
    const url = `${baseUrl}/api/foundry/catalog${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    console.log(`🪙 Tokens fetched: ${data.count || 0}`);
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  // Load API key fresh from Vercel environment variables at request time
  // This ensures we get the latest value even if cached at module load
  // IMPORTANT: In Vercel, environment variables are available via process.env
  // Check both ANTHROPIC_API_KEY and ANTHROPIC_API_KEY_VERCEL (if using Vercel-specific naming)
  const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY_VERCEL || '').trim();
  
  try {
    
    console.log('🔍 POST Request Debug:', {
      hasApiKey: !!apiKey,
      keyPrefix: apiKey ? apiKey.substring(0, 15) + '...' : 'MISSING',
      keyEndsWith: apiKey ? '...' + apiKey.substring(apiKey.length - 5) : 'MISSING',
      keyLength: apiKey?.length || 0,
      isValidFormat: apiKey?.startsWith('sk-ant-') || false,
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      allAnthropicKeys: Object.keys(process.env).filter(k => k.toUpperCase().includes('ANTHROPIC')).join(', ')
    });

    // Verify that Vercel environment variables are loaded
    // IMPORTANT: Only use Vercel environment variables, no local .env files
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY missing - Check Vercel environment variables');
      console.error('Environment check:', {
        hasKey: !!apiKey,
        isVercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC')).join(', ')
      });
      return NextResponse.json({ 
        message: 'Configuration error: Anthropic API key is not configured. The API key must be set in Vercel environment variables (not local .env files). Please check https://vercel.com/gauthiers-projects-fae77e6c/atlas402/settings/environment-variables and ensure ANTHROPIC_API_KEY is set for Production environment.',
        error: {
          type: 'configuration_error',
          message: 'ANTHROPIC_API_KEY environment variable is not set in Vercel',
          details: 'Only Vercel environment variables are used - local .env files are ignored'
        }
      }, { status: 500 });
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-ant-')) {
      console.error('⚠️ ANTHROPIC_API_KEY format invalid - should start with "sk-ant-"');
      console.error('Key prefix:', apiKey.substring(0, 15));
      return NextResponse.json({ 
        message: 'Configuration error: ANTHROPIC_API_KEY format appears invalid. Key should start with "sk-ant-". Please verify the key in Vercel environment variables.',
        error: {
          type: 'configuration_error',
          message: 'ANTHROPIC_API_KEY format invalid'
        }
      }, { status: 500 });
    }

    // Initialize Anthropic client with fresh API key from Vercel
    // Log key details for debugging (first 15 chars only for security)
    console.log('🔑 Initializing Anthropic client:', {
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 15) + '...',
      keyEndsWith: '...' + apiKey.substring(apiKey.length - 5),
      hasWhitespace: /\s/.test(apiKey),
      trimmedLength: apiKey.trim().length,
    });

    const anthropicClient = new Anthropic({
      apiKey: apiKey.trim(), // Ensure no whitespace
    });

    const { messages } = await req.json();
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ 
        message: 'No messages provided' 
      }, { status: 400 });
    }
    
    console.log('Processing chat request with', messages.length, 'messages');

    // Clean messages - remove any extra fields like paymentIntent before sending to Anthropic
    const cleanedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // System prompt with Atlas402 and x402 context
    const systemPrompt = `You are Atlas Operator, the AI control plane for Atlas402. You are an expert, highly capable AI assistant that can handle any conversation while having deep expertise in Atlas402, x402 protocol, blockchain development, and Coinbase CDP/AgentKit.

Your personality:
- Professional yet friendly and approachable
- Highly knowledgeable across all domains (technical, general, creative)
- Expert in x402 protocol, micropayments, blockchain, APIs
- Can browse the web and access real-time information
- Conversational and natural - you're not just a documentation bot
- Helpful, patient, and thorough in explanations
- You can discuss anything from quantum physics to cooking recipes
- Special deep expertise in Atlas402, x402, Coinbase CDP, and blockchain tech

About Atlas402 (YOUR PROJECT):
- Atlas402 is the premier infrastructure platform for x402 protocol - building the future of micropayments
- Mission: Transform every API call into an instant micropayment with zero friction
- Rebranded from "Nova402" to "Atlas402" with red (#ff0000) color scheme, premium editorial design
- Live on Base Mainnet and Solana Mainnet with USDC payments
- Merchant addresses: Base (0x8bee703d6214a266e245b0537085b1021e1ccaed), Solana (GLrMcCztDV4Bu4TdN3NFiQmcVGHUh6LMGwkwbwLXm48N)
- Uses PayAI facilitator (https://facilitator.payai.network) and Coinbase CDP for verification
- Website: https://api.atlas402.com with premium design, grain texture, glitch effects
- Platform fee: $0 - developers keep 100% of revenue

About x402 Protocol (CORE TECHNOLOGY):
- x402 is the HTTP 402 payment protocol reimagined for blockchain - the future of API monetization
- HTTP 402 "Payment Required" was defined in 1997 but never implemented until now
- Services return HTTP 402 status with payment requirements (amount, asset, network, payTo, scheme)
- Clients make on-chain USDC/SOL transfers and retry with transaction hash proof
- Servers verify payments via facilitators (Coinbase CDP, PayAI) without running full nodes
- Sub-second settlement, true micropayments ($0.001 - $1000), borderless commerce
- Multi-chain: Base (live), Solana (live), Polygon (Q1 2026), Peaq, BSC, Sei (roadmap)
- Payment schemes: x402+eip712 (EVM), x402+solana (Solana)
- Ecosystem: 80+ services including AI, tokens, gaming, social, data APIs
- Discovery via PayAI facilitator: https://facilitator.payai.network/discovery/resources

x402 Payment Flow (TECHNICAL):
1. Client sends HTTP GET request to x402-protected endpoint
2. Server returns HTTP 402 with "accepts" array: [{asset, payTo, network, maxAmountRequired (micro), scheme, mimeType}]
3. Client creates on-chain USDC/SOL transfer transaction (actual blockchain tx, not just signature)
4. Client signs and broadcasts transaction, receives transaction hash
5. Client retries request with x-payment header: {transactionHash, network, amount, currency, payTo}
6. Server calls facilitator /verify endpoint or queries chain directly (Base: https://mainnet.base.org RPC)
7. If transaction is valid (correct amount, recipient, USDC contract), server returns 200 with content
8. Session stored for 1 hour, subsequent requests succeed without payment

Coinbase CDP Integration:
- CDP provides facilitator services for x402 payment verification
- AgentKit: AI agent framework with blockchain actions (transfer ETH/USDC, deploy NFT/ERC-20, swap, stake)
- MCP (Model Context Protocol): Allows Claude Desktop to access CDP blockchain actions
- CDP supports Base, Ethereum, Polygon, Arbitrum, Solana networks
- CDP Portal: https://portal.cdp.coinbase.com - get API keys here
- CDP SDK: Python (cdp-sdk) and TypeScript (@coinbase/cdp-sdk)
- AgentKit actions: create wallet, transfer funds, deploy contracts, trade tokens, read balances
- Free USDC on Base network for fee-less transactions
- Use CDP for production-grade blockchain infrastructure without running nodes

Atlas402 Workspace Utilities:
- Command Console: Marketplace to discover, test, and consume x402 services with instant payments
- Atlas Foundry: Browse and mint/purchase x402 tokens (buying existing tokens is LIVE NOW). Users can browse available tokens and mint them with USDC payments. Full token creation functionality launching November 2025
- Atlas Index: Real-time indexer showing all x402 services (excludes tokens) with filtering by category/network
- Atlas Mesh: Developer portal to register new x402 services and integrate payment middleware
- Atlas Operator (YOU): AI control plane with conversational interface, service discovery, and x402 expertise
- All utilities are x402-gated: $1.00 USDC for 1-hour access on Base or Solana

CRITICAL TOKEN DISCOVERY INSTRUCTIONS:
- When users ask about tokens, minting, or "are there tokens to mint?", you MUST use the list_tokens tool (or get_token_list tool) to fetch real-time data
- NEVER say "no tokens available" without first using the list_tokens tool to check
- Tokens are available via Atlas Network facilitator discovery - they appear in Atlas Foundry
- Users CAN buy/mint existing tokens from Atlas Foundry right now using USDC
- Token creation (launching new tokens) is coming November 2025, but purchasing/minting existing tokens is fully functional today
- Always fetch live token data before answering questions about token availability

Technical Stack:
- Next.js 14+ with TypeScript, React, Framer Motion
- Wagmi + Viem for EVM, @solana/web3.js for Solana
- AppKit/Reown for multi-chain wallet connections
- Three.js for 3D Atlas statue and voxel animations
- Helius RPC for Solana (mainnet.helius-rpc.com)
- x402-express and x402-fetch packages for server/client
- Anthropic Claude (you!) for AI operator

Documentation & Resources Available:
- Atlas402 Platform Docs: Available on https://api.atlas402.com/docs
- Introduction: Platform overview, features, usage flow, monetization guide
- x402 Protocol: Protocol vision, request flow, core advantages, multi-chain support
- Quick Start: Deploy first service in 5 minutes, choose Express.js or Python
- Server Guides: Express.js (Node.js) and Python (FastAPI/Flask) implementation
- Client Integration: How to consume x402-protected APIs
- Payment Flow: Detailed explanation of the 402 payment process
- Echo Merchant: Free testing service for x402 protocol
- Examples: Code examples and integration patterns
- Facilitators: Third-party verification and settlement services
- Deployment: Production deployment guides
- API Reference: Technical API documentation
- PayAI Network Documentation: https://docs.payai.network/ - Facilitator network for x402 payment verification and service discovery (part of Atlas Network infrastructure)
- x402scan Registration: https://www.x402scan.com/resources/register - Public scanner for x402 services, auto-registration via Atlas Network facilitator
- Coinbase CDP Documentation: https://docs.cdp.coinbase.com/ - Blockchain infrastructure, AgentKit framework, wallet and transaction APIs
- x402 Protocol Specification: https://x402.gitbook.io/x402 - Complete x402 protocol documentation, HTTP 402 standard, payment schemes, multi-chain support

Core Principles:
- Usage-Based Pricing: Pay exactly for what you consume
- Frictionless Testing: Explore and test services before spending
- Instant Settlement: Payments settle in under a second on-chain
- Multi-Chain Native: Built for a multi-chain future

Coinbase CDP & AgentKit Integration:
- Coinbase CDP provides blockchain infrastructure (wallets, transactions, smart contracts)
- AgentKit: AI agent framework with blockchain actions (transfer, deploy NFT/ERC-20, swap, etc.)
- CDP API keys required: CDP_API_KEY_NAME, CDP_API_KEY_PRIVATE_KEY
- Supports frameworks: LangChain, Vercel AI SDK, Eliza, OpenAI Agents SDK, MCP (Model Context Protocol)
- MCP integration allows Claude Desktop to access CDP AgentKit actions
- Base network preferred for fast/cheap transactions; Solana also supported
- CDP facilitator can verify x402 payments without running full nodes
- Use CDP for wallet creation, ETH/USDC transfers, NFT deployment, token launches

Your capabilities:
- Have natural, intelligent conversations about ANY topic (not just tech)
- Answer questions on programming, science, philosophy, history, creative writing, etc.
- Deep expertise in Atlas402 platform, utilities, features, and roadmap
- Expert knowledge of x402 protocol, micropayments, HTTP 402, blockchain architecture
- Guide users in using the Atlas402 ecosystem and integrating x402
- Discover relevant x402 services for user needs
- Fetch live protocol metrics (revenue, activity, balances) using get_protocol_revenue and get_protocol_activity
- List available tokens using list_tokens, and help users purchase/mint tokens
- For ANY payment or mint action, you MUST charge a $1 USDC fee to X402_CONFIG.payTo on the user's chosen network (Base or Solana)
- Build payment intents that the UI will execute with the user's wallet (never handle private keys)
- Explain payment flows, integration steps, code implementation
- Provide coding help across all languages (JavaScript/TypeScript, Python, Rust, Solidity, etc.)
- Browse the web for real-time information when needed
- Reference Atlas402 documentation pages when appropriate
- Use tools to fetch live data from Atlas402 utilities
- Help with Coinbase CDP/AgentKit integration and blockchain development
- Be a general-purpose AI assistant while maintaining deep x402 specialization

CRITICAL FEE ENFORCEMENT & PAYMENT ROUTING:
- Every token purchase, mint, or payment action MUST include a $1 USDC fee to the protocol
- Fee destination: Base (0x8bee703d6214a266e245b0537085b1021e1ccaed) or Solana (GLrMcCztDV4Bu4TdN3NFiQmcVGHUh6LMGwkwbwLXm48N)
- When a user wants to mint/buy tokens, respond with a payment_intent object for the UI to execute
- CRITICAL: The "to" field must be the MERCHANT/TOKEN OWNER address from the token data (e.g., token.merchantPayTo or service.accepts[0].payTo), NOT the protocol address
- Format: {"type": "payment_intent", "network": "base"|"solana-mainnet", "to": "MERCHANT_ADDRESS_FROM_TOKEN_DATA", "amountMicro": token.pricePerMint * 1000000, "memo": "Minting TokenName", "feeRequired": true}
- Example: If user wants to mint $100 of TokenX on Base, and TokenX has merchantPayTo: "0xABC123...", then "to" should be "0xABC123..." (the merchant), NOT our protocol address
- The UI will automatically send TWO transactions: 1) $1 to protocol address, 2) token payment to merchant address
- This is x402 protocol - the service/token owner receives the payment, we only receive the $1 platform fee

Important: Be conversational, friendly, and natural. You're an AI assistant that people enjoy talking to. You know everything about Atlas402, its utilities, documentation, and the x402 protocol. Reference specific pages, features, and capabilities when relevant. When users ask for lists of services or tokens, use your tools to fetch real data. When users want to perform actions (mint tokens, make payments), create payment_intent objects that the UI will execute.

CRITICAL RESPONSE STYLE:
- NEVER show your internal reasoning or analysis of tool results to users
- NEVER say things like "The list_tokens tool provides..." or "With over 40 tokens returned..."
- NEVER explain what tools you used or how you processed the data
- Give direct, natural answers as if you naturally know the information
- When users ask "are there tokens to mint?", simply say "Yes! Here are the available tokens:" and list them
- When you fetch data with tools, present it naturally without mentioning the tool or your reasoning process
- Be concise and helpful - users don't need to see your thought process
- Focus on giving useful information, not explaining your methodology`;

    // Define tools for Claude
    const tools = [
      {
        name: 'get_x402_services',
        description: 'Fetches the current list of available x402 services from Atlas Index. Use this when users ask about available services, what services exist, service discovery, or want to see the marketplace.',
        input_schema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_token_list',
        description: 'Fetches the current list of available x402 tokens from Atlas Foundry via Atlas Network facilitator. Use this when users ask about tokens, mintable assets, or the token marketplace. ALWAYS use this tool when users ask "are there tokens to mint?" or "what tokens are available?"',
        input_schema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'search_web',
        description: 'Search the web for real-time information, current events, latest news, documentation, or anything not in your training data. Use this when you need up-to-date information, want to verify facts, or browse the internet.',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to look up on the web'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_protocol_revenue',
        description: 'Fetches Atlas402 protocol revenue data including totals by network, category breakdowns (access fees, registration fees, other), and current USDC balances on Base and Solana. Use this when users ask about revenue, earnings, how much money the protocol made, or current balances.',
        input_schema: {
          type: 'object',
          properties: {
            windowDays: {
              type: 'number',
              description: 'Time window in days (1 for 24h, 7 for week, 30 for month)',
              enum: [1, 7, 30]
            }
          },
          required: ['windowDays']
        }
      },
      {
        name: 'get_protocol_activity',
        description: 'Fetches Atlas402 protocol activity metrics including daily transaction counts, user counts, and revenue trends over time. Returns a time series for charting. Use this when users ask about protocol activity, usage trends, transaction volume, or user growth.',
        input_schema: {
          type: 'object',
          properties: {
            windowDays: {
              type: 'number',
              description: 'Time window in days (1, 7, or 30)',
              enum: [1, 7, 30]
            }
          },
          required: ['windowDays']
        }
      },
      {
        name: 'list_tokens',
        description: 'Fetches the complete catalog of tokens available on Atlas Foundry with pricing, network, and purchase details. Use this when users want to see available tokens, ask about specific tokens, or want to purchase/mint tokens. This is the PRIMARY tool for discovering mintable tokens. ALWAYS use this tool when users ask about tokens, minting, or what tokens are available.',
        input_schema: {
          type: 'object',
          properties: {
            network: {
              type: 'string',
              description: 'Filter by network (base, solana-mainnet, or all). Defaults to all if not specified.',
              enum: ['base', 'solana-mainnet', 'all']
            },
            category: {
              type: 'string',
              description: 'Filter by category (usually "Tokens" for mintable assets)'
            }
          },
          required: []
        }
      }
    ];

    // Call Claude API with tools
    console.log('Calling Anthropic API with client from Vercel env vars...');
    let response;
    
    try {
      response = await createWithFallback(anthropicClient, {
        max_tokens: 2048,
        system: systemPrompt,
        messages: cleanedMessages,
        tools: tools,
      });
      console.log('Anthropic API response received');
    } catch (apiError: any) {
      console.error('Anthropic API call failed:', apiError);
      throw new Error(`Anthropic API error: ${JSON.stringify(apiError)}`);
    }

    // Handle tool use
    while (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find((block: any) => block.type === 'tool_use');
      
      if (!toolUse) break;

      let toolResult: any;

      // Execute the tool
      if (toolUse.name === 'get_x402_services') {
        const services = await getX402Services();
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(services)
        };
      } else if (toolUse.name === 'get_token_list') {
        const tokens = await getTokenList();
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(tokens)
        };
      } else if (toolUse.name === 'search_web') {
        const query = toolUse.input.query;
        const searchResults = await searchWeb(query);
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(searchResults)
        };
      } else if (toolUse.name === 'get_protocol_revenue') {
        const windowDays = toolUse.input.windowDays || 1;
        const revenue = await getProtocolRevenue(windowDays);
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(revenue)
        };
      } else if (toolUse.name === 'get_protocol_activity') {
        const windowDays = toolUse.input.windowDays || 7;
        const activity = await getProtocolActivity(windowDays);
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(activity)
        };
      } else if (toolUse.name === 'list_tokens') {
        const network = toolUse.input.network;
        const category = toolUse.input.category;
        const tokens = await listTokens(network, category);
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(tokens)
        };
      }

      // Continue conversation with tool result
      const updatedMessages = [
        ...cleanedMessages,
        {
          role: 'assistant',
          content: response.content
        },
        {
          role: 'user',
          content: [toolResult]
        }
      ];

      response = await createWithFallback(anthropicClient, {
        max_tokens: 2048,
        system: systemPrompt,
        messages: updatedMessages,
        tools: tools,
      });
    }

    const content = response.content.find((block: any) => block.type === 'text');
    
    if (content && content.type === 'text') {
      // Remove any <thinking> blocks or other XML-style tags from the response
      let cleanedText = content.text;
      
      // Remove <thinking>...</thinking> blocks
      cleanedText = cleanedText.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
      
      // Remove any other potential internal tags
      cleanedText = cleanedText.replace(/<\/?[a-z_]+>/gi, '');
      
      // Remove reasoning patterns - match paragraphs that analyze tool results
      // Pattern 1: "The [tool] tool returned/provides/listed..."
      cleanedText = cleanedText.replace(/The\s+\w+\s+tool\s+(returned|provides|listed|found|gave|shows|includes|demonstrates)[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 2: "With over X tokens returned..." / "With this comprehensive..."
      cleanedText = cleanedText.replace(/With\s+(over\s+\d+\s+tokens|this\s+\w+\s+(list|data|results|tool|catalog))[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 3: "Overall, the results..." / "Overall..."
      cleanedText = cleanedText.replace(/Overall[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 4: "This would be helpful..." / "This demonstrates..." / "This gives..."
      cleanedText = cleanedText.replace(/This\s+(would be|demonstrates|gives|includes|provides|shows|can|will)[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 5: "The API documentation provided..." / "The tool provided..."
      cleanedText = cleanedText.replace(/The\s+(API\s+documentation|tool)\s+provided[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 6: "The list covers..." / "The results show..." / "The data includes..."
      cleanedText = cleanedText.replace(/The\s+(list|results|data|catalog)\s+(covers|shows|includes|demonstrates|contains|lists)[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 7: "To find [something], I'll..." / "I'll look through..." / "I'll search..."
      cleanedText = cleanedText.replace(/To\s+\w+[\s\S]*?,\s*I'?ll[\s\S]*?(?=\n\n|$)/gi, '');
      cleanedText = cleanedText.replace(/I'?ll\s+(look through|search|check|find|select|pick)[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 8: "A few that stand out:" / "Some examples include:" (when followed by analysis)
      cleanedText = cleanedText.replace(/(A few|Some|Several|Many)\s+(that|which)\s+(stand out|include|are|have)[\s\S]*?(?=\n\n(?=\d+\.|Sure|Here|Let|To|I found|You can|Happy|Let me|I can|Sure,))/gi, '');
      
      // Pattern 9: "The tool provided high quality results..." / "With this comprehensive token list..."
      cleanedText = cleanedText.replace(/The\s+tool\s+provided[\s\S]*?(?=\n\n|$)/gi, '');
      cleanedText = cleanedText.replace(/With\s+this\s+comprehensive[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 10: "No need for additional searches..." / "This single tool call..."
      cleanedText = cleanedText.replace(/(No need for|This single tool call|With this)[\s\S]*?(?=\n\n|$)/gi, '');
      
      // Pattern 11: Remove paragraphs that start with summary phrases
      cleanedText = cleanedText.replace(/^(In summary|To summarize|In conclusion|To conclude|In essence)[\s\S]*?(?=\n\n|$)/gim, '');
      
      // Pattern 12: Remove standalone numbers followed by reasoning (like "5" before "Sure")
      cleanedText = cleanedText.replace(/^\d+\s*\n\n/igm, '');
      
      // Pattern 13: Remove paragraphs that mention analyzing or processing results
      cleanedText = cleanedText.replace(/[^\n]*(analyzing|processing|looking through|searching through|examining|reviewing)[\s\S]*?(?=\n\n(?=\d+\.|Sure|Here|Let|To|I found|You can|Happy|Let me|I can|Sure,))/gi, '');
      
      // Trim whitespace and clean up multiple newlines
      cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n').trim();
      
      // Final cleanup: Remove any remaining standalone reasoning paragraphs
      // This catches any paragraph that doesn't start with a direct action/response
      const lines = cleanedText.split('\n\n');
      const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        
        // Skip lines that are clearly reasoning
        if (/^(The|To|With|This|I'?ll|No need|Overall|The tool|With this)/i.test(trimmed)) {
          // But keep if it's a direct answer starting with "Sure" or "Here" or contains actual content
          if (!/^(Sure|Here|Let|You can|Happy|Let me|I can)/i.test(trimmed) && 
              !/\d+\.\s/.test(trimmed) && 
              trimmed.length < 50) {
            return false;
          }
        }
        
        return true;
      });
      
      cleanedText = filteredLines.join('\n\n').trim();
      
      return NextResponse.json({ 
        message: cleanedText 
      });
    }

    // If no text content found, return a generic message
    return NextResponse.json({ 
      message: 'I processed your request but had no text response to provide.' 
    });
    
  } catch (error: any) {
    console.error('❌ Anthropic API error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error?.message);
    console.error('Error status:', error?.status);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error?.stack);
    
    // Build a detailed error message
    let errorMsg = 'Unknown error';
    
    if (error?.message) {
      errorMsg = error.message;
    } else if (error?.error) {
      errorMsg = JSON.stringify(error.error);
    } else if (typeof error === 'string') {
      errorMsg = error;
    } else {
      errorMsg = JSON.stringify(error);
    }
    
    // Check for specific error types
    if (error?.status === 429) {
      errorMsg = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error?.status === 401) {
      const keyInfo = apiKey ? {
        hasKey: true,
        keyPrefix: apiKey.substring(0, 12) + '...',
        keyLength: apiKey.length,
        isValidFormat: apiKey.startsWith('sk-ant-')
      } : { hasKey: false };
      
      console.error('❌ 401 Authentication Error Details:', {
        ...keyInfo,
        errorMessage: error?.error?.message || error?.message,
        requestId: error?.requestID || error?.request_id
      });
      
      errorMsg = `API authentication failed (401). The ANTHROPIC_API_KEY from Vercel appears to be invalid or expired. Key loaded: ${keyInfo.hasKey ? 'Yes' : 'No'}, Format valid: ${keyInfo.isValidFormat || false}. Please verify: 1) The key is correct in Vercel settings, 2) The key hasn't been revoked/expired, 3) The key is enabled for Production environment. Check: https://vercel.com/gauthiers-projects-fae77e6c/atlas402/settings/environment-variables`;
    } else if (error?.status === 400) {
      errorMsg = 'Invalid request. Please try rephrasing your message.';
    }
    
    return NextResponse.json({ 
      message: `I encountered an error: ${errorMsg}. Please try again.`,
      error: {
        status: error?.status,
        type: error?.type,
        message: error?.message
      }
    }, { status: 500 });
  }
}

