
// src/app/vineyards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Grape,
  Wine,
  CircleUser,
  Bot,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Vineyard, HarvestPrediction } from '@/types';
import { VineyardCRUDModal } from '@/components/ui/vineyard-crud-modal';
import { AIChatModal } from '@/components/ui/ai-chat-modal';
import { AIRecommendations } from '@/components/ui/ai-recommendations';
import { getAllVineyards, searchVineyards, getVineyardStats } from '@/app/vineyard-actions';
import { getHarvestPrediction } from '@/lib/data';

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
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'view'>('view');
  const [showCRUDModal, setShowCRUDModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

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
      const data = await getAllVineyards();
      setVineyards(data);

      // Cargar predicciones para cada viñedo
      const predictionMap = new Map<string, HarvestPrediction>();
      for (const vineyard of data) {
        try {
          const prediction = await getHarvestPrediction(vineyard.id);
          if (prediction) {
            predictionMap.set(vineyard.id, prediction);
          }
        } catch (error) {
          console.warn(`No se pudo cargar predicción para viñedo ${vineyard.id}`);
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
      const statsData = await getVineyardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleCRUDSuccess = (vineyard?: Vineyard) => {
    loadVineyards();
    loadStats();
    setSelectedVineyard(null);
  };

  const openCRUDModal = (mode: 'create' | 'edit' | 'delete' | 'view', vineyard?: Vineyard) => {
    setModalMode(mode);
    setSelectedVineyard(vineyard || null);
    setShowCRUDModal(true);
  };

  const VineyardCard = ({ vineyard, prediction }: { vineyard: Vineyard; prediction: HarvestPrediction | null }) => (
    <Card className="bg-card border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Imagen y datos básicos */}
          <div className="flex items-stretch">
            <div className="flex-shrink-0 w-[150px] md:w-[200px]">
              <Image 
                src={vineyard.imageUrl} 
                alt={vineyard.name} 
                width={200} 
                height={150} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">{vineyard.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{vineyard.location}</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Parcelas: {vineyard.totalPlots} | Uvas: {vineyard.grapeVarietals}
                </p>
                {vineyard.iotData.pests && (
                  <Badge variant="destructive" className="mb-2 w-fit">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Alerta de Plaga
                  </Badge>
                )}
              </div>
              
              {/* Acciones CRUD */}
              <div className="flex gap-2 mt-2">
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
                  onClick={() => openCRUDModal('edit', vineyard)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
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

  const Header = () => (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Wine className="h-6 w-6 text-primary" />
          <span className="sr-only">Vineyard AI</span>
        </Link>
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Resumen
        </Link>
        <Link href="/vineyards" className="text-foreground transition-colors hover:text-foreground">
          Gestionar Viñedos
        </Link>
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar viñedos..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ajustes</DropdownMenuItem>
            <DropdownMenuItem>Soporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
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
      <Header />
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header de la página con acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Viñedos</h1>
            <p className="text-muted-foreground">
              Administra tu portafolio de viñedos con IA integrada
            </p>
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
              variant="outline"
              onClick={() => setShowAIChat(true)}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              Chat IA
            </Button>
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

        {/* Alertas */}
        {stats && stats.withPests > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atención:</strong> Se han detectado plagas en {stats.withPests} viñedo(s). 
              Se recomienda realizar inspecciones y aplicar tratamientos preventivos.
            </AlertDescription>
          </Alert>
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
                          <td className="py-3">{vineyard.totalPlots}</td>
                          <td className="py-3">
                            {vineyard.iotData.pests ? (
                              <Badge variant="destructive">Alerta Plaga</Badge>
                            ) : (
                              <Badge variant="outline">Normal</Badge>
                            )}
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
                                onClick={() => openCRUDModal('edit', vineyard)}
                              >
                                <Edit className="h-3 w-3" />
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

      {/* Modales */}
      <VineyardCRUDModal
        isOpen={showCRUDModal}
        onClose={() => setShowCRUDModal(false)}
        vineyard={selectedVineyard}
        mode={modalMode}
        onSuccess={handleCRUDSuccess}
      />

      {/* TODO: Arreglar props de estos modales */}
      {/* <AIChatModal
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />

      <AIRecommendations
        isOpen={showAIRecommendations}
        onClose={() => setShowAIRecommendations(false)}
        vineyards={vineyards}
      /> */}
    </div>
  );
}
