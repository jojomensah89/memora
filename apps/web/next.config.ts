import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: ["shiki", "better-auth"],
  webpack: (config) => {
    // Alias better-auth/react to use CommonJS version for React 19 compatibility
    config.resolve.alias = {
      ...config.resolve.alias,
      "better-auth/react": path.resolve(
        __dirname,
        "node_modules/better-auth/dist/client/react/index.cjs"
      ),
    };
    return config;
  },
};

export default nextConfig;
