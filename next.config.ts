const nextConfig = {
  output: 'standalone',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clubs.iiit.ac.in',
        pathname: '/astronautics/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;