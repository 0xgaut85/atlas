import { NextRequest, NextResponse } from 'next/server';
import { payaiClient } from '@/lib/payai-client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const network = searchParams.get('network');
    const category = searchParams.get('category');
    
    console.log('🔍 Foundry catalog request:', { network, category });
    
    // Use PayAI client to discover services
    const result = await payaiClient.discoverServices();
    
    if (result.success && result.data) {
      // Filter for tokens only (category === 'Tokens')
      let tokens = result.data.filter((service: any) => service.category === 'Tokens');
      
      console.log(`📊 Found ${tokens.length} tokens before filtering`);
      
      // Apply network filter if provided
      if (network && network !== 'all') {
        tokens = tokens.filter((token: any) => token.price?.network === network);
        console.log(`📊 After network filter (${network}): ${tokens.length} tokens`);
      }
      
      // Apply category filter if provided (should already be 'Tokens' but double-check)
      if (category) {
        tokens = tokens.filter((token: any) => token.category === category);
        console.log(`📊 After category filter (${category}): ${tokens.length} tokens`);
      }
      
      // Format tokens for frontend
      const formatted = tokens.map((token: any) => ({
        id: token.id,
        name: token.name,
        description: token.description,
        category: token.category,
        network: token.price?.network,
        price: token.price,
        endpoint: token.endpoint,
        accepts: token.accepts,
        metadata: token.metadata,
      }));
      
      console.log(`✅ Returning ${formatted.length} tokens`);
      if (formatted.length > 0) {
        console.log('📋 Sample tokens:', formatted.slice(0, 3).map((t: any) => ({ name: t.name, network: t.network })));
      }
      
      return NextResponse.json({
        success: true,
        data: formatted,
        count: formatted.length,
      });
    } else {
      console.error('❌ Discovery failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to discover tokens',
        data: [],
        count: 0,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Error in foundry catalog:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch token catalog',
      data: [],
      count: 0,
    }, { status: 500 });
  }
}

