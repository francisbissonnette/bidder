import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_EBAY_ENVIRONMENT === 'PRODUCTION' 
      ? 'https://api.ebay.com'
      : 'https://api.sandbox.ebay.com';

    const response = await axios.post(
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

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error getting eBay access token:', error);
    return NextResponse.json(
      { error: 'Failed to get eBay access token' },
      { status: 500 }
    );
  }
} 
 