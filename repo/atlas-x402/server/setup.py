setup(
    name='atlas-x402-server',
    version='1.0.0',
    description='Server-side x402 payment middleware and verification',
    packages=['atlas_x402.server'],
    install_requires=[
        'fastapi>=0.104.0',
        'aiohttp>=3.9.0',
    ],
    python_requires='>=3.11',
)

