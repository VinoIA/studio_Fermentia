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

// Sistema prompt minimalista: sin filtros, solo identidad y estilo
const FERMENTIA_SYSTEM_PROMPT = `Te llamas FermentIA 🍇.

Responde siempre en español con markdown limpio y agradable:
- Encabezados claros (##, ###)
- Viñetas separadas y concisas
- Tablas solo cuando aporten claridad (Nombre | Ubicación | Variedad | Temp | Humedad | Plagas)
- Evita pegar URLs crudas o imágenes en el texto a menos que te las pidan
- Tono profesional, cercano y visual con emojis agrícolas (🍇🍷🌿🌱🌞🌧️🦗🍂)

Cuando el usuario pida datos o cambios sobre viñedos, usa herramientas (function calls) para leer/contar/crear/actualizar/eliminar en lugar de suponer.`;

// Embellece el markdown: quita URLs crudas y arregla saltos de línea/viñetas
function beautifyMarkdown(text: string): string {
  if (!text) return text;
  let t = text.trim();
  // Eliminar URLs crudas entre paréntesis: (http...)
  t = t.replace(/\s*\(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+\)/g, '');
  // Si quedó sintaxis de imagen sin URL, convertir a texto en negrita
  t = t.replace(/!\[([^\]]+)\]/g, '**$1**');
  // Asegurar saltos antes de encabezados
  t = t.replace(/\s*(###[^\n]*)/g, '\n\n$1');
  t = t.replace(/\s*(##\s[^\n]*)/g, '\n\n$1');
  // Corregir casos como "# ## Resumen" -> "## Resumen"
  t = t.replace(/#\s+##/g, '##');
  // Asegurar que las viñetas empiecen en nueva línea
  t = t.replace(/\s-\s/g, '\n- ');
  // Separar pares campo: valor que vienen pegados por guiones
  t = t.replace(/\s-\s\*\*/g, '\n- **');
  // Asegurar línea en blanco antes de tablas que comienzan con |
  t = t.replace(/([^\n])\n\|/g, '$1\n\n|');
  // Asegurar línea en blanco entre encabezado y texto previo con dos puntos
  t = t.replace(/:\s*\n\|/g, ':\n\n|');
  // Compactar líneas en blanco múltiples
  t = t.replace(/\n{3,}/g, '\n\n');
  return t;
}

// Eliminado el filtro/rewriting: FermentIA responderá siempre con su rol.

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

// Función principal de chat con OpenAI (con streaming)
export async function chatWithOpenAI(input: OpenAIChatInput): Promise<OpenAIChatOutput> {
  const sessionId = input.sessionId || Date.now().toString();
  
  try {
    console.log('🍇 FermentIA - Iniciando chat...');
    console.log('📝 Mensaje:', input.message);

  // No hay filtro: usamos el mensaje original

    // Construir mensajes para OpenAI con FermentIA especializada
  const messages: any[] = [
      {
        role: 'system',
        content: FERMENTIA_SYSTEM_PROMPT
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

    // Llamar a OpenAI con configuración mejorada
    console.log('🚀 Llamando a OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más rápido y económico
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7, // Creatividad moderada
      max_tokens: 2000, // Más tokens para respuestas completas
      presence_penalty: 0.1, // Evitar repetición
      frequency_penalty: 0.1,
      top_p: 0.9, // Calidad de respuesta
      stream: false // Sin streaming por ahora, para simplicidad
    });

    console.log('✅ Respuesta recibida de OpenAI');
    const assistantMessage = completion.choices[0]?.message;
    
    if (!assistantMessage) {
      throw new Error('No se recibió respuesta válida de OpenAI');
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

    // Embellecer salida
    responseText = beautifyMarkdown(responseText);
    if (responseText && !responseText.includes('# ') && !responseText.includes('## ')) {
      responseText = `## 🍇 FermentIA\n\n${responseText}\n\n---\n> Consejo: puedo crear, actualizar, eliminar o contar viñedos cuando lo necesites.`;
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
    console.error('❌ Error en FermentIA chat:', error);
    
    // Manejo específico de errores de API key
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('API key')) {
        console.error('❌ Error de API key - Verificar configuración');
        return {
          text: '❌ **Error de Configuración**\n\nHay un problema con la configuración de la API key de OpenAI. Por favor, verifica que esté correctamente configurada.',
          sessionId,
          confidence: 0
        };
      }
      
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return {
          text: '⚠️ **Límite de Uso Excedido**\n\nSe ha alcanzado el límite de uso de la API. Por favor, inténtalo más tarde.',
          sessionId,
          confidence: 0
        };
      }
    }
    
    return {
      text: '🍇 **FermentIA - Error Temporal**\n\nLo siento, ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo en unos momentos.\n\n*Si el problema persiste, verifica la configuración de la API.*',
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
