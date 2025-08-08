import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Cambiar a false para evitar errores en producción
  },
  eslint: {
    ignoreDuringBuilds: false, // Cambiar a false para mejor calidad de código
  },
  experimental: {
    typedRoutes: false,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:9003', '*.netlify.app'],
      bodySizeLimit: '2mb',
    }
  },
  webpack: (config, { isServer }) => {
    // Mejorar la resolución de módulos
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Asegurar que las extensiones estén bien configuradas
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    
    // Optimización para OpenAI y otras librerías
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
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
  // Configuración optimizada para deployment
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ['genkit'],
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Headers para mejorar seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
