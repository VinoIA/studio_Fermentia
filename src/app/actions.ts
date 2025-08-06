"use server";

import { z } from "zod";
import { chatWithFermentia as chatWithFermentiaFlow } from "@/ai/flows/fermentia-chat-flow";
import { addVineyard as addVineyardDB } from "@/lib/data";
import type { Message } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    console.error("Error al chatear con Fermentia:", error);
    throw new Error("No se pudo obtener respuesta de Fermentia");
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
        addVineyardDB(validatedFields.data);
    } catch (error) {
        return {
            message: 'Error en la base de datos: No se pudo crear el viñedo.',
        };
    }

    revalidatePath('/vineyards');
    revalidatePath('/');
    redirect('/vineyards');
}
