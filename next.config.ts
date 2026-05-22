import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Whitelists cross-origin requests to the dev server only.
  allowedDevOrigins: ["uat-web.gcap.co.th"],
};

export default nextConfig;
