/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_EBAY_CLIENT_ID: process.env.NEXT_PUBLIC_EBAY_CLIENT_ID,
    NEXT_PUBLIC_EBAY_CLIENT_SECRET: process.env.NEXT_PUBLIC_EBAY_CLIENT_SECRET,
  },
}

module.exports = nextConfig 