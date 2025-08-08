// src/lib/api.ts
'use server';

import { mapAPIToInternal, mapInternalToAPI, VineyardAPI } from './api-mappers';

const API_BASE_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io/vinedos';

// GET - Obtener todos los viñedos
export async function fetchVineyards(): Promise<any[]> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Para obtener datos frescos siempre
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiData: VineyardAPI[] = await response.json();
    
    // Mapear cada viñedo de formato API a formato interno
    const mappedData = apiData.map(vineyard => mapAPIToInternal(vineyard));
    
    return mappedData;
  } catch (error) {
    console.error('Error fetching vineyards:', error);
    throw new Error('Failed to fetch vineyards');
  }
}

// GET - Obtener un viñedo específico por ID
export async function fetchVineyardById(id: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiData: VineyardAPI = await response.json();
    return mapAPIToInternal(apiData);
  } catch (error) {
    console.error(`Error fetching vineyard ${id}:`, error);
    return null;
  }
}

// POST - Crear un nuevo viñedo
export async function createVineyard(vineyardData: any): Promise<any> {
  try {
    const apiData = mapInternalToAPI(vineyardData);
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const createdData: VineyardAPI = await response.json();
    return mapAPIToInternal(createdData);
  } catch (error) {
    console.error('Error creating vineyard:', error);
    throw new Error('Failed to create vineyard');
  }
}

// PUT - Actualizar un viñedo existente
export async function updateVineyard(id: string, updateData: any): Promise<any> {
  try {
    const apiData = mapInternalToAPI(updateData);
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedData: VineyardAPI = await response.json();
    return mapAPIToInternal(updatedData);
  } catch (error) {
    console.error(`Error updating vineyard ${id}:`, error);
    throw new Error('Failed to update vineyard');
  }
}

// DELETE - Eliminar un viñedo
export async function deleteVineyard(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting vineyard ${id}:`, error);
    return false;
  }
}
