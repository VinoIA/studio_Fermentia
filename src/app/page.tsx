"use client";

import { useState } from "react";
import Image from 'next/image';
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
  ChevronDown,
  Dot,
  Send,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from "@/components/ui/sidebar";
import type { Vineyard, Message } from "@/types";
import { chatWithFermentia } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialVineyards: Vineyard[] = [
  {
    id: "1",
    name: "Oak Ridge Estate",
    location: "Napa Valley, California",
    grapeVarietals: "Cabernet Sauvignon, Merlot",
    totalPlots: 12,
    iotData: {
      pests: false,
    },
    imageUrl: "https://placehold.co/300x200.png",
    imageHint: "vineyard aerial"
  },
  {
    id: "2",
    name: "Willow Creek Vineyards",
    location: "Burgundy, France",
    grapeVarietals: "Chardonnay, Pinot Noir",
    totalPlots: 8,
     iotData: {
      pests: true,
    },
    imageUrl: "https://placehold.co/300x200.png",
    imageHint: "grapes vine"
  },
  {
    id: "3",
    name: "Sunset Valley Farms",
    location: "Tuscany, Italy",
    grapeVarietals: "Zinfandel, Syrah",
    totalPlots: 15,
     iotData: {
      pests: false,
    },
    imageUrl: "https://placehold.co/300x200.png",
    imageHint: "vineyard sunset"
  },
];

const VineyardCard: React.FC<{ vineyard: Vineyard }> = ({ vineyard }) => (
  <Card className="bg-card border-border/50 overflow-hidden">
    <CardContent className="p-0 flex items-center gap-4">
      <div className="p-4 flex-1">
        <h3 className="font-bold text-lg">{vineyard.name}</h3>
        <p className="text-sm text-muted-foreground">
          Total Plots: {vineyard.totalPlots}, Grape Varieties: {vineyard.grapeVarietals}
        </p>
         {vineyard.iotData.pests && (
            <Badge variant="destructive" className="mt-2">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Pest Alert
            </Badge>
          )}
        <Button variant="outline" size="sm" className="mt-4">View Details</Button>
      </div>
      <div className="flex-shrink-0">
         <img src={vineyard.imageUrl} alt={vineyard.name} data-ai-hint={vineyard.imageHint} className="w-[200px] h-full object-cover" />
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
       const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chat with Fermentia
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] bg-background p-0">
          <SheetHeader className="p-6">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary"/>
              Fermentia
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-76px)]">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                 {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Ask me anything about your vineyards!</p>
                    <p className="text-xs">e.g., "Any pest alerts this week?" or "Advice on pruning Chardonnay?"</p>
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
                      <Avatar className="h-8 w-8">
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
                     <Avatar className="h-8 w-8">
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
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Fermentia..."
                  className="pr-12"
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


export default function DashboardPage() {
  const [vineyards] = useState<Vineyard[]>(initialVineyards);
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Dot className="h-8 w-8 text-primary" />
              <h1 className="font-bold text-lg">Vineyard AI</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Dot />
                  Vineyard AI
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
                {/* Search input can be added here if needed */}
            </div>
            <div className="flex items-center gap-4">
               <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  className="bg-muted pl-10"
                />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Vineyard Overview</h1>
                  <p className="text-muted-foreground">
                    Monitor the health and status of your vineyards in real-time.
                  </p>
                </div>
                <ChatPanel />
              </div>
              
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Vineyard Summary</h2>
                <div className="grid grid-cols-1 gap-6">
                  {vineyards.map((vineyard) => (
                    <VineyardCard key={vineyard.id} vineyard={vineyard} />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Map View</h2>
                <Card className="overflow-hidden">
                  <Image src="https://placehold.co/1200x500.png" data-ai-hint="map" width={1200} height={500} alt="Map of vineyards" className="w-full object-cover"/>
                </Card>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Alert Summary</h2>
                 <Card className="overflow-hidden">
                  <Image src="https://placehold.co/1200x500.png" data-ai-hint="vineyard field" width={1200} height={500} alt="Vineyard with an alert" className="w-full object-cover"/>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
