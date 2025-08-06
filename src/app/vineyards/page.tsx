
"use client";

import Link from "next/link"
import { PlusCircle } from "lucide-react"

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
import { getVineyards } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

export default function VineyardsPage() {
    const vineyards = getVineyards();

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
                                Gestiona tus viñedos y mira su estado.
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
                                        <TableHead className="text-right">Parcelas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vineyards.map((vineyard) => (
                                        <TableRow key={vineyard.id}>
                                            <TableCell className="font-medium">{vineyard.name}</TableCell>
                                            <TableCell>{vineyard.location}</TableCell>
                                            <TableCell>
                                                {vineyard.iotData.pests ? (
                                                     <Badge variant="destructive">Alerta de Plaga</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Saludable</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{vineyard.grapeVarietals}</TableCell>
                                            <TableCell className="text-right">{vineyard.totalPlots}</TableCell>
                                        </TableRow>
                                    ))}
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
