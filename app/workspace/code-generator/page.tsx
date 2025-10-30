'use client';

import { useState, useEffect } from 'react';

const frameworks = [
  { id: 'express', name: 'Express.js (Node.js)' },
  { id: 'fastapi', name: 'FastAPI (Python)' },
  { id: 'flask', name: 'Flask (Python)' },
  { id: 'nextjs', name: 'Next.js API Route' },
];

export default function CodeGeneratorPage() {
  const [selectedFramework, setSelectedFramework] = useState('express');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [customPrice, setCustomPrice] = useState('1.00');
  const [customNetwork, setCustomNetwork] = useState('base');
  const [customAddress, setCustomAddress] = useState('');

  const generateCode = async (customize = false) => {
    setLoading(true);
    try {
      const url = customize
        ? '/api/x402/code-generator'
        : `/api/x402/code-generator?framework=${selectedFramework}`;
      
      const response = customize
        ? await fetch('/api/x402/code-generator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              framework: selectedFramework,
              price: customPrice,
              network: customNetwork,
              merchantAddress: customAddress,
            }),
          })
        : await fetch(`/api/x402/code-generator?framework=${selectedFramework}`);

      const data = await response.json();
      if (data.success) {
        setCode(data.code);
      }
    } catch (error: any) {
      console.error('Error generating code:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCode();
  }, [selectedFramework]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">x402 Code Generator</h1>
          <p className="text-gray-600">Generate ready-to-use x402 server code - FREE utility</p>
        </div>

        <div className="bg-green-50 border-2 border-green-600 p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">FREE</span>
            <span className="text-gray-700">No payment required - drives adoption</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-4">
            <div className="bg-white border-2 border-black p-6">
              <label className="block text-sm font-medium text-black mb-2">
                Framework
              </label>
              <select
                value={selectedFramework}
                onChange={(e) => {
                  setSelectedFramework(e.target.value);
                  generateCode();
                }}
                className="w-full px-4 py-2 border-2 border-black text-black bg-white focus:outline-none focus:border-red-600"
              >
                {frameworks.map(fw => (
                  <option key={fw.id} value={fw.id}>{fw.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white border-2 border-black p-6">
              <h3 className="font-medium text-black mb-4">Customize (Optional)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price (USDC)</label>
                  <input
                    type="text"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="1.00"
                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Network</label>
                  <select
                    value={customNetwork}
                    onChange={(e) => setCustomNetwork(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                  >
                    <option value="base">Base</option>
                    <option value="solana-mainnet">Solana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Merchant Address</label>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white font-mono"
                  />
                </div>
                <button
                  onClick={() => generateCode(true)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate Custom Code'}
                </button>
              </div>
            </div>
          </div>

          {/* Code Output */}
          <div className="bg-white border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-black">Generated Code</h3>
              {code && (
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black text-sm transition-colors"
                >
                  Copy
                </button>
              )}
            </div>
            {code ? (
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-xs font-mono">
                {code}
              </pre>
            ) : (
              <div className="text-gray-400 text-center py-8">
                Select a framework to generate code
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

