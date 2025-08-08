'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Grape,
  Wine,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Vineyard, HarvestPrediction } from '@/types';
import { VineyardCRUDModal } from '@/components/ui/vineyard-crud-modal';
import { fetchVineyards } from '@/lib/api';

interface VineyardStats {
  total: number;
  totalPlots: number;
  averageTemperature: number;
  averageHumidity: number;
  withPests: number;
  pestPercentage: number;
}

export default function VineyardsPage() {
  const [vineyards, setVineyards] = useState<Vineyard[]>([]);
  const [filteredVineyards, setFilteredVineyards] = useState<Vineyard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<VineyardStats | null>(null);
  const [predictions, setPredictions] = useState<Map<string, HarvestPrediction>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVineyard, setSelectedVineyard] = useState<Vineyard | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'delete' | 'view'>('view');
  const [showCRUDModal, setShowCRUDModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadVineyards();
    loadStats();
  }, []);

  // Filtrar viñedos cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVineyards(vineyards);
    } else {
      const filtered = vineyards.filter(vineyard =>
        vineyard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vineyard.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vineyard.grapeVarietals.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVineyards(filtered);
    }
  }, [searchQuery, vineyards]);

  const loadVineyards = async () => {
    try {
      setIsLoading(true);
      const data = await fetchVineyards();
      setVineyards(data);

      // Cargar predicciones simuladas para cada viñedo
      const predictionMap = new Map<string, HarvestPrediction>();
      for (const vineyard of data) {
        try {
          // Generar predicción simulada basada en datos del viñedo
          const prediction = generatePredictionFromVineyard(vineyard);
          predictionMap.set(vineyard.id, prediction);
        } catch (error) {
          console.warn(`No se pudo generar predicción para viñedo ${vineyard.id}`);
        }
      }
      setPredictions(predictionMap);
    } catch (error) {
      console.error('Error cargando viñedos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await fetchVineyards();
      const statsData: VineyardStats = {
        total: data.length,
        totalPlots: data.reduce((sum, v) => sum + (v.totalPlots || 10), 0),
        averageTemperature: data.length > 0 ? Math.round(data.reduce((sum, v) => sum + v.temperature, 0) / data.length * 10) / 10 : 0,
        averageHumidity: data.length > 0 ? Math.round(data.reduce((sum, v) => sum + v.humidity, 0) / data.length * 10) / 10 : 0,
        withPests: data.filter(v => v.iotData?.pests).length,
        pestPercentage: data.length > 0 ? Math.round((data.filter(v => v.iotData?.pests).length / data.length) * 100) : 0
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Función para generar predicción simulada basada en datos del viñedo
  const generatePredictionFromVineyard = (vineyard: Vineyard): HarvestPrediction => {
    const temp = vineyard.temperature || 25;
    const humidity = vineyard.humidity || 60;
    
    // Simular predicción basada en temperatura y humedad
    let brix = 18 + (temp - 20) * 0.3 + (Math.random() - 0.5) * 2;
    brix = Math.max(15, Math.min(28, brix));
    
    let yield_kg_ha = 7000 + (30 - Math.abs(temp - 25)) * 100 + (70 - Math.abs(humidity - 65)) * 50;
    yield_kg_ha = Math.max(4000, Math.min(12000, Math.round(yield_kg_ha)));
    
    let recommendation: "optimal" | "wait" | "harvest_soon" = 'wait';
    if (brix >= 24) recommendation = 'optimal';
    else if (brix >= 22) recommendation = 'harvest_soon';

    return {
      id: vineyard.id,
      vineyardId: vineyard.id,
      vineyardName: vineyard.name,
      location: vineyard.location,
      grapeVarietals: vineyard.grapeVarietals,
      brix_next_7d: Math.round(brix * 10) / 10,
      yield_final: yield_kg_ha,
      confidence_brix: 0.8 + Math.random() * 0.15,
      confidence_yield: 0.75 + Math.random() * 0.2,
      harvest_recommendation: recommendation,
      created_at: Date.now()
    };
  };

  const handleCRUDSuccess = (vineyard?: Vineyard) => {
    loadVineyards();
    loadStats();
    setSelectedVineyard(null);
  };

  const openCRUDModal = (mode: 'create' | 'delete' | 'view', vineyard?: Vineyard) => {
    setModalMode(mode);
    setSelectedVineyard(vineyard || null);
    setShowCRUDModal(true);
  };

  const VineyardCard = ({ vineyard, prediction }: { vineyard: Vineyard; prediction: HarvestPrediction | null }) => (
    <Card className="bg-card border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Datos básicos */}
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-bold text-lg mb-1">{vineyard.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{vineyard.location}</p>
              <p className="text-sm text-muted-foreground mb-3">
                Parcelas: {vineyard.totalPlots || 10} | Uvas: {vineyard.grapeVarietals}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Temperatura:</span>
                  <span className="ml-1 font-medium">{vineyard.temperature}°C</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Humedad:</span>
                  <span className="ml-1 font-medium">{vineyard.humidity}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="ml-1 font-medium">{vineyard.harvestStatus}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cosecha:</span>
                  <span className="ml-1 font-medium">{vineyard.harvestDate}</span>
                </div>
              </div>
            </div>
              
            {/* Acciones CRUD */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCRUDModal('view', vineyard)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCRUDModal('delete', vineyard)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Predicciones de cosecha */}
          {prediction && (
            <div className="p-4 bg-muted/20 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Grape className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Predicciones de Cosecha</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">°Brix (7 días)</span>
                    <span className="text-sm font-semibold">{prediction.brix_next_7d}°</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Confianza</span>
                    <span className="text-xs">{(prediction.confidence_brix * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Rendimiento</span>
                    <span className="text-sm font-semibold">{prediction.yield_final.toLocaleString()} kg/ha</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Confianza</span>
                    <span className="text-xs">{(prediction.confidence_yield * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-center">
                <Badge 
                  variant={
                    prediction.harvest_recommendation === 'optimal' ? 'default' :
                    prediction.harvest_recommendation === 'harvest_soon' ? 'secondary' : 'outline'
                  }
                  className="text-xs"
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {prediction.harvest_recommendation === 'optimal' ? 'Cosecha Óptima' :
                   prediction.harvest_recommendation === 'harvest_soon' ? 'Cosechar Pronto' : 'Esperar'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const StatsCard = ({ title, value, subtitle, icon: Icon, variant = 'default' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    variant?: 'default' | 'destructive';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variant === 'destructive' ? 'text-destructive' : ''}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando viñedos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header de la página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Viñedos</h1>
            <p className="text-muted-foreground">
              Administra tu portafolio de viñedos con IA integrada
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => openCRUDModal('create')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Viñedo
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Viñedos"
              value={stats.total}
              subtitle="en el portafolio"
              icon={Wine}
            />
            <StatsCard
              title="Parcelas Totales"
              value={stats.totalPlots}
              subtitle="distribuidas"
              icon={BarChart3}
            />
            <StatsCard
              title="Temperatura Promedio"
              value={`${stats.averageTemperature}°C`}
              subtitle="últimos 7 días"
              icon={TrendingUp}
            />
            <StatsCard
              title="Alertas de Plagas"
              value={`${stats.pestPercentage}%`}
              subtitle={`${stats.withPests} viñedos afectados`}
              icon={AlertTriangle}
              variant={stats.pestPercentage > 0 ? 'destructive' : 'default'}
            />
          </div>
        )}

        {/* Contenido principal con tabs */}
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="grid">Vista Cuadrícula</TabsTrigger>
              <TabsTrigger value="table">Vista Tabla</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={loadVineyards}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          <TabsContent value="grid" className="space-y-4">
            {filteredVineyards.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Wine className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery ? 'No se encontraron viñedos' : 'No hay viñedos registrados'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Comienza creando tu primer viñedo'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => openCRUDModal('create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Viñedo
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredVineyards.map((vineyard) => (
                  <VineyardCard
                    key={vineyard.id}
                    vineyard={vineyard}
                    prediction={predictions.get(vineyard.id) || null}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Listado de Viñedos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Nombre</th>
                        <th className="text-left py-2">Ubicación</th>
                        <th className="text-left py-2">Variedades</th>
                        <th className="text-left py-2">Parcelas</th>
                        <th className="text-left py-2">Estado</th>
                        <th className="text-left py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVineyards.map((vineyard) => (
                        <tr key={vineyard.id} className="border-b">
                          <td className="py-3 font-medium">{vineyard.name}</td>
                          <td className="py-3 text-muted-foreground">{vineyard.location}</td>
                          <td className="py-3 text-muted-foreground">{vineyard.grapeVarietals}</td>
                          <td className="py-3">{vineyard.totalPlots || 10}</td>
                          <td className="py-3">
                            <Badge variant={
                              vineyard.harvestStatus === 'Completada' ? 'default' :
                              vineyard.harvestStatus === 'En progreso' ? 'secondary' : 'outline'
                            }>
                              {vineyard.harvestStatus}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCRUDModal('view', vineyard)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCRUDModal('delete', vineyard)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal CRUD */}
      <VineyardCRUDModal
        isOpen={showCRUDModal}
        onClose={() => setShowCRUDModal(false)}
        vineyard={selectedVineyard}
        mode={modalMode}
        onSuccess={handleCRUDSuccess}
      />
    </div>
  );
}
