// src/components/ui/ai-chat-modal.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bot, 
  User, 
  Send, 
  Brain, 
  Settings, 
  History, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Lightbulb
} from 'lucide-react';
import { chatWithFermentia } from '@/app/actions';
import type { Message, AIAction, TemperamentType } from '@/types';

interface AIChatModalProps {
  trigger?: React.ReactNode;
}

export function AIChatModal({ trigger }: AIChatModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [temperament, setTemperament] = useState<TemperamentType>('amigable');
  const [sessionId] = useState(() => Date.now().toString());
  const [actions, setActions] = useState<AIAction[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input,
      timestamp: Date.now()
    };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithFermentia(
        newMessages, 
        userMessage.content, 
        temperament,
        sessionId
      );
      
      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.text,
        timestamp: Date.now(),
        metadata: {
          temperament: response.temperament,
          confidence: response.confidence,
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setActions(prev => [...prev, ...(response.actions || [])]);
      setConfidence(response.confidence || null);
    } catch (error) {
       console.error(error);
       const errorMessage: Message = { 
         id: (Date.now() + 1).toString(), 
         role: 'assistant', 
         content: "Lo siento, tengo problemas para conectarme. Por favor, inténtalo de nuevo más tarde.",
         timestamp: Date.now()
       };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Por ahora solo mostrar el nombre del archivo
      setInput(`Analiza este archivo: ${file.name}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTemperamentDescription = (temp: TemperamentType): string => {
    const descriptions: Record<TemperamentType, string> = {
      creativo: "IA creativa e innovadora",
      formal: "IA formal y profesional", 
      técnico: "IA especializada en aspectos técnicos",
      directo: "IA directa y concisa",
      amigable: "IA amigable y conversacional"
    };
    return descriptions[temp];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            Asistente IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Fermentia - Asistente Inteligente de Viticultura
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="actions">Acciones</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col gap-4">
              {/* Área de mensajes */}
              <ScrollArea className="flex-1 h-[400px] border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>¡Hola! Soy Fermentia, tu asistente de IA especializado en viticultura.</p>
                      <p>Puedo ayudarte con análisis de datos, recomendaciones y gestión de viñedos.</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
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
                        <div>{message.content}</div>
                        {message.metadata?.confidence && (
                          <div className="mt-2 text-xs opacity-70">
                            Confianza: {(message.metadata.confidence * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User />
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
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Botones rápidos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAction("Analiza el estado actual de mis viñedos")}
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Análisis
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAction("¿Qué predicciones de cosecha tienes?")}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Predicciones
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAction("¿Hay alguna alerta de plagas?")}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Alertas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAction("Dame recomendaciones para optimizar mis viñedos")}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  Recomendar
                </Button>
              </div>

              {/* Formulario de entrada */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex-1 flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.pdf,.txt"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="flex-1">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Acciones Ejecutadas</h3>
                {actions.length === 0 ? (
                  <p className="text-muted-foreground">No hay acciones registradas aún.</p>
                ) : (
                  actions.map((action) => (
                    <Card key={action.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={action.executed ? "default" : "secondary"}>
                                {action.type}
                              </Badge>
                              <Badge variant="outline">{action.entity}</Badge>
                              {action.executed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm mb-2">{action.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(action.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Historial de Conversaciones</h3>
                <p className="text-muted-foreground">
                  Sesión actual: {sessionId}
                </p>
                {confidence && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Confianza promedio:</span>
                    <Badge variant="outline">
                      {(confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                )}
                {/* Aquí podrías mostrar sesiones anteriores */}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="settings" className="flex-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Configuración del Asistente</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Temperamento de la IA</label>
                    <Select value={temperament} onValueChange={(value: TemperamentType) => setTemperament(value)}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creativo">Creativo</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="técnico">Técnico</SelectItem>
                        <SelectItem value="directo">Directo</SelectItem>
                        <SelectItem value="amigable">Amigable</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTemperamentDescription(temperament)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
