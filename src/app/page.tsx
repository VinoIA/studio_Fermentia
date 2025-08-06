"use client";

import { useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Bot,
  CircleUser,
  Search,
  Bell,
  Wine,
  Send,
  LoaderCircle,
  AlertTriangle,
  PlusCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Vineyard, Message } from "@/types";
import { chatWithFermentia } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { initialVineyards } from "@/lib/data";

const VineyardCard: React.FC<{ vineyard: Vineyard }> = ({ vineyard }) => (
  <Card className="bg-card border-border/50 overflow-hidden hover:border-primary/50 transition-colors duration-300">
    <CardContent className="p-0 flex items-stretch">
      <div className="flex-shrink-0 w-[150px] md:w-[200px]">
         <Image src={vineyard.imageUrl} alt={vineyard.name} data-ai-hint={vineyard.imageHint} width={200} height={150} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center">
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
    </CardContent>
  </Card>
);

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithFermentia(messages, userMessage.content);
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.text };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
       console.error(error);
       const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Lo siento, tengo problemas para conectarme. Por favor, inténtalo de nuevo más tarde." };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <Sheet>
        <SheetTrigger asChild>
          <Button>
            <Bot className="h-5 w-5" />
            <span>Habla con Fermentia</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] bg-background p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary"/>
              <span>Fermentia, tu experto en viñedos</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-76px)]">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                 {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8 px-4 rounded-lg bg-muted/50">
                    <Wine className="mx-auto h-10 w-10 mb-4 text-primary" />
                    <h3 className="font-semibold text-lg text-foreground mb-2">¡Bienvenido a Fermentia!</h3>
                    <p className="text-sm">¡Pregúntame sobre tus viñedos!</p>
                    <p className="text-xs mt-2">ej: "¿Hay alertas de plagas?" o "Resumen de Finca Roble Alto."</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 border-2 border-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg p-3 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                     {message.role === "user" && (
                       <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <CircleUser />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                     <Avatar className="h-8 w-8 border-2 border-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot />
                        </AvatarFallback>
                      </Avatar>
                     <div className="bg-muted rounded-lg p-3 flex items-center">
                        <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                     </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSendMessage} className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregúntale a Fermentia..."
                  className="pr-12 bg-muted focus:bg-background"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
  )
}

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
  const [vineyards] = useState<Vineyard[]>(initialVineyards);
  
  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Resumen de Viñedos</h1>
                <div className="ml-auto flex items-center gap-2">
                    <ChatPanel />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                {vineyards.map((vineyard) => (
                    <VineyardCard key={vineyard.id} vineyard={vineyard} />
                ))}
                 <Link href="/vineyards/new">
                    <Card className="flex flex-col items-center justify-center h-full border-2 border-dashed hover:border-primary/80 hover:bg-muted/50 transition-colors duration-300 cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <PlusCircle className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-center font-semibold">Añadir Nuevo Viñedo</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

             <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Vista de Mapa</h2>
                <Card className="overflow-hidden">
                  <Image src="https://placehold.co/1200x500.png" data-ai-hint="map" width={1200} height={500} alt="Mapa de viñedos" className="w-full object-cover"/>
                </Card>
              </div>

        </main>
    </div>
  );
}
