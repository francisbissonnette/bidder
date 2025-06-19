import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_EBAY_ENVIRONMENT === 'PRODUCTION' 
      ? 'https://api.ebay.com'
      : 'https://api.sandbox.ebay.com';

    // First, get the access token
    const authResponse = await axios.post(
      `${baseUrl}/identity/v1/oauth2/token`,
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.NEXT_PUBLIC_EBAY_CLIENT_ID}:${process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    const token = authResponse.data.access_token;

    const response = await axios.get(
      `${baseUrl}/buy/marketplace_insights/v1/item_price_history/search?item_id=${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_CA',
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching item price history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item price history' },
      { status: 500 }
    );
  }
} 