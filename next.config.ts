import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "archiver", "@napi-rs/canvas", "pdfjs-dist", "pdf-lib", "fluent-ffmpeg", "canvas", "pdftoimg-js"],
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
