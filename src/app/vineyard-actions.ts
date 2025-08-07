// src/app/vineyard-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import type { Vineyard } from '@/types';
import { getVineyards } from '@/lib/data';

// Simulación de base de datos en memoria para el prototipo
let VINEYARD_DB: Vineyard[] = [];

// Inicializar con datos de muestra si está vacía
export async function initializeVineyardDB() {
  if (VINEYARD_DB.length === 0) {
    const sampleData = await getVineyards();
    VINEYARD_DB = [...sampleData];
  }
}

// Obtener todos los viñedos
export async function getAllVineyards(): Promise<Vineyard[]> {
  await initializeVineyardDB();
  return VINEYARD_DB;
}

// Obtener viñedo por ID
export async function getVineyardById(id: string): Promise<Vineyard | null> {
  await initializeVineyardDB();
  return VINEYARD_DB.find(v => v.id === id) || null;
}

// Crear nuevo viñedo
export async function createVineyard(vineyardData: Omit<Vineyard, 'id'>): Promise<{ success: boolean; vineyard?: Vineyard; error?: string }> {
  try {
    await initializeVineyardDB();
    
    const newVineyard: Vineyard = {
      ...vineyardData,
      id: `vineyard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    VINEYARD_DB.push(newVineyard);
    
    // Revalidar las páginas que muestran viñedos
    revalidatePath('/');
    revalidatePath('/vineyards');
    
    return { success: true, vineyard: newVineyard };
  } catch (error) {
    console.error('Error creando viñedo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al crear viñedo' 
    };
  }
}

// Actualizar viñedo existente
export async function updateVineyard(id: string, updates: Partial<Omit<Vineyard, 'id'>>): Promise<{ success: boolean; vineyard?: Vineyard; error?: string }> {
  try {
    await initializeVineyardDB();
    
    const index = VINEYARD_DB.findIndex(v => v.id === id);
    if (index === -1) {
      return { success: false, error: 'Viñedo no encontrado' };
    }

    VINEYARD_DB[index] = { ...VINEYARD_DB[index], ...updates };
    
    // Revalidar las páginas que muestran viñedos
    revalidatePath('/');
    revalidatePath('/vineyards');
    revalidatePath(`/vineyards/${id}`);
    
    return { success: true, vineyard: VINEYARD_DB[index] };
  } catch (error) {
    console.error('Error actualizando viñedo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al actualizar viñedo' 
    };
  }
}

// Eliminar viñedo
export async function deleteVineyard(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await initializeVineyardDB();
    
    const index = VINEYARD_DB.findIndex(v => v.id === id);
    if (index === -1) {
      return { success: false, error: 'Viñedo no encontrado' };
    }

    VINEYARD_DB.splice(index, 1);
    
    // Revalidar las páginas que muestran viñedos
    revalidatePath('/');
    revalidatePath('/vineyards');
    
    return { success: true };
  } catch (error) {
    console.error('Error eliminando viñedo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al eliminar viñedo' 
    };
  }
}

// Buscar viñedos con filtros
export async function searchVineyards(query: string): Promise<Vineyard[]> {
  await initializeVineyardDB();
  
  const lowerQuery = query.toLowerCase();
  return VINEYARD_DB.filter(vineyard => 
    vineyard.name.toLowerCase().includes(lowerQuery) ||
    vineyard.location.toLowerCase().includes(lowerQuery) ||
    vineyard.grapeVarietals.toLowerCase().includes(lowerQuery)
  );
}

// Obtener estadísticas de viñedos
export async function getVineyardStats() {
  await initializeVineyardDB();
  
  if (VINEYARD_DB.length === 0) {
    return {
      total: 0,
      totalPlots: 0,
      averageTemperature: 0,
      averageHumidity: 0,
      withPests: 0,
      pestPercentage: 0
    };
  }
  
  const total = VINEYARD_DB.length;
  const totalPlots = VINEYARD_DB.reduce((sum, v) => sum + v.totalPlots, 0);
  const averageTemperature = VINEYARD_DB.reduce((sum, v) => sum + v.iotData.temp_mean_7d, 0) / total;
  const averageHumidity = VINEYARD_DB.reduce((sum, v) => sum + v.iotData.hr_max_3d, 0) / total;
  const withPests = VINEYARD_DB.filter(v => v.iotData.pests).length;
  
  return {
    total,
    totalPlots,
    averageTemperature: Math.round(averageTemperature * 10) / 10,
    averageHumidity: Math.round(averageHumidity * 10) / 10,
    withPests,
    pestPercentage: total > 0 ? Math.round((withPests / total) * 100) : 0
  };
}
