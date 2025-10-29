from fastapi import FastAPI, Request
from atlas_x402.server.middleware import x402_middleware

app = FastAPI()
MERCHANT_ADDRESS = '0x8bee703d6214a266e245b0537085b1021e1ccaed'

@app.get('/api/weather')
async def get_weather(request: Request):
    await x402_middleware(
        request,
        price='0.05',
        network='base',
        merchant_address=MERCHANT_ADDRESS
    )
    
    return {
        'location': 'San Francisco',
        'temperature': 72,
        'condition': 'Sunny',
        'timestamp': '2025-01-01T12:00:00Z',
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=3000)

