// src/ai/openai.ts
import OpenAI from 'openai';

// Función para obtener la API key en runtime
function getAPIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ OPENAI_API_KEY no está configurada. Las funciones de IA no funcionarán.');
    throw new Error('API key de OpenAI no configurada');
  }
  return apiKey;
}

// Crear instancia de OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Usar directamente la variable de entorno
  timeout: 30000, // 30 segundos timeout
  maxRetries: 3, // Reintentos en caso de error
});

// Función para generar recomendaciones inteligentes usando GPT-4
export async function generateVineyardRecommendations(vineyardData: any, context?: string) {
  try {
    // Verificar que tenemos una API key válida
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('API key de OpenAI no configurada');
    }

    const systemPrompt = `Eres un experto agrónomo especializado en viticultura. 
Tu trabajo es analizar datos de viñedos y generar recomendaciones precisas y actionables.
Responde SIEMPRE en formato JSON con la siguiente estructura:
{
  "recommendations": [
    {
      "id": "unique_id",
      "type": "warning|suggestion|insight|optimization",
      "title": "Título de la recomendación",
      "description": "Descripción detallada",
      "priority": "critical|high|medium|low",
      "confidence": 0.0-1.0,
      "data": {
        "actions": ["acción1", "acción2"],
        "benefits": ["beneficio1", "beneficio2"]
      }
    }
  ],
  "summary": "Resumen general del análisis"
}`;

    const userPrompt = `Analiza los siguientes datos de viñedos y genera recomendaciones específicas:

DATOS DE VIÑEDOS:
${JSON.stringify(vineyardData, null, 2)}

CONTEXTO ADICIONAL:
${context || 'Análisis general de viñedos'}

INSTRUCCIONES:
- Genera máximo 3 recomendaciones
- Prioriza problemas críticos (plagas, enfermedades)
- Considera la época del año (actualmente es agosto, temporada de cosecha)
- Sé específico en las acciones recomendadas
- Incluye nivel de confianza basado en la calidad de los datos`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más económico y eficiente
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.3, // Baja temperatura para respuestas más precisas
      max_tokens: 1500,
      response_format: { type: "json_object" } // Forzar respuesta en JSON
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const parsedResponse = JSON.parse(response);
    
    // Validar estructura de la respuesta
    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      throw new Error('Formato de respuesta inválido de OpenAI');
    }

    // Agregar timestamps y IDs únicos
    const recommendations = parsedResponse.recommendations.map((rec: any, index: number) => ({
      ...rec,
      id: `openai_${Date.now()}_${index}`,
      timestamp: Date.now(),
      source: 'openai_gpt4'
    }));

    return {
      success: true,
      recommendations,
      summary: parsedResponse.summary || 'Análisis completado exitosamente',
      usage: completion.usage
    };

  } catch (error) {
    console.error('Error en OpenAI API:', error);
    
    // Fallback a recomendaciones básicas si OpenAI falla
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido en OpenAI',
      recommendations: [],
      fallback: true
    };
  }
}

// Configuraciones predefinidas para el temperamento de la IA
export const AI_TEMPERAMENTS = {
  creativo: {
    temperature: 0.9,
    top_p: 0.95,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    description: "IA creativa e innovadora, genera ideas originales y soluciones poco convencionales"
  },
  formal: {
    temperature: 0.3,
    top_p: 0.8,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    description: "IA formal y profesional, respuestas estructuradas y técnicas"
  },
  técnico: {
    temperature: 0.4,
    top_p: 0.85,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    description: "IA especializada en aspectos técnicos, datos precisos y análisis detallados"
  },
  directo: {
    temperature: 0.2,
    top_p: 0.7,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    description: "IA directa y concisa, respuestas claras y al punto"
  },
  amigable: {
    temperature: 0.7,
    top_p: 0.9,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    description: "IA amigable y conversacional, tono cálido y accesible"
  }
} as const;

export type TemperamentType = keyof typeof AI_TEMPERAMENTS;
