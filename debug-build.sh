#!/bin/bash

echo "=== Información del entorno ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"

echo "=== Verificando estructura de directorios ==="
ls -la src/
ls -la src/components/
ls -la src/components/ui/

echo "=== Verificando archivos específicos ==="
ls -la src/components/ui/button.tsx 2>/dev/null && echo "✓ button.tsx existe" || echo "✗ button.tsx no existe"
ls -la src/components/ui/input.tsx 2>/dev/null && echo "✓ input.tsx existe" || echo "✗ input.tsx no existe"
ls -la src/components/ui/card.tsx 2>/dev/null && echo "✓ card.tsx existe" || echo "✗ card.tsx no existe"
ls -la src/components/ui/dropdown-menu.tsx 2>/dev/null && echo "✓ dropdown-menu.tsx existe" || echo "✗ dropdown-menu.tsx no existe"
ls -la src/components/ui/ai-chat-modal.tsx 2>/dev/null && echo "✓ ai-chat-modal.tsx existe" || echo "✗ ai-chat-modal.tsx no existe"

echo "=== Verificando tsconfig.json ==="
cat tsconfig.json

echo "=== Iniciando build ==="
npm run build
