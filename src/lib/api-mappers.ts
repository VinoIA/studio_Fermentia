// src/lib/api-mappers.ts
// Funciones de mapeo entre formatos de datos de API y internos

// Tipo para el formato de API
export interface VineyardAPI {
  id: number;
  nombre: string;
  ubicacion: string;
  variedadUva: string;
  estadoCosecha: string;
  temperatura: number;
  humedad: number;
  fechaCosecha: string;
}

// Mapear datos de la API a nuestro formato interno
export function mapAPIToInternal(apiVineyard: VineyardAPI): any {
  return {
    id: apiVineyard.id.toString(),
    name: apiVineyard.nombre,
    location: apiVineyard.ubicacion,
    grapeVarietals: apiVineyard.variedadUva,
    totalPlots: Math.floor(Math.random() * 20) + 5, // Simular parcelas
    harvestStatus: apiVineyard.estadoCosecha,
    temperature: apiVineyard.temperatura,
    humidity: apiVineyard.humedad,
    harvestDate: apiVineyard.fechaCosecha,
    imageUrl: `/imgs/${Math.floor(Math.random() * 4) + 1}.${Math.random() > 0.5 ? 'jpg' : 'png'}`,
    imageHint: "vineyard aerial view",
    iotData: {
      pests: Math.random() < 0.2, // 20% probabilidad de plagas
      temp_mean_7d: apiVineyard.temperatura,
      hr_max_3d: apiVineyard.humedad,
      soil_moist_mean_24h: 40 + Math.random() * 30,
      ndvi_anom: -0.2 + Math.random() * 0.4,
      evi_anom: -0.15 + Math.random() * 0.3,
      sin_day: Math.sin(2 * Math.PI * new Date().getDay() / 365),
      cos_day: Math.cos(2 * Math.PI * new Date().getDay() / 365),
      variedad_onehot: [1, 0, 0, 0, 0], // Simplificado
      surface_ha: 10 + Math.random() * 50
    }
  };
}

// Mapear datos internos a formato de API
export function mapInternalToAPI(internalVineyard: any): Partial<VineyardAPI> {
  return {
    nombre: internalVineyard.name || internalVineyard.nombre,
    ubicacion: internalVineyard.location || internalVineyard.ubicacion,
    variedadUva: internalVineyard.grapeVarietals || internalVineyard.variedadUva,
    estadoCosecha: internalVineyard.harvestStatus || "Pendiente",
    temperatura: internalVineyard.temperature || internalVineyard.iotData?.temp_mean_7d || 25,
    humedad: internalVineyard.humidity || internalVineyard.iotData?.hr_max_3d || 60,
    fechaCosecha: internalVineyard.harvestDate || new Date().toISOString().split('T')[0]
  };
}
