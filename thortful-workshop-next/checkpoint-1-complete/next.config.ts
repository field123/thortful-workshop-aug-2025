import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.thortful.com",
      },
      {
        protocol: "https",
        hostname: "images-fe.thortful.com",
      },
      {
        protocol: "https",
        hostname: "strapi-media.thortful.com",
      },
      {
        protocol: "https",
        hostname: "files-eu.epusercontent.com",
      },
    ],
  },
};

export default nextConfig;
