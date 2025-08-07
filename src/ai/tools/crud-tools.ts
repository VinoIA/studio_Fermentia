// src/ai/tools/crud-tools.ts
'use server';

import { createVineyard, updateVineyard, deleteVineyard, getAllVineyards } from '@/app/vineyard-actions';
import type { AIAction } from '@/types';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  action?: AIAction;
  requiresConfirmation?: boolean;
}

// Herramienta para leer datos de viñedos
export async function getVineyardInfo(params: { vineyardName?: string }): Promise<ToolResult> {
  try {
    const data = getVineyardData(params.vineyardName);
    return {
      success: true,
      data,
      action: {
        id: Date.now().toString(),
        type: 'READ',
        entity: 'vineyard',
        description: `Consulta de información de ${params.vineyardName || 'todos los viñedos'}`,
        data: { vineyardName: params.vineyardName },
        timestamp: Date.now(),
        executed: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      action: {
        id: Date.now().toString(),
        type: 'READ',
        entity: 'vineyard',
        description: `Error al consultar ${params.vineyardName || 'viñedos'}`,
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Herramienta para crear nuevos viñedos
export async function createVineyard(params: {
  name: string;
  location: string;
  grapeVarietals: string;
  totalPlots?: number;
}): Promise<ToolResult> {
  return {
    success: true,
    data: params,
    requiresConfirmation: true,
    action: {
      id: Date.now().toString(),
      type: 'CREATE',
      entity: 'vineyard',
      description: `Crear nuevo viñedo: ${params.name} en ${params.location}`,
      data: params,
      timestamp: Date.now(),
      confirmation: true,
      executed: false
    }
  };
}

// Herramienta para actualizar viñedos
export async function updateVineyard(params: {
  vineyardId: string;
  updates: Partial<Vineyard>;
}): Promise<ToolResult> {
  return {
    success: true,
    data: params,
    requiresConfirmation: true,
    action: {
      id: Date.now().toString(),
      type: 'UPDATE',
      entity: 'vineyard',
      description: `Actualizar viñedo ID: ${params.vineyardId}`,
      data: params,
      timestamp: Date.now(),
      confirmation: true,
      executed: false
    }
  };
}

// Herramienta para eliminar viñedos
export async function deleteVineyard(params: { vineyardId: string }): Promise<ToolResult> {
  return {
    success: true,
    data: params,
    requiresConfirmation: true,
    action: {
      id: Date.now().toString(),
      type: 'DELETE',
      entity: 'vineyard',
      description: `Eliminar viñedo ID: ${params.vineyardId}`,
      data: params,
      timestamp: Date.now(),
      confirmation: true,
      executed: false
    }
  };
}

// Herramienta para obtener predicciones de cosecha
export async function getHarvestPredictions(params: { vineyardId?: string }): Promise<ToolResult> {
  try {
    let data;
    if (params.vineyardId) {
      data = getHarvestPrediction(params.vineyardId);
    } else {
      data = getAllHarvestPredictions();
    }

    return {
      success: true,
      data,
      action: {
        id: Date.now().toString(),
        type: 'READ',
        entity: 'prediction',
        description: `Obtener predicciones de cosecha ${params.vineyardId ? 'para viñedo específico' : 'para todos los viñedos'}`,
        data: params,
        timestamp: Date.now(),
        executed: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener predicciones',
      action: {
        id: Date.now().toString(),
        type: 'READ',
        entity: 'prediction',
        description: 'Error al obtener predicciones de cosecha',
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Herramienta para análisis de datos y recomendaciones
export async function analyzeDataAndRecommend(params: {
  dataType: 'vineyard' | 'harvest' | 'general';
  context?: string;
}): Promise<ToolResult> {
  try {
    let analysisData;
    const recommendations: AIRecommendation[] = [];

    switch (params.dataType) {
      case 'vineyard':
        analysisData = getVineyardData();
        if (Array.isArray(analysisData)) {
          // Analizar plagas
          const vineyardsWithPests = analysisData.filter(v => v.alerta_plagas);
          if (vineyardsWithPests.length > 0) {
            recommendations.push({
              id: Date.now().toString(),
              type: 'warning',
              title: 'Alerta de Plagas Detectada',
              description: `Se detectaron plagas en ${vineyardsWithPests.length} viñedo(s): ${vineyardsWithPests.map(v => v.nombre).join(', ')}`,
              priority: 'high',
              data: vineyardsWithPests,
              confidence: 0.9,
              timestamp: Date.now()
            });
          }

          // Analizar predicciones de °Brix bajas
          const lowBrixVineyards = analysisData.filter(v => v.prediccion_brix && v.prediccion_brix < 20);
          if (lowBrixVineyards.length > 0) {
            recommendations.push({
              id: (Date.now() + 1).toString(),
              type: 'suggestion',
              title: 'Predicción de °Brix Baja',
              description: `${lowBrixVineyards.length} viñedo(s) presentan predicciones de °Brix por debajo de 20`,
              priority: 'medium',
              data: lowBrixVineyards,
              confidence: 0.8,
              timestamp: Date.now()
            });
          }
        }
        break;

      case 'harvest':
        analysisData = getAllHarvestPredictions();
        // Analizar predicciones de cosecha
        Object.entries(analysisData).forEach(([vineyardId, prediction]: [string, any]) => {
          if (prediction.confidence_brix < 0.7) {
            recommendations.push({
              id: `${Date.now()}_${vineyardId}`,
              type: 'warning',
              title: 'Baja Confianza en Predicción de °Brix',
              description: `La predicción de °Brix para el viñedo ${vineyardId} tiene baja confianza (${(prediction.confidence_brix * 100).toFixed(1)}%)`,
              priority: 'medium',
              data: prediction,
              confidence: prediction.confidence_brix,
              timestamp: Date.now()
            });
          }
        });
        break;

      default:
        analysisData = {
          vineyards: getVineyardData(),
          predictions: getAllHarvestPredictions()
        };
    }

    return {
      success: true,
      data: {
        analysis: analysisData,
        recommendations,
        summary: `Se analizaron datos de tipo ${params.dataType} y se generaron ${recommendations.length} recomendaciones`
      },
      action: {
        id: Date.now().toString(),
        type: 'READ',
        entity: 'report',
        description: `Análisis de datos y generación de recomendaciones para ${params.dataType}`,
        data: params,
        timestamp: Date.now(),
        executed: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en el análisis',
      action: {
        id: Date.now().toString(),
        type: 'READ',
        entity: 'report',
        description: 'Error en análisis de datos',
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Definición de herramientas para OpenAI siguiendo el formato oficial
export const OPENAI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "getVineyardInfo",
      description: "Obtener información detallada sobre viñedos, incluyendo datos de IoT, plagas y condiciones actuales",
      parameters: {
        type: "object",
        properties: {
          vineyardName: {
            type: "string",
            description: "Nombre específico del viñedo. Si no se proporciona, devuelve información de todos los viñedos"
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "createVineyard",
      description: "Crear un nuevo viñedo en el sistema. Requiere confirmación del usuario",
      parameters: {
        type: "object",
        properties: {
          name: { 
            type: "string", 
            description: "Nombre del viñedo" 
          },
          location: { 
            type: "string", 
            description: "Ubicación del viñedo" 
          },
          grapeVarietals: { 
            type: "string", 
            description: "Variedades de uva separadas por comas" 
          },
          totalPlots: { 
            type: "number", 
            description: "Número total de parcelas (opcional)" 
          }
        },
        required: ["name", "location", "grapeVarietals"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "updateVineyard",
      description: "Actualizar información de un viñedo existente. Requiere confirmación del usuario",
      parameters: {
        type: "object",
        properties: {
          vineyardId: { 
            type: "string", 
            description: "ID del viñedo a actualizar" 
          },
          updates: {
            type: "object",
            description: "Campos a actualizar",
            properties: {
              name: { type: "string" },
              location: { type: "string" },
              grapeVarietals: { type: "string" },
              totalPlots: { type: "number" }
            },
            additionalProperties: false
          }
        },
        required: ["vineyardId", "updates"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "deleteVineyard",
      description: "Eliminar un viñedo del sistema. Requiere confirmación del usuario",
      parameters: {
        type: "object",
        properties: {
          vineyardId: { 
            type: "string", 
            description: "ID del viñedo a eliminar" 
          }
        },
        required: ["vineyardId"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getHarvestPredictions",
      description: "Obtener predicciones de cosecha basadas en modelos de Machine Learning",
      parameters: {
        type: "object",
        properties: {
          vineyardId: {
            type: "string",
            description: "ID específico del viñedo. Si no se proporciona, devuelve predicciones de todos los viñedos"
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "analyzeDataAndRecommend",
      description: "Analizar datos existentes y generar recomendaciones inteligentes basadas en patrones y contexto",
      parameters: {
        type: "object",
        properties: {
          dataType: {
            type: "string",
            enum: ["vineyard", "harvest", "general"],
            description: "Tipo de datos a analizar"
          },
          context: {
            type: "string",
            description: "Contexto adicional para el análisis (opcional)"
          }
        },
        required: ["dataType"],
        additionalProperties: false
      }
    }
  }
] as const;

// Función para ejecutar herramientas
export async function executeAITool(toolName: string, params: any): Promise<ToolResult> {
  switch (toolName) {
    case 'getVineyardInfo':
      return getVineyardInfo(params);
    case 'createVineyard':
      return createVineyard(params);
    case 'updateVineyard':
      return updateVineyard(params);
    case 'deleteVineyard':
      return deleteVineyard(params);
    case 'getHarvestPredictions':
      return getHarvestPredictions(params);
    case 'analyzeDataAndRecommend':
      return analyzeDataAndRecommend(params);
    default:
      return {
        success: false,
        error: `Herramienta desconocida: ${toolName}`,
        action: {
          id: Date.now().toString(),
          type: 'READ',
          entity: 'vineyard',
          description: `Error: herramienta desconocida ${toolName}`,
          timestamp: Date.now(),
          executed: false
        }
      };
  }
}
