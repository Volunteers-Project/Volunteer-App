import createNextIntlPlugin from 'next-intl/plugin';

// Load next-intl plugin
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prlugwnrzhywvvhcmjxi.supabase.co', // 👈 Supabase domain
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

// ✅ Combine both configs into one default export
export default withNextIntl(nextConfig);
