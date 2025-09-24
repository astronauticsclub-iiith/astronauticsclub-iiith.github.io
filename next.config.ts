const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",      
  // output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clubs.iiit.ac.in',
        pathname: '/astronautics/uploads/**',  // include basePath here!
      },
    ],
  },
};


module.exports = nextConfig;
