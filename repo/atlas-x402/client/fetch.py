import asyncio
import aiohttp
import base64
import json
from typing import Optional

async def x402_fetch(
    url: str,
    network: str,
    wallet_address: Optional[str] = None,
    facilitator_url: Optional[str] = None,
    **kwargs
) -> aiohttp.ClientResponse:
    async with aiohttp.ClientSession() as session:
        async with session.get(url, **kwargs) as response:
            if response.status == 402:
                payment_requirements = await response.json()
                requirement = payment_requirements.get('accepts', [{}])[0]
                
                if not requirement:
                    raise Exception('No payment requirements provided')
                
                payment_payload = await create_payment(requirement, network, wallet_address)
                payment_header = base64.b64encode(json.dumps(payment_payload).encode()).decode()
                
                headers = kwargs.get('headers', {})
                headers['x-payment'] = payment_header
                
                async with session.get(url, headers=headers, **kwargs) as retry_response:
                    return retry_response
            
            return response

async def create_payment(requirement: dict, network: str, wallet_address: Optional[str]) -> dict:
    return {
        'x402Version': 1,
        'scheme': requirement.get('scheme'),
        'network': requirement.get('network'),
        'payload': {
            'transactionHash': '0x...',
            'amount': requirement.get('maxAmountRequired'),
            'currency': 'USDC',
            'payTo': requirement.get('payTo'),
        },
    }

