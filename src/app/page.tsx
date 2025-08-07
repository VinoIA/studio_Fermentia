// src/app/page.tsx

"use client";

import { useState, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import {
  Bot,
  Search,
  Wine,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  Grape,
  CircleUser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Vineyard, Message, HarvestPrediction } from "@/types";
import { AIChatModal } from "@/components/ui/ai-chat-modal";
import { AIRecommendations } from "@/components/ui/ai-recommendations";
import { VineyardCRUDModal } from "@/components/ui/vineyard-crud-modal";
import { Badge } from "@/components/ui/badge";
import { getVineyards, getHarvestPrediction } from "@/lib/data";

const VineyardCard: React.FC<{ vineyard: Vineyard; prediction: HarvestPrediction | null; onEdit: () => void; onView: () => void }> = ({ vineyard, prediction, onEdit, onView }) => (
  <Card className="bg-card border-border/50 overflow-hidden hover:border-primary/50 transition-colors duration-300">
    <CardContent className="p-0">
      <div className="flex flex-col">
        {/* Imagen y datos básicos */}
        <div className="flex items-stretch">
          <div className="flex-shrink-0 w-[150px] md:w-[200px]">
            <Image src={vineyard.imageUrl} alt={vineyard.name} data-ai-hint={vineyard.imageHint} width={200} height={150} className="w-full h-full object-cover" />
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg">{vineyard.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {vineyard.location}
              </p>
              <p className="text-sm text-muted-foreground">
                Parcelas: {vineyard.totalPlots} | Uvas: {vineyard.grapeVarietals}
              </p>
              {vineyard.iotData.pests && (
                <Badge variant="destructive" className="mt-2 w-fit">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Alerta de Plaga
                </Badge>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={onView} className="flex-1">
                Ver Detalles
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                Gestionar
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

const Header: React.FC = () => (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <Wine className="h-6 w-6 text-primary" />
                <span className="sr-only">Vineyard AI</span>
            </Link>
            <Link href="/" className="text-foreground transition-colors hover:text-foreground">
                Resumen
            </Link>
            <Link href="/vineyards" className="text-muted-foreground transition-colors hover:text-foreground">
                Gestionar Viñedos
            </Link>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form className="ml-auto flex-1 sm:flex-initial">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar..."
                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
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

export default function DashboardPage() {
  const [vineyards, setVineyards] = useState<Vineyard[]>([]);
  const [predictions, setPredictions] = useState<{ [key: string]: HarvestPrediction | null }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCRUDModal, setShowCRUDModal] = useState(false);
  const [selectedVineyard, setSelectedVineyard] = useState<Vineyard | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'view'>('view');
  
  useEffect(() => {
    // Cargar datos en el cliente para evitar hidratación problems
    const loadData = async () => {
      try {
        const vineyardData = getVineyards();
        setVineyards(vineyardData);
        
        // Cargar predicciones para todos los viñedos
        const newPredictions: { [key: string]: HarvestPrediction | null } = {};
        vineyardData.forEach(vineyard => {
          newPredictions[vineyard.id] = getHarvestPrediction(vineyard.id);
        });
        setPredictions(newPredictions);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleCRUDSuccess = () => {
    // Recargar datos después de operaciones CRUD
    const vineyardData = getVineyards();
    setVineyards(vineyardData);
    setSelectedVineyard(null);
  };

  const openCRUDModal = (mode: 'create' | 'edit' | 'delete' | 'view', vineyard?: Vineyard) => {
    setModalMode(mode);
    setSelectedVineyard(vineyard || null);
    setShowCRUDModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Resumen de Viñedos</h1>
                <div className="ml-auto flex items-center gap-2">
                    <AIChatModal 
                      trigger={
                        <Button variant="outline" className="gap-2">
                          <Bot className="h-4 w-4" />
                          Chat con IA
                        </Button>
                      }
                    />
                </div>
            </div>
            
            {/* Resumen de predicciones */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">°Brix Promedio</CardTitle>
                  <Grape className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.values(predictions).filter(p => p).length > 0 ? 
                      (Object.values(predictions).reduce((acc, p) => acc + (p?.brix_next_7d || 0), 0) / 
                       Object.values(predictions).filter(p => p).length).toFixed(1) : '0'}°
                  </div>
                  <p className="text-xs text-muted-foreground">Predicción a 7 días</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rendimiento Esperado</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.values(predictions).filter(p => p).length > 0 ? 
                      Math.round(Object.values(predictions).reduce((acc, p) => acc + (p?.yield_final || 0), 0) / 
                       Object.values(predictions).filter(p => p).length).toLocaleString() : '0'} kg/ha
                  </div>
                  <p className="text-xs text-muted-foreground">Promedio estimado</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Listos para Cosecha</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.values(predictions).filter(p => p && p.harvest_recommendation === 'optimal').length}
                  </div>
                  <p className="text-xs text-muted-foreground">De {vineyards.length} viñedos</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vineyards.filter(v => v.iotData.pests).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Plagas detectadas</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                {vineyards.map((vineyard) => (
                    <VineyardCard 
                      key={vineyard.id} 
                      vineyard={vineyard} 
                      prediction={predictions[vineyard.id]}
                      onView={() => openCRUDModal('view', vineyard)}
                      onEdit={() => openCRUDModal('edit', vineyard)}
                    />
                ))}
                 <Card 
                    onClick={() => openCRUDModal('create')}
                    className="flex flex-col items-center justify-center h-full border-2 border-dashed hover:border-primary/80 hover:bg-muted/50 transition-colors duration-300 cursor-pointer"
                 >
                    <CardContent className="flex flex-col items-center justify-center p-6">
                        <PlusCircle className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-center font-semibold">Añadir Nuevo Viñedo</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recomendaciones de IA */}
            <div className="grid gap-4 md:grid-cols-2">
              <AIRecommendations />
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Configuración de IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    La IA analiza continuamente tus datos para generar recomendaciones inteligentes.
                  </p>
                  <div className="flex gap-2">
                    <AIChatModal 
                      trigger={
                        <Button variant="outline" size="sm">
                          <Bot className="h-4 w-4 mr-2" />
                          Configurar IA
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

             <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Vista de Mapa</h2>
                <Card className="overflow-hidden">
                  <Image src="https://placehold.co/1200x500.png" data-ai-hint="map" width={1200} height={500} alt="Mapa de viñedos" className="w-full object-cover"/>
                </Card>
              </div>

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