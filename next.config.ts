/** @type {import('next').NextConfig} */
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url));

await jiti.import("./env");

const nextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows ALL external domains (easy for development)
      },
    ],
  },
};

export default nextConfig;
