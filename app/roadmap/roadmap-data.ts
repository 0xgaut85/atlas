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
    title: 'Platform Launch',
    description: 'Building the foundation for decentralized micropayments',
    period: 'Q4 2025',
    items: [
      {
        id: 'command-console',
        title: 'Command Console',
        description: 'Atlas Workspace marketplace for x402 services: discovery, testing, and instant payments',
        status: 'completed',
        features: [
          'Service browsing and filtering',
          'Real-time payment processing',
          'Wallet integration',
          'Transaction history tracking',
        ],
      },
      {
        id: 'base-solana',
        title: 'Base & Solana Integration',
        description: 'Live payment support on Base and Solana networks',
        status: 'completed',
        features: [
          'Base mainnet USDC payments',
          'Solana mainnet USDC payments',
          'Wallet switching',
          'Network auto-detection',
        ],
      },
      {
        id: 'token-minting',
        title: 'Token Browse & Mint',
        description: 'Browse and mint x402 tokens directly from the marketplace',
        status: 'completed',
        features: [
          'Token discovery',
          'Website previews',
          'One-click minting',
          'Multi-network tokens',
        ],
      },
      {
        id: 'developer-tools',
        title: 'Atlas Mesh',
        description: 'Developer portal for registering and managing x402 services',
        status: 'completed',
        features: [
          'Service registration',
          'Code generation',
          'API documentation',
          'Integration guides',
        ],
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'Ecosystem Expansion',
    description: 'Growing the network with AI and multi-chain support',
    period: 'Q1-Q2 2026',
    items: [
      {
        id: 'indexer-launch',
        title: 'Atlas Index',
        description: 'Complete visibility into all x402 services across the network',
        status: 'in-progress',
        features: [
          'Global service tracking',
          'Service metadata display',
          'Facilitator information',
          'Category filtering',
        ],
      },
      {
        id: 'native-agent',
        title: 'Atlas Operator',
        description: 'AI-powered operator with conversational interface and x402 ecosystem access',
        status: 'in-progress',
        features: [
          'LLM conversations',
          'Service discovery',
          'Knowledge base integration',
          'Platform guidance',
        ],
      },
      {
        id: 'additional-chains',
        title: 'Multi-Chain Support',
        description: 'Expand to Polygon, Peaq, and Sei networks',
        status: 'planned',
        features: [
          'Polygon integration',
          'Peaq network support',
          'Sei blockchain',
          'Cross-chain routing',
        ],
      },
    ],
  },
  {
    id: 'phase-3',
    title: 'Advanced Features',
    description: 'Token launch and community governance',
    period: 'Q3 2026',
    items: [
      {
        id: 'token-launch',
        title: 'Atlas Token Launch',
        description: 'Native token for platform governance and network incentives',
        status: 'planned',
        features: [
          'Token economics',
          'Fair distribution',
          'Liquidity provision',
          'Staking mechanics',
        ],
      },
      {
        id: 'advanced-payments',
        title: 'Advanced Payment Models',
        description: 'Subscription models and credit systems for enterprise use cases',
        status: 'planned',
        features: [
          'Subscription billing',
          'Credit accounts',
          'Volume discounts',
          'Analytics dashboard',
        ],
      },
      {
        id: 'governance',
        title: 'Community Governance',
        description: 'Decentralized decision-making for protocol development',
        status: 'planned',
        features: [
          'On-chain voting',
          'Proposal system',
          'Treasury management',
          'Protocol upgrades',
        ],
      },
    ],
  },
  {
    id: 'phase-4',
    title: 'Network Scale',
    description: 'Enterprise solutions and global infrastructure',
    period: 'Q4 2026 & Beyond',
    items: [
      {
        id: 'enterprise',
        title: 'Enterprise Solutions',
        description: 'White-label infrastructure and enterprise-grade integrations',
        status: 'planned',
        features: [
          'Enterprise APIs',
          'White-label marketplace',
          'Compliance tools',
          'Custom integrations',
        ],
      },
      {
        id: 'ai-routing',
        title: 'AI-Powered Optimization',
        description: 'Intelligent payment routing and predictive analytics',
        status: 'planned',
        features: [
          'Smart routing',
          'Fraud detection',
          'Usage forecasting',
          'Cost optimization',
        ],
      },
      {
        id: 'global-scale',
        title: 'Global Infrastructure',
        description: 'Scale to millions of transactions with regional optimization',
        status: 'planned',
        features: [
          'Global CDN',
          'Regional facilitators',
          'Multi-currency support',
          'Low-latency routing',
        ],
      },
    ],
  },
];

