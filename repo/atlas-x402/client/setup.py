setup(
    name='atlas-x402-client',
    version='1.0.0',
    description='Client-side x402 payment integration',
    packages=['atlas_x402.client'],
    install_requires=[
        'aiohttp>=3.9.0',
        'solana>=0.30.0',
    ],
    python_requires='>=3.11',
)




