from typing import Dict, Any, List, Tuple

def validate_token_params(params: Dict[str, Any]) -> Tuple[bool, List[str]]:
    errors = []
    
    if not params.get('name') or len(params['name']) < 1:
        errors.append('Token name is required')
    
    if not params.get('symbol') or len(params['symbol']) < 2 or len(params['symbol']) > 10:
        errors.append('Token symbol must be between 2 and 10 characters')
    
    if not params.get('supply') or float(params['supply']) <= 0:
        errors.append('Supply must be greater than 0')
    
    if params.get('network') not in ['base', 'solana-mainnet']:
        errors.append('Network must be base or solana-mainnet')
    
    return len(errors) == 0, errors

def calculate_deployment_fee(price: str, network: str) -> float:
    base_fee = 10.0
    price_value = float(price) if price else 0.0
    return base_fee + price_value

