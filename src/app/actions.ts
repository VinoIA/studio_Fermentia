"use server";

import { z } from "zod";
import { chatWithFermentia as chatWithFermentiaFlow } from "@/ai/flows/fermentia-chat-flow";
import type { Message } from "@/types";

const chatSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  message: z.string(),
});

export async function chatWithFermentia(history: Message[], message: string) {
  const validatedInput = chatSchema.parse({ history, message });
  try {
    const output = await chatWithFermentiaFlow(validatedInput.history, validatedInput.message);
    return { text: output.text };
  } catch (error) {
    console.error("Error chatting with Fermentia:", error);
    throw new Error("Failed to get response from Fermentia");
  }
}