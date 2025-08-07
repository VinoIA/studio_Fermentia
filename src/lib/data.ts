import type { Vineyard, HarvestPrediction, Plot } from "@/types";

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
  
  // IoT data con variaciones por parcela
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
    soil_ph: 6.0 + Math.random() * 2.0, // pH 6.0 - 8.0
    organic_matter: 1.5 + Math.random() * 3.5, // 1.5% - 5.0%
    water_stress_index: Math.random() * 0.7, // 0 - 0.7
  };
  
  // Generar predicciones para esta parcela específica
  const brix_next_7d = brixRandomForest(plotIoTData);
  const yield_final = yieldXGBoost({
    ...plotIoTData,
    surface_ha: baseIoTData.surface_ha / totalPlots // Área promedio por parcela
  });
  
  // Fecha estimada de cosecha basada en °Brix
  const daysToHarvest = Math.max(7, Math.round((24 - brix_next_7d) * 3));
  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() + daysToHarvest);
  
  // Score de calidad basado en múltiples factores
  const qualityScore = Math.min(100, Math.max(60, 
    (brix_next_7d * 3) + 
    (yield_final / 100) + 
    ((8 - Math.abs(plotIoTData.soil_ph - 7)) * 5) +
    ((5 - plotIoTData.organic_matter) * 3) +
    ((1 - plotIoTData.water_stress_index) * 10)
  ));

  return {
    id: `plot-${plotNumber}`,
    plotNumber,
    area_ha: parseFloat(((baseIoTData.surface_ha / totalPlots) * (0.8 + Math.random() * 0.4)).toFixed(2)),
    soilType: soilTypes[Math.floor(Math.random() * soilTypes.length)],
    slope: Math.round(Math.random() * 25), // 0-25 grados
    exposure: exposures[Math.floor(Math.random() * exposures.length)],
    plantingYear,
    vineAge,
    iotData: plotIoTData,
    prediction: {
      brix_next_7d,
      yield_final,
      confidence_brix: 0.75 + Math.random() * 0.2,
      confidence_yield: 0.70 + Math.random() * 0.25,
      harvest_recommendation: brix_next_7d >= 24 ? 'optimal' : brix_next_7d >= 22 ? 'harvest_soon' : 'wait',
      expected_harvest_date: harvestDate.toISOString().split('T')[0],
      quality_score: Math.round(qualityScore)
    }
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

// Estado en memoria
let vineyardsDB = [...initialVineyards];

// Funciones existentes
export function getVineyards() {
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

// ============ ALGORITMOS DE PREDICCIÓN DE COSECHA ============

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