// src/ai/tools/tool-definitions.ts

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
      description: "Crear un nuevo viñedo en el sistema con información detallada",
      parameters: {
        type: "object",
        properties: {
          nombre: {
            type: "string",
            description: "Nombre del viñedo"
          },
          ubicacion: {
            type: "string",
            description: "Ubicación geográfica del viñedo"
          },
          variedadUva: {
            type: "string",
            description: "Variedades de uva cultivadas"
          },
          temperatura: {
            type: "number",
            description: "Temperatura actual en grados Celsius (opcional, por defecto 25°C)"
          },
          humedad: {
            type: "number",
            description: "Humedad relativa en porcentaje (opcional, por defecto 60%)"
          },
          estadoCosecha: {
            type: "string",
            description: "Estado actual de la cosecha: 'Pendiente', 'En progreso', 'Completada' (opcional, por defecto 'Pendiente')"
          },
          fechaCosecha: {
            type: "string",
            description: "Fecha de cosecha en formato YYYY-MM-DD (opcional, por defecto fecha actual)"
          }
        },
        required: ["nombre", "ubicacion", "variedadUva"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "updateVineyard",
      description: "Actualizar información de un viñedo existente usando su ID de la API",
      parameters: {
        type: "object",
        properties: {
          id: { 
            type: "string", 
            description: "ID del viñedo a actualizar (de la API)" 
          },
          nombre: {
            type: "string",
            description: "Nuevo nombre del viñedo (opcional)"
          },
          ubicacion: {
            type: "string",
            description: "Nueva ubicación del viñedo (opcional)"
          },
          variedadUva: {
            type: "string",
            description: "Nuevas variedades de uva (opcional)"
          },
          temperatura: {
            type: "number",
            description: "Nueva temperatura en grados Celsius (opcional)"
          },
          humedad: {
            type: "number",
            description: "Nueva humedad relativa en porcentaje (opcional)"
          },
          estadoCosecha: {
            type: "string",
            description: "Nuevo estado de cosecha: 'Pendiente', 'En progreso', 'Completada' (opcional)"
          },
          fechaCosecha: {
            type: "string",
            description: "Nueva fecha de cosecha en formato YYYY-MM-DD (opcional)"
          }
        },
        required: ["id"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "deleteVineyard",
      description: "Eliminar un viñedo del sistema usando su ID de la API",
      parameters: {
        type: "object",
        properties: {
          id: { 
            type: "string", 
            description: "ID del viñedo a eliminar (de la API)" 
          }
        },
        required: ["id"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getHarvestPredictions",
      description: "Obtener predicciones de cosecha para viñedos específicos o todos",
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
      description: "Analizar datos de viñedos y generar recomendaciones inteligentes basadas en IA",
      parameters: {
        type: "object",
        properties: {
          dataType: {
            type: "string",
            enum: ["vineyard", "harvest", "general"],
            description: "Tipo de análisis a realizar: vineyard (específico de viñedos), harvest (predicciones), general (análisis completo)"
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

export type OpenAIToolName = 
  | "getVineyardInfo"
  | "createVineyard" 
  | "updateVineyard"
  | "deleteVineyard"
  | "getHarvestPredictions"
  | "analyzeDataAndRecommend";

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  action?: any;
  requiresConfirmation?: boolean;
}
