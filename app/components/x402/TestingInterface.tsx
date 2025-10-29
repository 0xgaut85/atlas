'use client';

import { useState, useEffect } from 'react';
import { X402TestResult } from '@/lib/payai-client';

interface TestingInterfaceProps {
  selectedServiceId?: string;
  onClose: () => void;
}

export function TestingInterface({ selectedServiceId, onClose }: TestingInterfaceProps) {
  const [testResult, setTestResult] = useState<X402TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('base-sepolia');
  const [testStep, setTestStep] = useState<'idle' | 'requesting' | 'payment-required' | 'completed'>('idle');

  const networks = [
    { id: 'base-sepolia', name: 'Base Sepolia (Testnet)', recommended: true },
    { id: 'base', name: 'Base Mainnet', recommended: false },
    { id: 'solana-devnet', name: 'Solana Devnet', recommended: false },
  ];

  useEffect(() => {
    if (selectedServiceId) {
      handleTest();
    }
  }, [selectedServiceId]);

  const handleTest = async () => {
    if (!selectedServiceId) return;

    setIsLoading(true);
    setTestStep('requesting');
    setTestResult(null);

    try {
      // Step 1: Initial request to Echo Merchant
      setTestStep('requesting');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Make real API call to Echo Merchant
      const echoMerchantUrl = `https://x402.payai.network/api/${selectedNetwork}/paid-content`;
      
      const initialResponse = await fetch(echoMerchantUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      // Step 2: Check for HTTP 402 Payment Required
      setTestStep('payment-required');
      await new Promise(resolve => setTimeout(resolve, 1000));

      let resultData: X402TestResult;

      if (initialResponse.status === 402) {
        // Real HTTP 402 response
        const paymentInfo = await initialResponse.json();
        
        resultData = {
          success: true,
          statusCode: 402,
          response: {
            ...paymentInfo,
            message: 'HTTP 402 Payment Required - This is a real x402 response!',
            instructions: 'In a real implementation, payment would be processed automatically',
          },
          timestamp: Date.now(),
          network: selectedNetwork,
        };
      } else if (initialResponse.status === 200) {
        // Already paid or free content
        const contentData = await initialResponse.json();
        
        resultData = {
          success: true,
          statusCode: 200,
          response: {
            ...contentData,
            message: 'Content accessed successfully (Echo Merchant auto-refund)',
          },
          timestamp: Date.now(),
          network: selectedNetwork,
        };
      } else {
        // Other response
        const responseData = await initialResponse.text();
        
        resultData = {
          success: false,
          statusCode: initialResponse.status,
          response: {
            error: `HTTP ${initialResponse.status}: ${responseData}`,
            endpoint: echoMerchantUrl,
          },
          timestamp: Date.now(),
          network: selectedNetwork,
        };
      }

      setTestResult(resultData);
      setTestStep('completed');

      // Log the real interaction
      console.log('Real Echo Merchant test:', {
        endpoint: echoMerchantUrl,
        status: initialResponse.status,
        network: selectedNetwork,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Real Echo Merchant test failed:', error);
      setTestResult({
        success: false,
        statusCode: 0,
        response: { 
          error: error instanceof Error ? error.message : 'Network error',
          endpoint: `https://x402.payai.network/api/${selectedNetwork}/paid-content`,
          details: 'Failed to connect to PayAI Echo Merchant',
        },
        timestamp: Date.now(),
        network: selectedNetwork,
      });
      setTestStep('completed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatus = (step: string) => {
    const currentStepIndex = ['idle', 'requesting', 'payment-required', 'completed'].indexOf(testStep);
    const stepIndex = ['idle', 'requesting', 'payment-required', 'completed'].indexOf(step);
    
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  const formatResponse = (response: any) => {
    return JSON.stringify(response, null, 2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">x402 Protocol Testing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Network Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Network</label>
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {networks.map(network => (
              <option key={network.id} value={network.id}>
                {network.name} {network.recommended ? '(Recommended)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* HTTP 402 Flow Visualization */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">HTTP 402 Payment Flow</h3>
          
          <div className="space-y-4">
            {/* Step 1: Initial Request */}
            <div className={`p-4 rounded-lg border-2 transition-all ${
              getStepStatus('requesting') === 'active' 
                ? 'border-blue-500 bg-blue-50' 
                : getStepStatus('requesting') === 'completed'
                ? 'border-red-600 bg-red-600/10'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  getStepStatus('requesting') === 'active' 
                    ? 'bg-blue-500 text-white' 
                    : getStepStatus('requesting') === 'completed'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <div>
                  <h4 className="font-medium">Initial Request</h4>
                  <p className="text-sm text-gray-600">GET /api/{selectedNetwork}/paid-content</p>
                </div>
                {getStepStatus('requesting') === 'active' && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: 402 Payment Required */}
            <div className={`p-4 rounded-lg border-2 transition-all ${
              getStepStatus('payment-required') === 'active' 
                ? 'border-orange-500 bg-orange-50' 
                : getStepStatus('payment-required') === 'completed'
                ? 'border-red-600 bg-red-600/10'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  getStepStatus('payment-required') === 'active' 
                    ? 'bg-orange-500 text-white' 
                    : getStepStatus('payment-required') === 'completed'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <div>
                  <h4 className="font-medium">HTTP 402 Payment Required</h4>
                  <p className="text-sm text-gray-600">Server requests payment for content access</p>
                </div>
                {getStepStatus('payment-required') === 'active' && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Payment & Response */}
            <div className={`p-4 rounded-lg border-2 transition-all ${
              getStepStatus('completed') === 'active' 
                ? 'border-red-600 bg-red-600/10' 
                : getStepStatus('completed') === 'completed'
                ? 'border-red-600 bg-red-600/10'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  getStepStatus('completed') === 'completed'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <div>
                  <h4 className="font-medium">Payment & Content Delivery</h4>
                  <p className="text-sm text-gray-600">HTTP 200 OK with paid content</p>
                </div>
                {getStepStatus('completed') === 'active' && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
            
            <div className={`p-4 rounded-lg border-2 ${
              testResult.success 
                ? 'border-red-600 bg-red-600/10' 
                : 'border-red-500 bg-red-50'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">
                  {testResult.success ? '✓' : '✗'}
                </span>
                <div>
                  <h4 className="font-medium">
                    {testResult.success ? 'Test Successful' : 'Test Failed'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Status Code: {testResult.statusCode} | Network: {testResult.network}
                  </p>
                </div>
              </div>

              {testResult.transactionHash && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Transaction Hash:</p>
                  <code className="text-xs bg-white p-2 rounded border block mt-1">
                    {testResult.transactionHash}
                  </code>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Response:</p>
                <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
                  {formatResponse(testResult.response)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleTest}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Testing...' : 'Run Test Again'}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Echo Merchant Note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This test uses PayAI's Echo Merchant service. 
            All payments are automatically refunded as per the x402 testing protocol.
          </p>
        </div>
      </div>
    </div>
  );
}
