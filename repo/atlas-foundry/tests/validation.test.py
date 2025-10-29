import pytest
from atlas_foundry.utils.validation import validate_token_params

def test_validate_token_params():
    params = {
        'name': 'Test Token',
        'symbol': 'TEST',
        'supply': '1000000',
        'network': 'base',
    }
    
    valid, errors = validate_token_params(params)
    assert valid is True
    assert len(errors) == 0

def test_validate_token_params_invalid():
    params = {
        'name': '',
        'symbol': 'T',
        'supply': '0',
        'network': 'invalid',
    }
    
    valid, errors = validate_token_params(params)
    assert valid is False
    assert len(errors) > 0

