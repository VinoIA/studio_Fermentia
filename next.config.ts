import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
    unoptimized: true, // Para deployment en Netlify
  },
  output: 'standalone', // Para mejor compatibilidad con Netlify
  experimental: {
    esmExternals: true,
  },
  // Optimizaciones para Netlify
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  // Manejo de variables de entorno
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
