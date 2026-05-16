/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  serverExternalPackages: ['@resvg/resvg-js'],
  images: {
    remotePatterns: [
      { hostname: '*.googleusercontent.com' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: '*.google.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/events', destination: '/calendar', permanent: true },
      { source: '/admin', destination: '/', permanent: false },
      { source: '/admin/:path*', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
