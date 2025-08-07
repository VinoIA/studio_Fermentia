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

const PlotStatusBadge: React.FC<{ recommendation: Plot['prediction']['harvest_recommendation'] }> = ({ recommendation }) => {
  const variants = {
    optimal: { variant: "default" as const, text: "Óptima", color: "text-green-600" },
    harvest_soon: { variant: "secondary" as const, text: "Pronto", color: "text-yellow-600" },
    wait: { variant: "outline" as const, text: "Esperar", color: "text-blue-600" }
  };
  
  const config = variants[recommendation] || variants.wait;
  
  return (
    <Badge variant={config.variant} className={`${config.color} text-xs`}>
      {config.text}
    </Badge>
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
  const avgYield = plots.reduce((acc, plot) => acc + plot.prediction.yield_final, 0) / plots.length;
  const avgQuality = plots.reduce((acc, plot) => acc + plot.prediction.quality_score, 0) / plots.length;
  const readyToHarvest = plots.filter(plot => plot.prediction.harvest_recommendation === 'optimal').length;
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

          {/* Métricas resumen */}
          <div className="md:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="°Brix Promedio"
              value={`${avgBrix.toFixed(1)}°`}
              icon={<Grape className="h-4 w-4 text-muted-foreground" />}
              description="Predicción a 7 días"
            />
            <MetricCard
              title="Rendimiento"
              value={`${Math.round(avgYield).toLocaleString()}`}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              description="kg/ha promedio"
            />
            <MetricCard
              title="Calidad"
              value={`${Math.round(avgQuality)}/100`}
              icon={<Leaf className="h-4 w-4 text-muted-foreground" />}
              description="Score de calidad"
            />
            <MetricCard
              title="Listas"
              value={`${readyToHarvest}/${plots.length}`}
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              description="Parcelas para cosecha"
            />
          </div>
        </div>

        {/* Tabla de parcelas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalle por Parcelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Suelo</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>°Brix</TableHead>
                    <TableHead>Rendimiento</TableHead>
                    <TableHead>Calidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cosecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plots.map((plot) => (
                    <TableRow key={plot.id}>
                      <TableCell className="font-medium">
                        {plot.plotNumber}
                      </TableCell>
                      <TableCell>
                        {plot.area_ha.toFixed(1)} ha
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{plot.soilType}</div>
                          <div className="text-xs text-muted-foreground">
                            pH: {plot.iotData.soil_ph.toFixed(1)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{plot.vineAge} años</div>
                          <div className="text-xs text-muted-foreground">
                            {plot.exposure}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {plot.prediction.brix_next_7d}°
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(plot.prediction.confidence_brix * 100).toFixed(0)}% confianza
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {plot.prediction.yield_final.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            kg/ha
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {plot.prediction.quality_score}/100
                          </div>
                          <Progress 
                            value={plot.prediction.quality_score} 
                            className="h-1 w-12"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <PlotStatusBadge recommendation={plot.prediction.harvest_recommendation} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(plot.prediction.expected_harvest_date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de condiciones ambientales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Condiciones Ambientales Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Temperatura</span>
                </div>
                <div className="text-lg font-semibold">
                  {vineyard.iotData.temp_mean_7d.toFixed(1)}°C
                </div>
                <div className="text-xs text-muted-foreground">
                  Media 7 días
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Humedad Rel.</span>
                </div>
                <div className="text-lg font-semibold">
                  {vineyard.iotData.hr_max_3d.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Máxima 3 días
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Humedad Suelo</span>
                </div>
                <div className="text-lg font-semibold">
                  {vineyard.iotData.soil_moist_mean_24h.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Media 24h
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">NDVI</span>
                </div>
                <div className="text-lg font-semibold">
                  {vineyard.iotData.ndvi_anom.toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Anomalía NDVI
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}