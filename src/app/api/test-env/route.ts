import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.NEXT_PUBLIC_EBAY_CLIENT_ID,
    hasClientSecret: !!process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
} 