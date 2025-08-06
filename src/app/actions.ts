"use server";

import {
  generateVineyardDescription,
  type GenerateVineyardDescriptionInput,
  type GenerateVineyardDescriptionOutput,
} from "@/ai/flows/generate-vineyard-description";
import { z } from "zod";

const actionSchema = z.object({
  name: z.string(),
  location: z.string(),
  grapeVarietals: z.string(),
  notableWines: z.string().optional(),
});

export async function generateDescriptionAction(
  input: GenerateVineyardDescriptionInput
): Promise<GenerateVineyardDescriptionOutput> {
  const validatedInput = actionSchema.parse(input);
  try {
    const output = await generateVineyardDescription(validatedInput);
    return output;
  } catch (error) {
    console.error("Error generating vineyard description:", error);
    throw new Error("Failed to generate description");
  }
}
