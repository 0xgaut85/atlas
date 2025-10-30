from typing import Dict, Any, Optional
import aiohttp
import json

async def verify_payment(
    payment_payload: Dict[str, Any],
    requirements: Dict[str, Any],
    facilitator_url: Optional[str] = None,
    rpc_url: Optional[str] = None
) -> Dict[str, Any]:
    if facilitator_url:
        return await verify_via_facilitator(payment_payload, requirements, facilitator_url)
    
    scheme = requirements.get('scheme')
    if scheme == 'x402+eip712':
        return await verify_eip712_payment(payment_payload, requirements, rpc_url)
    elif scheme == 'x402+solana':
        return await verify_solana_payment(payment_payload, requirements, rpc_url)
    
    return {
        'isValid': False,
        'invalidReason': f'Unsupported scheme: {scheme}',
    }

async def verify_via_facilitator(
    payment_payload: Dict[str, Any],
    requirements: Dict[str, Any],
    facilitator_url: str
) -> Dict[str, Any]:
    import base64
    
    payment_header = base64.b64encode(json.dumps(payment_payload).encode()).decode()
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f'{facilitator_url}/verify',
            json={
                'x402Version': 1,
                'paymentHeader': payment_header,
                'paymentRequirements': requirements,
            }
        ) as response:
            result = await response.json()
            return {
                'isValid': result.get('isValid', False),
                'invalidReason': result.get('invalidReason'),
            }

async def verify_eip712_payment(
    payment_payload: Dict[str, Any],
    requirements: Dict[str, Any],
    rpc_url: Optional[str]
) -> Dict[str, Any]:
    rpc = rpc_url or ('https://mainnet.base.org' if requirements.get('network') == 'base' else 'https://mainnet.infura.io/v3/...')
    tx_hash = payment_payload.get('payload', {}).get('transactionHash')
    
    if not tx_hash:
        return {
            'isValid': False,
            'invalidReason': 'Missing transaction hash',
        }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            rpc,
            json={
                'jsonrpc': '2.0',
                'method': 'eth_getTransactionReceipt',
                'params': [tx_hash],
                'id': 1,
            }
        ) as response:
            result = await response.json()
            receipt = result.get('result')
            
            if not receipt or receipt.get('status') != '0x1':
                return {
                    'isValid': False,
                    'invalidReason': 'Transaction failed or not found',
                }
            
            return {
                'isValid': True,
            }

async def verify_solana_payment(
    payment_payload: Dict[str, Any],
    requirements: Dict[str, Any],
    rpc_url: Optional[str]
) -> Dict[str, Any]:
    rpc = rpc_url or 'https://api.mainnet-beta.solana.com'
    signature = payment_payload.get('payload', {}).get('signature')
    
    if not signature:
        return {
            'isValid': False,
            'invalidReason': 'Missing transaction signature',
        }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            rpc,
            json={
                'jsonrpc': '2.0',
                'id': 1,
                'method': 'getTransaction',
                'params': [signature, {'encoding': 'json'}],
            }
        ) as response:
            result = await response.json()
            transaction = result.get('result')
            
            if not transaction or transaction.get('meta', {}).get('err'):
                return {
                    'isValid': False,
                    'invalidReason': 'Transaction failed or not found',
                }
            
            return {
                'isValid': True,
            }





