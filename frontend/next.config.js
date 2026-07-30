/** @type {import('next').NextConfig} */
const nextConfig = {
  // distDir removed: was 'out' (static export) which `next start` cannot
  // serve. We now build normally to `.next/` and run with `next start`.
  // (Re-enable only if you intend to deploy to a static host like Netlify.)
  output: 'standalone',
  trailingSlash: true,
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    localeDetection: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
