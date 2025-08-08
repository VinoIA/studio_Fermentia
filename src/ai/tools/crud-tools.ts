// src/ai/tools/crud-tools.ts
'use server';

import { fetchVineyards, fetchVineyardById, createVineyard, updateVineyard, deleteVineyard } from '@/lib/api';
import type { AIAction, AIRecommendation } from '@/types';
import type { ToolResult } from './tool-definitions';

// Herramienta para leer datos de viñedos desde la API real
export async function getVineyardInfo(params: { vineyardName?: string }): Promise<ToolResult> {
  try {
    if (params.vineyardName) {
      // Buscar viñedo específico por nombre
      const allVineyards = await fetchVineyards();
      const vineyard = allVineyards.find(v => 
        v.name.toLowerCase().includes(params.vineyardName!.toLowerCase())
      );
      
      if (!vineyard) {
        return {
          success: false,
          error: `Viñedo "${params.vineyardName}" no encontrado`,
          action: {
            id: Date.now().toString(),
            type: 'READ',
            entity: 'vineyard',
            description: `Búsqueda fallida: ${params.vineyardName}`,
            timestamp: Date.now(),
            executed: false
          }
        };
      }

      return {
        success: true,
        data: vineyard,
        action: {
          id: Date.now().toString(),
          type: 'READ',
          entity: 'vineyard',
          description: `Consulta exitosa de viñedo: ${vineyard.name}`,
          data: { vineyardName: params.vineyardName, found: vineyard.name },
          timestamp: Date.now(),
          executed: true
        }
      };
    } else {
      // Obtener todos los viñedos
      const vineyards = await fetchVineyards();
      
      return {
        success: true,
        data: {
          vineyards,
          summary: {
            total: vineyards.length,
            locations: [...new Set(vineyards.map(v => v.location))],
            varieties: [...new Set(vineyards.map(v => v.grapeVarietals))],
            harvestStatus: vineyards.reduce((acc, v) => {
              acc[v.harvestStatus] = (acc[v.harvestStatus] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            withPests: vineyards.filter(v => v.iotData?.pests).length,
            averageTemp: Math.round(vineyards.reduce((sum, v) => sum + v.temperature, 0) / vineyards.length * 10) / 10
          }
        },
        action: {
          id: Date.now().toString(),
          type: 'READ',
          entity: 'vineyard',
          description: `Consulta exitosa de todos los viñedos (${vineyards.length} encontrados)`,
          timestamp: Date.now(),
          executed: true
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener datos de viñedos',
      action: {
        id: Date.now().toString(),
        type: 'READ',
        entity: 'vineyard',
        description: 'Error al consultar API de viñedos',
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Herramienta para crear nuevos viñedos en la API real
export async function createVineyardTool(params: {
  nombre: string;
  ubicacion: string;
  variedadUva: string;
  temperatura?: number;
  humedad?: number;
  estadoCosecha?: string;
  fechaCosecha?: string;
}): Promise<ToolResult> {
  try {
    const vineyardData = {
      name: params.nombre,
      location: params.ubicacion,
      grapeVarietals: params.variedadUva,
      temperature: params.temperatura || 25,
      humidity: params.humedad || 60,
      harvestStatus: params.estadoCosecha || "Pendiente",
      harvestDate: params.fechaCosecha || new Date().toISOString().split('T')[0]
    };
    
    const newVineyard = await createVineyard(vineyardData);
    
    return {
      success: true,
      data: newVineyard,
      action: {
        id: Date.now().toString(),
        type: 'CREATE',
        entity: 'vineyard',
        description: `✅ Viñedo creado exitosamente: "${newVineyard.name}" en ${newVineyard.location}`,
        data: {
          id: newVineyard.id,
          nombre: newVineyard.name,
          ubicacion: newVineyard.location,
          variedad: newVineyard.grapeVarietals
        },
        timestamp: Date.now(),
        executed: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear viñedo',
      action: {
        id: Date.now().toString(),
        type: 'CREATE',
        entity: 'vineyard',
        description: `❌ Error al crear viñedo: ${params.nombre}`,
        data: params,
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Herramienta para actualizar viñedos en la API real
export async function updateVineyardTool(params: {
  id: string;
  nombre?: string;
  ubicacion?: string;
  variedadUva?: string;
  temperatura?: number;
  humedad?: number;
  estadoCosecha?: string;
  fechaCosecha?: string;
}): Promise<ToolResult> {
  try {
    // Primero verificar que el viñedo existe
    const existingVineyard = await fetchVineyardById(params.id);
    if (!existingVineyard) {
      return {
        success: false,
        error: `Viñedo con ID ${params.id} no encontrado`,
        action: {
          id: Date.now().toString(),
          type: 'UPDATE',
          entity: 'vineyard',
          description: `❌ Viñedo ID ${params.id} no existe`,
          timestamp: Date.now(),
          executed: false
        }
      };
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (params.nombre) updateData.name = params.nombre;
    if (params.ubicacion) updateData.location = params.ubicacion;
    if (params.variedadUva) updateData.grapeVarietals = params.variedadUva;
    if (params.temperatura) updateData.temperature = params.temperatura;
    if (params.humedad) updateData.humidity = params.humedad;
    if (params.estadoCosecha) updateData.harvestStatus = params.estadoCosecha;
    if (params.fechaCosecha) updateData.harvestDate = params.fechaCosecha;

    const updatedVineyard = await updateVineyard(params.id, updateData);
    
    return {
      success: true,
      data: updatedVineyard,
      action: {
        id: Date.now().toString(),
        type: 'UPDATE',
        entity: 'vineyard',
        description: `✅ Viñedo actualizado: "${updatedVineyard.name}" (ID: ${params.id})`,
        data: {
          id: params.id,
          cambios: Object.keys(updateData),
          nombre: updatedVineyard.name
        },
        timestamp: Date.now(),
        executed: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar viñedo',
      action: {
        id: Date.now().toString(),
        type: 'UPDATE',
        entity: 'vineyard',
        description: `❌ Error al actualizar viñedo ID: ${params.id}`,
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Herramienta para eliminar viñedos de la API real (por id o por nombre)
export async function deleteVineyardTool(params: { id?: string; nombre?: string; confirm?: boolean }): Promise<ToolResult> {
  try {
    const now = Date.now();
    let targetId = params.id?.toString().trim();
    let vineyard: any | null = null;

    // Si no hay ID pero hay nombre, buscarlo primero
    if (!targetId && params.nombre) {
      const all = await fetchVineyards();
      const match = all.filter(v => v.name.toLowerCase().includes(params.nombre!.toLowerCase()));
      if (match.length === 0) {
        return {
          success: false,
          error: `No encontré viñedos que coincidan con "${params.nombre}"`,
          action: {
            id: now.toString(),
            type: 'DELETE',
            entity: 'vineyard',
            description: `❌ Sin coincidencias por nombre: ${params.nombre}`,
            timestamp: now,
            executed: false
          }
        };
      }
      if (match.length > 1) {
        return {
          success: false,
          error: `Hay ${match.length} coincidencias para "${params.nombre}". Especifica el ID exacto.`,
          action: {
            id: now.toString(),
            type: 'DELETE',
            entity: 'vineyard',
            description: `⚠️ Varias coincidencias por nombre: ${params.nombre}`,
            data: { candidatos: match.map(v => ({ id: v.id, nombre: v.name, ubicacion: v.location })) },
            timestamp: now,
            executed: false
          }
        };
      }
      targetId = match[0].id;
      vineyard = match[0];
    }

    if (!targetId) {
      return {
        success: false,
        error: 'Falta el ID o el nombre del viñedo a eliminar',
        action: {
          id: now.toString(),
          type: 'DELETE',
          entity: 'vineyard',
          description: '❌ Parámetros insuficientes para eliminar',
          timestamp: now,
          executed: false
        }
      };
    }

    // Obtener el viñedo por ID para confirmar datos
    if (!vineyard) {
      vineyard = await fetchVineyardById(targetId);
    }
    if (!vineyard) {
      return {
        success: false,
        error: `Viñedo con ID ${targetId} no encontrado`,
        action: {
          id: now.toString(),
          type: 'DELETE',
          entity: 'vineyard',
          description: `❌ Viñedo ID ${targetId} no existe`,
          timestamp: now,
          executed: false
        }
      };
    }

    // Confirmación simple (placeholder para flujos con confirm modal)
    if (params.confirm === false) {
      return {
        success: false,
        error: 'Operación cancelada por el usuario',
        requiresConfirmation: true
      };
    }

    const success = await deleteVineyard(targetId);
    
    if (!success) {
      return {
        success: false,
        error: 'Error al eliminar viñedo de la API',
        action: {
          id: Date.now().toString(),
          type: 'DELETE',
          entity: 'vineyard',
          description: `❌ Error al eliminar: ${vineyard.name}`,
          timestamp: Date.now(),
          executed: false
        }
      };
    }
    
    // Verificar refrescando lista para asegurar que ya no aparece
    let remaining: any[] = [];
    try {
      remaining = await fetchVineyards();
    } catch {}
    const stillExists = remaining.some(v => v.id === (targetId as string));

    return {
      success: true,
      data: { deletedVineyard: vineyard, verified: !stillExists },
      action: {
        id: now.toString(),
        type: 'DELETE',
        entity: 'vineyard',
        description: `🗑️ Viñedo eliminado: "${vineyard.name}" (ID: ${targetId})`,
        data: { 
          id: targetId, 
          nombre: vineyard.name,
          ubicacion: vineyard.location
        },
        timestamp: now,
        executed: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar viñedo',
      action: {
        id: Date.now().toString(),
        type: 'DELETE',
        entity: 'vineyard',
        description: `❌ Error al eliminar viñedo ID: ${params.id}`,
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Herramienta para obtener predicciones de cosecha (simuladas basadas en datos reales)
export async function getHarvestPredictions(params: { vineyardId?: string }): Promise<ToolResult> {
  try {
    if (params.vineyardId) {
      const vineyard = await fetchVineyardById(params.vineyardId);
      if (!vineyard) {
        return {
          success: false,
          error: `Viñedo con ID ${params.vineyardId} no encontrado`,
          action: {
            id: Date.now().toString(),
            type: 'READ',
            entity: 'prediction',
            description: `Predicción fallida: viñedo no encontrado`,
            timestamp: Date.now(),
            executed: false
          }
        };
      }

      // Generar predicción basada en datos reales
      const prediction = generatePredictionFromVineyard(vineyard);
      
      return {
        success: true,
        data: {
          vineyard: vineyard.name,
          location: vineyard.location,
          prediction,
          currentStatus: vineyard.harvestStatus,
          harvestDate: vineyard.harvestDate
        },
        action: {
          id: Date.now().toString(),
          type: 'read',
          entity: 'prediction',
          description: `Predicción generada para: ${vineyard.name}`,
          timestamp: Date.now(),
          executed: true
        }
      };
    } else {
      // Obtener predicciones para todos los viñedos
      const vineyards = await fetchVineyards();
      const predictions = vineyards.map(v => ({
        id: v.id,
        name: v.name,
        location: v.location,
        currentStatus: v.harvestStatus,
        harvestDate: v.harvestDate,
        prediction: generatePredictionFromVineyard(v)
      }));

      return {
        success: true,
        data: { predictions, total: predictions.length },
        action: {
          id: Date.now().toString(),
          type: 'read',
          entity: 'prediction',
          description: `Predicciones generadas para ${predictions.length} viñedos`,
          timestamp: Date.now(),
          executed: true
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener predicciones',
      action: {
        id: Date.now().toString(),
        type: 'read',
        entity: 'prediction',
        description: 'Error al generar predicciones',
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Función auxiliar para generar predicciones basadas en datos reales
function generatePredictionFromVineyard(vineyard: any) {
  const temp = vineyard.temperature || 25;
  const humidity = vineyard.humidity || 60;
  
  // Simular predicción basada en temperatura y humedad
  let brix = 18 + (temp - 20) * 0.3 + (Math.random() - 0.5) * 2;
  brix = Math.max(15, Math.min(28, brix));
  
  let yield_kg_ha = 7000 + (30 - Math.abs(temp - 25)) * 100 + (70 - Math.abs(humidity - 65)) * 50;
  yield_kg_ha = Math.max(4000, Math.min(12000, Math.round(yield_kg_ha)));
  
  let recommendation = 'wait';
  if (brix >= 24) recommendation = 'optimal';
  else if (brix >= 22) recommendation = 'harvest_soon';
  
  return {
    brix_next_7d: Math.round(brix * 10) / 10,
    yield_final: yield_kg_ha,
    confidence_brix: 0.8 + Math.random() * 0.15,
    confidence_yield: 0.75 + Math.random() * 0.2,
    harvest_recommendation: recommendation,
    temperature_factor: temp,
    humidity_factor: humidity
  };
}

// Herramienta para análisis de datos y recomendaciones (usando datos reales de la API)
export async function analyzeDataAndRecommend(params: {
  dataType: 'vineyard' | 'harvest' | 'general';
  context?: string;
}): Promise<ToolResult> {
  try {
    const vineyards = await fetchVineyards();
    const currentTime = Date.now();

    if (vineyards.length === 0) {
      return {
        success: true,
        data: {
          recommendations: [{
            id: `${currentTime}_empty`,
            type: 'suggestion',
            title: 'No hay viñedos registrados',
            description: 'Comienza agregando tu primer viñedo para recibir análisis y recomendaciones personalizadas.',
            priority: 'low',
            data: { source: 'system' },
            confidence: 1.0,
            timestamp: currentTime
          }]
        },
        action: {
          id: currentTime.toString(),
          type: 'READ',
          entity: 'report',
          description: 'Análisis realizado: base de datos vacía',
          timestamp: currentTime,
          executed: true
        }
      };
    }

    const recommendations: AIRecommendation[] = [];
    
    // Analizar plagas
    const vineyardsWithPests = vineyards.filter(v => v.iotData?.pests);
    if (vineyardsWithPests.length > 0) {
      recommendations.push({
        id: `${currentTime}_pests`,
        type: 'warning',
        title: 'Alerta de Plagas Detectada',
        description: `Se han detectado plagas en ${vineyardsWithPests.length} viñedo(s): ${vineyardsWithPests.map(v => v.name).join(', ')}. Aplicar tratamiento inmediatamente.`,
        priority: 'critical',
        data: { 
          affected_vineyards: vineyardsWithPests.map(v => v.name),
          actions: ['Inspección detallada', 'Aplicar insecticida orgánico', 'Monitoreo intensivo'],
          source: 'real_data'
        },
        confidence: 0.95,
        timestamp: currentTime
      });
    }

    // Analizar temperaturas extremas
    const hotVineyards = vineyards.filter(v => v.temperature > 30);
    const coldVineyards = vineyards.filter(v => v.temperature < 15);
    
    if (hotVineyards.length > 0) {
      recommendations.push({
        id: `${currentTime}_heat`,
        type: 'warning',
        title: 'Temperaturas Elevadas',
        description: `${hotVineyards.length} viñedo(s) registran temperaturas superiores a 30°C. Riesgo de estrés hídrico en las vides.`,
        priority: 'high',
        data: { 
          affected_vineyards: hotVineyards.map(v => `${v.name} (${v.temperature}°C)`),
          actions: ['Aumentar riego', 'Verificar sistema de irrigación', 'Monitorear humedad del suelo'],
          source: 'real_data'
        },
        confidence: 0.88,
        timestamp: currentTime
      });
    }

    // Analizar humedad
    const lowHumidityVineyards = vineyards.filter(v => v.humidity < 50);
    if (lowHumidityVineyards.length > 0) {
      recommendations.push({
        id: `${currentTime}_humidity`,
        type: 'suggestion',
        title: 'Humedad Baja Detectada',
        description: `${lowHumidityVineyards.length} viñedo(s) presentan humedad relativa baja (<50%). Considerar ajustes en el riego.`,
        priority: 'medium',
        data: { 
          affected_vineyards: lowHumidityVineyards.map(v => `${v.name} (${v.humidity}%)`),
          benefits: ['Mejor desarrollo de la uva', 'Reducción de estrés hídrico', 'Optimización de la calidad'],
          source: 'real_data'
        },
        confidence: 0.82,
        timestamp: currentTime
      });
    }

    // Analizar estado de cosecha
    const readyToHarvest = vineyards.filter(v => v.harvestStatus === 'En progreso');
    const pendingHarvest = vineyards.filter(v => v.harvestStatus === 'Pendiente');

    if (readyToHarvest.length > 0) {
      recommendations.push({
        id: `${currentTime}_harvest_active`,
        type: 'insight',
        title: 'Cosechas en Progreso',
        description: `${readyToHarvest.length} viñedo(s) están en proceso de cosecha. Asegurar logística y calidad del proceso.`,
        priority: 'medium',
        data: { 
          active_vineyards: readyToHarvest.map(v => `${v.name} - ${v.harvestDate}`),
          actions: ['Verificar cronograma', 'Coordinar equipos', 'Control de calidad'],
          source: 'real_data'
        },
        confidence: 0.9,
        timestamp: currentTime
      });
    }

    // Recomendación general de optimización
    if (recommendations.length === 0) {
      recommendations.push({
        id: `${currentTime}_optimization`,
        type: 'optimization',
        title: 'Sistema Funcionando Correctamente',
        description: 'Todos los viñedos están dentro de parámetros normales. Continuar con el monitoreo regular.',
        priority: 'low',
        data: { 
          summary: `${vineyards.length} viñedos monitoreados`,
          benefits: ['Mantenimiento preventivo', 'Monitoreo continuo', 'Optimización estacional'],
          source: 'real_data'
        },
        confidence: 0.85,
        timestamp: currentTime
      });
    }

    return {
      success: true,
      data: {
        recommendations: recommendations.slice(0, 5), // Máximo 5 recomendaciones
        summary: `Análisis completado: ${vineyards.length} viñedos evaluados, ${recommendations.length} recomendaciones generadas`,
        stats: {
          total_vineyards: vineyards.length,
          with_pests: vineyardsWithPests.length,
          high_temp: hotVineyards.length,
          low_humidity: lowHumidityVineyards.length,
          harvest_active: readyToHarvest.length,
          harvest_pending: pendingHarvest.length,
          source: 'mockapi_real_data'
        }
      },
      action: {
        id: currentTime.toString(),
        type: 'READ',
        entity: 'report',
        description: `Análisis completo realizado con datos reales de ${vineyards.length} viñedos`,
        data: { dataType: params.dataType, vineyardCount: vineyards.length },
        timestamp: currentTime,
        executed: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar recomendaciones',
      action: {
        id: Date.now().toString(),
        type: 'READ',
        entity: 'report',
        description: 'Error en análisis de datos',
        timestamp: Date.now(),
        executed: false
      }
    };
  }
}

// Función para ejecutar herramientas
export async function executeAITool(toolName: string, params: any): Promise<ToolResult> {
  switch (toolName) {
    case 'getVineyardInfo':
      return getVineyardInfo(params);
    case 'createVineyard':
      return createVineyardTool(params);
    case 'updateVineyard':
      return updateVineyardTool(params);
    case 'deleteVineyard':
      return deleteVineyardTool(params);
    case 'getHarvestPredictions':
      return getHarvestPredictions(params);
    case 'analyzeDataAndRecommend':
      return analyzeDataAndRecommend(params);
    default:
      return {
        success: false,
        error: `Herramienta desconocida: ${toolName}`,
        action: {
          id: Date.now().toString(),
          type: 'READ',
          entity: 'vineyard',
          description: `Error: herramienta desconocida ${toolName}`,
          timestamp: Date.now(),
          executed: false
        }
      };
  }
}
