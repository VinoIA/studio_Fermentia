// src/lib/data.ts - Simulación de datos IoT realistas para viñedos

import type { Vineyard, HarvestPrediction } from "@/types";

// Función para generar datos IoT realistas basados en sensores de campo
function generateRealisticIoTData(varietals: string, location: string, temperature: number, humidity: number) {
  // Calcular día del año para componentes estacionales
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Componentes estacionales (importante para ML)
  const sin_day = Math.sin(2 * Math.PI * dayOfYear / 365);
  const cos_day = Math.cos(2 * Math.PI * dayOfYear / 365);
  
  // Simulación de one-hot encoding para variedades principales
  const varietyMap: { [key: string]: number[] } = {
    'Cabernet Sauvignon': [1, 0, 0, 0, 0],
    'Merlot': [0, 1, 0, 0, 0],
    'Chardonnay': [0, 0, 1, 0, 0],
    'Pinot Noir': [0, 0, 0, 1, 0],
    'Sauvignon Blanc': [0, 0, 0, 0, 1],
    'Syrah': [0, 0, 0, 0, 1], // Usar Sauvignon Blanc como default
    'Zinfandel': [1, 0, 0, 0, 0] // Usar Cabernet como default
  };
  
  // Determinar variedad principal
  const mainVariety = Object.keys(varietyMap).find(v => varietals.includes(v)) || 'Cabernet Sauvignon';
  
  // Simular detección de plagas basada en condiciones ambientales
  let pestProbability = 0.15; // Base 15%
  if (temperature > 28 && humidity > 70) pestProbability += 0.2; // Condiciones favorables para plagas
  if (temperature < 18 || humidity < 40) pestProbability -= 0.1; // Condiciones desfavorables
  
  // Simular temperatura promedio de 7 días (variación realista)
  const temp_variation = (Math.random() - 0.5) * 4; // ±2°C variación
  const temp_mean_7d = Math.max(15, Math.min(35, temperature + temp_variation));
  
  // Simular humedad máxima de 3 días (típicamente más alta que la actual)
  const hr_max_3d = Math.max(humidity, Math.min(95, humidity + Math.random() * 15));
  
  // Simular humedad del suelo basada en lluvia reciente y riego
  let soil_moisture = 40; // Base
  if (hr_max_3d > 80) soil_moisture += 20; // Si hubo lluvia
  if (temperature > 30) soil_moisture -= 15; // Evaporación alta
  const soil_moist_mean_24h = Math.max(20, Math.min(80, soil_moisture + (Math.random() - 0.5) * 10));
  
  // Simular índices de vegetación (NDVI y EVI) - valores típicos de viñedos
  const base_ndvi = 0.6; // NDVI típico de viñedos saludables
  const base_evi = 0.4;  // EVI típico
  
  // Anomalías basadas en condiciones
  let ndvi_anomaly = (Math.random() - 0.5) * 0.3; // ±0.15 variación normal
  let evi_anomaly = (Math.random() - 0.5) * 0.2;  // ±0.1 variación normal
  
  if (soil_moist_mean_24h < 30) { // Estrés hídrico
    ndvi_anomaly -= 0.1;
    evi_anomaly -= 0.05;
  }
  if (temperature > 32) { // Estrés térmico
    ndvi_anomaly -= 0.08;
    evi_anomaly -= 0.04;
  }
  
  // Determinar superficie basada en ubicación
  let surface_ha = 8; // Base
  if (location.includes('Napa') || location.includes('Toscana')) surface_ha = 12 + Math.random() * 8; // Viñedos grandes
  else if (location.includes('Borgoña')) surface_ha = 5 + Math.random() * 5; // Viñedos medianos
  else surface_ha = 6 + Math.random() * 10; // Variación general
  
  return {
    pests: Math.random() < pestProbability,
    temp_mean_7d: parseFloat(temp_mean_7d.toFixed(1)),
    hr_max_3d: parseFloat(hr_max_3d.toFixed(1)),
    soil_moist_mean_24h: parseFloat(soil_moist_mean_24h.toFixed(1)),
    ndvi_anom: parseFloat(ndvi_anomaly.toFixed(3)),
    evi_anom: parseFloat(evi_anomaly.toFixed(3)),
    sin_day: parseFloat(sin_day.toFixed(3)),
    cos_day: parseFloat(cos_day.toFixed(3)),
    variedad_onehot: varietyMap[mainVariety],
    surface_ha: parseFloat(surface_ha.toFixed(1))
  };
}

// Datos iniciales simulados que funcionan como fallback si la API no está disponible
export const initialVineyards: Vineyard[] = [
  {
    id: "1",
    name: "Finca Roble Alto",
    location: "Valle de Napa, California",
    grapeVarietals: "Cabernet Sauvignon, Merlot",
    totalPlots: 12,
    temperature: 24.5,
    humidity: 68,
    harvestStatus: "Pendiente",
    harvestDate: "2024-09-15",
    iotData: generateRealisticIoTData("Cabernet Sauvignon, Merlot", "Valle de Napa, California", 24.5, 68)
  },
  {
    id: "2",
    name: "Viñedos Arroyo Sauce",
    location: "Borgoña, Francia",
    grapeVarietals: "Chardonnay, Pinot Noir",
    totalPlots: 8,
    temperature: 22.1,
    humidity: 72,
    harvestStatus: "En progreso",
    harvestDate: "2024-08-20",
    iotData: generateRealisticIoTData("Chardonnay, Pinot Noir", "Borgoña, Francia", 22.1, 72)
  },
  {
    id: "3",
    name: "Hacienda del Valle del Sol",
    location: "Toscana, Italia",
    grapeVarietals: "Zinfandel, Syrah",
    totalPlots: 15,
    temperature: 27.3,
    humidity: 65,
    harvestStatus: "Pendiente",
    harvestDate: "2024-09-30",
    iotData: generateRealisticIoTData("Zinfandel, Syrah", "Toscana, Italia", 27.3, 65)
  },
  {
    id: "4",
    name: "Vides de la Montaña Nublada",
    location: "Sonoma, California",
    grapeVarietals: "Sauvignon Blanc",
    totalPlots: 10,
    temperature: 23.8,
    humidity: 70,
    harvestStatus: "Completada",
    harvestDate: "2024-08-10",
    iotData: generateRealisticIoTData("Sauvignon Blanc", "Sonoma, California", 23.8, 70)
  },
];

// Estado en memoria
let vineyardsDB = [...initialVineyards];

// Funciones existentes
export function getVineyards() {
  return vineyardsDB;
}

export function getVineyardById(id: string) {
  return vineyardsDB.find(v => v.id === id);
}

export function addVineyard(vineyardData: Omit<Vineyard, 'id' | 'iotData'>) {
  const newVineyard: Vineyard = {
    ...vineyardData,
    id: (vineyardsDB.length + 1).toString(),
    iotData: generateRealisticIoTData(
      vineyardData.grapeVarietals, 
      vineyardData.location, 
      vineyardData.temperature, 
      vineyardData.humidity
    ),
  };
  vineyardsDB.push(newVineyard);
  return newVineyard;
}

// Nuevo: función para actualizar viñedo
export function updateVineyard(id: string, updates: Partial<Vineyard>) {
  const index = vineyardsDB.findIndex(v => v.id === id);
  if (index === -1) return null;
  
  vineyardsDB[index] = { ...vineyardsDB[index], ...updates };
  return vineyardsDB[index];
}

// Nuevo: función para eliminar viñedo
export function deleteVineyard(id: string) {
  const index = vineyardsDB.findIndex(v => v.id === id);
  if (index === -1) return false;
  
  vineyardsDB.splice(index, 1);
  return true;
}

// ============ ALGORITMOS DE PREDICCIÓN DE COSECHA ============

/**
 * Simulación del modelo Random Forest para predicción de °Brix
 * Input: datos IoT del viñedo
 * Output: °Brix previsto a 7 días
 */
function brixRandomForest(iotData: Vineyard['iotData']): number {
  // Valores por defecto si los datos IoT no están disponibles
  const temp_mean_7d = iotData?.temp_mean_7d || 24;
  const hr_max_3d = iotData?.hr_max_3d || 70;
  const soil_moist_mean_24h = iotData?.soil_moist_mean_24h || 50;
  const ndvi_anom = iotData?.ndvi_anom || 0;
  const evi_anom = iotData?.evi_anom || 0;
  const sin_day = iotData?.sin_day || 0;
  const cos_day = iotData?.cos_day || 0;
  const variedad_onehot = iotData?.variedad_onehot || [1, 0, 0, 0, 0];

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
  
  // Agregar algo de ruido para simular incertidumbre
  brixPrediction += (Math.random() - 0.5) * 2;
  
  // Mantener en rango realista (15-28 °Brix)
  return Math.max(15, Math.min(28, parseFloat(brixPrediction.toFixed(1))));
}

/**
 * Simulación del modelo XGBoost para predicción de rendimiento
 * Input: datos IoT del viñedo + superficie
 * Output: rendimiento final kg/ha
 */
function yieldXGBoost(iotData: Vineyard['iotData']): number {
  // Valores por defecto si los datos IoT no están disponibles
  const temp_mean_7d = iotData?.temp_mean_7d || 24;
  const hr_max_3d = iotData?.hr_max_3d || 70;
  const soil_moist_mean_24h = iotData?.soil_moist_mean_24h || 50;
  const ndvi_anom = iotData?.ndvi_anom || 0;
  const evi_anom = iotData?.evi_anom || 0;
  const sin_day = iotData?.sin_day || 0;
  const cos_day = iotData?.cos_day || 0;
  const variedad_onehot = iotData?.variedad_onehot || [1, 0, 0, 0, 0];
  const surface_ha = iotData?.surface_ha || 10;

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
  
  // Efecto de escala (viñedos más grandes pueden tener ligeras eficiencias)
  yieldPrediction += Math.log(surface_ha) * 100;
  
  // Agregar ruido para simular incertidumbre
  yieldPrediction += (Math.random() - 0.5) * 1000;
  
  // Mantener en rango realista (4000-15000 kg/ha)
  return Math.max(4000, Math.min(15000, Math.round(yieldPrediction)));
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
    id: `pred_${vineyardId}_${Date.now()}`,
    vineyardId: vineyard.id,
    vineyardName: vineyard.name,
    location: vineyard.location,
    grapeVarietals: vineyard.grapeVarietals,
    brix_next_7d,
    yield_final,
    confidence_brix: parseFloat(confidence_brix.toFixed(2)),
    confidence_yield: parseFloat(confidence_yield.toFixed(2)),
    harvest_recommendation,
    created_at: Date.now()
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

// Función para la IA (actualizada para manejar datos de API real)
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
    id: v.id,
    nombre: v.name,
    ubicacion: v.location,
    temperatura: v.temperature,
    humedad: v.humidity,
    estado_cosecha: v.harvestStatus,
    alerta_plagas: v.iotData?.pests || false,
    prediccion_brix: allPredictions[v.id]?.brix_next_7d,
    prediccion_rendimiento: allPredictions[v.id]?.yield_final,
    recomendacion: allPredictions[v.id]?.harvest_recommendation
  }));
}