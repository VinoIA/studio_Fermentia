// src/app/actions.ts

"use server";

import { z } from "zod";
import { chatWithFermentia as chatWithFermentiaFlow } from "@/ai/flows/fermentia-chat-flow";
import { addVineyard as addVineyardDB } from "@/lib/data";
import type { Message } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const chatSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'tool']),
    content: z.string(),
  })),
  message: z.string(),
});

export async function chatWithFermentia(history: Message[], message: string) {
  const validatedInput = chatSchema.parse({ history, message });
  try {
    // Verificar que la API key esté configurada
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error("GOOGLE_GENAI_API_KEY no está configurada");
      throw new Error("API key no configurada");
    }
    
    console.log("Llamando a Fermentia con mensaje:", message);
    const output = await chatWithFermentiaFlow(validatedInput.history, validatedInput.message);
    console.log("Respuesta de Fermentia:", output);
    return { text: output.text };
  } catch (error) {
    console.error("Error detallado al chatear con Fermentia:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack available');
    
    // Proporcionar un error más específico
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error("Error de configuración: API key no válida o no configurada");
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error("Error: Se ha excedido la cuota de la API");
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error("Error de conexión: No se puede conectar con la API");
      }
    }
    
    throw new Error(`Error al conectar con Fermentia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

const vineyardSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres."),
    grapeVarietals: z.string().min(3, "Las variedades de uva deben tener al menos 3 caracteres."),
    totalPlots: z.coerce.number().int().positive("El número de parcelas debe ser positivo."),
    imageUrl: z.string().url("La URL de la imagen no es válida."),
    imageHint: z.string().optional(),
});

export async function addVineyard(prevState: any, formData: FormData) {
    const validatedFields = vineyardSchema.safeParse({
        name: formData.get('name'),
        location: formData.get('location'),
        grapeVarietals: formData.get('grapeVarietals'),
        totalPlots: formData.get('totalPlots'),
        imageUrl: formData.get('imageUrl'),
        imageHint: formData.get('imageHint'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error de validación. Por favor, corrige los campos.',
        };
    }

    try {
        const vineyard = {
            ...validatedFields.data,
            imageHint: validatedFields.data.imageHint || '',
        };
        addVineyardDB(vineyard);
    } catch (error) {
        return {
            message: 'Error en la base de datos: No se pudo crear el viñedo.',
        };
    }

    revalidatePath('/vineyards');
    revalidatePath('/');
    redirect('/vineyards');
}