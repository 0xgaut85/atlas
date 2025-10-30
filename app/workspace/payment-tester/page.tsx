'use client';

import { useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { createX402Client } from '@/lib/x402-client';
import { PaymentGateModal } from '@/app/components/x402/PaymentGateModal';

export default function PaymentTesterPage() {
  const { address, isConnected } = useAppKitAccount();
  const [endpointUrl, setEndpointUrl] = useState('');
  const [testMode, setTestMode] = useState<'full' | 'validate-only'>('full');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const handleTest = async () => {
    if (!endpointUrl) return;

    setLoading(true);
    setResults(null);

    try {
      const x402Fetch = createX402Client((window as any).ethereum);
      const response = await x402Fetch('/api/x402/payment-tester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpointUrl,
          testMode: testMode === 'validate-only' ? 'validate-only' : undefined,
        }),
      });

      const data = await response.json();
      setResults(data);
      if (data.success) {
        setHasAccess(true);
      }
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-2">x402 Payment Tester</h1>
        <p className="text-gray-600 mb-8">Test and debug x402 payment flows step-by-step</p>

        {!hasAccess && (
          <PaymentGateModal
            pageName="Payment Tester"
            pageId="payment-tester"
            isOpen={!hasAccess}
            onSuccess={() => setHasAccess(true)}
            onClose={() => {}}
            userAddress={address || ''}
          />
        )}

        {hasAccess && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-black p-6">
              <label className="block text-sm font-medium text-black mb-2">
                Endpoint URL
              </label>
              <input
                type="url"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="https://api.example.com/service"
                className="w-full px-4 py-2 border-2 border-black text-black bg-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="bg-white border-2 border-black p-6">
              <label className="block text-sm font-medium text-black mb-2">
                Test Mode
              </label>
              <select
                value={testMode}
                onChange={(e) => setTestMode(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-black text-black bg-white focus:outline-none focus:border-red-600"
              >
                <option value="full">Full Test (includes invalid payment test)</option>
                <option value="validate-only">Validate Only (402 response check)</option>
              </select>
            </div>

            <button
              onClick={handleTest}
              disabled={loading || !endpointUrl}
              className="w-full px-6 py-3 bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Testing...' : 'Run Test'}
            </button>

            {results && (
              <div className="bg-white border-2 border-black p-6">
                <h2 className="text-2xl font-bold text-black mb-4">Test Results</h2>
                
                {results.success ? (
                  <div className="space-y-4">
                    {results.results?.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="border border-gray-300 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-black">Step {step.step}:</span>
                          <span className="font-medium">{step.name}</span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            step.status === 'success' ? 'bg-green-100 text-green-700' :
                            step.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        {step.details && (
                          <pre className="text-xs bg-gray-50 p-3 overflow-auto">
                            {JSON.stringify(step.details, null, 2)}
                          </pre>
                        )}
                        {step.error && (
                          <div className="text-red-600 text-sm">{step.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-red-600">{results.error}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

