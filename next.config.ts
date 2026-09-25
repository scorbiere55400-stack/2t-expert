import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/scorbiere55400-stack/2t-expert/main/public/**",
      },
    ],
  },
};

export default nextConfig;
