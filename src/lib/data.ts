// src/lib/data.ts

import type { Vineyard, HarvestPrediction } from "@/types";

// Función para generar datos simulados realistas
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

export const initialVineyards: Vineyard[] = [
  {
    id: "1",
    name: "Finca Roble Alto",
    location: "Valle de Napa, California",
    grapeVarietals: "Cabernet Sauvignon, Merlot",
    totalPlots: 12,
    iotData: generateIoTData("Cabernet Sauvignon, Merlot", "Valle de Napa, California"),
    imageUrl: "/imgs/1.jpg",
    imageHint: "vineyard aerial"
  },
  {
    id: "2",
    name: "Viñedos Arroyo Sauce",
    location: "Borgoña, Francia",
    grapeVarietals: "Chardonnay, Pinot Noir",
    totalPlots: 8,
    iotData: generateIoTData("Chardonnay, Pinot Noir", "Borgoña, Francia"),
    imageUrl: "/imgs/2.png",
    imageHint: "grapes vine"
  },
  {
    id: "3",
    name: "Hacienda del Valle del Sol",
    location: "Toscana, Italia",
    grapeVarietals: "Zinfandel, Syrah",
    totalPlots: 15,
    iotData: generateIoTData("Zinfandel, Syrah", "Toscana, Italia"),
    imageUrl: "/imgs/3.jpeg",
    imageHint: "vineyard sunset"
  },
  {
    id: "4",
    name: "Vides de la Montaña Nublada",
    location: "Sonoma, California",
    grapeVarietals: "Sauvignon Blanc",
    totalPlots: 10,
    iotData: generateIoTData("Sauvignon Blanc", "Sonoma, California"),
    imageUrl: "/imgs/4.png",
    imageHint: "vineyard mountain"
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
    iotData: generateIoTData(vineyardData.grapeVarietals, vineyardData.location),
  };
  vineyardsDB.push(newVineyard);
  return newVineyard;
}

// ============ ALGORITMOS DE PREDICCIÓN DE COSECHA ============

/**
 * Simulación del modelo Random Forest para predicción de °Brix
 * Input: datos IoT del viñedo
 * Output: °Brix previsto a 7 días
 */
function brixRandomForest(iotData: Vineyard['iotData']): number {
  const {
    temp_mean_7d,
    hr_max_3d,
    soil_moist_mean_24h,
    ndvi_anom,
    evi_anom,
    sin_day,
    cos_day,
    variedad_onehot
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
  const {
    temp_mean_7d,
    hr_max_3d,
    soil_moist_mean_24h,
    ndvi_anom,
    evi_anom,
    sin_day,
    cos_day,
    variedad_onehot,
    surface_ha
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