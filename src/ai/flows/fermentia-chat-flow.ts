// src/ai/flows/fermentia-chat-flow.ts

'use server';
/**
 * @fileOverview Fermentia, un experto en IA en viticultura con capacidades de predicción de cosecha.
 *
 * - chatWithFermentia - Una función para chatear con Fermentia.
 * - FermentiaChatInput - El tipo de entrada para la función de chat.
 * - FermentiaChatOutput - El tipo de retorno para la función de chat.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getVineyardData, getHarvestPrediction, getAllHarvestPredictions } from '@/lib/data';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'tool']),
  content: z.string(),
});

const FermentiaChatInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string(),
});
export type FermentiaChatInput = z.infer<typeof FermentiaChatInputSchema>;

const FermentiaChatOutputSchema = z.object({
  text: z.string().describe("La respuesta del asistente de IA."),
});
export type FermentiaChatOutput = z.infer<typeof FermentiaChatOutputSchema>;


const vineyardInfoTool = ai.defineTool(
  {
    name: 'getVineyardInfo',
    description: 'Obtener información sobre los viñedos, incluidas alertas de plagas, variedades de uva y otros datos de IoT.',
    inputSchema: z.object({
      vineyardName: z.string().optional().describe('El nombre de un viñedo específico para obtener información.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    return getVineyardData(input?.vineyardName);
  }
);

const harvestPredictionTool = ai.defineTool(
  {
    name: 'getHarvestPredictions',
    description: 'Obtener predicciones de cosecha incluyendo °Brix, rendimiento y recomendaciones para un viñedo específico o todos los viñedos.',
    inputSchema: z.object({
      vineyardName: z.string().optional().describe('El nombre de un viñedo específico. Si no se proporciona, devuelve predicciones para todos.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    if (input?.vineyardName) {
      // Buscar el ID del viñedo por nombre
      const vineyards = getVineyardData();
      const vineyard = Array.isArray(vineyards) ? 
        vineyards.find(v => v.nombre.toLowerCase().includes(input.vineyardName!.toLowerCase())) :
        null;
      
      if (!vineyard) {
        return { error: "Viñedo no encontrado para predicciones" };
      }
      
      // Encontrar el ID real del viñedo
      const allVineyards = getVineyardData();
      const vineyardId = Array.isArray(allVineyards) ? 
        allVineyards.findIndex(v => v.nombre === vineyard.nombre) + 1 : 
        null;
      
      if (!vineyardId) {
        return { error: "No se pudo obtener ID del viñedo" };
      }
      
      const prediction = getHarvestPrediction(vineyardId.toString());
      return {
        viñedo: vineyard.nombre,
        prediccion: prediction
      };
    } else {
      // Devolver todas las predicciones
      const allPredictions = getAllHarvestPredictions();
      const vineyardData = getVineyardData();
      
      if (!Array.isArray(vineyardData)) {
        return { error: "Error al obtener datos de viñedos" };
      }
      
      return vineyardData.map((v, index) => ({
        nombre: v.nombre,
        ubicacion: v.ubicacion,
        prediccion_brix: allPredictions[(index + 1).toString()]?.brix_next_7d,
        prediccion_rendimiento: allPredictions[(index + 1).toString()]?.yield_final,
        recomendacion: allPredictions[(index + 1).toString()]?.harvest_recommendation,
        confianza_brix: allPredictions[(index + 1).toString()]?.confidence_brix,
        confianza_rendimiento: allPredictions[(index + 1).toString()]?.confidence_yield
      }));
    }
  }
);


// Función de chat simple y no transmitida por streaming
export async function chatWithFermentia(history: z.infer<typeof MessageSchema>[], message: string): Promise<FermentiaChatOutput> {
  return fermentiaChatFlow({ history, message });
}

const fermentiaChatFlow = ai.defineFlow(
  {
    name: 'fermentiaChatFlow',
    inputSchema: FermentiaChatInputSchema,
    outputSchema: FermentiaChatOutputSchema,
  },
  async (input) => {
    // Construir el prompt manualmente
    let conversationContext = '';
    for (const msg of input.history) {
      conversationContext += `${msg.role}: ${msg.content}\n`;
    }
    conversationContext += `user: ${input.message}\n`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      tools: [vineyardInfoTool, harvestPredictionTool],
      system: `Eres Fermentia, un asistente experto en IA especializado en viticultura (cultivo de viñedos) y predicción de cosechas. Tu función es proporcionar consejos expertos, responder preguntas y ofrecer sugerencias relacionadas con el cultivo de uvas, la gestión de viñedos y las predicciones de cosecha.

Habla siempre en español.

Tienes acceso a:
1. Datos en tiempo real de los viñedos del usuario (getVineyardInfo)
2. Predicciones de cosecha basadas en algoritmos de Machine Learning:
   - Modelo Random Forest para predicción de °Brix a 7 días
   - Modelo XGBoost para predicción de rendimiento final (kg/ha)
   - Recomendaciones de cosecha basadas en las predicciones

Cuando te pregunten sobre predicciones de cosecha, utiliza la herramienta getHarvestPredictions. Esta herramienta puede proporcionar:
- °Brix previsto a 7 días
- Rendimiento esperado en kg/ha
- Nivel de confianza de las predicciones
- Recomendaciones de cosecha (optimal, harvest_soon, wait)

Explica los resultados de manera clara y proporciona contexto sobre lo que significan los valores de °Brix y rendimiento para la calidad del vino y la planificación de la cosecha.

Sé amable, conocedor y servicial. Si no tienes información específica, utiliza las herramientas disponibles para obtener los datos más actualizados.`,
      prompt: conversationContext,
    });

    return { text: response.text };
  }
);