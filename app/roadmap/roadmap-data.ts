// Roadmap data configuration
// Edit this file to update roadmap items easily

export type RoadmapStatus = 'completed' | 'in-progress' | 'planned';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  quarter?: string;
  year?: number;
  features?: string[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  period: string;
  items: RoadmapItem[];
}

export const roadmapData: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Platform Foundation',
    description: 'Core infrastructure and utilities for x402 micropayments',
    period: 'October 2025',
    items: [
      {
        id: 'base-solana',
        title: 'Base & Solana Integration',
        description: 'Live payment support on Base and Solana networks with USDC',
        status: 'completed',
        features: [
          'Base mainnet USDC payments',
          'Solana mainnet USDC payments',
          'Wallet switching (EVM & Solana)',
          'Network auto-detection',
        ],
      },
      {
        id: 'atlas-workspace',
        title: 'Atlas Workspace',
        description: 'Unified command center for all Atlas402 utilities and x402 services',
        status: 'completed',
        features: [
          'Command Console for service discovery',
          'One-click access to all utilities',
          'Payment-gated access ($1 USDC per hour)',
          'Unified dashboard interface',
        ],
      },
      {
        id: 'atlas-foundry',
        title: 'Atlas Foundry',
        description: 'Browse and mint x402-native tokens with instant payments',
        status: 'completed',
        features: [
          'Token discovery and filtering',
          'Website previews and metadata',
          'One-click minting with USDC',
          'Multi-network token support',
          'Mint fee collection ($0.25 USDC)',
        ],
      },
      {
        id: 'atlas-mesh',
        title: 'Atlas Mesh',
        description: 'Developer portal for registering and managing x402 services',
        status: 'completed',
        features: [
          'Service registration with PayAI facilitator',
          'Automatic x402scan.com listing',
          'Code generation and SDKs',
          'Integration guides and docs',
        ],
      },
      {
        id: 'atlas-dashboard',
        title: 'Atlas Dashboard',
        description: 'Personal analytics dashboard for user activity and balances',
        status: 'completed',
        features: [
          'Multi-chain balance tracking (USDC & native tokens)',
          'Payment history and activity feed',
          'Minted tokens tracking',
          'Export capabilities (CSV/JSON)',
        ],
      },
      {
        id: 'atlas-x402',
        title: 'Atlas x402',
        description: 'Protocol analytics dashboard for platform revenue and usage',
        status: 'completed',
        features: [
          'Real-time revenue tracking (Base & Solana)',
          'User activity and transaction monitoring',
          'Service purchase analytics',
          'Category-based fee breakdown',
        ],
      },
      {
        id: '💰-atlas-token',
        title: '$ATLAS Token Launch',
        description: 'Native token for platform governance, network incentives, and ecosystem rewards',
        status: 'completed',
        features: [
          'Token launch and distribution',
          'On-chain token economics',
          'Liquidity provision',
          'Community rewards system',
        ],
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'Ecosystem Growth',
    description: 'Expanding discovery, AI capabilities, and multi-chain support',
    period: 'Q4 2025',
    items: [
      {
        id: 'atlas-index',
        title: 'Atlas Index',
        description: 'Real-time service discovery and purchase system for x402 services',
        status: 'completed',
        features: [
          'Global service tracking via PayAI facilitator',
          'Service metadata and pricing display',
          'Purchase service fee ($0.50 USDC)',
          'Category and network filtering',
          'Real-time service updates',
        ],
      },
      {
        id: 'atlas-operator',
        title: 'Atlas Operator',
        description: 'AI-powered conversational interface with full x402 ecosystem access',
        status: 'completed',
        features: [
          'Claude-powered LLM conversations',
          'Service discovery and recommendations',
          'Payment intent generation',
          'Platform guidance and documentation',
          'Multi-tool capability integration',
        ],
      },
      {
        id: 'atlas-explorer',
        title: 'Atlas Explorer',
        description: 'Blockchain explorer for x402 transactions and protocol activity',
        status: 'planned',
        features: [
          'Transaction search and filtering',
          'Payment verification tools',
          'Service endpoint monitoring',
          'Network-wide activity visualization',
        ],
      },
      {
        id: 'multi-chain',
        title: 'Multi-Chain Expansion',
        description: 'Extend x402 support to Polygon, Peaq, Sei, and BSC networks',
        status: 'planned',
        features: [
          'Polygon mainnet integration',
          'Peaq network support',
          'Sei blockchain support',
          'BSC (Binance Smart Chain) integration',
          'Cross-chain payment routing',
        ],
      },
    ],
  },
  {
    id: 'phase-3',
    title: 'Advanced Features',
    description: 'Enhanced payment models and community governance',
    period: 'Q1 2026',
    items: [
      {
        id: 'advanced-payments',
        title: 'Advanced Payment Models',
        description: 'Subscription billing, credit systems, and enterprise payment solutions',
        status: 'planned',
        features: [
          'Subscription billing (monthly/annual)',
          'Credit accounts and balance management',
          'Volume discounts and tiered pricing',
          'Enterprise payment analytics',
        ],
      },
      {
        id: 'governance',
        title: 'Token Governance',
        description: 'Decentralized decision-making powered by $ATLAS token holders',
        status: 'planned',
        features: [
          'On-chain voting with $ATLAS',
          'Proposal submission system',
          'Treasury management',
          'Protocol upgrade voting',
        ],
      },
      {
        id: 'staking',
        title: 'Staking & Rewards',
        description: 'Stake $ATLAS tokens to earn rewards and participate in governance',
        status: 'planned',
        features: [
          'Token staking mechanics',
          'Reward distribution',
          'Validator selection',
          'Yield farming opportunities',
        ],
      },
    ],
  },
  {
    id: 'phase-4',
    title: 'Enterprise & Scale',
    description: 'Production infrastructure and global deployment',
    period: 'Q2 2026 & Beyond',
    items: [
      {
        id: 'enterprise',
        title: 'Enterprise Solutions',
        description: 'White-label infrastructure and enterprise-grade API integrations',
        status: 'planned',
        features: [
          'Enterprise API packages',
          'White-label marketplace',
          'Compliance and audit tools',
          'Custom integration support',
        ],
      },
      {
        id: 'ai-routing',
        title: 'AI-Powered Optimization',
        description: 'Intelligent payment routing, fraud detection, and predictive analytics',
        status: 'planned',
        features: [
          'Smart payment routing',
          'ML-based fraud detection',
          'Usage forecasting',
          'Cost optimization algorithms',
        ],
      },
      {
        id: 'global-scale',
        title: 'Global Infrastructure',
        description: 'Scale to millions of transactions with regional optimization',
        status: 'planned',
        features: [
          'Global CDN deployment',
          'Regional facilitator networks',
          'Multi-currency support',
          'Low-latency routing (<100ms)',
        ],
      },
    ],
  },
];

