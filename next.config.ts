const nextConfig = {
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    reactStrictMode: true,
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "clubs.iiit.ac.in",
                pathname: "/astronautics/uploads/**",
            },
        ],
    },
};

module.exports = nextConfig;
