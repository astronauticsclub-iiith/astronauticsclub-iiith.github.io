import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.json": {
        loaders: ["raw-loader"],
      },
    },
    // Suppress HMR warnings for specific files - blogs json compatibility
    resolveExtensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },
};

export default nextConfig;
