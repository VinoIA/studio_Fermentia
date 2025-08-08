import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  // Configuración optimizada para Netlify
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ['genkit'],
};

export default nextConfig;
