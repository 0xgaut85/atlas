import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment, create402Response } from '../middleware';
import { payaiClient } from '@/lib/payai-client';

/**
 * x402 Service Monitor / Uptime Checker
 * 
 * Monitors health and availability of x402 services
 * - Checks service uptime
 * - Measures response times
 * - Tracks payment success rates
 * - Provides health scores
 * 
 * Access: $1.00 USDC
 */

interface ServiceHealth {
  endpoint: string;
  name?: string;
  status: 'online' | 'offline' | 'error';
  responseTime?: number;
  lastChecked: string;
  paymentSuccess: boolean;
  errors?: string[];
}

export async function GET(req: NextRequest) {
  // Verify payment access
  const verification = await verifyX402Payment(req, '$1.00');
  
  if (!verification.valid) {
    return create402Response(req, '$1.00', 'Monitor x402 service health and uptime', ['base']);
  }

  try {
    // Get all services from discovery
    const discoveryResult = await payaiClient.discoverServices();
    
    if (!discoveryResult.success || !discoveryResult.data) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch services from discovery',
      }, { status: 500 });
    }

    const services = discoveryResult.data;
    const healthChecks: ServiceHealth[] = [];

    // Check up to 20 services (to avoid timeout)
    const servicesToCheck = services.slice(0, 20);

    // Parallel health checks with timeout
    const checkPromises = servicesToCheck.map(async (service): Promise<ServiceHealth> => {
      const startTime = Date.now();
      const health: ServiceHealth = {
        endpoint: service.endpoint,
        name: service.name,
        status: 'offline',
        lastChecked: new Date().toISOString(),
        paymentSuccess: false,
        errors: [],
      };

      try {
        // Set 5 second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(service.endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        health.responseTime = responseTime;
        health.status = response.status === 402 ? 'online' : 'offline';

        if (response.status === 402) {
          try {
            const paymentInfo = await response.json();
            if (paymentInfo.accepts && Array.isArray(paymentInfo.accepts) && paymentInfo.accepts.length > 0) {
              health.paymentSuccess = true;
            } else {
              health.errors?.push('Invalid payment requirements structure');
            }
          } catch (e) {
            health.errors?.push('Invalid JSON in 402 response');
          }
        } else {
          health.errors?.push(`Expected 402, got ${response.status}`);
        }
      } catch (error: any) {
        health.status = 'error';
        if (error.name === 'AbortError') {
          health.errors?.push('Request timeout (>5s)');
        } else {
          health.errors?.push(error.message || 'Unknown error');
        }
      }

      return health;
    });

    const results = await Promise.all(checkPromises);

    // Calculate statistics
    const onlineCount = results.filter(r => r.status === 'online').length;
    const offlineCount = results.filter(r => r.status === 'offline').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const avgResponseTime = results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.filter(r => r.responseTime).length || 0;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        total: results.length,
        online: onlineCount,
        offline: offlineCount,
        errors: errorCount,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: `${((onlineCount / results.length) * 100).toFixed(1)}%`,
      },
      services: results.sort((a, b) => {
        // Sort by status: online first, then by response time
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return (a.responseTime || 9999) - (b.responseTime || 9999);
      }),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

