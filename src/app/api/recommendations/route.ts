import { NextRequest, NextResponse } from 'next/server';
import { analyzeDataAndRecommend } from '@/ai/tools/crud-tools';

const API_BASE_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io/vinedos';

// Función para obtener datos de la API real
async function fetchVineyardsFromAPI() {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Para obtener datos frescos siempre
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching vineyards from API:', error);
    throw error;
  }
}

// Función para generar recomendaciones basadas en datos reales
function generateSmartRecommendations(vineyards: any[]) {
  const recommendations = [];
  const now = new Date();
  
  // Analizar cada viñedo
  vineyards.forEach((vineyard) => {
    // Recomendaciones por temperatura
    if (vineyard.temperatura > 30) {
      recommendations.push({
        id: `temp-${vineyard.id}`,
        type: 'warning',
        priority: 'alta',
        title: `Temperatura alta en ${vineyard.nombre}`,
        description: `La temperatura de ${vineyard.temperatura}°C está por encima del rango óptimo. Considere aumentar el riego.`,
        action: 'Incrementar frecuencia de riego',
        vineyard: vineyard.nombre,
        location: vineyard.ubicacion
      });
    } else if (vineyard.temperatura < 15) {
      recommendations.push({
        id: `temp-low-${vineyard.id}`,
        type: 'info',
        priority: 'media',
        title: `Temperatura baja en ${vineyard.nombre}`,
        description: `La temperatura de ${vineyard.temperatura}°C podría afectar la maduración. Monitorear de cerca.`,
        action: 'Monitorear desarrollo de la uva',
        vineyard: vineyard.nombre,
        location: vineyard.ubicacion
      });
    }

    // Recomendaciones por humedad
    if (vineyard.humedad > 80) {
      recommendations.push({
        id: `humid-${vineyard.id}`,
        type: 'warning',
        priority: 'alta',
        title: `Humedad alta en ${vineyard.nombre}`,
        description: `La humedad de ${vineyard.humedad}% puede favorecer enfermedades fúngicas.`,
        action: 'Mejorar ventilación y aplicar fungicidas preventivos',
        vineyard: vineyard.nombre,
        location: vineyard.ubicacion
      });
    } else if (vineyard.humedad < 40) {
      recommendations.push({
        id: `humid-low-${vineyard.id}`,
        type: 'info',
        priority: 'media',
        title: `Humedad baja en ${vineyard.nombre}`,
        description: `La humedad de ${vineyard.humedad}% podría causar estrés hídrico.`,
        action: 'Considerar riego adicional',
        vineyard: vineyard.nombre,
        location: vineyard.ubicacion
      });
    }

    // Recomendaciones por estado de cosecha
    if (vineyard.estadoCosecha === 'En progreso') {
      const harvestDate = new Date(vineyard.fechaCosecha);
      const daysUntilHarvest = Math.ceil((harvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilHarvest <= 7 && daysUntilHarvest > 0) {
        recommendations.push({
          id: `harvest-soon-${vineyard.id}`,
          type: 'success',
          priority: 'alta',
          title: `Cosecha próxima en ${vineyard.nombre}`,
          description: `La cosecha está programada en ${daysUntilHarvest} días. Preparar equipos y personal.`,
          action: 'Preparar logística de cosecha',
          vineyard: vineyard.nombre,
          location: vineyard.ubicacion
        });
      }
    } else if (vineyard.estadoCosecha === 'Pendiente') {
      recommendations.push({
        id: `harvest-pending-${vineyard.id}`,
        type: 'info',
        priority: 'media',
        title: `Cosecha pendiente en ${vineyard.nombre}`,
        description: `Monitorear condiciones para determinar momento óptimo de cosecha.`,
        action: 'Continuar monitoreo de maduración',
        vineyard: vineyard.nombre,
        location: vineyard.ubicacion
      });
    }

    // Recomendaciones por variedad de uva
    if (vineyard.variedadUva === 'Malbec' && vineyard.temperatura > 28) {
      recommendations.push({
        id: `malbec-${vineyard.id}`,
        type: 'info',
        priority: 'media',
        title: `Condiciones óptimas para Malbec en ${vineyard.nombre}`,
        description: `Las condiciones actuales son favorables para la variedad Malbec.`,
        action: 'Mantener condiciones actuales',
        vineyard: vineyard.nombre,
        location: vineyard.ubicacion
      });
    }
  });

  // Recomendaciones generales
  const avgTemp = vineyards.reduce((sum: number, v: any) => sum + v.temperatura, 0) / vineyards.length;
  const avgHumidity = vineyards.reduce((sum: number, v: any) => sum + v.humedad, 0) / vineyards.length;
  
  if (avgTemp > 27) {
    recommendations.push({
      id: 'general-temp',
      type: 'warning',
      priority: 'media',
      title: 'Temperatura promedio elevada',
      description: `La temperatura promedio de ${avgTemp.toFixed(1)}°C está elevada en todos los viñedos.`,
      action: 'Revisar sistema de riego general',
      vineyard: 'Todos los viñedos',
      location: 'General'
    });
  }

  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataType = 'vineyard', context } = body;

    // Obtener datos reales de la API
    const vineyards = await fetchVineyardsFromAPI();
    console.log('📊 Datos obtenidos de la API:', vineyards.length, 'viñedos');

    // Generar recomendaciones inteligentes basadas en datos reales
    const smartRecommendations = generateSmartRecommendations(vineyards);
    
    // También usar la herramienta de IA si se proporciona contexto específico
    let aiRecommendations = [];
    if (context) {
      const aiResult = await analyzeDataAndRecommend({
        dataType,
        context: {
          ...context,
          vineyards: vineyards // Pasar datos reales a la IA
        }
      });
      
      if (aiResult.success && aiResult.data?.recommendations) {
        aiRecommendations = aiResult.data.recommendations;
      }
    }

    // Combinar recomendaciones
    const allRecommendations = [...smartRecommendations, ...aiRecommendations];
    const highPriorityCount = allRecommendations.filter(r => r.priority === 'alta').length;

    return NextResponse.json({
      success: true,
      recommendations: allRecommendations,
      summary: `Se generaron ${allRecommendations.length} recomendaciones basadas en ${vineyards.length} viñedos`,
      stats: { 
        total: allRecommendations.length, 
        highPriority: highPriorityCount,
        vineyards: vineyards.length,
        avgTemperature: (vineyards.reduce((sum: number, v: any) => sum + v.temperatura, 0) / vineyards.length).toFixed(1),
        avgHumidity: (vineyards.reduce((sum: number, v: any) => sum + v.humedad, 0) / vineyards.length).toFixed(1)
      }
    });

  } catch (error) {
    console.error('Error en API de recomendaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener recomendaciones', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// Método GET para obtener recomendaciones sin parámetros
export async function GET() {
  try {
    // Obtener datos reales de la API
    const vineyards = await fetchVineyardsFromAPI();
    console.log('📊 Datos obtenidos de la API (GET):', vineyards.length, 'viñedos');

    // Generar recomendaciones inteligentes basadas en datos reales
    const recommendations = generateSmartRecommendations(vineyards);
    const highPriorityCount = recommendations.filter(r => r.priority === 'alta').length;

    return NextResponse.json({
      success: true,
      recommendations: recommendations,
      summary: `Se obtuvieron ${recommendations.length} recomendaciones basadas en ${vineyards.length} viñedos`,
      stats: { 
        total: recommendations.length, 
        highPriority: highPriorityCount,
        vineyards: vineyards.length,
        avgTemperature: vineyards.length > 0 ? (vineyards.reduce((sum: number, v: any) => sum + v.temperatura, 0) / vineyards.length).toFixed(1) : '0',
        avgHumidity: vineyards.length > 0 ? (vineyards.reduce((sum: number, v: any) => sum + v.humedad, 0) / vineyards.length).toFixed(1) : '0'
      }
    });

  } catch (error) {
    console.error('Error en API de recomendaciones (GET):', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener recomendaciones', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
