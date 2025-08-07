# 🍇 Fermentia - Asistente IA para Viticultura

## 🎯 Descripción

Fermentia es un asistente de IA avanzado especializado en viticultura y gestión de viñedos que utiliza **GPT-4 de OpenAI** para proporcionar análisis inteligentes, recomendaciones y operaciones CRUD sobre los datos de viñedos.

## ✅ Funcionalidades Implementadas

### 🤖 Integración de IA Completa
- **Modelo**: GPT-4 de OpenAI integrado completamente
- **API Key**: Configurada y funcionando
- **Análisis Inteligente**: Procesa datos de viñedos, IoT, predicciones de cosecha
- **Recomendaciones Dinámicas**: Basadas en patrones, historial y contexto actual

### 🔧 Capacidades CRUD
- ✅ **Crear**: Nuevos viñedos (requiere confirmación)
- ✅ **Leer**: Consultar información de viñedos y predicciones
- ✅ **Actualizar**: Modificar viñedos existentes (requiere confirmación)
- ✅ **Eliminar**: Remover viñedos (requiere confirmación)

### 🎨 Interfaz de Chat Avanzada
- **Modal Separado**: Chat en ventana modal profesional, no flotante
- **Pestañas Organizadas**: Chat, Acciones, Historial, Configuración
- **Botones Rápidos**: Acciones predefinidas para análisis común
- **Carga de Archivos**: Soporte para análisis de documentos
- **Historial Completo**: Conversaciones guardadas con metadata

### 🧠 Temperamentos de IA
- **Creativo**: IA innovadora con ideas originales
- **Formal**: Respuestas profesionales y estructuradas
- **Técnico**: Especializada en datos precisos y análisis
- **Directo**: Respuestas concisas y al punto
- **Amigable**: Tono cálido y conversacional

### 📊 Sistema de Recomendaciones
- **Análisis Automático**: Detecta problemas y oportunidades
- **Alertas Inteligentes**: Plagas, condiciones adversas, predicciones bajas
- **Niveles de Confianza**: Cada recomendación incluye porcentaje de confianza
- **Priorización**: Critical, High, Medium, Low
- **Implementación**: Seguimiento de recomendaciones aplicadas

### 🔒 Sistema de Auditoría
- **Logs Completos**: Todas las decisiones de IA registradas
- **Confirmaciones**: Operaciones CRUD requieren aprobación explícita
- **Trazabilidad**: Historial completo de acciones y resultados
- **Sesiones**: Gestión de múltiples conversaciones simultáneas

## 🚀 Configuración

### Variables de Entorno
```env
OPENAI_API_KEY=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
GOOGLE_GENAI_API_KEY=  # Opcional, mantenido para compatibilidad
```

### Instalación
```bash
npm install openai
npm run dev
```

## 🎮 Uso

### 1. Chat Básico
- Abrir el modal de IA desde el botón "Chat con IA"
- Escribir consultas naturales en español
- El asistente responderá con análisis y recomendaciones

### 2. Operaciones CRUD
```
"Crea un viñedo llamado 'Viña Nueva' en Mendoza, Argentina con Malbec"
"Actualiza el viñedo 'Finca Roble Alto' cambiando la ubicación"
"Elimina el viñedo con ID 123"
"Muéstrame información del viñedo 'Valle Esperanza'"
```

### 3. Análisis y Recomendaciones
```
"Analiza el estado actual de mis viñedos"
"¿Hay alertas de plagas?"
"Dame predicciones de cosecha"
"Recomienda optimizaciones para mis viñedos"
```

### 4. Configuración de Temperamento
- Ir a la pestaña "Configuración" en el modal
- Seleccionar el temperamento deseado
- El asistente adaptará su estilo de respuesta

## 🏗️ Arquitectura Técnica

### Componentes Principales
```
src/
├── ai/
│   ├── openai.ts                    # Configuración OpenAI + temperamentos
│   ├── flows/
│   │   └── openai-chat-flow.ts      # Flujo principal de chat
│   └── tools/
│       └── crud-tools.ts            # Herramientas CRUD + análisis
├── components/ui/
│   ├── ai-chat-modal.tsx           # Modal de chat principal
│   └── ai-recommendations.tsx      # Panel de recomendaciones
├── app/
│   └── actions.ts                  # Server Actions para OpenAI
└── types/
    └── index.ts                    # Tipos TypeScript
```

### Herramientas Disponibles para la IA
1. **getVineyardInfo**: Consultar datos de viñedos
2. **createVineyard**: Crear nuevos viñedos
3. **updateVineyard**: Actualizar viñedos existentes
4. **deleteVineyard**: Eliminar viñedos
5. **getHarvestPredictions**: Obtener predicciones ML
6. **analyzeDataAndRecommend**: Análisis y recomendaciones

## 📈 Dashboard Mejorado

### Panel de Recomendaciones
- Análisis automático en tiempo real
- Visualización de alertas prioritarias
- Botones para marcar como implementado
- Actualización manual disponible

### Métricas Inteligentes
- °Brix promedio con predicciones
- Rendimiento esperado calculado
- Viñedos listos para cosecha
- Alertas activas de plagas

## 🔮 Funcionalidades Futuras Implementadas

### ✅ Ya Disponible
- Sistema de logs de decisiones IA
- Configuración de temperamentos
- Gestión de sesiones de chat
- Confirmaciones de acciones CRUD
- Análisis contextual de datos

### 🚧 Posibles Mejoras
- Entrenamiento supervisado con feedback
- Integración con más APIs de clima
- Análisis de imágenes de viñedos
- Reportes PDF automatizados

## 🛠️ Comandos Útiles

```bash
npm run dev          # Servidor desarrollo
npm run build        # Build producción
npm run typecheck    # Verificar tipos TypeScript
npm run lint         # Verificar código
```

## 📞 Soporte

El asistente Fermentia está completamente operativo y listo para:
- Gestionar viñedos con confirmaciones de seguridad
- Analizar datos en tiempo real
- Generar recomendaciones inteligentes
- Proporcionar predicciones de cosecha
- Mantener auditoría completa de acciones

¡Disfruta tu nuevo asistente de IA especializado en viticultura! 🍷
