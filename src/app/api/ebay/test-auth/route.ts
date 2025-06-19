import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
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

    // Test the token with a simple API call
    const testResponse = await axios.get(
      `${baseUrl}/buy/browse/v1/item_summary/search?q=baseball+card&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_CA',
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'eBay credentials are valid',
      token: token,
      testResponse: testResponse.data
    });
  } catch (error: any) {
    console.error('Error testing eBay credentials:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data || error.message,
        details: 'Please check your eBay API credentials and environment settings'
      },
      { status: 500 }
    );
  }
} 