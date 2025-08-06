
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
  const initialState = { message: null, errors: {} };
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
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="w-full"
                                        placeholder="Ej: Finca Roble Alto"
                                        required
                                    />
                                    {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="location">Ubicación</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="Ej: Valle de Napa, California"
                                        required
                                    />
                                     {state.errors?.location && <p className="text-sm text-destructive">{state.errors.location}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="grapeVarietals">Variedades de Uva</Label>
                                    <Input
                                        id="grapeVarietals"
                                        name="grapeVarietals"
                                        placeholder="Ej: Cabernet Sauvignon, Merlot"
                                        required
                                    />
                                     {state.errors?.grapeVarietals && <p className="text-sm text-destructive">{state.errors.grapeVarietals}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="totalPlots">Total de Parcelas</Label>
                                    <Input
                                        id="totalPlots"
                                        name="totalPlots"
                                        type="number"
                                        placeholder="Ej: 12"
                                        required
                                    />
                                     {state.errors?.totalPlots && <p className="text-sm text-destructive">{state.errors.totalPlots}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Imagen del Viñedo</CardTitle>
                            <CardDescription>
                                Añade una imagen representativa para tu viñedo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                <Label htmlFor="imageUrl">URL de la Imagen</Label>
                                <Input
                                    id="imageUrl"
                                    name="imageUrl"
                                    type="url"
                                    placeholder="https://placehold.co/400x300.png"
                                    defaultValue="https://placehold.co/400x300.png"
                                    required
                                />
                                {state.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl}</p>}
                            </div>
                            <div className="grid gap-3 mt-4">
                                <Label htmlFor="imageHint">Pista para IA (Opcional)</Label>
                                <Input
                                    id="imageHint"
                                    name="imageHint"
                                    placeholder="Ej: vineyard sunset"
                                />
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
