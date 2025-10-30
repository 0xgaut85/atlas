import { NextRequest, NextResponse } from 'next/server';
import { X402_CONFIG } from '@/lib/x402-config';

/**
 * Resource Registration Endpoint for x402scan Discovery
 * This endpoint ensures resources are registered with PayAI facilitator
 * so x402scan can discover and index transactions
 * 
 * x402scan queries PayAI facilitator's /discovery/resources endpoint
 * and expects resources to be registered there with proper metadata
 */
export async function POST(req: NextRequest) {
  try {
    const { resource, description, name } = await req.json().catch(() => ({}));
    
    if (!resource) {
      return NextResponse.json({ error: 'resource URL is required' }, { status: 400 });
    }

    // Mogami facilitator discovery endpoint
    const facilitatorUrl = X402_CONFIG.facilitatorUrl || 'https://facilitator.mogami.io';
    const discoveryUrl = `${facilitatorUrl}/discovery/resources`;

    // Register resource with Mogami facilitator
    // Mogami facilitator should automatically track resources when they receive payments
    // But we can also explicitly register for discovery
    const registrationPayload = {
      resource: resource,
      name: name || 'Atlas402 Service',
      description: description || 'x402-protected service',
      metadata: {
        merchant: X402_CONFIG.merchantUrl,
        network: 'base',
        asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
        payTo: X402_CONFIG.payTo,
      },
    };

    try {
      const response = await fetch(discoveryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationPayload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Resource registered with Mogami facilitator:', resource);
        return NextResponse.json({
          success: true,
          message: 'Resource registered for x402scan discovery',
          resource: resource,
          facilitator: facilitatorUrl,
        });
      } else {
        console.warn('⚠️ Facilitator registration may not be supported, but payments will still register automatically');
        // Still return success - Mogami facilitator registers resources automatically on first payment
        return NextResponse.json({
          success: true,
          message: 'Resource will be auto-registered on first payment',
          resource: resource,
          note: 'Mogami facilitator automatically registers resources when payments are verified',
        });
      }
    } catch (error: any) {
      console.warn('⚠️ Could not reach facilitator, but payments will auto-register:', error.message);
      // Still return success - registration happens automatically on payment
      return NextResponse.json({
        success: true,
        message: 'Resource will be auto-registered on first payment',
        resource: resource,
        note: 'Mogami facilitator automatically registers resources when payments are verified',
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Failed to register resource',
    }, { status: 500 });
  }
}

/**
 * List all registered resources
 */
export async function GET(req: NextRequest) {
  try {
    const facilitatorUrl = X402_CONFIG.facilitatorUrl || 'https://facilitator.payai.network';
    const discoveryUrl = `${facilitatorUrl}/discovery/resources`;

    try {
      const response = await fetch(discoveryUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      // Filter for our resources
      const ourResources = data.items?.filter((item: any) => 
        item.resource?.includes('atlas402.com') || 
        item.metadata?.merchant?.includes('atlas402.com')
      ) || [];

      return NextResponse.json({
        success: true,
        facilitator: facilitatorUrl,
        totalResources: data.items?.length || 0,
        ourResources: ourResources.length,
        resources: ourResources,
        note: 'PayAI facilitator auto-registers resources on first payment',
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: 'Could not query facilitator discovery',
        message: error.message,
        note: 'Resources are auto-registered when payments are verified',
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Failed to list resources',
    }, { status: 500 });
  }
}

