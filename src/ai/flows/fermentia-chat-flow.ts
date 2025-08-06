'use server';
/**
 * @fileOverview Fermentia, an AI expert in viticulture.
 *
 * - chatWithFermentia - A function to chat with Fermentia.
 * - FermentiaChatInput - The input type for the chat function.
 * - FermentiaChatOutput - The return type for the chat function.
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
  text: z.string().describe("The AI assistant's response."),
});
export type FermentiaChatOutput = z.infer<typeof FermentiaChatOutputSchema>;


const vineyardInfoTool = ai.defineTool(
  {
    name: 'getVineyardInfo',
    description: 'Get information about the vineyards, including pest alerts, grape varietals, and other IoT data.',
    inputSchema: z.object({
      vineyardName: z.string().optional().describe('The name of a specific vineyard to get information about.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    return getVineyardData(input?.vineyardName);
  }
);


// Simple, non-streamed chat function
export async function chatWithFermentia(history: z.infer<typeof MessageSchema>[], message: string): Promise<FermentiaChatOutput> {
  return fermentiaChatFlow({ history, message });
}

const prompt = ai.definePrompt({
  name: 'fermentiaChatPrompt',
  input: { schema: FermentiaChatInputSchema },
  output: { schema: FermentiaChatOutputSchema },
  tools: [vineyardInfoTool],
  system: `You are Fermentia, an expert AI assistant specializing in viticulture (vineyard cultivation). Your role is to provide expert advice, answer questions, and offer suggestions related to growing grapes and managing vineyards.

You have access to real-time data from the user's vineyards. Use the getVineyardInfo tool to answer questions about pest status, vineyard summaries, or any other data-related query.

Be friendly, knowledgeable, and helpful.`,
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
