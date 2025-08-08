"use server";

import { z } from "zod";
import { chatWithOpenAI, getAILogs, getChatSession, confirmAndExecuteAction } from "@/ai/flows/openai-chat-flow";
import { createVineyard as createVineyardAPI } from "@/lib/api";
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
      confidence: z.number().optional(),
      toolsUsed: z.array(z.string()).optional(),
      executedAction: z.string().optional(),
    }).optional(),
  })),
  message: z.string(),
  sessionId: z.string().optional(),
});

export async function chatWithFermentia(
  history: Message[], 
  message: string, 
  sessionId?: string
) {
  const validatedInput = chatSchema.parse({ 
    history, 
    message, 
    sessionId 
  });
  
  try {
    // Verificar que la API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY no está configurada");
      throw new Error("API key de OpenAI no configurada");
    }
    
    console.log("Llamando a OpenAI con mensaje:", message);
    
    const output = await chatWithOpenAI({
      history: validatedInput.history,
      message: validatedInput.message,
      sessionId: validatedInput.sessionId
    });
    
    console.log("Respuesta de OpenAI:", output);
    
    return { 
      text: output.text,
      actions: output.actions,
      confidence: output.confidence,
      sessionId: output.sessionId,
      usage: output.usage
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
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    ubicacion: z.string().min(3, "La ubicación debe tener al menos 3 caracteres."),
    variedadUva: z.string().min(3, "Las variedades de uva deben tener al menos 3 caracteres."),
    estadoCosecha: z.string().min(3, "El estado de cosecha es requerido."),
    temperatura: z.coerce.number().int().min(-10).max(50, "La temperatura debe estar entre -10 y 50°C."),
    humedad: z.coerce.number().int().min(0).max(100, "La humedad debe estar entre 0 y 100%."),
    fechaCosecha: z.string().min(10, "La fecha de cosecha es requerida."),
});

export async function addVineyard(prevState: any, formData: FormData) {
    const validatedFields = vineyardSchema.safeParse({
        nombre: formData.get('nombre'),
        ubicacion: formData.get('ubicacion'),
        variedadUva: formData.get('variedadUva'),
        estadoCosecha: formData.get('estadoCosecha'),
        temperatura: formData.get('temperatura'),
        humedad: formData.get('humedad'),
        fechaCosecha: formData.get('fechaCosecha'),
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
        };
        await createVineyardAPI(vineyard);
    } catch (error) {
        return {
            message: 'Error en la base de datos: No se pudo crear el viñedo.',
        };
    }

    revalidatePath('/vineyards');
    revalidatePath('/');
    redirect('/vineyards');
}
