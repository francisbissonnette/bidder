import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface SearchParams {
  keywords: string;
  filters?: {
    priceRange?: {
      min: number;
      max: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = await request.json();
    console.log('Received search request with params:', searchParams);

    if (!searchParams.keywords) {
      return NextResponse.json(
        { success: false, error: 'Keywords are required' },
        { status: 400 }
      );
    }

    // Get eBay API credentials from environment variables
    const clientId = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET;
    const baseUrl = process.env.EBAY_API_URL || 'https://api.sandbox.ebay.com';

    console.log('Using eBay API URL:', baseUrl);
    console.log('Client ID available:', !!clientId);
    console.log('Client Secret available:', !!clientSecret);

    if (!clientId || !clientSecret) {
      console.error('Missing eBay API credentials');
      return NextResponse.json(
        { success: false, error: 'eBay API credentials not configured' },
        { status: 500 }
      );
    }

    console.log('Getting eBay access token...');
    // Get OAuth token
    const tokenResponse = await axios.post(
      `${baseUrl}/identity/v1/oauth2/token`,
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope/buy.marketplace.insights',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        }
      }
    );

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', {
      hasAccessToken: !!tokenResponse.data.access_token,
      tokenType: tokenResponse.data.token_type,
      expiresIn: tokenResponse.data.expires_in
    });

    const accessToken = tokenResponse.data.access_token;
    console.log('Access token received');

    // Construct query parameters for Marketplace Insights API
    const queryParams = new URLSearchParams({
      q: searchParams.keywords.trim(),
      limit: '100' // Maximum items per request
    });

    const searchUrl = `${baseUrl}/buy/marketplace_insights/v1_beta/item_sales/search?${queryParams.toString()}`;
    console.log('Making search request to:', searchUrl);

    try {
      // Make the search request
      const searchResponse = await axios.get(
        searchUrl,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_CA'
          }
        }
      );

      console.log('Search response:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        hasData: !!searchResponse.data,
        dataKeys: searchResponse.data ? Object.keys(searchResponse.data) : [],
        total: searchResponse.data?.total,
        rawResponse: searchResponse.data // Log the entire response for debugging
      });

      if (!searchResponse.data) {
        throw new Error('Empty response from eBay API');
      }

      // Check for warnings in the response
      if (searchResponse.data.warnings) {
        console.warn('eBay API warnings:', searchResponse.data.warnings);
      }

      // If we have no items but no errors, return empty array
      if (!searchResponse.data.item_sales) {
        console.log('No items found in response');
        return NextResponse.json({
          success: true,
          items: [],
          total: searchResponse.data.total || 0
        });
      }

      if (!Array.isArray(searchResponse.data.item_sales)) {
        console.error('Unexpected response format:', searchResponse.data);
        throw new Error('Unexpected response format from eBay API');
      }

      console.log(`Found ${searchResponse.data.item_sales.length} items`);

      return NextResponse.json({
        success: true,
        items: searchResponse.data.item_sales.map((item: any) => ({
          itemId: item.item_id,
          title: item.title,
          price: {
            value: item.last_sold_price.value,
            currency: item.last_sold_price.currency
          },
          lastSoldDate: item.last_sold_date,
          condition: item.condition,
          categoryId: item.category_id,
          itemWebUrl: item.item_web_url,
          image: item.image?.image_url,
          seller: {
            username: item.seller?.username,
            feedbackScore: item.seller?.feedback_score
          }
        })),
        total: searchResponse.data.total || 0
      });
    } catch (searchError: any) {
      console.error('eBay search error:', {
        message: searchError.message,
        response: searchError.response?.data,
        status: searchError.response?.status,
        statusText: searchError.response?.statusText,
        headers: searchError.response?.headers,
        config: searchError.config
      });
      throw searchError;
    }
  } catch (error: any) {
    console.error('Error in search API:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.response?.data || 'No additional details available'
      },
      { status: 500 }
    );
  }
} 