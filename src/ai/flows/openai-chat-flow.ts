// src/ai/flows/openai-chat-flow.ts
'use server';

import { openai, AI_TEMPERAMENTS, type TemperamentType } from '@/ai/openai';
import { executeAITool, OPENAI_TOOLS } from '@/ai/tools/crud-tools';
import type { Message, AIAction, ChatSession } from '@/types';

export interface OpenAIChatInput {
  history: Message[];
  message: string;
  temperament?: TemperamentType;
  sessionId?: string;
}

export interface OpenAIChatOutput {
  text: string;
  actions?: AIAction[];
  recommendations?: any[];
  confidence?: number;
  temperament: TemperamentType;
  sessionId: string;
}

// Sistema de logs para auditoría
const AI_LOGS: Array<{
  timestamp: number;
  sessionId: string;
  input: string;
  output: string;
  temperament: TemperamentType;
  actions: AIAction[];
  confidence?: number;
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
  const temperament = input.temperament || 'amigable';
  const sessionId = input.sessionId || Date.now().toString();
  const temperamentConfig = AI_TEMPERAMENTS[temperament];
  
  // Construir mensajes para OpenAI
  const messages: any[] = [
    {
      role: 'system',
      content: `Eres Fermentia, un asistente de IA experto en viticultura y gestión de viñedos. Tu configuración actual es: ${temperamentConfig.description}.

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
- analyzeDataAndRecommend: Analizar datos y generar recomendaciones

REGLAS IMPORTANTES:
- Siempre habla en español
- Para operaciones CRUD que modifiquen datos, SIEMPRE solicita confirmación explícita del usuario
- Proporciona contexto y justificaciones para tus recomendaciones
- Cuando analices datos, incluye niveles de confianza en tus conclusiones
- Si detectas problemas críticos (plagas, condiciones adversas), prioriza estas alertas

TEMPERAMENTO ACTUAL: ${temperament} - ${temperamentConfig.description}`
    }
  ];

  // Agregar historial de conversación
  input.history.forEach(msg => {
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    });
  });

  // Agregar mensaje actual
  messages.push({
    role: 'user',
    content: input.message
  });

  try {
    // Llamada inicial a OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      tools: [...OPENAI_TOOLS],
      tool_choice: 'auto',
      temperature: temperamentConfig.temperature,
      top_p: temperamentConfig.top_p,
      frequency_penalty: temperamentConfig.frequency_penalty,
      presence_penalty: temperamentConfig.presence_penalty,
      max_tokens: 2000
    });

    const response = completion.choices[0].message;
    const actions: AIAction[] = [];
    let finalContent = response.content || '';

    // Ejecutar herramientas si fueron llamadas
    if (response.tool_calls && response.tool_calls.length > 0) {
      // Agregar la respuesta del asistente con tool_calls al historial
      messages.push({
        role: 'assistant',
        content: response.content,
        tool_calls: response.tool_calls
      });

      // Ejecutar cada herramienta y agregar sus respuestas
      for (const toolCall of response.tool_calls) {
        try {
          const params = JSON.parse(toolCall.function.arguments);
          const result = await executeAITool(toolCall.function.name, params);
          
          if (result.action) {
            actions.push(result.action);
          }

          // Determinar respuesta de la herramienta
          let toolResponse;
          if (result.requiresConfirmation) {
            toolResponse = `⚠️ ACCIÓN PENDIENTE DE CONFIRMACIÓN: ${result.action?.description}`;
          } else if (result.success) {
            toolResponse = JSON.stringify(result.data);
          } else {
            toolResponse = `Error: ${result.error}`;
          }

          // Agregar respuesta de la herramienta al historial
          messages.push({
            role: 'tool',
            content: toolResponse,
            tool_call_id: toolCall.id
          });

        } catch (error) {
          // Agregar respuesta de error de la herramienta
          messages.push({
            role: 'tool',
            content: `Error ejecutando ${toolCall.function.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            tool_call_id: toolCall.id
          });
        }
      }

      // Segunda llamada a OpenAI con los resultados de las herramientas
      const followUpCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: temperamentConfig.temperature,
        top_p: temperamentConfig.top_p,
        frequency_penalty: temperamentConfig.frequency_penalty,
        presence_penalty: temperamentConfig.presence_penalty,
        max_tokens: 2000
      });

      finalContent = followUpCompletion.choices[0].message.content || finalContent;
    }

    // Calcular confianza basada en tokens y contexto
    const confidence = Math.min(0.95, 0.6 + (completion.usage?.total_tokens || 0) / 2000 * 0.35);

    // Guardar log para auditoría
    AI_LOGS.push({
      timestamp: Date.now(),
      sessionId,
      input: input.message,
      output: finalContent,
      temperament,
      actions,
      confidence
    });

    // Actualizar sesión de chat
    const existingSession = await getChatSession(sessionId);
    if (existingSession) {
      existingSession.messages.push(
        {
          id: Date.now().toString(),
          role: 'user',
          content: input.message,
          timestamp: Date.now()
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: finalContent,
          timestamp: Date.now(),
          metadata: {
            temperament,
            confidence,
            toolsUsed: response.tool_calls?.map(tc => tc.function.name) || [],
            executedAction: actions.find(a => a.executed)?.description
          }
        }
      );
      existingSession.updatedAt = Date.now();
      await saveChatSession(existingSession);
    } else {
      const newSession: ChatSession = {
        id: sessionId,
        title: input.message.substring(0, 50) + (input.message.length > 50 ? '...' : ''),
        messages: [
          {
            id: Date.now().toString(),
            role: 'user',
            content: input.message,
            timestamp: Date.now()
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: finalContent,
            timestamp: Date.now(),
            metadata: {
              temperament,
              confidence,
              toolsUsed: response.tool_calls?.map(tc => tc.function.name) || [],
              executedAction: actions.find(a => a.executed)?.description
            }
          }
        ],
        temperament,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await saveChatSession(newSession);
    }

    return {
      text: finalContent,
      actions,
      confidence,
      temperament,
      sessionId
    };

  } catch (error) {
    console.error('Error en chatWithOpenAI:', error);
    
    // Guardar log de error
    AI_LOGS.push({
      timestamp: Date.now(),
      sessionId,
      input: input.message,
      output: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      temperament,
      actions: []
    });

    throw new Error(`Error al procesar tu consulta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Función auxiliar para confirmar y ejecutar acciones pendientes
export async function confirmAndExecuteAction(actionId: string, sessionId: string): Promise<boolean> {
  try {
    const session = await getChatSession(sessionId);
    if (!session) return false;

    // Buscar la acción en los logs
    const log = AI_LOGS.find(l => l.sessionId === sessionId && l.actions.some(a => a.id === actionId));
    if (!log) return false;

    const action = log.actions.find(a => a.id === actionId);
    if (!action || action.executed) return false;

    // Aquí ejecutarías la acción real (por ahora solo marcamos como ejecutada)
    action.executed = true;
    action.confirmation = false;

    return true;
  } catch (error) {
    console.error('Error confirmando acción:', error);
    return false;
  }
}
