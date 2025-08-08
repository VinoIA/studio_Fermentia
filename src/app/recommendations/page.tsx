import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bug, Droplets, Thermometer, Eye } from 'lucide-react';

// Tipos para las recomendaciones
interface Recommendation {
  id: string;
  type: string;
  priority: 'alta' | 'media' | 'baja';
  title: string;
  description: string;
  action: string;
  vineyard: string;
  location: string;
  pestType?: string;
  riskLevel?: string;
  confidence?: number;
  data?: any;
  timestamp?: number;
}

// Función para obtener recomendaciones en el servidor
async function getRecommendations(): Promise<{ success: boolean; recommendations: Recommendation[]; error?: string }> {
  try {
    console.log('🔄 Generating recommendations server-side...');
    
    // Obtener datos directamente de MockAPI
    const MOCKAPI_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io/vinedos';
    
    console.log('📡 Fetching vineyard data from MockAPI...');
    const response = await fetch(MOCKAPI_URL, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' 
      },
      signal: AbortSignal.timeout(10000) // 10 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`MockAPI error: ${response.status} ${response.statusText}`);
    }

    const vineyards = await response.json();
    console.log(`📊 Found ${vineyards.length} vineyards in MockAPI`);
    
    if (!Array.isArray(vineyards) || vineyards.length === 0) {
      throw new Error('No vineyard data available from MockAPI');
    }

    // Generar recomendaciones basadas en datos reales
    const recommendations: Recommendation[] = [];
    
    vineyards.forEach((vineyard: any) => {
      const vineyardName = vineyard.nombre || 'Viñedo sin nombre';
      const location = vineyard.ubicacion || 'Ubicación desconocida';
      const temp = vineyard.temperatura || 0;
      const humidity = vineyard.humedad || 0;
      const grapeVariety = vineyard.variedadUva || 'Variedad desconocida';
      const harvestStatus = vineyard.estadoCosecha || 'Desconocido';

      // 🐛 ALERTAS DE PLAGAS basadas en condiciones reales
      
      // Pulgón - Alta humedad + temperatura moderada
      if (humidity > 70 && temp >= 20 && temp <= 28) {
        recommendations.push({
          id: `pest-aphid-${vineyard.id}`,
          type: 'warning',
          priority: 'alta',
          title: `🐛 Riesgo de pulgones en ${vineyardName}`,
          description: `Condiciones favorables: ${temp}°C y ${humidity}% humedad ideales para pulgones`,
          action: 'Aplicar tratamiento preventivo con aceite neem o insecticida biológico',
          vineyard: vineyardName,
          location: location,
          pestType: 'pulgon',
          riskLevel: 'alto',
          confidence: 0.85,
          data: { temperature: temp, humidity: humidity, risk: 'alto' },
          timestamp: Date.now()
        });
      }

      // Araña roja - Temperatura alta + baja humedad
      if (temp > 30 && humidity < 50) {
        recommendations.push({
          id: `pest-spider-${vineyard.id}`,
          type: 'warning',
          priority: 'alta',
          title: `🕷️ Alerta de araña roja en ${vineyardName}`,
          description: `Temperatura ${temp}°C y humedad ${humidity}% favorecen araña roja`,
          action: 'Incrementar humedad ambiental y aplicar acaricida específico',
          vineyard: vineyardName,
          location: location,
          pestType: 'arana_roja',
          riskLevel: 'alto',
          confidence: 0.90,
          data: { temperature: temp, humidity: humidity, risk: 'alto' },
          timestamp: Date.now()
        });
      }

      // Mildiu - Alta humedad + temperatura moderada
      if (humidity > 80 && temp >= 15 && temp <= 25) {
        recommendations.push({
          id: `pest-mildew-${vineyard.id}`,
          type: 'warning',
          priority: 'alta',
          title: `🍄 Riesgo crítico de mildiu en ${vineyardName}`,
          description: `Humedad ${humidity}% y temperatura ${temp}°C son ideales para mildiu`,
          action: 'Aplicar fungicida preventivo (cobre o sistémico) URGENTE',
          vineyard: vineyardName,
          location: location,
          pestType: 'mildiu',
          riskLevel: 'crítico',
          confidence: 0.95,
          data: { temperature: temp, humidity: humidity, risk: 'crítico' },
          timestamp: Date.now()
        });
      }

      // Trips - Condiciones secas y calurosas
      if (temp > 28 && humidity < 60) {
        recommendations.push({
          id: `pest-thrips-${vineyard.id}`,
          type: 'warning',
          priority: 'media',
          title: `🦟 Riesgo de trips en ${vineyardName}`,
          description: `Condiciones secas (${humidity}%) y temperatura ${temp}°C favorecen trips`,
          action: 'Monitorear hojas jóvenes y aplicar trampas azules',
          vineyard: vineyardName,
          location: location,
          pestType: 'trips',
          riskLevel: 'medio',
          confidence: 0.75,
          data: { temperature: temp, humidity: humidity, risk: 'medio' },
          timestamp: Date.now()
        });
      }

      // 🌱 RECOMENDACIONES DE CUIDADO basadas en datos específicos

      // Riego según temperatura
      if (temp > 32) {
        recommendations.push({
          id: `care-irrigation-hot-${vineyard.id}`,
          type: 'care',
          priority: 'alta',
          title: `💧 Riego intensivo para ${vineyardName}`,
          description: `Temperatura ${temp}°C requiere riego frecuente para evitar estrés hídrico`,
          action: 'Regar 2-3 veces por semana en horas tempranas (6-8 AM)',
          vineyard: vineyardName,
          location: location,
          confidence: 0.9,
          data: { temperature: temp, recommendation: 'riego_intensivo' },
          timestamp: Date.now()
        });
      } else if (temp > 28) {
        recommendations.push({
          id: `care-irrigation-warm-${vineyard.id}`,
          type: 'care',
          priority: 'media',
          title: `🚿 Riego moderado para ${vineyardName}`,
          description: `Mantener humedad del suelo constante con ${temp}°C`,
          action: 'Riego por goteo 1-2 veces por semana',
          vineyard: vineyardName,
          location: location,
          confidence: 0.8,
          data: { temperature: temp, recommendation: 'riego_moderado' },
          timestamp: Date.now()
        });
      }

      // Recomendaciones específicas por variedad
      if (grapeVariety.toLowerCase().includes('merlot')) {
        recommendations.push({
          id: `care-merlot-${vineyard.id}`,
          type: 'care',
          priority: 'media',
          title: `🍇 Cuidado específico Merlot - ${vineyardName}`,
          description: `Merlot requiere manejo especial en clima ${temp}°C`,
          action: 'Controlar exposición solar y mantener humedad del suelo constante',
          vineyard: vineyardName,
          location: location,
          confidence: 0.85,
          data: { variety: grapeVariety, temperature: temp },
          timestamp: Date.now()
        });
      }

      // Estado de cosecha
      if (harvestStatus.toLowerCase().includes('pendiente')) {
        const currentMonth = new Date().getMonth() + 1;
        if (currentMonth >= 2 && currentMonth <= 4) { // Época de cosecha
          recommendations.push({
            id: `harvest-ready-${vineyard.id}`,
            type: 'harvest',
            priority: 'alta',
            title: `🍇 Preparar cosecha en ${vineyardName}`,
            description: `${grapeVariety} con estado "${harvestStatus}" en época de cosecha`,
            action: 'Monitorear niveles de azúcar (Brix) y planificar cosecha',
            vineyard: vineyardName,
            location: location,
            confidence: 0.9,
            data: { status: harvestStatus, variety: grapeVariety },
            timestamp: Date.now()
          });
        }
      }
    });

    console.log(`✅ Generated ${recommendations.length} recommendations from real data`);
    
    return {
      success: true,
      recommendations: recommendations,
      error: undefined
    };
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    
    // Fallback: usar datos de ejemplo basados en MockAPI típico
    const fallbackRecommendations: Recommendation[] = [
      {
        id: 'fallback-pest-1',
        type: 'warning',
        priority: 'media',
        title: '🐛 Vigilar condiciones para pulgones',
        description: 'Las condiciones de humedad moderada pueden favorecer el desarrollo de pulgones',
        action: 'Inspeccionar hojas regularmente y aplicar tratamiento preventivo si es necesario',
        vineyard: 'Viñedos en general',
        location: 'Colombia',
        pestType: 'pulgon',
        riskLevel: 'medio',
        confidence: 0.7,
        timestamp: Date.now()
      },
      {
        id: 'fallback-care-1',
        type: 'care',
        priority: 'alta',
        title: '🌱 Monitoreo estacional recomendado',
        description: 'Época ideal para revisar el estado general de los viñedos',
        action: 'Realizar inspección visual completa y verificar sistema de riego',
        vineyard: 'Todos los viñedos',
        location: 'General',
        confidence: 0.8,
        timestamp: Date.now()
      },
      {
        id: 'fallback-merlot-1',
        type: 'care',
        priority: 'media',
        title: '🍇 Cuidado específico para Merlot',
        description: 'Variedades Merlot requieren atención especial en esta época',
        action: 'Controlar exposición solar y mantener humedad del suelo',
        vineyard: 'Viñedos Merlot',
        location: 'Colombia',
        confidence: 0.85,
        timestamp: Date.now()
      },
      {
        id: 'fallback-harvest-1',
        type: 'harvest',
        priority: 'alta',
        title: '🍇 Preparación para cosecha',
        description: 'Viñedos con estado pendiente requieren preparación',
        action: 'Monitorear niveles de azúcar y planificar logística de cosecha',
        vineyard: 'Viñedos en cosecha',
        location: 'Colombia',
        confidence: 0.9,
        timestamp: Date.now()
      }
    ];

    return {
      success: false,
      recommendations: fallbackRecommendations,
      error: `Error conectando con MockAPI: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

export default async function RecommendationsPage() {
  const data = await getRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baja': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string, pestType?: string) => {
    if (pestType) {
      return <Bug className="h-4 w-4" />;
    }
    
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'care': return <Droplets className="h-4 w-4" />;
      case 'harvest': return <CheckCircle className="h-4 w-4" />;
      case 'irrigation': return <Droplets className="h-4 w-4" />;
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'info': 
      case 'suggestion': return <Eye className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatConfidence = (confidence?: number) => {
    if (!confidence) return '';
    return `${Math.round(confidence * 100)}% confianza`;
  };

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recomendaciones FermentIA 🍇</h1>
          <p className="text-gray-600 mt-2">
            Análisis inteligente y sugerencias para optimizar tus viñedos
          </p>
          {data.recommendations.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.recommendations.length} recomendación{data.recommendations.length !== 1 ? 'es' : ''} disponibles
            </p>
          )}
        </div>
      </div>

      {data.error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {data.error}
            {!data.success && " - Mostrando recomendaciones de respaldo."}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Sistema funcionando correctamente
          </AlertDescription>
        </Alert>
      )}

      {data.recommendations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Todo está en orden</h3>
            <p className="text-muted-foreground">
              No hay recomendaciones urgentes en este momento. Tus viñedos están funcionando correctamente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.recommendations.map((rec) => (
            <Card key={rec.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(rec.type, rec.pestType)}
                    <Badge variant={getPriorityColor(rec.priority) as any}>
                      {rec.priority}
                    </Badge>
                  </div>
                  {rec.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(rec.timestamp)}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{rec.title}</CardTitle>
                <CardDescription className="text-sm">
                  📍 {rec.vineyard} • {rec.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {rec.description}
                </p>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    💡 Acción recomendada:
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rec.action}
                  </p>
                </div>

                {(rec.confidence || rec.riskLevel) && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {rec.confidence && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formatConfidence(rec.confidence)}
                      </span>
                    )}
                    {rec.riskLevel && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Riesgo {rec.riskLevel}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
