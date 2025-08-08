// src/lib/recommendations.ts
// Funciones compartidas para generar recomendaciones

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
  confidence?: number;
  data?: any;
  timestamp?: number;
}

const API_BASE_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io/vinedos';

// Función para obtener datos de la API real
export async function fetchVineyardsFromAPI() {
  try {
    // Timeout de 10s para entornos serverless (Netlify)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📊 Fetched ${data.length} vineyards from API`);
    return data;
  } catch (error) {
    console.error('Error fetching vineyards from API:', error);
    throw error;
  }
}

// Función para detectar y generar alertas de plagas
export function generatePestAlerts(vineyards: any[]): Recommendation[] {
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
        riskLevel: 'alto',
        confidence: 0.85,
        data: { temperature: temp, humidity: humidity, risk: 'alto' },
        timestamp: Date.now()
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
        riskLevel: 'alto',
        confidence: 0.90,
        data: { temperature: temp, humidity: humidity, risk: 'alto' },
        timestamp: Date.now()
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
        riskLevel: 'medio',
        confidence: 0.75,
        data: { temperature: temp, humidity: humidity, risk: 'medio' },
        timestamp: Date.now()
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
        riskLevel: 'alto',
        confidence: 0.95,
        data: { temperature: temp, humidity: humidity, risk: 'crítico' },
        timestamp: Date.now()
      });
    }

    // Oídio - Temperatura moderada
    if (temp >= 20 && temp <= 27) {
      pestAlerts.push({
        id: `pest-powdery-${vineyard.id}`,
        type: 'suggestion',
        priority: 'media',
        title: `⚪ Vigilar oídio en ${vineyardName}`,
        description: `Temperatura ${temp}°C favorable para desarrollo de oídio`,
        action: 'Inspeccionar hojas regularmente y mantener ventilación',
        vineyard: vineyardName,
        location: location,
        pestType: 'oidio',
        riskLevel: 'medio',
        confidence: 0.70,
        data: { temperature: temp, risk: 'medio' },
        timestamp: Date.now()
      });
    }
  });

  return pestAlerts;
}

// Función para generar recomendaciones de cuidado
export function generateCareRecommendations(vineyards: any[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  vineyards.forEach((vineyard) => {
    const vineyardName = vineyard.nombre || 'Viñedo sin nombre';
    const location = vineyard.ubicacion || 'Ubicación desconocida';
    const temp = vineyard.temperatura || 0;
    const humidity = vineyard.humedad || 0;
    const harvestStatus = vineyard.estadoCosecha || 'Desconocido';

    // Recomendaciones de riego basadas en humedad
    if (humidity < 40) {
      recommendations.push({
        id: `irrigation-${vineyard.id}`,
        type: 'irrigation',
        priority: 'alta',
        title: `💧 Riego necesario en ${vineyardName}`,
        description: `Humedad baja detectada: ${humidity}%`,
        action: 'Incrementar frecuencia de riego. Revisar sistema de irrigación',
        vineyard: vineyardName,
        location: location,
        category: 'riego',
        confidence: 0.90,
        data: { humidity: humidity, recommendation: 'increase_irrigation' },
        timestamp: Date.now()
      });
    } else if (humidity > 90) {
      recommendations.push({
        id: `drainage-${vineyard.id}`,
        type: 'warning',
        priority: 'media',
        title: `🌊 Exceso de humedad en ${vineyardName}`,
        description: `Humedad muy alta: ${humidity}%`,
        action: 'Mejorar drenaje y reducir riego. Vigilar posibles hongos',
        vineyard: vineyardName,
        location: location,
        category: 'drenaje',
        confidence: 0.85,
        data: { humidity: humidity, recommendation: 'improve_drainage' },
        timestamp: Date.now()
      });
    }

    // Recomendaciones de temperatura
    if (temp > 35) {
      recommendations.push({
        id: `cooling-${vineyard.id}`,
        type: 'temperature',
        priority: 'alta',
        title: `🌡️ Temperatura elevada en ${vineyardName}`,
        description: `Temperatura crítica: ${temp}°C`,
        action: 'Aplicar sombreado temporal y aumentar riego por aspersión',
        vineyard: vineyardName,
        location: location,
        category: 'temperatura',
        confidence: 0.95,
        data: { temperature: temp, recommendation: 'cooling_measures' },
        timestamp: Date.now()
      });
    } else if (temp < 10) {
      recommendations.push({
        id: `protection-${vineyard.id}`,
        type: 'warning',
        priority: 'alta',
        title: `❄️ Protección contra heladas en ${vineyardName}`,
        description: `Temperatura baja: ${temp}°C`,
        action: 'Activar sistemas anti-heladas. Considerar cobertura temporal',
        vineyard: vineyardName,
        location: location,
        category: 'protección',
        confidence: 0.90,
        data: { temperature: temp, recommendation: 'frost_protection' },
        timestamp: Date.now()
      });
    }

    // Recomendaciones de cosecha
    if (harvestStatus === 'Pendiente') {
      recommendations.push({
        id: `harvest-${vineyard.id}`,
        type: 'info',
        priority: 'media',
        title: `🍇 Seguimiento de cosecha en ${vineyardName}`,
        description: 'Estado de cosecha pendiente',
        action: 'Monitorear grados Brix y planificar fecha de cosecha',
        vineyard: vineyardName,
        location: location,
        category: 'cosecha',
        confidence: 0.80,
        data: { harvestStatus: harvestStatus, recommendation: 'monitor_harvest' },
        timestamp: Date.now()
      });
    }
  });

  return recommendations;
}

export type { Recommendation };
