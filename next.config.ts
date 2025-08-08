import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: false,
  },
  webpack: (config, { isServer }) => {
    // Mejorar la resolución de módulos
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Asegurar que las extensiones estén bien configuradas
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    
    return config;
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
