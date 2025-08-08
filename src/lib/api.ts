// src/lib/api.ts
'use server';

import { mapAPIToInternal, mapInternalToAPI, VineyardAPI } from './api-mappers';

const API_BASE_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io/vinedos';

// GET - Obtener todos los viñedos
export async function fetchVineyards(): Promise<any[]> {
  try {
    console.log('🔄 Iniciando fetchVineyards...');
    console.log('📡 API URL:', API_BASE_URL);
    
    // Crear un timeout para la request
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 15000); // 15 segundos timeout
    
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Para obtener datos frescos siempre
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId); // Limpiar timeout si la request fue exitosa

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const apiData: VineyardAPI[] = await response.json();
    console.log('📊 Raw API data received:', apiData.length, 'items');
    console.log('📋 First item structure:', apiData[0] ? JSON.stringify(apiData[0], null, 2) : 'No items');
    
    // Mapear cada viñedo de formato API a formato interno
    const mappedData = apiData.map((vineyard, index) => {
      try {
        console.log(`🔄 Mapping vineyard ${index + 1}:`, vineyard.nombre || vineyard.id);
        const mapped = mapAPIToInternal(vineyard);
        console.log(`✅ Successfully mapped vineyard ${index + 1}`);
        return mapped;
      } catch (mapError) {
        console.error(`❌ Error mapping vineyard ${index + 1}:`, mapError);
        console.error('❌ Vineyard data:', JSON.stringify(vineyard, null, 2));
        throw mapError;
      }
    });
    
    console.log('✅ All vineyards mapped successfully:', mappedData.length);
    return mappedData;
  } catch (error) {
    console.error('❌ Critical error in fetchVineyards:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout after 15 seconds');
        throw new Error('API request timeout - please try again');
      }
      if (error.message.includes('fetch')) {
        console.error('❌ Network error');
        throw new Error('Network error - please check your connection');
      }
    }
    
    // En lugar de lanzar el error, devolver un array vacío para evitar crash
    console.log('🛡️ Returning empty array to prevent crash');
    return [];
  }
}

// GET - Obtener un viñedo específico por ID
export async function fetchVineyardById(id: string): Promise<any | null> {
  try {
    console.log(`🔄 Fetching vineyard by ID: ${id}`);
    
    // Asegurar que el ID sea numérico para la API
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`❌ Invalid ID format: ${id}. Expected numeric ID.`);
      return null;
    }
    
    console.log(`📡 Making GET request to: ${API_BASE_URL}/${numericId}`);
    
    const response = await fetch(`${API_BASE_URL}/${numericId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('📡 Fetch response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`ℹ️ Vineyard ${numericId} not found`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiData: VineyardAPI = await response.json();
    console.log('✅ Fetched vineyard (raw):', apiData);
    
    const result = mapAPIToInternal(apiData);
    console.log('✅ Fetched vineyard (mapped):', result);
    
    return result;
  } catch (error) {
    console.error(`❌ Error fetching vineyard ${id}:`, error);
    return null;
  }
}

// POST - Crear un nuevo viñedo
export async function createVineyard(vineyardData: any): Promise<any> {
  try {
    console.log('🔄 Creating vineyard with input data:', vineyardData);
    const apiData = mapInternalToAPI(vineyardData);
    console.log('🔄 Mapped to API format:', apiData);
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    console.log('📡 Create response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Create error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const createdData: VineyardAPI = await response.json();
    console.log('✅ Created vineyard (raw):', createdData);
    
    const result = mapAPIToInternal(createdData);
    console.log('✅ Created vineyard (mapped):', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error creating vineyard:', error);
    throw new Error(`Failed to create vineyard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// PUT - Actualizar un viñedo existente
export async function updateVineyard(id: string, updateData: any): Promise<any> {
  try {
    console.log(`🔄 Updating vineyard ${id} with input data:`, updateData);
    
    // Primero, obtener todos los viñedos para encontrar el ID real de la API
    console.log('🔍 Fetching all vineyards to find the correct API ID...');
    const allVineyards = await fetchVineyards();
    
    // Encontrar el viñedo que coincida con nuestro ID interno
    const targetVineyard = allVineyards.find(v => v.id === id);
    if (!targetVineyard) {
      throw new Error(`Vineyard with ID ${id} not found in current vineyard list`);
    }
    
    console.log(`✅ Found vineyard in list: ${targetVineyard.name} (internal ID: ${id})`);
    
    // Ahora necesitamos obtener el ID real de la API haciendo GET all y comparando datos
    console.log('📡 Fetching raw API data to find real API ID...');
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vineyards for update: ${response.status}`);
    }

    const apiVineyards: VineyardAPI[] = await response.json();
    console.log('📋 Raw API vineyards count:', apiVineyards.length);
    
    // Encontrar el viñedo en la API que coincida con el nombre y ubicación
    const apiVineyard = apiVineyards.find(v => 
      v.nombre === targetVineyard.name && 
      v.ubicacion === targetVineyard.location
    );
    
    if (!apiVineyard) {
      throw new Error(`Could not find corresponding vineyard in API for ${targetVineyard.name} at ${targetVineyard.location}`);
    }
    
    const realApiId = apiVineyard.id;
    console.log(`✅ Found real API ID: ${realApiId} for vineyard: ${apiVineyard.nombre}`);
    
    // Preparar datos para la actualización
    const apiData = mapInternalToAPI(updateData);
    console.log('🔄 Mapped to API format:', apiData);
    console.log(`🔄 Making PUT request to: ${API_BASE_URL}/${realApiId}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const updateResponse = await fetch(`${API_BASE_URL}/${realApiId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('📡 Update response status:', updateResponse.status);
    console.log('📡 Update response ok:', updateResponse.ok);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Update error response:', errorText);
      console.error('❌ Request URL was:', `${API_BASE_URL}/${realApiId}`);
      console.error('❌ Request body was:', JSON.stringify(apiData, null, 2));
      throw new Error(`HTTP error! status: ${updateResponse.status}, body: ${errorText}`);
    }

    const updatedData: VineyardAPI = await updateResponse.json();
    console.log('✅ Updated vineyard (raw):', updatedData);
    
    const result = mapAPIToInternal(updatedData);
    console.log('✅ Updated vineyard (mapped):', result);
    
    return result;
  } catch (error) {
    console.error(`❌ Error updating vineyard ${id}:`, error);
    throw new Error(`Failed to update vineyard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// DELETE - Eliminar un viñedo
export async function deleteVineyard(id: string): Promise<boolean> {
  try {
    console.log(`🔄 Starting delete process for vineyard ID: ${id}`);
    
    // Paso 1: Obtener todos los viñedos de la API para encontrar el correcto
    console.log('� Fetching all vineyards from API...');
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vineyards: HTTP ${response.status}`);
    }

    const apiVineyards: VineyardAPI[] = await response.json();
    console.log(`📋 Found ${apiVineyards.length} vineyards in API`);
    
    if (apiVineyards.length === 0) {
      throw new Error('No vineyards found in API');
    }

    // Paso 2: Encontrar el viñedo que corresponde a nuestro ID interno
    // Primero intentar buscar por ID directo (convertido a número)
    let targetApiVineyard = null;
    const numericId = parseInt(id, 10);
    
    if (!isNaN(numericId)) {
      targetApiVineyard = apiVineyards.find(v => v.id === numericId);
      console.log(`� Search by numeric ID ${numericId}: ${targetApiVineyard ? 'FOUND' : 'NOT FOUND'}`);
    }
    
    // Si no se encuentra por ID directo, buscar por datos del viñedo mapeado
    if (!targetApiVineyard) {
      console.log('🔍 Searching by vineyard data mapping...');
      
      // Mapear todos los viñedos y buscar el que coincida con nuestro ID
      for (const apiVineyard of apiVineyards) {
        try {
          const mapped = mapAPIToInternal(apiVineyard);
          if (mapped.id === id) {
            console.log(`✅ Found matching vineyard: ${apiVineyard.nombre} (API ID: ${apiVineyard.id})`);
            targetApiVineyard = apiVineyard;
            break;
          }
        } catch (mapError) {
          console.warn(`⚠️ Could not map vineyard ${apiVineyard.id}:`, mapError);
          continue;
        }
      }
    }

    if (!targetApiVineyard) {
      console.error(`❌ Vineyard with ID ${id} not found in API`);
      console.log('📋 Available vineyards:', apiVineyards.map(v => ({ id: v.id, nombre: v.nombre })));
      throw new Error(`Vineyard with ID "${id}" not found`);
    }

    // Paso 3: Realizar el DELETE usando el ID real de la API
    const deleteUrl = `${API_BASE_URL}/${targetApiVineyard.id}`;
    console.log(`📡 Sending DELETE request to: ${deleteUrl}`);
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
          console.log(`🔎 Search by numeric ID ${numericId}: ${targetApiVineyard ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`📡 DELETE response status: ${deleteResponse.status}`);

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('❌ DELETE failed:', {
        status: deleteResponse.status,
        statusText: deleteResponse.statusText,
        body: errorText,
        url: deleteUrl
      });
      throw new Error(`DELETE failed: HTTP ${deleteResponse.status} - ${errorText}`);
    }

    // Verificar si el DELETE fue exitoso
    try {
      const deletedData = await deleteResponse.text();
      console.log('✅ DELETE successful, response:', deletedData);
    } catch (parseError) {
      console.log('✅ DELETE successful (no response body)');
    }

    console.log(`✅ Vineyard "${targetApiVineyard.nombre}" deleted successfully`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error in deleteVineyard:`, error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Unknown error occurred while deleting vineyard: ${String(error)}`);
    }
  }
}
