// src/types/index.ts

export type Vineyard = {
  id: string;
  name: string;
  location: string;
  grapeVarietals: string;
  totalPlots: number;
  iotData: {
    pests: boolean;
    // Datos para modelos de ML
    temp_mean_7d: number; // Temperatura media últimos 7 días (°C)
    hr_max_3d: number; // Humedad relativa máxima últimos 3 días (%)
    soil_moist_mean_24h: number; // Humedad del suelo media últimas 24h (%)
    ndvi_anom: number; // Anomalía NDVI
    evi_anom: number; // Anomalía EVI
    sin_day: number; // Componente sinusoidal del día del año
    cos_day: number; // Componente cosinusoidal del día del año
    variedad_onehot: number[]; // One-hot encoding de variedades
    surface_ha: number; // Superficie en hectáreas
  };
  imageUrl: string;
  imageHint: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
};

export type HarvestPrediction = {
  brix_next_7d: number; // °Brix previsto a 7 días
  yield_final: number; // Rendimiento final kg/ha
  confidence_brix: number; // Confianza del modelo (0-1)
  confidence_yield: number; // Confianza del modelo (0-1)
  harvest_recommendation: 'optimal' | 'wait' | 'harvest_soon';
};