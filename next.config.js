/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dashboard.themattressai.com', 'chat.themattressai.com'],
  },
  poweredByHeader: false,
  output: 'standalone',
};

module.exports = nextConfig
