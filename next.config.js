/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure Content Security Policy
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development'
              ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
              : "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

