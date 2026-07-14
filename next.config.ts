import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* API calls from the browser go to /api-proxy/* (see src/app/api-proxy)
   * so the server can attach the Cookie header the browser refuses to set. */
};

export default nextConfig;
