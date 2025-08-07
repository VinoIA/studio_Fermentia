"use server";

import { z } from "zod";
import { chatWithOpenAI, confirmAndExecuteAction, getAILogs, getChatSession } from "@/ai/flows/openai-chat-flow";
import { addVineyard as addVineyardDB } from "@/lib/data";
import type { Message } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const chatSchema = z.object({
  history: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'tool']),
    content: z.string(),
    timestamp: z.number().optional(),
    metadata: z.object({
      temperament: z.string().optional(),
      confidence: z.number().optional(),
      toolsUsed: z.array(z.string()).optional(),
      executedAction: z.string().optional(),
    }).optional(),
  })),
  message: z.string(),
  temperament: z.enum(['creativo', 'formal', 'técnico', 'directo', 'amigable']).optional(),
  sessionId: z.string().optional(),
});

export async function chatWithFermentia(
  history: Message[], 
  message: string, 
  temperament?: 'creativo' | 'formal' | 'técnico' | 'directo' | 'amigable',
  sessionId?: string
) {
  const validatedInput = chatSchema.parse({ 
    history, 
    message, 
    temperament: temperament || 'amigable',
    sessionId 
  });
  
  try {
    // Verificar que la API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY no está configurada");
      throw new Error("API key de OpenAI no configurada");
    }
    
    console.log("Llamando a OpenAI con mensaje:", message);
    console.log("Temperamento:", validatedInput.temperament);
    
    const output = await chatWithOpenAI({
      history: validatedInput.history,
      message: validatedInput.message,
      temperament: validatedInput.temperament,
      sessionId: validatedInput.sessionId
    });
    
    console.log("Respuesta de OpenAI:", output);
    
    return { 
      text: output.text,
      actions: output.actions,
      confidence: output.confidence,
      temperament: output.temperament,
      sessionId: output.sessionId
    };
  } catch (error) {
    console.error("Error detallado al chatear con OpenAI:", error);
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

// Función para confirmar y ejecutar acciones de la IA
export async function confirmAIAction(actionId: string, sessionId: string) {
  try {
    const success = await confirmAndExecuteAction(actionId, sessionId);
    return { success };
  } catch (error) {
    console.error("Error confirmando acción:", error);
    throw new Error(`Error al confirmar acción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Función para obtener logs de auditoría de la IA
export async function getAIAuditLogs(sessionId?: string) {
  try {
    const logs = await getAILogs(sessionId);
    return { logs };
  } catch (error) {
    console.error("Error obteniendo logs:", error);
    throw new Error(`Error al obtener logs: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Función para obtener sesiones de chat
export async function getChatSessionData(sessionId: string) {
  try {
    const session = await getChatSession(sessionId);
    return { session };
  } catch (error) {
    console.error("Error obteniendo sesión:", error);
    throw new Error(`Error al obtener sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
