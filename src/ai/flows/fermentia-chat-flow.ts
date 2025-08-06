'use server';
/**
 * @fileOverview Fermentia, un experto en IA en viticultura.
 *
 * - chatWithFermentia - Una función para chatear con Fermentia.
 * - FermentiaChatInput - El tipo de entrada para la función de chat.
 * - FermentiaChatOutput - El tipo de retorno para la función de chat.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getVineyardData } from '@/lib/data';

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


// Función de chat simple y no transmitida por streaming
export async function chatWithFermentia(history: z.infer<typeof MessageSchema>[], message: string): Promise<FermentiaChatOutput> {
  return fermentiaChatFlow({ history, message });
}

const prompt = ai.definePrompt({
  name: 'fermentiaChatPrompt',
  input: { schema: FermentiaChatInputSchema },
  output: { schema: FermentiaChatOutputSchema },
  tools: [vineyardInfoTool],
  system: `Eres Fermentia, un asistente experto en IA especializado en viticultura (cultivo de viñedos). Tu función es proporcionar consejos expertos, responder preguntas y ofrecer sugerencias relacionadas con el cultivo de uvas y la gestión de viñedos.

Habla siempre en español.

Tienes acceso a datos en tiempo real de los viñedos del usuario. Utiliza la herramienta getVineyardInfo para responder preguntas sobre el estado de las plagas, resúmenes de viñedos o cualquier otra consulta relacionada con los datos.

Sé amable, conocedor y servicial.`,
  prompt: `{{#each history}}
{{role}}: {{content}}
{{/each}}
user: {{message}}
assistant:`,
});

const fermentiaChatFlow = ai.defineFlow(
  {
    name: 'fermentiaChatFlow',
    inputSchema: FermentiaChatInputSchema,
    outputSchema: FermentiaChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
