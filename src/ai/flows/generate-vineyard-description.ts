'use server';
/**
 * @fileOverview An AI agent that generates a compelling description for a new vineyard entry.
 *
 * - generateVineyardDescription - A function that handles the vineyard description generation process.
 * - GenerateVineyardDescriptionInput - The input type for the generateVineyardDescription function.
 * - GenerateVineyardDescriptionOutput - The return type for the generateVineyardDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVineyardDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the vineyard.'),
  location: z.string().describe('The location of the vineyard.'),
  grapeVarietals: z.string().describe('The grape varietals grown at the vineyard.'),
  notableWines: z.string().optional().describe('Any particularly notable wines produced at the vineyard.'),
});
export type GenerateVineyardDescriptionInput = z.infer<typeof GenerateVineyardDescriptionInputSchema>;

const GenerateVineyardDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling description of the vineyard.'),
});
export type GenerateVineyardDescriptionOutput = z.infer<typeof GenerateVineyardDescriptionOutputSchema>;

export async function generateVineyardDescription(input: GenerateVineyardDescriptionInput): Promise<GenerateVineyardDescriptionOutput> {
  return generateVineyardDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVineyardDescriptionPrompt',
  input: {schema: GenerateVineyardDescriptionInputSchema},
  output: {schema: GenerateVineyardDescriptionOutputSchema},
  prompt: `You are a marketing copywriter expert in the wine industry. You are writing a description for a new vineyard to be displayed on a website.

  Vineyard Name: {{name}}
  Location: {{location}}
  Grape Varietals: {{grapeVarietals}}
  Notable Wines: {{#if notableWines}}{{notableWines}}{{else}}None{{/if}}

  Write a compelling and engaging description of the vineyard. Incorporate the vineyard's name, location, and grape varietals. If there are any particularly notable wines, include those facts in the description.
  `,
});

const generateVineyardDescriptionFlow = ai.defineFlow(
  {
    name: 'generateVineyardDescriptionFlow',
    inputSchema: GenerateVineyardDescriptionInputSchema,
    outputSchema: GenerateVineyardDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
