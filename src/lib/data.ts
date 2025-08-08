// src/lib/data.ts

import type { Vineyard, HarvestPrediction, Plot } from "@/types";

/**
 * Nuevo algoritmo para predicción de humedad del suelo a 7 días
 * Basado en factores vitícolas reales
 */
function soilMoisturePredictor(currentSensorData: any, iotData: any): number {
  const { soil_moisture, temperature, electrical_conductivity } = currentSensorData;
  const { water_stress_index, organic_matter } = iotData;
  
  // Base: humedad actual
  let moisture_7d = soil_moisture;
  
  // Factor estacional (agosto = tendencia a la baja para estrés hídrico controlado)
  const seasonalFactor = -0.5; // Tendencia ligeramente a la baja
  
  // Factor de temperatura (más calor = más evaporación)
  const tempFactor = (temperature - 22) * -0.3; // Por cada grado sobre 22°C, baja 0.3%
  
  // Factor de conductividad (alta EC puede afectar absorción)
  const ecFactor = electrical_conductivity > 1.5 ? -0.2 : 0;
  
  // Factor de materia orgánica (retiene más agua)
  const organicFactor = organic_matter * 0.1;
  
  // Factor de estrés hídrico actual
  const stressFactor = water_stress_index * -1.5;
  
  // Aplicar todos los factores
  moisture_7d += seasonalFactor + tempFactor + ecFactor + organicFactor + stressFactor;
  
  // Agregar variabilidad natural
  moisture_7d += (Math.random() - 0.5) * 3;
  
  // Mantener en rango realista (3-45%)
  return Math.max(3, Math.min(45, moisture_7d));
}

// Función para calcular tendencias vitícolas realistas
function calculateTrends(currentSensorData: any, iotData: any, prediction: any) {
  const { soil_moisture, temperature, soil_ph, brix_current } = currentSensorData;
  const { brix_next_7d, soil_moisture_next_7d } = prediction;
  
  // Calcular tendencias basadas en viticultura real
  const brix_rate = (brix_next_7d - brix_current) / 7; // °Brix por día real
  const moisture_rate = (soil_moisture_next_7d - soil_moisture) / 7; // % humedad por día
  const ph_change = Math.abs(soil_ph - 6.8); // Desviación del pH óptimo 6.8
  const temp_status = temperature;

  return {
    // Tendencia °Brix basada en velocidad de maduración científicamente válida
    brix_trend: 
      brix_rate > 0.8 ? 'up_bad' :      // Muy rápido (sobre-maduración)
      brix_rate >= 0.3 ? 'up_good' :    // Velocidad óptima (0.3-0.8° por día)
      brix_rate > 0 ? 'stable_good' :   // Lento pero progresando
      'down_bad',                       // Perdiendo azúcar (problema)

    // Tendencia humedad basada en estrés hídrico controlado
    moisture_trend:
      moisture_rate < -3 ? 'down_bad' :     // Perdiendo agua muy rápido (estrés excesivo)
      moisture_rate < -1 ? 'down_good' :    // Estrés hídrico controlado (beneficioso)
      moisture_rate <= 1 ? 'stable_good' :  // Estable (bueno)
      'up_bad',                             // Aumentando humedad (malo para calidad)

    // Tendencia pH basada en rangos vitícolas óptimos
    ph_trend:
      ph_change > 0.5 ? (soil_ph > 6.8 ? 'up_bad' : 'down_bad') : 'stable_good',

    // Tendencia temperatura basada en rangos óptimos de maduración
    temp_trend:
      temp_status > 28 ? 'up_bad' :      // Muy caliente (estrés térmico)
      temp_status > 25 ? 'up_good' :     // Calor moderado (bueno para maduración)
      temp_status >= 20 ? 'stable_good' : // Temperatura ideal
      'down_good'                        // Fresco (ralentiza maduración, puede ser bueno)
  };
}

// Función para generar alertas dinámicas basadas en urgencia vitícola real
function generateViticultureAlerts(
  currentSensorData: any, 
  prediction: any, 
  trends: any,
  vineAge: number
): { priority: string; message: string; action_required: string; time_frame: string } {
  const { soil_moisture, temperature, soil_ph, electrical_conductivity } = currentSensorData;
  const { brix_next_7d } = prediction;
  
  // Mes actual (simulado como agosto - época de pre-cosecha)
  const currentMonth = 8; // Agosto
  
  // Alertas críticas basadas en ciencia vitícola
  if (brix_next_7d > 24 && currentMonth >= 8) {
    return {
      priority: 'critical',
      message: 'Sobre-maduración inminente',
      action_required: 'COSECHAR INMEDIATAMENTE',
      time_frame: '24h'
    };
  }
  
  if (soil_moisture < 8) {
    return {
      priority: 'critical', 
      message: 'Estrés hídrico severo',
      action_required: 'RIEGO URGENTE',
      time_frame: '12h'
    };
  }
  
  if (temperature > 30) {
    return {
      priority: 'high',
      message: 'Estrés térmico peligroso', 
      action_required: 'Proteger del calor',
      time_frame: '24h'
    };
  }
  
  if (brix_next_7d >= 23 && currentMonth >= 8) {
    return {
      priority: 'high',
      message: 'Ventana de cosecha próxima',
      action_required: 'Preparar cosecha',
      time_frame: '3-5 días'
    };
  }
  
  if (soil_ph < 6.0 || soil_ph > 7.5) {
    return {
      priority: 'medium',
      message: 'pH fuera de rango óptimo',
      action_required: 'Corregir pH del suelo',
      time_frame: '48h'
    };
  }
  
  if (electrical_conductivity > 2.0) {
    return {
      priority: 'medium',
      message: 'Salinidad elevada',
      action_required: 'Reducir salinidad',
      time_frame: '1 semana'
    };
  }
  
  if (soil_moisture > 35) {
    return {
      priority: 'medium',
      message: 'Exceso de humedad',
      action_required: 'Reducir riego',
      time_frame: '48h'
    };
  }
  
  return {
    priority: 'low',
    message: 'Condiciones normales',
    action_required: 'Monitoreo rutinario',
    time_frame: 'Semanal'
  };
}

// Función para generar datos de una parcela individual
function generatePlotData(
  plotNumber: number, 
  vineyardVarietals: string, 
  vineyardLocation: string,
  totalPlots: number,
  baseIoTData: any
): Plot {
  // Calcular día del año
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Componentes estacionales
  const sin_day = Math.sin(2 * Math.PI * dayOfYear / 365);
  const cos_day = Math.cos(2 * Math.PI * dayOfYear / 365);
  
  // Generar variación por parcela (cada parcela es ligeramente diferente)
  const variation = () => 0.8 + Math.random() * 0.4; // 0.8 a 1.2
  const smallVariation = () => 0.95 + Math.random() * 0.1; // 0.95 a 1.05
  
  // Tipos de suelo variados
  const soilTypes = ['Franco', 'Arcilloso', 'Arenoso', 'Franco-arenoso', 'Franco-arcilloso'];
  const exposures = ['Norte', 'Sur', 'Este', 'Oeste', 'Noreste', 'Noroeste', 'Sureste', 'Suroeste'];
  
  // Año de plantación variado (últimos 5-25 años)
  const plantingYear = 2024 - (5 + Math.floor(Math.random() * 20));
  const vineAge = 2024 - plantingYear;
  
  // IoT data con variaciones por parcela para algoritmos ML
  const plotIoTData = {
    temp_mean_7d: baseIoTData.temp_mean_7d * variation(),
    hr_max_3d: baseIoTData.hr_max_3d * smallVariation(),
    soil_moist_mean_24h: baseIoTData.soil_moist_mean_24h * variation(),
    ndvi_anom: baseIoTData.ndvi_anom + (Math.random() - 0.5) * 0.1,
    evi_anom: baseIoTData.evi_anom + (Math.random() - 0.5) * 0.08,
    sin_day,
    cos_day,
    variedad_onehot: baseIoTData.variedad_onehot,
    // Datos específicos de parcela
    organic_matter: 1.5 + Math.random() * 3.5, // 1.5% - 5.0%
    water_stress_index: Math.random() * 0.7, // 0 - 0.7
  };
  
  // Generar predicciones para esta parcela específica
  const brix_next_7d = brixRandomForest({
    ...plotIoTData,
    soil_ph: Math.max(5.5, Math.min(8.5, 6.0 + Math.random() * 2.0)),
    organic_matter: plotIoTData.organic_matter,
    water_stress_index: plotIoTData.water_stress_index
  });
  
  // Generar °Brix actual realista (ligeramente menor que la predicción de 7 días)
  const brix_current = Math.max(15, brix_next_7d - (0.3 + Math.random() * 2)); // 0.3-2.3° menos que predicción
  
  // Datos actuales de sensores IoT (rangos científicamente válidos)
  const currentSensorData = {
    soil_moisture: Math.max(5, Math.min(40, 15 + Math.random() * 20)), // 5-40% (rango real viticultura)
    temperature: Math.max(15, Math.min(35, 20 + Math.random() * 10)), // 15-35°C (rango real)
    soil_ph: Math.max(5.5, Math.min(8.5, 6.0 + Math.random() * 2.0)), // 5.5-8.5 (rango real)
    electrical_conductivity: Math.max(0.5, Math.min(3.0, 0.8 + Math.random() * 1.5)), // 0.5-3.0 mS/cm
    light_intensity: Math.max(3000, Math.min(7000, 4000 + Math.random() * 2000)), // 3000-7000 lux
    air_humidity: Math.max(40, Math.min(90, 50 + Math.random() * 30)), // 40-90% HR
    brix_current, // °Brix actual medido
  };
  
  // Nueva predicción de humedad del suelo a 7 días usando algoritmo vitícola
  const soil_moisture_next_7d = soilMoisturePredictor(currentSensorData, plotIoTData);
  
  const yield_final = yieldXGBoost({
    ...plotIoTData,
    surface_ha: baseIoTData.surface_ha / totalPlots // Área promedio por parcela
  });
  
  // Fecha estimada de cosecha basada en °Brix
  const daysToHarvest = Math.max(3, Math.round((25 - brix_next_7d) * 4));
  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() + daysToHarvest);
  
  // Score de calidad basado en múltiples factores vitícolas
  const qualityScore = Math.min(100, Math.max(60, 
    (brix_next_7d * 2.8) + 
    (yield_final / 120) + 
    ((8 - Math.abs(currentSensorData.soil_ph - 6.8)) * 8) +
    ((5 - plotIoTData.organic_matter) * 3) +
    ((1 - plotIoTData.water_stress_index) * 12)
  ));

  // Crear predicciones
  const prediction = {
    brix_next_7d,
    soil_moisture_next_7d,
    yield_final,
    confidence_brix: 0.75 + Math.random() * 0.2,
    confidence_moisture: 0.70 + Math.random() * 0.25,
    confidence_yield: 0.70 + Math.random() * 0.25,
    harvest_recommendation: (brix_next_7d >= 24 ? 'optimal' : brix_next_7d >= 22 ? 'harvest_soon' : 'wait') as 'optimal' | 'harvest_soon' | 'wait',
    expected_harvest_date: harvestDate.toISOString().split('T')[0],
    quality_score: Math.round(qualityScore)
  };

  // Calcular tendencias
  const trends = calculateTrends(currentSensorData, plotIoTData, prediction);
  
  // Generar alertas
  const alerts = generateViticultureAlerts(currentSensorData, prediction, trends, vineAge);

  return {
    id: `plot-${plotNumber}`,
    plotNumber,
    area_ha: parseFloat(((baseIoTData.surface_ha / totalPlots) * (0.8 + Math.random() * 0.4)).toFixed(2)),
    soilType: soilTypes[Math.floor(Math.random() * soilTypes.length)],
    slope: Math.round(Math.random() * 25), // 0-25 grados
    exposure: exposures[Math.floor(Math.random() * exposures.length)],
    plantingYear,
    vineAge,
    currentSensorData,
    iotData: plotIoTData,
    prediction,
    trends,
    alerts
  };
}

// Función para generar datos simulados realistas del viñedo
function generateIoTData(varietals: string, location: string) {
  // Calcular día del año
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Componentes estacionales
  const sin_day = Math.sin(2 * Math.PI * dayOfYear / 365);
  const cos_day = Math.cos(2 * Math.PI * dayOfYear / 365);
  
  // Simulación de one-hot encoding para variedades principales
  const varietyMap: { [key: string]: number[] } = {
    'Cabernet Sauvignon': [1, 0, 0, 0, 0],
    'Merlot': [0, 1, 0, 0, 0],
    'Chardonnay': [0, 0, 1, 0, 0],
    'Pinot Noir': [0, 0, 0, 1, 0],
    'Sauvignon Blanc': [0, 0, 0, 0, 1]
  };
  
  // Determinar variedad principal
  const mainVariety = Object.keys(varietyMap).find(v => varietals.includes(v)) || 'Cabernet Sauvignon';
  
  return {
    pests: Math.random() < 0.2,
    temp_mean_7d: 18 + Math.random() * 12, // 18-30°C
    hr_max_3d: 60 + Math.random() * 35, // 60-95%
    soil_moist_mean_24h: 25 + Math.random() * 50, // 25-75%
    ndvi_anom: -0.2 + Math.random() * 0.4, // -0.2 a 0.2
    evi_anom: -0.15 + Math.random() * 0.3, // -0.15 a 0.15
    sin_day,
    cos_day,
    variedad_onehot: varietyMap[mainVariety],
    surface_ha: 5 + Math.random() * 20 // 5-25 hectáreas
  };
}

// Función para generar viñedo completo con parcelas
function generateVineyardWithPlots(
  id: string,
  name: string, 
  location: string, 
  grapeVarietals: string, 
  totalPlots: number,
  imageUrl: string,
  imageHint: string
): Vineyard {
  const baseIoTData = generateIoTData(grapeVarietals, location);
  
  // Generar todas las parcelas
  const plots: Plot[] = [];
  for (let i = 1; i <= totalPlots; i++) {
    plots.push(generatePlotData(i, grapeVarietals, location, totalPlots, baseIoTData));
  }
  
  return {
    id,
    name,
    location,
    grapeVarietals,
    totalPlots,
    plots,
    iotData: baseIoTData,
    imageUrl,
    imageHint
  };
}

/**
 * Simulación del modelo Random Forest para predicción de °Brix
 * Input: datos IoT del viñedo o parcela
 * Output: °Brix previsto a 7 días
 */
function brixRandomForest(iotData: any): number {
  const {
    temp_mean_7d,
    hr_max_3d,
    soil_moist_mean_24h,
    ndvi_anom,
    evi_anom,
    sin_day,
    cos_day,
    variedad_onehot,
    soil_ph,
    organic_matter,
    water_stress_index
  } = iotData;

  // Simulación de Random Forest (pesos basados en importancia real de features)
  let brixPrediction = 18; // Base °Brix
  
  // Contribución de temperatura (feature más importante)
  brixPrediction += (temp_mean_7d - 20) * 0.4;
  
  // Contribución de humedad relativa
  brixPrediction -= (hr_max_3d - 75) * 0.02;
  
  // Contribución de humedad del suelo
  brixPrediction += (50 - soil_moist_mean_24h) * 0.05;
  
  // Contribución de índices de vegetación
  brixPrediction += ndvi_anom * 8 + evi_anom * 6;
  
  // Contribución estacional
  brixPrediction += sin_day * 2 + cos_day * 1.5;
  
  // Contribución de variedad (algunas variedades acumulan más azúcar)
  const varietyContrib = variedad_onehot[0] * 1.2 + // Cabernet Sauvignon
                        variedad_onehot[1] * 0.8 +  // Merlot
                        variedad_onehot[2] * 0.5 +  // Chardonnay
                        variedad_onehot[3] * 0.7 +  // Pinot Noir
                        variedad_onehot[4] * 0.9;   // Sauvignon Blanc
  
  brixPrediction += varietyContrib;
  
  // Contribuciones específicas de parcela (si están disponibles)
  if (soil_ph) {
    brixPrediction += (soil_ph - 6.5) * 0.5; // pH óptimo alrededor de 6.5
  }
  if (organic_matter) {
    brixPrediction += organic_matter * 0.3; // Más materia orgánica = mejor nutrición
  }
  if (water_stress_index !== undefined) {
    brixPrediction += water_stress_index * 2; // Estrés hídrico moderado mejora °Brix
  }
  
  // Agregar algo de ruido para simular incertidumbre
  brixPrediction += (Math.random() - 0.5) * 2;
  
  // Mantener en rango realista (15-28 °Brix)
  return Math.max(15, Math.min(28, parseFloat(brixPrediction.toFixed(1))));
}

/**
 * Simulación del modelo XGBoost para predicción de rendimiento
 * Input: datos IoT del viñedo o parcela + superficie
 * Output: rendimiento final kg/ha
 */
function yieldXGBoost(iotData: any): number {
  const {
    temp_mean_7d,
    hr_max_3d,
    soil_moist_mean_24h,
    ndvi_anom,
    evi_anom,
    sin_day,
    cos_day,
    variedad_onehot,
    surface_ha,
    soil_ph,
    organic_matter,
    water_stress_index
  } = iotData;

  // Simulación de XGBoost (gradient boosting)
  let yieldPrediction = 8000; // Base yield kg/ha
  
  // Contribución de temperatura (óptimo alrededor de 22-25°C)
  const tempOptimal = 23.5;
  yieldPrediction -= Math.abs(temp_mean_7d - tempOptimal) * 150;
  
  // Contribución de humedad relativa (muy importante para rendimiento)
  yieldPrediction += (hr_max_3d - 70) * 25;
  
  // Contribución de humedad del suelo (crítico)
  yieldPrediction += (soil_moist_mean_24h - 40) * 60;
  
  // Contribución de índices de vegetación (muy correlacionados con yield)
  yieldPrediction += ndvi_anom * 3000 + evi_anom * 2500;
  
  // Contribución estacional
  yieldPrediction += sin_day * 500 + cos_day * 300;
  
  // Contribución de variedad (diferentes potenciales de rendimiento)
  const varietyYield = variedad_onehot[0] * 1000 + // Cabernet Sauvignon
                      variedad_onehot[1] * 1200 +  // Merlot (más productivo)
                      variedad_onehot[2] * 1100 +  // Chardonnay
                      variedad_onehot[3] * 900 +   // Pinot Noir (menos productivo)
                      variedad_onehot[4] * 1050;   // Sauvignon Blanc
  
  yieldPrediction += varietyYield;
  
  // Efecto de escala (parcelas más grandes pueden tener ligeras eficiencias)
  if (surface_ha) {
    yieldPrediction += Math.log(Math.max(0.1, surface_ha)) * 100;
  }
  
  // Contribuciones específicas de parcela
  if (soil_ph) {
    yieldPrediction -= Math.abs(soil_ph - 6.8) * 200; // pH óptimo para rendimiento
  }
  if (organic_matter) {
    yieldPrediction += organic_matter * 400; // Materia orgánica mejora rendimiento
  }
  if (water_stress_index !== undefined) {
    yieldPrediction -= water_stress_index * 2000; // Estrés hídrico reduce rendimiento
  }
  
  // Agregar ruido para simular incertidumbre
  yieldPrediction += (Math.random() - 0.5) * 1000;
  
  // Mantener en rango realista (4000-15000 kg/ha)
  return Math.max(4000, Math.min(15000, Math.round(yieldPrediction)));
}

export const initialVineyards: Vineyard[] = [
  generateVineyardWithPlots(
    "1", 
    "Finca Roble Alto", 
    "Valle de Napa, California", 
    "Cabernet Sauvignon, Merlot", 
    12, 
    "/imgs/1.jpg", 
    "vineyard aerial"
  ),
  generateVineyardWithPlots(
    "2", 
    "Viñedos Arroyo Sauce", 
    "Borgoña, Francia", 
    "Chardonnay, Pinot Noir", 
    8, 
    "/imgs/2.png", 
    "grapes vine"
  ),
  generateVineyardWithPlots(
    "3", 
    "Hacienda del Valle del Sol", 
    "Toscana, Italia", 
    "Zinfandel, Syrah", 
    15, 
    "/imgs/3.jpeg", 
    "vineyard sunset"
  ),
  generateVineyardWithPlots(
    "4", 
    "Vides de la Montaña Nublada", 
    "Sonoma, California", 
    "Sauvignon Blanc", 
    10, 
    "/imgs/4.png", 
    "vineyard mountain"
  ),
];

// Mantenemos un estado en memoria para simular una base de datos.
let vineyardsDB = [...initialVineyards];

export function getVineyards() {
  // En una aplicación real, esto consultaría una base de datos.
  return vineyardsDB;
}

export function getVineyardById(id: string) {
    return vineyardsDB.find(v => v.id === id);
}

export function addVineyard(vineyardData: Omit<Vineyard, 'id' | 'iotData' | 'plots'>) {
  const newVineyard = generateVineyardWithPlots(
    (vineyardsDB.length + 1).toString(),
    vineyardData.name,
    vineyardData.location,
    vineyardData.grapeVarietals,
    vineyardData.totalPlots,
    vineyardData.imageUrl,
    vineyardData.imageHint
  );
  vineyardsDB.push(newVineyard);
  return newVineyard;
}

/**
 * Obtener datos específicos de una parcela
 */
export function getPlotById(vineyardId: string, plotNumber: number): Plot | null {
  const vineyard = getVineyardById(vineyardId);
  if (!vineyard) return null;
  
  return vineyard.plots.find(plot => plot.plotNumber === plotNumber) || null;
}

/**
 * Obtener todas las parcelas de un viñedo
 */
export function getPlotsByVineyardId(vineyardId: string): Plot[] {
  const vineyard = getVineyardById(vineyardId);
  if (!vineyard) return [];
  
  return vineyard.plots;
}

/**
 * Función principal para obtener predicciones de cosecha
 */
export function getHarvestPrediction(vineyardId: string): HarvestPrediction | null {
  const vineyard = getVineyardById(vineyardId);
  if (!vineyard) return null;

  const brix_next_7d = brixRandomForest(vineyard.iotData);
  const yield_final = yieldXGBoost(vineyard.iotData);
  
  // Calcular confianza basada en calidad de datos simulada
  const confidence_brix = 0.75 + Math.random() * 0.2; // 75-95%
  const confidence_yield = 0.70 + Math.random() * 0.25; // 70-95%
  
  // Determinar recomendación de cosecha
  let harvest_recommendation: 'optimal' | 'wait' | 'harvest_soon' = 'wait';
  if (brix_next_7d >= 24) {
    harvest_recommendation = 'optimal';
  } else if (brix_next_7d >= 22) {
    harvest_recommendation = 'harvest_soon';
  }
  
  return {
    brix_next_7d,
    yield_final,
    confidence_brix: parseFloat(confidence_brix.toFixed(2)),
    confidence_yield: parseFloat(confidence_yield.toFixed(2)),
    harvest_recommendation
  };
}

/**
 * Obtener predicciones para todos los viñedos
 */
export function getAllHarvestPredictions(): { [key: string]: HarvestPrediction } {
  const predictions: { [key: string]: HarvestPrediction } = {};
  
  vineyardsDB.forEach(vineyard => {
    const prediction = getHarvestPrediction(vineyard.id);
    if (prediction) {
      predictions[vineyard.id] = prediction;
    }
  });
  
  return predictions;
}

// Función para la IA (actualizada)
export function getVineyardData(vineyardName?: string) {
  if (vineyardName) {
    const vineyard = vineyardsDB.find(v => v.name.toLowerCase().includes(vineyardName.toLowerCase()));
    if (!vineyard) return { error: "Viñedo no encontrado" };
    
    const prediction = getHarvestPrediction(vineyard.id);
    return {
      ...vineyard,
      prediccion_cosecha: prediction
    };
  }
  
  // Resumen con predicciones
  const allPredictions = getAllHarvestPredictions();
  return vineyardsDB.map(v => ({
    nombre: v.name,
    ubicacion: v.location,
    alerta_plagas: v.iotData.pests,
    prediccion_brix: allPredictions[v.id]?.brix_next_7d,
    prediccion_rendimiento: allPredictions[v.id]?.yield_final,
    recomendacion: allPredictions[v.id]?.harvest_recommendation
  }));
}