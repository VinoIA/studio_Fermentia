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
import { getVineyardData, getHarvestPrediction, getAllHarvestPredictions, getPlotsByVineyardId, getVineyards } from '@/lib/data';

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
      // Usar getVineyards() para obtener los objetos completos del viñedo
      const vineyards = getVineyards();
      const vineyard = vineyards.find(v => v.name.toLowerCase().includes(input.vineyardName!.toLowerCase()));
      
      if (!vineyard) {
        return { error: "Viñedo no encontrado para predicciones" };
      }
      
      // Usar el ID directamente del objeto del viñedo
      const prediction = getHarvestPrediction(vineyard.id);
      return {
        viñedo: vineyard.name,
        prediccion: prediction
      };
    } else {
      // Devolver todas las predicciones
      const allPredictions = getAllHarvestPredictions();
      const vineyardData = getVineyards();
      
      if (!Array.isArray(vineyardData)) {
        return { error: "Error al obtener datos de viñedos" };
      }
      
      return vineyardData.map((v) => ({
        nombre: v.name,
        ubicacion: v.location,
        prediccion_brix: allPredictions[v.id]?.brix_next_7d,
        prediccion_rendimiento: allPredictions[v.id]?.yield_final,
        recomendacion: allPredictions[v.id]?.harvest_recommendation,
        confianza_brix: allPredictions[v.id]?.confidence_brix,
        confianza_rendimiento: allPredictions[v.id]?.confidence_yield
      }));
    }
  }
);

const plotDetailsTool = ai.defineTool(
  {
    name: 'getPlotDetails',
    description: 'Obtener detalles específicos de las parcelas de un viñedo, incluyendo métricas individuales de °Brix, rendimiento y condiciones de cada parcela.',
    inputSchema: z.object({
      vineyardName: z.string().describe('El nombre del viñedo para obtener detalles de sus parcelas.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    if (!input.vineyardName) {
      return { error: "Nombre de viñedo requerido" };
    }
    
    // Buscar el viñedo por nombre
    const vineyards = getVineyards();
    const vineyard = vineyards.find(v => v.name.toLowerCase().includes(input.vineyardName.toLowerCase()));
    
    if (!vineyard) {
      return { error: "Viñedo no encontrado" };
    }
    
    // Obtener todas las parcelas
    const plots = getPlotsByVineyardId(vineyard.id);
    
    return {
      viñedo: vineyard.name,
      ubicacion: vineyard.location,
      total_parcelas: vineyard.totalPlots,
      parcelas: plots.map(plot => ({
        numero: plot.plotNumber,
        area_ha: plot.area_ha,
        tipo_suelo: plot.soilType,
        edad_vides: plot.vineAge,
        exposicion: plot.exposure,
        prediccion_brix: plot.prediction.brix_next_7d,
        rendimiento_esperado: plot.prediction.yield_final,
        calidad_score: plot.prediction.quality_score,
        recomendacion_cosecha: plot.prediction.harvest_recommendation,
        fecha_cosecha_estimada: plot.prediction.expected_harvest_date,
        ph_suelo: plot.iotData.soil_ph.toFixed(1),
        materia_organica: plot.iotData.organic_matter.toFixed(1),
        indice_estres_hidrico: plot.iotData.water_stress_index.toFixed(2)
      }))
    };
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
      tools: [vineyardInfoTool, harvestPredictionTool, plotDetailsTool],
      system: `Eres Fermentia, un asistente experto en IA especializado en viticultura (cultivo de viñedos) y predicción de cosechas. Tu función es proporcionar consejos expertos, responder preguntas y ofrecer sugerencias relacionadas con el cultivo de uvas, la gestión de viñedos y las predicciones de cosecha.

Habla siempre en español.

Tienes acceso a:
1. Datos en tiempo real de los viñedos del usuario (getVineyardInfo)
2. Predicciones de cosecha basadas en algoritmos de Machine Learning:
   - Modelo Random Forest para predicción de °Brix a 7 días
   - Modelo XGBoost para predicción de rendimiento final (kg/ha)
   - Recomendaciones de cosecha basadas en las predicciones
3. Detalles específicos de parcelas individuales (getPlotDetails):
   - Métricas individuales por parcela (°Brix, rendimiento, calidad)
   - Características del suelo (pH, materia orgánica, tipo)
   - Condiciones específicas (edad de vides, exposición)
   - Índices de estrés hídrico por parcela

Cuando te pregunten sobre predicciones de cosecha, utiliza la herramienta getHarvestPredictions. 
Cuando necesites información detallada sobre parcelas específicas, usa getPlotDetails.
Cuando te pregunten sobre un viñedo en general, usa getVineyardInfo.
Las herramientas pueden proporcionar:
- °Brix previsto a 7 días
- Rendimiento esperado en kg/ha
- Nivel de confianza de las predicciones
- Recomendaciones de cosecha (optimal, harvest_soon, wait)
- Detalles individuales de cada parcela
- Análisis comparativo entre parcelas

Explica los resultados de manera clara y proporciona contexto sobre lo que significan los valores de °Brix y rendimiento para la calidad del vino y la planificación de la cosecha. Cuando hables de parcelas específicas, menciona las diferencias entre ellas y qué factores pueden estar influyendo en sus métricas.

Sé amable, conocedor y servicial. Si no tienes información específica, utiliza las herramientas disponibles para obtener los datos más actualizados.`,
      prompt: conversationContext,
    });

    return { text: response.text };
  }
);