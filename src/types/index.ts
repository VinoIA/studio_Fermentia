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
  timestamp?: number;
  metadata?: {
    temperament?: string;
    confidence?: number;
    toolsUsed?: string[];
    executedAction?: string;
  };
};

export type AIAction = {
  id: string;
  type: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  entity: 'vineyard' | 'prediction' | 'user' | 'report';
  description: string;
  data?: any;
  confirmation?: boolean;
  executed?: boolean;
  timestamp: number;
  userId?: string;
};

export type AIRecommendation = {
  id: string;
  type: 'optimization' | 'warning' | 'suggestion' | 'insight';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  confidence: number;
  timestamp: number;
  implemented?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  temperament: string;
  createdAt: number;
  updatedAt: number;
};

export type TemperamentType = 'creativo' | 'formal' | 'técnico' | 'directo' | 'amigable';

export type HarvestPrediction = {
  brix_next_7d: number; // °Brix previsto a 7 días
  yield_final: number; // Rendimiento final kg/ha
  confidence_brix: number; // Confianza del modelo (0-1)
  confidence_yield: number; // Confianza del modelo (0-1)
  harvest_recommendation: 'optimal' | 'wait' | 'harvest_soon';
};