#!/bin/bash
# Netlify Build Script para Studio Fermentia

echo "🚀 Iniciando build de Studio Fermentia..."

# Configurar variables de entorno
export NODE_VERSION=18
export NEXT_TELEMETRY_DISABLED=1
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false

# Verificar versión de Node
node --version
npm --version

echo "📦 Instalando dependencias..."
# Limpiar cache de npm
npm cache clean --force

# Instalar dependencias con resolución legacy
npm ci --legacy-peer-deps --no-optional

echo "🔨 Ejecutando build..."
npm run build

echo "✅ Build completado exitosamente!"
