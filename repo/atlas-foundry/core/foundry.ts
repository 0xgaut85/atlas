export interface TokenParams {
  name: string;
  symbol: string;
  supply: string;
  pricePerMint: string;
  network: 'base' | 'solana-mainnet';
  deployerAddress: string;
  description?: string;
  decimals?: number;
}

export interface TokenResult {
  contractAddress: string;
  mintEndpoint: string;
  deploymentTxHash: string;
  explorerLink: string;
  network: string;
}

export class AtlasFoundry {
  private facilitatorUrl: string;
  private evmWallet?: any;
  private solanaConnection?: any;

  constructor(config: { facilitatorUrl: string }) {
    this.facilitatorUrl = config.facilitatorUrl;
  }

  async initializeEVM(walletClient: any) {
    this.evmWallet = walletClient;
  }

  async createToken(params: TokenParams): Promise<TokenResult> {
    if (params.network === 'base') {
      return this.createERC20Token(params);
    } else {
      return this.createSPLToken(params);
    }
  }

  private async createERC20Token(params: TokenParams): Promise<TokenResult> {
    const { deployERC20 } = await import('./server/deploy');
    const deployment = await deployERC20({
      name: params.name,
      symbol: params.symbol,
      supply: params.supply,
      owner: params.deployerAddress,
      walletClient: this.evmWallet,
    });

    const mintEndpoint = `/api/token/${deployment.contractAddress}/mint`;
    
    await this.registerWithX402Scan({
      endpoint: mintEndpoint,
      network: 'base',
      merchantAddress: params.deployerAddress,
      price: params.pricePerMint,
    });

    return {
      contractAddress: deployment.contractAddress,
      mintEndpoint,
      deploymentTxHash: deployment.txHash,
      explorerLink: `https://basescan.org/tx/${deployment.txHash}`,
      network: 'base',
    };
  }

  private async createSPLToken(params: TokenParams): Promise<TokenResult> {
    const { deploySPLToken } = await import('./server/deploy');
    const deployment = await deploySPLToken({
      name: params.name,
      symbol: params.symbol,
      supply: params.supply,
      connection: this.solanaConnection,
    });

    const mintEndpoint = `/api/token/${deployment.mintAddress}/mint`;
    
    await this.registerWithX402Scan({
      endpoint: mintEndpoint,
      network: 'solana-mainnet',
      merchantAddress: params.deployerAddress,
      price: params.pricePerMint,
    });

    return {
      contractAddress: deployment.mintAddress,
      mintEndpoint,
      deploymentTxHash: deployment.signature,
      explorerLink: `https://solscan.io/tx/${deployment.signature}`,
      network: 'solana-mainnet',
    };
  }

  private async registerWithX402Scan(params: {
    endpoint: string;
    network: string;
    merchantAddress: string;
    price: string;
  }) {
    await fetch(`${this.facilitatorUrl}/discovery/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: params.endpoint,
        endpoint: params.endpoint,
        merchantAddress: params.merchantAddress,
        network: params.network,
        price: params.price,
        category: 'Tokens',
      }),
    });
  }
}

export default AtlasFoundry;

