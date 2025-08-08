
'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addVineyard } from '@/app/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Guardando...' : 'Guardar Viñedo'}
    </Button>
  );
}

export default function NewVineyardPage() {
  const initialState = { message: "", errors: {} };
  const [state, dispatch] = useFormState(addVineyard, initialState);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <form action={dispatch}>
        <div className="mx-auto grid max-w-6xl flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
                 <Link href="/vineyards">
                    <Button variant="outline" size="icon" className="h-7 w-7">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Atrás</span>
                    </Button>
                </Link>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Añadir Nuevo Viñedo
                </h1>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                     <Link href="/vineyards">
                        <Button variant="outline">Cancelar</Button>
                    </Link>
                    <SubmitButton />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del Viñedo</CardTitle>
                            <CardDescription>
                                Introduce la información principal de tu nuevo viñedo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        className="w-full"
                                        placeholder="Ej: Viñedo Los Olivos"
                                        required
                                    />
                                    {state.errors?.nombre && <p className="text-sm text-destructive">{state.errors.nombre}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="ubicacion">Ubicación</Label>
                                    <Input
                                        id="ubicacion"
                                        name="ubicacion"
                                        placeholder="Ej: Valle de Ica, Perú"
                                        required
                                    />
                                     {state.errors?.ubicacion && <p className="text-sm text-destructive">{state.errors.ubicacion}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="variedadUva">Variedad de Uva</Label>
                                    <Input
                                        id="variedadUva"
                                        name="variedadUva"
                                        placeholder="Ej: Quebranta, Malbec, Cabernet Sauvignon"
                                        required
                                    />
                                     {state.errors?.variedadUva && <p className="text-sm text-destructive">{state.errors.variedadUva}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="estadoCosecha">Estado de Cosecha</Label>
                                    <select
                                        id="estadoCosecha"
                                        name="estadoCosecha"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="">Seleccionar estado</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En progreso">En progreso</option>
                                        <option value="Finalizada">Finalizada</option>
                                    </select>
                                     {state.errors?.estadoCosecha && <p className="text-sm text-destructive">{state.errors.estadoCosecha}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="temperatura">Temperatura (°C)</Label>
                                        <Input
                                            id="temperatura"
                                            name="temperatura"
                                            type="number"
                                            placeholder="Ej: 25"
                                            min="-10"
                                            max="50"
                                            required
                                        />
                                        {state.errors?.temperatura && <p className="text-sm text-destructive">{state.errors.temperatura}</p>}
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="humedad">Humedad (%)</Label>
                                        <Input
                                            id="humedad"
                                            name="humedad"
                                            type="number"
                                            placeholder="Ej: 65"
                                            min="0"
                                            max="100"
                                            required
                                        />
                                        {state.errors?.humedad && <p className="text-sm text-destructive">{state.errors.humedad}</p>}
                                    </div>
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="fechaCosecha">Fecha de Cosecha</Label>
                                    <Input
                                        id="fechaCosecha"
                                        name="fechaCosecha"
                                        type="date"
                                        required
                                    />
                                     {state.errors?.fechaCosecha && <p className="text-sm text-destructive">{state.errors.fechaCosecha}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:hidden">
                 <Link href="/vineyards">
                    <Button variant="outline">Cancelar</Button>
                </Link>
                <SubmitButton />
            </div>
        </div>
      </form>
    </main>
  );
}
