/** @type {import('next').NextConfig} */
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
