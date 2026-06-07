import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "..", ".."),
  transpilePackages: ["@techbold/contracts"],
  turbopack: {
    root: path.join(import.meta.dirname, "..", ".."),
    rules: {
      "*.ts": { loaders: ["./turbopack-strip-js-ext.cjs"] },
    },
  },
};

export default nextConfig;
