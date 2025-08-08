import { NextRequest, NextResponse } from 'next/server';
import { chatWithOpenAI } from '@/ai/flows/openai-chat-flow';

// POST - Chat con streaming simulado
export async function POST(request: NextRequest) {
  try {
    // Verificar API key solo si está en producción y la necesitamos
    if (process.env.NODE_ENV === 'production' && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Configuración de API no disponible' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { history = [], message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    console.log('🤖 API Chat - Procesando mensaje:', message);

    // Usar el flujo existente de OpenAI
    const result = await chatWithOpenAI({
      history,
      message,
      sessionId
    });

    console.log('✅ API Chat - Respuesta generada exitosamente');

    return NextResponse.json({
      success: true,
      text: result.text,
      actions: result.actions || [],
      confidence: result.confidence || 0.9,
      sessionId: result.sessionId,
      usage: result.usage,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ Error en API de chat:', error);
    
    // Mejor manejo de errores específicos
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Error de configuración: API key no válida';
        statusCode = 401;
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'Límite de uso excedido. Intenta más tarde.';
        statusCode = 429;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Date.now()
      },
      { status: statusCode }
    );
  }
}

// GET - Obtener estado del chat (para debug)
export async function GET() {
  try {
    // Verificar configuración
    const isConfigured = !!process.env.OPENAI_API_KEY;
    
    return NextResponse.json({
      success: true,
      status: 'Chat API funcionando',
      configured: isConfigured,
      model: 'gpt-4o-mini',
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Error verificando estado del chat',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}
