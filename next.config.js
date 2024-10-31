/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dashboard.themattressai.com', 'chat.themattressai.com'],
  },
  poweredByHeader: false,
  webpack: (config) => {
    config.externals.push({
      'canvas': 'canvas',
      '@napi-rs/canvas': '@napi-rs/canvas',
    });
    return config;
  },
};

module.exports = nextConfig
