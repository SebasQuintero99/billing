import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desactivar Turbopack debido a error en Windows
  // Error: node process exited with code 0xc0000142
  // https://github.com/vercel/next.js/issues/...
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
