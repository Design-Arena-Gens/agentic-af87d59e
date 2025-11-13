/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
  reactStrictMode: true,
  images: { remotePatterns: [] }
};

module.exports = nextConfig;
