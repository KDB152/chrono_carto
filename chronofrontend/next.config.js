/** @type {import('next').NextConfig} */
const nextConfig = {

  // Allow cross-origin requests from your domain
  allowedDevOrigins: ['www.chronocarto.tn', '51.77.195.224'],
  images: {
    domains: ['localhost'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3001 http://51.77.195.224:3001; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
          {
            key: 'Viewport-Width',
            value: 'device-width',
          },
          {
            key: 'X-UA-Compatible',
            value: 'IE=edge',
          },
        ],
      },
    ];
  },
  async rewrites() {
    // En production, utilisez l'URL de l'API déployée sur votre VPS
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || 'http://51.77.195.224:3001'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
