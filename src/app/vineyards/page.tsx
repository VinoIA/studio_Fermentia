// src/app/vineyards/page.tsx

"use client";

import Link from "next/link"
import { PlusCircle, Eye, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getVineyards, getAllHarvestPredictions } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

export default function VineyardsPage() {
    const vineyards = getVineyards();
    const predictions = getAllHarvestPredictions();

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <div className="flex items-center">
                        <div className="ml-auto flex items-center gap-2">
                            <Link href="/vineyards/new">
                               <Button size="sm" className="h-8 gap-1">
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Añadir Viñedo
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Viñedos</CardTitle>
                            <CardDescription>
                                Gestiona tus viñedos y mira su estado. Haz clic en "Ver Detalle" para ver las métricas de cada parcela.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Variedades</TableHead>
                                        <TableHead>Parcelas</TableHead>
                                        <TableHead>Predicción °Brix</TableHead>
                                        <TableHead>Rendimiento</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vineyards.map((vineyard) => {
                                        const prediction = predictions[vineyard.id];
                                        // Calcular promedio de parcelas
                                        const avgBrix = vineyard.plots.reduce((acc, plot) => acc + plot.prediction.brix_next_7d, 0) / vineyard.plots.length;
                                        const avgYield = vineyard.plots.reduce((acc, plot) => acc + plot.prediction.yield_final, 0) / vineyard.plots.length;
                                        const readyPlots = vineyard.plots.filter(plot => plot.prediction.harvest_recommendation === 'optimal').length;
                                        
                                        return (
                                            <TableRow key={vineyard.id}>
                                                <TableCell className="font-medium">
                                                    <Link href={`/vineyards/${vineyard.id}`} className="hover:text-primary">
                                                        {vineyard.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{vineyard.location}</TableCell>
                                                <TableCell>
                                                    {vineyard.iotData.pests ? (
                                                         <Badge variant="destructive">Alerta de Plaga</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Saludable</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{vineyard.grapeVarietals}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div>{vineyard.totalPlots} parcelas</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {readyPlots > 0 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <TrendingUp className="mr-1 h-3 w-3" />
                                                                    {readyPlots} listas
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-semibold">{avgBrix.toFixed(1)}°</div>
                                                        <div className="text-xs text-muted-foreground">Promedio</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-semibold">{Math.round(avgYield).toLocaleString()}</div>
                                                        <div className="text-xs text-muted-foreground">kg/ha</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/vineyards/${vineyard.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver Detalle
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <div className="text-xs text-muted-foreground">
                                Mostrando <strong>1-{vineyards.length}</strong> de <strong>{vineyards.length}</strong> viñedos
                            </div>
                        </CardFooter>
                    </Card>
                </main>
            </div>
        </div>
    )
}