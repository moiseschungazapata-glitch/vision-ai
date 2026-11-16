/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  allowedDevOrigins: ["192.168.100.7", "127.0.0.1", "localhost"],
  turbopack: {
    root: appRoot,
  },
};

export default nextConfig;
