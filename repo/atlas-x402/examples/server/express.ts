import express from 'express';
import { x402Middleware } from '@atlas402/x402-server';

const app = express();
app.use(express.json());

const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || '0x8bee703d6214a266e245b0537085b1021e1ccaed';

app.get('/api/weather',
  x402Middleware({
    price: '0.05 USDC',
    network: 'base',
    merchantAddress: MERCHANT_ADDRESS,
  }),
  (req, res) => {
    res.json({
      location: 'San Francisco',
      temperature: 72,
      condition: 'Sunny',
      timestamp: new Date().toISOString(),
    });
  }
);

app.get('/api/data',
  x402Middleware({
    price: '0.10 USDC',
    network: 'base',
    merchantAddress: MERCHANT_ADDRESS,
  }),
  (req, res) => {
    res.json({
      data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ],
    });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`x402 server running on port ${PORT}`);
  console.log(`Merchant address: ${MERCHANT_ADDRESS}`);
});








