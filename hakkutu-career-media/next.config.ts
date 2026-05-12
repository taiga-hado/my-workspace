import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/column",
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/:path*",
          destination: "https://hakkutu-career.com/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
