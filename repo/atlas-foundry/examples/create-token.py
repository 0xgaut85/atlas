import asyncio
from atlas_foundry.core.foundry import AtlasFoundry, TokenParams

async def main():
    foundry = AtlasFoundry(facilitator_url='https://facilitator.payai.network')
    
    token = await foundry.create_token(TokenParams(
        name='My Service Token',
        symbol='MST',
        supply='1000000',
        price_per_mint='10.00',
        network='base',
        deployer_address='0x1234567890123456789012345678901234567890'
    ))
    
    print(f"Token created: {token.contract_address}")

if __name__ == '__main__':
    asyncio.run(main())

