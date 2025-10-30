'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { createX402Client } from '@/lib/x402-client';
import { PaymentGateModal } from '@/app/components/x402/PaymentGateModal';

export default function ServiceMonitorPage() {
  const { address, isConnected } = useAppKitAccount();
  const [loading, setLoading] = useState(false);
  const [monitorData, setMonitorData] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMonitorData = async () => {
    setLoading(true);
    try {
      const x402Fetch = createX402Client((window as any).ethereum);
      const response = await x402Fetch('/api/x402/service-monitor');
      const data = await response.json();
      setMonitorData(data);
      if (data.success) {
        setHasAccess(true);
      }
    } catch (error: any) {
      console.error('Monitor error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess && autoRefresh) {
      const interval = setInterval(fetchMonitorData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [hasAccess, autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-700';
      case 'offline': return 'bg-yellow-100 text-yellow-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">x402 Service Monitor</h1>
            <p className="text-gray-600">Real-time health and uptime monitoring for x402 services</p>
          </div>
          {hasAccess && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Auto-refresh (30s)</span>
              </label>
              <button
                onClick={fetchMonitorData}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Checking...' : 'Refresh'}
              </button>
            </div>
          )}
        </div>

        {!hasAccess && (
          <PaymentGateModal
            pageName="Service Monitor"
            pageId="service-monitor"
            isOpen={!hasAccess}
            onSuccess={() => {
              setHasAccess(true);
              fetchMonitorData();
            }}
            onClose={() => {}}
            userAddress={address || ''}
          />
        )}

        {hasAccess && monitorData && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border-2 border-black p-4">
                <div className="text-2xl font-bold text-black">{monitorData.stats?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Services</div>
              </div>
              <div className="bg-white border-2 border-green-600 p-4">
                <div className="text-2xl font-bold text-green-600">{monitorData.stats?.online || 0}</div>
                <div className="text-sm text-gray-600">Online</div>
              </div>
              <div className="bg-white border-2 border-yellow-600 p-4">
                <div className="text-2xl font-bold text-yellow-600">{monitorData.stats?.offline || 0}</div>
                <div className="text-sm text-gray-600">Offline</div>
              </div>
              <div className="bg-white border-2 border-black p-4">
                <div className="text-2xl font-bold text-black">{monitorData.stats?.avgResponseTime || 0}ms</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>

            {/* Services List */}
            <div className="bg-white border-2 border-black">
              <div className="p-4 border-b-2 border-black">
                <h2 className="text-xl font-bold text-black">Service Health Status</h2>
              </div>
              <div className="divide-y-2 divide-black">
                {monitorData.services?.map((service: any, idx: number) => (
                  <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(service.status)}`}>
                            {service.status.toUpperCase()}
                          </span>
                          <span className="font-medium text-black">{service.name || 'Unknown Service'}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-mono break-all">{service.endpoint}</div>
                        {service.errors && service.errors.length > 0 && (
                          <div className="mt-2 text-xs text-red-600">
                            {service.errors.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {service.responseTime && (
                          <div className="text-sm font-medium text-black">{service.responseTime}ms</div>
                        )}
                        {service.paymentSuccess && (
                          <div className="text-xs text-green-600">✓ Payment OK</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

