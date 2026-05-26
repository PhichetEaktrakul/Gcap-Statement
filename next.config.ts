import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["uat-web.gcap.co.th"], // Whitelists cross-origin requests to the dev server only.
};

export default nextConfig;
