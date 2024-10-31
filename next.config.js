/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dashboard.themattressai.com', 'chat.themattressai.com'],
  },
  poweredByHeader: false,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|png)$/i,
      type: 'asset/resource',
    })
    return config
  }
};

module.exports = nextConfig
