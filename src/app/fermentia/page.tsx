"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Lightbulb, AlertTriangle, FileText, Brain } from "lucide-react";
import { chatWithFermentia } from "@/app/actions";
import type { Message } from "@/types";

export default function FermentIAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        `session_${Date.now()}`
      );
      
      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.text,
        timestamp: Date.now(),
        metadata: {
          confidence: response.confidence,
          executedAction: response.actions?.[0]?.id
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
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

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">FermentIA - Chat Inteligente</h1>
      
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Conversación con FermentIA
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4 min-h-0">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>¡Hola! Soy FermentIA, tu asistente de IA especializado en viticultura.</p>
                  <p>Puedo ayudarte con análisis de datos, recomendaciones, y gestión de viñedos.</p>
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
          </div>

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
            <div className="flex-1">
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
            <Button type="submit" disabled={isLoading || !input.trim()} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
