// src/app/vineyards/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Grape,
  TrendingUp,
  AlertTriangle,
  Eye,
  Droplets,
  Thermometer,
  Leaf,
  Zap,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Vineyard, Plot } from "@/types";
import { getVineyardById, getPlotsByVineyardId } from "@/lib/data";

// Componente para mostrar tendencias con flechitas
const TrendIndicator: React.FC<{ trend: string; value: string }> = ({ trend, value }) => {
  const getTrendConfig = (trend: string) => {
    switch (trend) {
      case 'up_good':
        return { icon: '↗️', color: 'text-green-600', bg: 'bg-green-50' };
      case 'up_bad':
        return { icon: '↗️', color: 'text-red-600', bg: 'bg-red-50' };
      case 'down_good':
        return { icon: '↘️', color: 'text-green-600', bg: 'bg-green-50' };
      case 'down_bad':
        return { icon: '↘️', color: 'text-red-600', bg: 'bg-red-50' };
      case 'stable_good':
        return { icon: '➡️', color: 'text-green-600', bg: 'bg-green-50' };
      case 'stable_bad':
        return { icon: '➡️', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      default:
        return { icon: '➡️', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const config = getTrendConfig(trend);

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${config.bg}`}>
      <span className="text-sm">{config.icon}</span>
      <span className={`text-xs font-medium ${config.color}`}>{value}</span>
    </div>
  );
};

// Componente para mostrar alertas
const AlertBadge: React.FC<{ alert: Plot['alerts'] }> = ({ alert }) => {
  const getAlertConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { variant: "destructive" as const, icon: '🚨', text: alert.action_required };
      case 'high':
        return { variant: "destructive" as const, icon: '⚠️', text: alert.action_required };
      case 'medium':
        return { variant: "secondary" as const, icon: '⚡', text: alert.action_required };
      case 'low':
        return { variant: "outline" as const, icon: '📋', text: alert.action_required };
      default:
        return { variant: "outline" as const, icon: '✅', text: 'Todo bien' };
    }
  };

  const config = getAlertConfig(alert.priority);

  return (
    <div className="space-y-1">
      <Badge variant={config.variant} className="text-xs">
        {config.icon} {config.text}
      </Badge>
      <div className="text-xs text-muted-foreground">
        {alert.time_frame}
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function VineyardDetailPage() {
  const params = useParams();
  const vineyardId = params?.id as string;
  const [vineyard, setVineyard] = useState<Vineyard | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vineyardId) {
      const vineyardData = getVineyardById(vineyardId);
      const plotsData = getPlotsByVineyardId(vineyardId);
      
      setVineyard(vineyardData || null);
      setPlots(plotsData);
      setLoading(false);
    }
  }, [vineyardId]);

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!vineyard) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Viñedo no encontrado</h1>
        <Link href="/vineyards">
          <Button>Volver a Viñedos</Button>
        </Link>
      </div>
    );
  }

  // Calcular estadísticas del viñedo
  const avgBrix = plots.reduce((acc, plot) => acc + plot.prediction.brix_next_7d, 0) / plots.length;
  const avgMoisture = plots.reduce((acc, plot) => acc + plot.prediction.soil_moisture_next_7d, 0) / plots.length;
  const avgQuality = plots.reduce((acc, plot) => acc + plot.prediction.quality_score, 0) / plots.length;
  const readyToHarvest = plots.filter(plot => plot.prediction.harvest_recommendation === 'optimal').length;
  const criticalAlerts = plots.filter(plot => plot.alerts.priority === 'critical').length;
  const totalArea = plots.reduce((acc, plot) => acc + plot.area_ha, 0);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/vineyards">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{vineyard.name}</h1>
          <Badge variant="outline" className="hidden sm:inline-flex">
            <MapPin className="mr-1 h-3 w-3" />
            {vineyard.location}
          </Badge>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        {/* Información general del viñedo */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Imagen y datos básicos */}
          <Card className="md:col-span-1">
            <CardContent className="p-0">
              <Image
                src={vineyard.imageUrl}
                alt={vineyard.name}
                width={400}
                height={300}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-6">
                <h2 className="font-bold text-xl mb-2">{vineyard.name}</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{vineyard.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Grape className="h-4 w-4" />
                    <span>{vineyard.grapeVarietals}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{vineyard.totalPlots} parcelas • {totalArea.toFixed(1)} ha</span>
                  </div>
                </div>
                {vineyard.iotData.pests && (
                  <Badge variant="destructive" className="mt-4">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Alerta de Plagas
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Métricas predictivas */}
          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="°Brix Predicho"
              value={`${avgBrix.toFixed(1)}°`}
              icon={<Grape className="h-4 w-4 text-muted-foreground" />}
              description="Promedio a 7 días"
            />
            <MetricCard
              title="Humedad Estimada"
              value={`${avgMoisture.toFixed(0)}%`}
              icon={<Droplets className="h-4 w-4 text-muted-foreground" />}
              description="Suelo a 7 días"
            />
            <MetricCard
              title="Listas p/Cosecha"
              value={`${readyToHarvest}/${plots.length}`}
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              description="Parcelas óptimas"
            />
            <MetricCard
              title="Alertas Críticas"
              value={criticalAlerts}
              icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              description="Requieren acción"
            />
          </div>
        </div>

        {/* Tabla detallada de monitoreo predictivo por parcelas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Monitoreo Predictivo por Parcelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Humedad</TableHead>
                    <TableHead>Temp</TableHead>
                    <TableHead>pH</TableHead>
                    <TableHead>EC</TableHead>
                    <TableHead>Luz</TableHead>
                    <TableHead>°Brix</TableHead>
                    <TableHead>Tendencias</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Alertas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plots.map((plot) => (
                    <TableRow key={plot.id}>
                      <TableCell className="font-medium">
                        {plot.plotNumber}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">{plot.currentSensorData.soil_moisture.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">Actual</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">{plot.currentSensorData.temperature.toFixed(0)}°C</div>
                          <div className="text-xs text-muted-foreground">Actual</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">{plot.currentSensorData.soil_ph.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">pH</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">{plot.currentSensorData.electrical_conductivity.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">mS/cm</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">{plot.currentSensorData.light_intensity.toFixed(0)}</div>
                          <div className="text-xs text-muted-foreground">lux</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">{plot.currentSensorData.brix_current.toFixed(1)}° / {plot.prediction.brix_next_7d.toFixed(1)}°</div>
                          <div className="text-xs text-muted-foreground">
                            Actual / Predicho 7d
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <TrendIndicator trend={plot.trends.brix_trend} value="Brix" />
                          <TrendIndicator trend={plot.trends.moisture_trend} value="Agua" />
                          {(plot.trends.ph_trend !== 'stable_good' || plot.trends.temp_trend !== 'stable_good') && (
                            <div className="space-y-1">
                              {plot.trends.ph_trend !== 'stable_good' && (
                                <TrendIndicator trend={plot.trends.ph_trend} value="pH" />
                              )}
                              {plot.trends.temp_trend !== 'stable_good' && (
                                <TrendIndicator trend={plot.trends.temp_trend} value="Temp" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant={
                              plot.prediction.harvest_recommendation === 'optimal' ? 'default' :
                              plot.prediction.harvest_recommendation === 'harvest_soon' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {plot.prediction.harvest_recommendation === 'optimal' ? 'Óptimo' :
                             plot.prediction.harvest_recommendation === 'harvest_soon' ? 'Pronto' : 'Esperar'}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Calidad: {plot.prediction.quality_score}/100
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertBadge alert={plot.alerts} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de condiciones ambientales por parcela */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Condiciones Ambientales por Parcela
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plots.map((plot) => (
                <div key={plot.id} className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Parcela #{plot.plotNumber}</h4>
                    <div className="text-sm text-muted-foreground">
                      {plot.area_ha.toFixed(1)} ha • {plot.soilType} • {plot.exposure}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Temperatura</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {plot.currentSensorData.temperature.toFixed(1)}°C
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {plot.trends.temp_trend !== 'stable_good' && (
                          <TrendIndicator trend={plot.trends.temp_trend} value="Temp" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Humedad Suelo</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {plot.currentSensorData.soil_moisture.toFixed(0)}%
                      </div>
                      <div className="text-xs">
                        <TrendIndicator trend={plot.trends.moisture_trend} value="↗7d: " />
                        <span className="text-muted-foreground ml-1">
                          {plot.prediction.soil_moisture_next_7d.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Grape className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">°Brix</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {plot.currentSensorData.brix_current.toFixed(1)}°
                      </div>
                      <div className="text-xs">
                        <TrendIndicator trend={plot.trends.brix_trend} value="↗7d: " />
                        <span className="text-muted-foreground ml-1">
                          {plot.prediction.brix_next_7d.toFixed(1)}°
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">pH Suelo</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {plot.currentSensorData.soil_ph.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {plot.trends.ph_trend !== 'stable_good' && (
                          <TrendIndicator trend={plot.trends.ph_trend} value="pH" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">EC</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {plot.currentSensorData.electrical_conductivity.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        mS/cm
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Luz</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {plot.currentSensorData.light_intensity.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        lux
                      </div>
                    </div>
                  </div>
                  
                  {/* Información adicional de la parcela */}
                  <div className="mt-4 pt-3 border-t border-muted">
                    <div className="grid gap-2 sm:grid-cols-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Plantación:</span>
                        <span className="ml-1 font-medium">{plot.plantingYear} ({plot.vineAge} años)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pendiente:</span>
                        <span className="ml-1 font-medium">{plot.slope}°</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">M. Orgánica:</span>
                        <span className="ml-1 font-medium">{plot.iotData.organic_matter.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}