import { NextRequest, NextResponse } from 'next/server';
import { analyzeDataAndRecommend } from '@/ai/tools/crud-tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataType = 'general', context } = body;

    // Validar el tipo de datos
    if (!['vineyard', 'harvest', 'general'].includes(dataType)) {
      return NextResponse.json(
        { error: 'Tipo de datos inválido' },
        { status: 400 }
      );
    }

    // Generar recomendaciones usando la herramienta simplificada
    const result = await analyzeDataAndRecommend({
      dataType,
      context
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al generar recomendaciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recommendations: result.data?.recommendations || [],
      summary: result.data?.summary || 'Recomendaciones generadas exitosamente',
      stats: result.data?.stats || { total: 0, highPriority: 0 }
    });

  } catch (error) {
    console.error('Error en API de recomendaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Método GET para obtener recomendaciones sin parámetros
export async function GET() {
  try {
    const result = await analyzeDataAndRecommend({
      dataType: 'general'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al obtener recomendaciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recommendations: result.data?.recommendations || [],
      summary: result.data?.summary || 'Recomendaciones obtenidas exitosamente',
      stats: result.data?.stats || { total: 0, highPriority: 0 }
    });

  } catch (error) {
    console.error('Error en API de recomendaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
