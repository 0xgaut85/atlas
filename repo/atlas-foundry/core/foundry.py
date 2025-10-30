from typing import Optional, Dict, Any
from dataclasses import dataclass

@dataclass
class TokenParams:
    name: str
    symbol: str
    supply: str
    price_per_mint: str
    network: str
    deployer_address: str
    description: Optional[str] = None
    decimals: Optional[int] = None

@dataclass
class TokenResult:
    contract_address: str
    mint_endpoint: str
    deployment_tx_hash: str
    explorer_link: str
    network: str

class AtlasFoundry:
    def __init__(self, facilitator_url: str):
        self.facilitator_url = facilitator_url
        self.evm_wallet = None
        self.solana_connection = None
        
    async def create_token(self, params: TokenParams) -> TokenResult:
        if params.network == 'base':
            return await self._create_erc20_token(params)
        else:
            return await self._create_spl_token(params)
    
    async def _create_erc20_token(self, params: TokenParams) -> TokenResult:
        from .server.deploy import deploy_erc20
        
        deployment = await deploy_erc20({
            'name': params.name,
            'symbol': params.symbol,
            'supply': params.supply,
            'owner': params.deployer_address,
            'wallet_client': self.evm_wallet,
        })
        
        mint_endpoint = f"/api/token/{deployment['contract_address']}/mint"
        
        await self._register_with_x402_scan({
            'endpoint': mint_endpoint,
            'network': 'base',
            'merchant_address': params.deployer_address,
            'price': params.price_per_mint,
        })
        
        return TokenResult(
            contract_address=deployment['contract_address'],
            mint_endpoint=mint_endpoint,
            deployment_tx_hash=deployment['tx_hash'],
            explorer_link=f"https://basescan.org/tx/{deployment['tx_hash']}",
            network='base'
        )
    
    async def _create_spl_token(self, params: TokenParams) -> TokenResult:
        from .server.deploy import deploy_spl_token
        
        deployment = await deploy_spl_token({
            'name': params.name,
            'symbol': params.symbol,
            'supply': params.supply,
            'connection': self.solana_connection,
        })
        
        mint_endpoint = f"/api/token/{deployment['mint_address']}/mint"
        
        await self._register_with_x402_scan({
            'endpoint': mint_endpoint,
            'network': 'solana-mainnet',
            'merchant_address': params.deployer_address,
            'price': params.price_per_mint,
        })
        
        return TokenResult(
            contract_address=deployment['mint_address'],
            mint_endpoint=mint_endpoint,
            deployment_tx_hash=deployment['signature'],
            explorer_link=f"https://solscan.io/tx/{deployment['signature']}",
            network='solana-mainnet'
        )
    
    async def _register_with_x402_scan(self, params: Dict[str, Any]):
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.facilitator_url}/discovery/resources",
                json={
                    'name': params['endpoint'],
                    'endpoint': params['endpoint'],
                    'merchantAddress': params['merchant_address'],
                    'network': params['network'],
                    'price': params['price'],
                    'category': 'Tokens',
                }
            ) as response:
                response.raise_for_status()




