import { NextRequest, NextResponse } from 'next/server';
import { generateVineyardRecommendations } from '@/ai/openai';

const API_BASE_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io/vinedos';

// Tipos para las recomendaciones
interface Recommendation {
  id: string;
  type: string;
  priority: 'alta' | 'media' | 'baja';
  title: string;
  description: string;
  action: string;
  vineyard: string;
  location: string;
  category?: string;
  pestType?: string;
  riskLevel?: string;
  specific?: boolean;
}

// Función para obtener datos de la API real
async function fetchVineyardsFromAPI() {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
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

// Función para detectar y generar alertas de plagas
function generatePestAlerts(vineyards: any[]): Recommendation[] {
  const pestAlerts: Recommendation[] = [];
  
  vineyards.forEach((vineyard) => {
    const vineyardName = vineyard.nombre || 'Viñedo sin nombre';
    const location = vineyard.ubicacion || 'Ubicación desconocida';
    const temp = vineyard.temperatura || 0;
    const humidity = vineyard.humedad || 0;

    // Condiciones favorables para diferentes plagas
    
    // Pulgón (Aphids) - Alta humedad y temperatura moderada
    if (humidity > 70 && temp >= 20 && temp <= 28) {
      pestAlerts.push({
        id: `pest-aphid-${vineyard.id}`,
        type: 'warning',
        priority: 'alta',
        title: `🐛 Riesgo de pulgones en ${vineyardName}`,
        description: `Condiciones favorables: ${temp}°C y ${humidity}% humedad para pulgones`,
        action: 'Aplicar tratamiento preventivo con aceite neem o insecticida biológico',
        vineyard: vineyardName,
        location: location,
        pestType: 'pulgon',
        riskLevel: 'alto'
      });
    }

    // Araña roja - Temperatura alta y baja humedad
    if (temp > 30 && humidity < 50) {
      pestAlerts.push({
        id: `pest-spider-${vineyard.id}`,
        type: 'warning',
        priority: 'alta',
        title: `🕷️ Alerta de araña roja en ${vineyardName}`,
        description: `Temperatura ${temp}°C y humedad ${humidity}% favorecen araña roja`,
        action: 'Incrementar humedad ambiental y aplicar acaricida específico',
        vineyard: vineyardName,
        location: location,
        pestType: 'arana_roja',
        riskLevel: 'alto'
      });
    }

    // Trips - Condiciones secas y calurosas
    if (temp > 28 && humidity < 60) {
      pestAlerts.push({
        id: `pest-thrips-${vineyard.id}`,
        type: 'warning',
        priority: 'media',
        title: `🦟 Riesgo de trips en ${vineyardName}`,
        description: `Condiciones secas (${humidity}%) y temperatura ${temp}°C favorecen trips`,
        action: 'Monitorear hojas jóvenes y aplicar trampas azules',
        vineyard: vineyardName,
        location: location,
        pestType: 'trips',
        riskLevel: 'medio'
      });
    }

    // Mildiu - Alta humedad y temperatura moderada
    if (humidity > 80 && temp >= 15 && temp <= 25) {
      pestAlerts.push({
        id: `pest-mildew-${vineyard.id}`,
        type: 'warning',
        priority: 'alta',
        title: `🍄 Riesgo de mildiu en ${vineyardName}`,
        description: `Humedad ${humidity}% y temperatura ${temp}°C ideales para mildiu`,
        action: 'Aplicar fungicida preventivo (cobre o sistémico) urgente',
        vineyard: vineyardName,
        location: location,
        pestType: 'mildiu',
        riskLevel: 'alto'
      });
    }

    // Oídio - Temperatura moderada
    if (temp >= 20 && temp <= 27) {
      pestAlerts.push({
        id: `pest-powdery-${vineyard.id}`,
        type: 'info',
        priority: 'media',
        title: `⚪ Vigilar oídio en ${vineyardName}`,
        description: `Temperatura ${temp}°C favorable para desarrollo de oídio`,
        action: 'Inspeccionar hojas regularmente y mantener ventilación',
        vineyard: vineyardName,
        location: location,
        pestType: 'oidio',
        riskLevel: 'medio'
      });
    }
  });

  return pestAlerts;
}

// Función para generar recomendaciones específicas de cuidado
function generateCareRecommendations(vineyards: any[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  vineyards.forEach((vineyard) => {
    const vineyardName = vineyard.nombre || 'Viñedo sin nombre';
    const location = vineyard.ubicacion || 'Ubicación desconocida';
    const temp = vineyard.temperatura || 0;
    const humidity = vineyard.humedad || 0;
    const harvestStatus = vineyard.estadoCosecha || 'Desconocido';
    const grapeVariety = vineyard.variedadUva || 'Variedad desconocida';

    // Recomendaciones de riego basadas en temperatura y humedad
    if (temp > 32) {
      recommendations.push({
        id: `care-irrigation-hot-${vineyard.id}`,
        type: 'care',
        priority: 'alta',
        title: `💧 Riego intensivo para ${vineyardName}`,
        description: `Temperatura ${temp}°C requiere riego frecuente para evitar estrés hídrico`,
        action: 'Regar 2-3 veces por semana en horas tempranas (6-8 AM)',
        vineyard: vineyardName,
        location: location,
        category: 'riego'
      });
    } else if (temp > 28) {
      recommendations.push({
        id: `care-irrigation-warm-${vineyard.id}`,
        type: 'care',
        priority: 'media',
        title: `🚿 Riego moderado para ${vineyardName}`,
        description: `Mantener humedad del suelo constante con ${temp}°C`,
        action: 'Riego por goteo 1-2 veces por semana',
        vineyard: vineyardName,
        location: location,
        category: 'riego'
      });
    }

    // Recomendaciones de poda según época
    if (currentMonth >= 6 && currentMonth <= 8) { // Invierno en hemisferio sur
      recommendations.push({
        id: `care-pruning-${vineyard.id}`,
        type: 'care',
        priority: 'alta',
        title: `✂️ Época de poda para ${vineyardName}`,
        description: `Período ideal para poda de ${grapeVariety}`,
        action: 'Realizar poda de formación y eliminación de madera vieja',
        vineyard: vineyardName,
        location: location,
        category: 'poda'
      });
    }

    // Recomendaciones de fertilización
    if (currentMonth >= 9 && currentMonth <= 11) { // Primavera
      recommendations.push({
        id: `care-fertilization-${vineyard.id}`,
        type: 'care',
        priority: 'media',
        title: `🌱 Fertilización primaveral - ${vineyardName}`,
        description: `Aplicar nutrientes para brotación de ${grapeVariety}`,
        action: 'Fertilizar con NPK 10-10-10 y micronutrientes',
        vineyard: vineyardName,
        location: location,
        category: 'fertilizacion'
      });
    }

    // Recomendaciones de manejo del dosel
    if (currentMonth >= 11 && currentMonth <= 2) { // Primavera-Verano
      recommendations.push({
        id: `care-canopy-${vineyard.id}`,
        type: 'care',
        priority: 'media',
        title: `🍃 Manejo del dosel - ${vineyardName}`,
        description: `Controlar crecimiento vegetativo para mejorar ventilación`,
        action: 'Deshoje selectivo y atado de brotes',
        vineyard: vineyardName,
        location: location,
        category: 'dosel'
      });
    }

    // Recomendaciones específicas por variedad
    if (grapeVariety.toLowerCase().includes('malbec')) {
      recommendations.push({
        id: `care-malbec-${vineyard.id}`,
        type: 'care',
        priority: 'baja',
        title: `🍇 Cuidado específico Malbec - ${vineyardName}`,
        description: `Malbec requiere exposición solar controlada`,
        action: 'Mantener hojas que protejan racimos del sol directo',
        vineyard: vineyardName,
        location: location,
        category: 'varietal'
      });
    }

    // Control de malezas
    if (currentMonth >= 9 && currentMonth <= 12) {
      recommendations.push({
        id: `care-weeds-${vineyard.id}`,
        type: 'care',
        priority: 'media',
        title: `🌿 Control de malezas - ${vineyardName}`,
        description: `Época de crecimiento activo de malezas`,
        action: 'Aplicar herbicida selectivo o cultivar mecánicamente',
        vineyard: vineyardName,
        location: location,
        category: 'malezas'
      });
    }
  });

  return recommendations;
}

// GET - Obtener recomendaciones y alertas
export async function GET() {
  try {
    console.log('📊 Iniciando generación de recomendaciones y alertas...');
    
    // Obtener datos reales de la API
    const vineyards = await fetchVineyardsFromAPI();
    console.log(`📊 Datos obtenidos: ${vineyards.length} viñedos`);

    // Generar alertas de plagas
    const pestAlerts = generatePestAlerts(vineyards);
    console.log(`🐛 Generadas ${pestAlerts.length} alertas de plagas`);

    // Generar recomendaciones de cuidado
    const careRecommendations = generateCareRecommendations(vineyards);
    console.log(`🌱 Generadas ${careRecommendations.length} recomendaciones de cuidado`);

    // Combinar todas las recomendaciones
    const allRecommendations = [...pestAlerts, ...careRecommendations];
    
    // Estadísticas
    const highPriorityCount = allRecommendations.filter(r => r.priority === 'alta').length;
    const pestCount = pestAlerts.length;
    const careCount = careRecommendations.length;

    return NextResponse.json({
      success: true,
      recommendations: allRecommendations,
      pestAlerts: pestAlerts,
      careRecommendations: careRecommendations,
      summary: `Generadas ${allRecommendations.length} recomendaciones: ${pestCount} alertas de plagas y ${careCount} consejos de cuidado`,
      stats: { 
        total: allRecommendations.length,
        pestAlerts: pestCount,
        careRecommendations: careCount,
        highPriority: highPriorityCount,
        vineyards: vineyards.length,
        avgTemperature: vineyards.length > 0 ? (vineyards.reduce((sum: number, v: any) => sum + v.temperatura, 0) / vineyards.length).toFixed(1) : '0',
        avgHumidity: vineyards.length > 0 ? (vineyards.reduce((sum: number, v: any) => sum + v.humedad, 0) / vineyards.length).toFixed(1) : '0'
      }
    });

  } catch (error) {
    console.error('❌ Error en API de recomendaciones:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor al obtener recomendaciones', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

// POST - Generar recomendaciones con IA para viñedo específico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vineyardId, context } = body;

    console.log('🤖 Generando recomendaciones con IA...');
    
    // Obtener datos de viñedos
    const vineyards = await fetchVineyardsFromAPI();
    
    let targetVineyard = null;
    if (vineyardId) {
      targetVineyard = vineyards.find((v: any) => v.id.toString() === vineyardId.toString());
    }

    // Usar IA para recomendaciones específicas
    let aiRecommendations: Recommendation[] = [];
    try {
      const vineyardContext = targetVineyard || 'Análisis general de viñedos';
      const aiResult = await generateVineyardRecommendations(vineyardContext, context);
      
      if (aiResult && typeof aiResult === 'string') {
        aiRecommendations = [{
          id: `ai-recommendation-${Date.now()}`,
          type: 'ai',
          priority: 'media',
          title: '🤖 Recomendación IA',
          description: aiResult,
          action: 'Seguir las recomendaciones de la IA',
          vineyard: targetVineyard?.nombre || 'General',
          location: targetVineyard?.ubicacion || 'Múltiples ubicaciones',
          category: 'ia'
        }];
      } else if (aiResult && typeof aiResult === 'object' && aiResult.success) {
        aiRecommendations = [{
          id: `ai-recommendation-${Date.now()}`,
          type: 'ai',
          priority: 'media',
          title: '🤖 Recomendación IA',
          description: aiResult.summary || 'Recomendación generada por IA',
          action: 'Seguir las recomendaciones de la IA',
          vineyard: targetVineyard?.nombre || 'General',
          location: targetVineyard?.ubicacion || 'Múltiples ubicaciones',
          category: 'ia'
        }];
      }
    } catch (aiError) {
      console.error('⚠️ Error en IA, continuando con recomendaciones básicas:', aiError);
    }

    // Generar también recomendaciones básicas
    const pestAlerts = generatePestAlerts(vineyards);
    const careRecommendations = generateCareRecommendations(vineyards);
    
    // Filtrar por viñedo específico si se proporciona
    let filteredPestAlerts = pestAlerts;
    let filteredCareRecommendations = careRecommendations;
    
    if (vineyardId && targetVineyard) {
      filteredPestAlerts = pestAlerts.filter(alert => alert.vineyard === targetVineyard.nombre);
      filteredCareRecommendations = careRecommendations.filter(rec => rec.vineyard === targetVineyard.nombre);
    }

    const allRecommendations = [...aiRecommendations, ...filteredPestAlerts, ...filteredCareRecommendations];

    return NextResponse.json({
      success: true,
      recommendations: allRecommendations,
      aiRecommendations: aiRecommendations,
      pestAlerts: filteredPestAlerts,
      careRecommendations: filteredCareRecommendations,
      targetVineyard: targetVineyard,
      summary: `Generadas ${allRecommendations.length} recomendaciones${targetVineyard ? ` para ${targetVineyard.nombre}` : ' generales'}`,
      stats: {
        total: allRecommendations.length,
        ai: aiRecommendations.length,
        pests: filteredPestAlerts.length,
        care: filteredCareRecommendations.length
      }
    });

  } catch (error) {
    console.error('❌ Error en POST de recomendaciones:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al generar recomendaciones específicas', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuración de alertas (futuro)
export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Método PUT no implementado aún'
  }, { status: 501 });
}

// DELETE - Eliminar alertas específicas (futuro)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Método DELETE no implementado aún'
  }, { status: 501 });
}
