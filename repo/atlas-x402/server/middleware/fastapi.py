from fastapi import Request, HTTPException
from typing import Optional
import base64
import json

async def x402_middleware(
    request: Request,
    price: str,
    network: str,
    merchant_address: str,
    facilitator_url: Optional[str] = None
):
    payment_header = request.headers.get('x-payment')
    
    if not payment_header:
        raise HTTPException(
            status_code=402,
            detail={
                'x402Version': 1,
                'accepts': [{
                    'scheme': 'x402+eip712' if network == 'base' else 'x402+solana',
                    'network': network,
                    'maxAmountRequired': str(int(float(price) * 1_000_000)),
                    'resource': str(request.url),
                    'description': f'Payment required for {request.url.path}',
                    'mimeType': 'application/json',
                    'payTo': merchant_address,
                    'maxTimeoutSeconds': 60,
                    'asset': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' if network == 'base' else 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                    'extra': {'name': 'USDC', 'version': '2'} if network == 'base' else None,
                }],
                'error': None,
            }
        )
    
    try:
        decoded = base64.b64decode(payment_header).decode('utf-8')
        payment_payload = json.loads(decoded)
        
        verified = await verify_payment(
            payment_payload,
            network=network,
            facilitator_url=facilitator_url or 'https://facilitator.payai.network'
        )
        
        if not verified:
            raise HTTPException(
                status_code=402,
                detail={'error': 'Payment verification failed'}
            )
        
        request.state.x402_payment = {
            'verified': True,
            'tx_hash': payment_payload.get('payload', {}).get('transactionHash') or payment_payload.get('payload', {}).get('signature'),
            'amount': payment_payload.get('payload', {}).get('amount'),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def verify_payment(payment_payload: dict, network: str, facilitator_url: str) -> bool:
    import aiohttp
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f'{facilitator_url}/verify',
            json={
                'x402Version': 1,
                'paymentHeader': payment_payload,
                'paymentRequirements': {
                    'network': network,
                },
            }
        ) as response:
            result = await response.json()
            return result.get('isValid', False)

