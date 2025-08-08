// src/app/page.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Plus,
  TrendingUp,
  Grape,
  AlertTriangle,
  Wine,
  Thermometer,
  Droplets,
  Calendar,
  MapPin,
  RefreshCw,
  Zap,
  PlusCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import type { Vineyard, HarvestPrediction } from "@/types";
import { AIChatModal } from "../components/ui/ai-chat-modal";
import { VineyardCRUDModal } from "../components/ui/vineyard-crud-modal";
import { Badge } from "../components/ui/badge";
import { fetchVineyards } from "@/lib/api";
import { getHarvestPrediction } from "@/lib/data";

// Componente de tarjeta minimalista estilo isla
const VineyardIslandCard: React.FC<{ 
  vineyard: Vineyard; 
  prediction: HarvestPrediction | null; 
  onEdit: () => void; 
  onView: () => void 
}> = ({ vineyard, prediction, onEdit, onView }) => (
  <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 overflow-hidden">
    <CardContent className="p-0">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wine className="h-5 w-5" />
            <h3 className="font-bold text-lg">{vineyard.name}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            {vineyard.harvestStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-1 mt-1 text-white/90">
          <MapPin className="h-3 w-3" />
          <span className="text-sm">{vineyard.location}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 space-y-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
            <Thermometer className="h-4 w-4 mx-auto text-blue-600 mb-1" />
            <div className="text-lg font-bold text-blue-600">{vineyard.temperature}°C</div>
            <div className="text-xs text-muted-foreground">Temperatura</div>
          </div>
          <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl">
            <Droplets className="h-4 w-4 mx-auto text-cyan-600 mb-1" />
            <div className="text-lg font-bold text-cyan-600">{vineyard.humidity}%</div>
            <div className="text-xs text-muted-foreground">Humedad</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-xl">
            <Grape className="h-4 w-4 mx-auto text-green-600 mb-1" />
            <div className="text-lg font-bold text-green-600">{vineyard.totalPlots || 10}</div>
            <div className="text-xs text-muted-foreground">Parcelas</div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Variedad:</span>
            <span className="font-medium">{vineyard.grapeVarietals}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cosecha:</span>
            <span className="font-medium">{vineyard.harvestDate}</span>
          </div>
        </div>

        {/* Predicción si existe */}
        {prediction && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Predicción IA</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">°Brix:</span>
                <span className="ml-1 font-bold text-purple-600">{prediction.brix_next_7d}°</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rendimiento:</span>
                <span className="ml-1 font-bold text-purple-600">{Math.round(prediction.yield_final/1000)}k kg/ha</span>
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant={
                  prediction.harvest_recommendation === 'optimal' ? 'default' :
                  prediction.harvest_recommendation === 'harvest_soon' ? 'secondary' : 'outline'
                }
                className="text-xs"
              >
                {prediction.harvest_recommendation === 'optimal' ? '🎯 Cosecha Óptima' :
                 prediction.harvest_recommendation === 'harvest_soon' ? '⏰ Cosechar Pronto' : '⏳ Esperar'}
              </Badge>
            </div>
          </div>
        )}

        {/* Alerta de plagas */}
        {vineyard.iotData?.pests && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>¡Plagas detectadas!</strong> Requiere atención inmediata.
            </AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onView} 
            className="flex-1 text-xs"
          >
            Ver Detalles
          </Button>
          <Button 
            size="sm" 
            onClick={onEdit} 
            className="flex-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Gestionar
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componente de estadística en formato isla
const StatIsland: React.FC<{ 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: any; 
  color: string;
  trend?: 'up' | 'down' | 'stable';
}> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
    <CardContent className="p-0">
      <div className={`bg-gradient-to-r ${color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <Icon className="h-6 w-6" />
          {trend && (
            <TrendingUp className={`h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''} ${trend === 'stable' ? 'rotate-90' : ''}`} />
          )}
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{title}</div>
        </div>
      </div>
      {subtitle && (
        <div className="p-3 bg-white dark:bg-slate-900">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

// Header is now handled by TopNav in layout

interface VineyardStats {
  total: number;
  totalPlots: number;
  averageTemperature: number;
  averageHumidity: number;
  withPests: number;
  pestPercentage: number;
  lastUpdated: string;
}

export default function DashboardPage() {
  const [vineyards, setVineyards] = useState<Vineyard[]>([]);
  const [predictions, setPredictions] = useState<{ [key: string]: HarvestPrediction | null }>({});
  const [stats, setStats] = useState<VineyardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCRUDModal, setShowCRUDModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [selectedVineyard, setSelectedVineyard] = useState<Vineyard | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'view'>('view');
  const [alertsShown, setAlertsShown] = useState<Set<string>>(new Set()); // Evitar spam de alertas
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  
  useEffect(() => {
    // Cargar datos en el cliente desde la API real
    loadVineyardsFromAPI();
  }, []);

  const loadVineyardsFromAPI = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando viñedos desde API real...');
      
      const apiVineyards = await fetchVineyards();
      console.log('✅ Viñedos obtenidos:', apiVineyards.length);
      
      setVineyards(apiVineyards);
      
      // Generar estadísticas
      const statsData: VineyardStats = {
        total: apiVineyards.length,
        totalPlots: apiVineyards.reduce((sum, v) => sum + (v.totalPlots || 10), 0),
        averageTemperature: apiVineyards.length > 0 ? 
          Math.round(apiVineyards.reduce((sum, v) => sum + v.temperature, 0) / apiVineyards.length * 10) / 10 : 0,
        averageHumidity: apiVineyards.length > 0 ? 
          Math.round(apiVineyards.reduce((sum, v) => sum + v.humidity, 0) / apiVineyards.length * 10) / 10 : 0,
        withPests: apiVineyards.filter(v => v.iotData?.pests).length,
        pestPercentage: apiVineyards.length > 0 ? 
          Math.round((apiVineyards.filter(v => v.iotData?.pests).length / apiVineyards.length) * 100) : 0,
        lastUpdated: new Date().toLocaleTimeString('es-ES')
      };
      setStats(statsData);

      // Generar predicciones
      const predictionMap: { [key: string]: HarvestPrediction | null } = {};
      apiVineyards.forEach((vineyard: Vineyard) => {
        try {
          const prediction = getHarvestPrediction(vineyard.id);
          predictionMap[vineyard.id] = prediction;
        } catch (error) {
          console.warn(`No se pudo generar predicción para viñedo ${vineyard.id}`);
          predictionMap[vineyard.id] = null;
        }
      });
      setPredictions(predictionMap);

      // Mensaje de bienvenida de Fermentia
      if (apiVineyards.length > 0) {
        const pestCount = statsData.withPests;
        const locations = [...new Set(apiVineyards.map(v => v.location))];
        const varieties = [...new Set(apiVineyards.map(v => v.grapeVarietals))];
        
        let welcomeMsg = `🤖 ¡Hola! Soy Fermentia, tu asistente IA para viñedos. `;
        welcomeMsg += `He encontrado ${statsData.total} viñedo${statsData.total !== 1 ? 's' : ''} `;
        welcomeMsg += `en ${locations.length} ubicación${locations.length !== 1 ? 'es' : ''} `;
        welcomeMsg += `(${locations.join(', ')}) `;
        welcomeMsg += `con variedades: ${varieties.join(', ')}. `;
        
        if (pestCount > 0) {
          welcomeMsg += `⚠️ ALERTA: Detecté plagas en ${pestCount} viñedo${pestCount !== 1 ? 's' : ''}. `;
        }
        
        welcomeMsg += `Temperatura promedio: ${statsData.averageTemperature}°C. `;
        welcomeMsg += `¿En qué puedo ayudarte hoy?`;
        
        setWelcomeMessage(welcomeMsg);
      } else {
        setWelcomeMessage('🤖 ¡Hola! Soy Fermentia. No encontré viñedos registrados. ¿Te ayudo a crear tu primer viñedo?');
      }
      
    } catch (error) {
      console.error('❌ Error cargando viñedos:', error);
      setWelcomeMessage('🤖 ¡Hola! Soy Fermentia. Tuve problemas conectando con la API. ¿Quieres que lo intente de nuevo?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCRUDSuccess = () => {
    loadVineyardsFromAPI(); // Recargar datos después de cambios
    setSelectedVineyard(null);
    setShowCRUDModal(false);
  };

  const openCRUDModal = (mode: 'create' | 'edit' | 'delete' | 'view', vineyard?: Vineyard) => {
    setModalMode(mode);
    setSelectedVineyard(vineyard || null);
    setShowCRUDModal(true);
  };

  // Función para generar alertas inteligentes (sin spam)
  const getSmartAlerts = () => {
    if (!stats || !vineyards.length) return [];
    
    const alerts = [];
    const currentTime = Date.now();
    
    // Alerta de plagas (solo si hay plagas y no se ha mostrado en los últimos 5 minutos)
    if (stats.withPests > 0) {
      const pestAlertId = `pests_${stats.withPests}`;
      if (!alertsShown.has(pestAlertId)) {
        alerts.push({
          id: pestAlertId,
          type: 'critical' as const,
          message: `Se detectaron plagas en ${stats.withPests} viñedo${stats.withPests !== 1 ? 's' : ''}. Aplicar tratamiento inmediatamente.`,
          timestamp: currentTime
        });
        
        // Marcar como mostrada y remover después de 5 minutos
        setTimeout(() => {
          setAlertsShown(prev => new Set([...prev].filter(id => id !== pestAlertId)));
        }, 5 * 60 * 1000);
        
        setAlertsShown(prev => new Set([...prev, pestAlertId]));
      }
    }

    // Alerta de temperaturas extremas
    const hotVineyards = vineyards.filter(v => v.temperature > 30);
    if (hotVineyards.length > 0) {
      const heatAlertId = `heat_${hotVineyards.length}`;
      if (!alertsShown.has(heatAlertId)) {
        alerts.push({
          id: heatAlertId,
          type: 'warning' as const,
          message: `${hotVineyards.length} viñedo${hotVineyards.length !== 1 ? 's' : ''} con temperaturas superiores a 30°C. Verificar riego.`,
          timestamp: currentTime
        });
        
        setTimeout(() => {
          setAlertsShown(prev => new Set([...prev].filter(id => id !== heatAlertId)));
        }, 10 * 60 * 1000);
        
        setAlertsShown(prev => new Set([...prev, heatAlertId]));
      }
    }

    return alerts;
  };

  const smartAlerts = getSmartAlerts();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="font-medium">Conectando con tu API...</p>
              <p className="text-sm text-muted-foreground mt-2">Cargando datos de viñedos</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header de bienvenida con mensaje de Fermentia */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Viñedos</h1>
            <p className="text-muted-foreground">
              Monitoreo y gestión inteligente de viñedos
            </p>
            {stats && (
              <p className="text-xs text-muted-foreground mt-1">
                Última actualización: {stats.lastUpdated}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAIRecommendations(true)}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              Recomendaciones IA
            </Button>
            <Button
              onClick={() => setShowAIChat(true)}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              Chat con Fermentia
            </Button>
            <Button
              onClick={() => openCRUDModal('create')}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nuevo Viñedo
            </Button>
          </div>
        </div>

        {/* Mensaje de bienvenida de Fermentia */}
        {welcomeMessage && (
          <Card className="bg-primary/5 border-primary/20 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 mt-0.5 text-primary" />
                <p className="text-sm">{welcomeMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alertas inteligentes (sin spam) */}
        {smartAlerts.map((alert) => (
          <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{alert.type === 'critical' ? 'CRÍTICO:' : 'AVISO:'}</strong> {alert.message}
            </AlertDescription>
          </Alert>
        ))}

        {/* Estadísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatIsland
              title="Total Viñedos"
              value={stats.total}
              subtitle="conectados a la API"
              icon={Wine}
              color="from-green-500 to-emerald-600"
              trend="stable"
            />
            <StatIsland
              title="Parcelas Totales"
              value={stats.totalPlots}
              subtitle="en producción"
              icon={BarChart3}
              color="from-blue-500 to-cyan-600"
              trend="up"
            />
            <StatIsland
              title="Temperatura Promedio"
              value={`${stats.averageTemperature}°C`}
              subtitle="en tiempo real"
              icon={TrendingUp}
              color="from-orange-500 to-red-600"
              trend={stats.averageTemperature > 25 ? "up" : "stable"}
            />
            <StatIsland
              title="Alertas de Plagas"
              value={`${stats.pestPercentage}%`}
              subtitle={`${stats.withPests} viñedos afectados`}
              icon={AlertTriangle}
              color={stats.pestPercentage > 0 ? "from-red-500 to-pink-600" : "from-gray-500 to-slate-600"}
              trend={stats.pestPercentage > 0 ? "up" : "stable"}
            />
          </div>
        )}

        {/* Grid de viñedos */}
        {vineyards.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Wine className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay viñedos registrados</h3>
              <p className="text-muted-foreground mb-4">
                Conecta tu API o crea tu primer viñedo para comenzar
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => openCRUDModal('create')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Crear Primer Viñedo
                </Button>
                <Button variant="outline" onClick={loadVineyardsFromAPI}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar Conexión
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Viñedos Activos ({vineyards.length})</h2>
              <Button variant="outline" size="sm" onClick={loadVineyardsFromAPI}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vineyards.map((vineyard) => (
                <VineyardIslandCard
                  key={vineyard.id}
                  vineyard={vineyard}
                  prediction={predictions[vineyard.id]}
                  onEdit={() => openCRUDModal('edit', vineyard)}
                  onView={() => openCRUDModal('view', vineyard)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modales */}
      <VineyardCRUDModal
        isOpen={showCRUDModal}
        onClose={() => setShowCRUDModal(false)}
        vineyard={selectedVineyard}
        mode={modalMode}
        onSuccess={handleCRUDSuccess}
      />

      <AIChatModal
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialMessage={welcomeMessage}
        persistSession={true}
        onVineyardAction={loadVineyardsFromAPI}
      />

     
    </div>
  );
}