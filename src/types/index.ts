// src/types/index.ts

export type Vineyard = {
  id: string;
  name: string;
  location: string;
  grapeVarietals: string;
  totalPlots: number;
  plots: Plot[]; // Array de parcelas individuales
  iotData: {
    pests: boolean;
    // Datos agregados del viñedo (promedio de todas las parcelas)
    temp_mean_7d: number; // Temperatura media últimos 7 días (°C)
    hr_max_3d: number; // Humedad relativa máxima últimos 3 días (%)
    soil_moist_mean_24h: number; // Humedad del suelo media últimas 24h (%)
    ndvi_anom: number; // Anomalía NDVI
    evi_anom: number; // Anomalía EVI
    sin_day: number; // Componente sinusoidal del día del año
    cos_day: number; // Componente cosinusoidal del día del año
    variedad_onehot: number[]; // One-hot encoding de variedades
    surface_ha: number; // Superficie total en hectáreas
  };
  imageUrl: string;
  imageHint: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
};

export type Plot = {
  id: string;
  plotNumber: number;
  area_ha: number; // Área de la parcela en hectáreas
  soilType: string; // Tipo de suelo
  slope: number; // Pendiente en grados
  exposure: string; // Exposición al sol (Norte, Sur, etc.)
  plantingYear: number; // Año de plantación
  vineAge: number; // Edad de las vides en años
  // Métricas específicas de la parcela
  iotData: {
    temp_mean_7d: number;
    hr_max_3d: number;
    soil_moist_mean_24h: number;
    ndvi_anom: number;
    evi_anom: number;
    sin_day: number;
    cos_day: number;
    variedad_onehot: number[];
    // Métricas adicionales específicas de parcela
    soil_ph: number;
    organic_matter: number; // % materia orgánica
    water_stress_index: number; // Índice de estrés hídrico
  };
  prediction: {
    brix_next_7d: number;
    yield_final: number;
    confidence_brix: number;
    confidence_yield: number;
    harvest_recommendation: 'optimal' | 'wait' | 'harvest_soon';
    expected_harvest_date: string; // Fecha estimada de cosecha
    quality_score: number; // Score de calidad esperada (1-100)
  };
};

export type HarvestPrediction = {
  brix_next_7d: number; // °Brix previsto a 7 días
  yield_final: number; // Rendimiento final kg/ha
  confidence_brix: number; // Confianza del modelo (0-1)
  confidence_yield: number; // Confianza del modelo (0-1)
  harvest_recommendation: 'optimal' | 'wait' | 'harvest_soon';
};