// src/ai/flows/openai-chat-flow.ts
'use server';

import { openai } from '@/ai/openai';
import { executeAITool } from '@/ai/tools/crud-tools';
import { OPENAI_TOOLS } from '@/ai/tools/tool-definitions';
import type { Message, AIAction, ChatSession } from '@/types';

export interface OpenAIChatInput {
  history: Message[];
  message: string;
  sessionId?: string;
}

export interface OpenAIChatOutput {
  text: string;
  actions?: AIAction[];
  recommendations?: any[];
  confidence?: number;
  sessionId: string;
  usage?: any;
}

// Sistema de logs para auditoría
const AI_LOGS: Array<{
  timestamp: number;
  sessionId: string;
  input: string;
  output: string;
  actions: AIAction[];
  confidence?: number;
  usage?: any;
}> = [];

export async function getAILogs(sessionId?: string) {
  if (sessionId) {
    return AI_LOGS.filter(log => log.sessionId === sessionId);
  }
  return AI_LOGS;
}

// Gestión de sesiones de chat
const CHAT_SESSIONS: Map<string, ChatSession> = new Map();

export async function getChatSession(sessionId: string): Promise<ChatSession | undefined> {
  return CHAT_SESSIONS.get(sessionId);
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  CHAT_SESSIONS.set(session.id, session);
}

export async function getAllChatSessions(): Promise<ChatSession[]> {
  return Array.from(CHAT_SESSIONS.values());
}

// Función principal de chat con OpenAI
export async function chatWithOpenAI(input: OpenAIChatInput): Promise<OpenAIChatOutput> {
  const sessionId = input.sessionId || Date.now().toString();
  
  try {
    // Verificar que OpenAI esté configurado
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('API key de OpenAI no configurada');
    }

    // Construir mensajes para OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: `Eres Fermentia, un asistente de IA experto en viticultura y gestión de viñedos.

CAPACIDADES PRINCIPALES:
1. **Análisis de Datos**: Puedes analizar datos de viñedos, condiciones IoT, predicciones de cosecha y generar insights inteligentes.
2. **Operaciones CRUD**: Puedes crear, leer, actualizar y eliminar registros de viñedos previa confirmación del usuario.
3. **Recomendaciones Inteligentes**: Generas sugerencias basadas en patrones, historial y contexto actual.
4. **Asistencia Contextual**: Proporcionas ayuda personalizada según los datos que maneja la aplicación.

HERRAMIENTAS DISPONIBLES:
- getVineyardInfo: Consultar información de viñedos
- createVineyard: Crear nuevos viñedos (requiere confirmación)
- updateVineyard: Actualizar viñedos existentes (requiere confirmación)  
- deleteVineyard: Eliminar viñedos (requiere confirmación)
- getHarvestPredictions: Obtener predicciones de cosecha con ML
- analyzeDataAndRecommend: Generar recomendaciones inteligentes

INSTRUCCIONES:
- Responde siempre en español
- Sé específico y técnicamente preciso
- Cuando uses herramientas, explica qué estás haciendo
- Si necesitas confirmación para operaciones destructivas, pídela claramente
- Proporciona insights valiosos basados en los datos disponibles
- Mantén un tono profesional pero amigable

CONTEXTO ACTUAL: Es agosto de 2025, temporada de cosecha en el hemisferio sur.`
      }
    ];

    // Agregar historial de conversación
    input.history.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Agregar mensaje actual
    messages.push({
      role: 'user',
      content: input.message
    });

    // Convertir OPENAI_TOOLS a array mutable
    const tools = [...OPENAI_TOOLS];

    // Llamar a OpenAI con function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const assistantMessage = completion.choices[0]?.message;
    
    if (!assistantMessage) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    let responseText = assistantMessage.content || '';
    const actions: AIAction[] = [];
    let totalConfidence = 1.0;

    // Procesar tool calls si existen
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: string[] = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type === 'function' && toolCall.function) {
          try {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            console.log(`Ejecutando herramienta: ${functionName}`, functionArgs);
            
            const result = await executeAITool(functionName, functionArgs);
            
            if (result.success) {
              toolResults.push(`✅ ${functionName}: ${JSON.stringify(result.data)}`);
              if (result.action) {
                actions.push(result.action);
              }
            } else {
              toolResults.push(`❌ ${functionName}: ${result.error}`);
              totalConfidence *= 0.8;
            }
          } catch (error) {
            console.error('Error ejecutando herramienta:', error);
            toolResults.push(`❌ Error ejecutando ${toolCall.function.name}: ${error}`);
            totalConfidence *= 0.7;
          }
        }
      }

      // Si hay resultados de herramientas, hacer una segunda llamada para interpretar
      if (toolResults.length > 0) {
        const followUpMessages = [...messages, {
          role: 'assistant',
          content: assistantMessage.content,
          tool_calls: assistantMessage.tool_calls
        }];

        // Agregar resultados de herramientas
        assistantMessage.tool_calls.forEach((toolCall, index) => {
          followUpMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResults[index] || 'Sin resultado'
          });
        });

        const followUpCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: followUpMessages,
          temperature: 0.7,
          max_tokens: 1000
        });

        const followUpMessage = followUpCompletion.choices[0]?.message?.content;
        if (followUpMessage) {
          responseText = followUpMessage;
        }
      }
    }

    // Guardar en logs
    AI_LOGS.push({
      timestamp: Date.now(),
      sessionId,
      input: input.message,
      output: responseText,
      actions,
      confidence: totalConfidence,
      usage: completion.usage
    });

    return {
      text: responseText,
      actions,
      sessionId,
      confidence: totalConfidence,
      usage: completion.usage
    };

  } catch (error) {
    console.error('Error en OpenAI chat:', error);
    
    return {
      text: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
      sessionId,
      confidence: 0
    };
  }
}

// Función simple para respuestas rápidas sin herramientas
export async function quickChatWithOpenAI(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: 'system',
          content: 'Eres Fermentia, un asistente experto en viticultura. Responde de manera concisa y útil.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content || 'No pude procesar tu solicitud.';
  } catch (error) {
    console.error('Error en quick chat:', error);
    return 'Lo siento, no puedo responder en este momento.';
  }
}

// Función para confirmar y ejecutar acciones
export async function confirmAndExecuteAction(actionId: string, sessionId: string): Promise<boolean> {
  try {
    // Esta función se puede usar para confirmar acciones que requieren confirmación
    // Por ahora retornamos true, pero se puede expandir para manejar confirmaciones reales
    console.log(`Confirmando acción ${actionId} para sesión ${sessionId}`);
    return true;
  } catch (error) {
    console.error('Error confirmando acción:', error);
    return false;
  }
}
