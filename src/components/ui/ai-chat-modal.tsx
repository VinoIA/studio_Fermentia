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
  Lightbulb,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Download
} from 'lucide-react';
import { chatWithFermentia } from '@/app/actions';
import type { Message, AIAction, TemperamentType, ChatSession } from '@/types';

interface AIChatModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  initialMessage?: string;
  persistSession?: boolean;
  onVineyardAction?: () => void;
}

export function AIChatModal({ 
  trigger, 
  isOpen: externalIsOpen, 
  onClose: externalOnClose,
  initialMessage,
  persistSession = false,
  onVineyardAction
}: AIChatModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? 
    (open: boolean) => { if (!open) externalOnClose(); } : 
    setInternalIsOpen;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [temperament, setTemperament] = useState<TemperamentType>('amigable');
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
  const [actions, setActions] = useState<AIAction[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  
  // Nuevos estados para conversaciones
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessionTitle, setSessionTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar sesiones guardadas al montar
  useEffect(() => {
    if (persistSession) {
      const savedSessions = localStorage.getItem('fermentia_chat_sessions');
      if (savedSessions) {
        try {
          const sessions: ChatSession[] = JSON.parse(savedSessions);
          setChatSessions(sessions);
          
          // Si hay sesiones, cargar la más reciente
          if (sessions.length > 0) {
            const lastSession = sessions[sessions.length - 1];
            setCurrentSessionId(lastSession.id);
            setMessages(lastSession.messages);
            setTemperament(lastSession.temperament as TemperamentType);
            setSessionTitle(lastSession.title);
          }
        } catch (error) {
          console.warn('Error al cargar sesiones guardadas:', error);
        }
      }
    }
  }, [persistSession]);

  // Función para crear nueva conversación
  const createNewSession = () => {
    const newSessionId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: `Conversación ${chatSessions.length + 1}`,
      messages: [],
      temperament,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setChatSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setSessionTitle(newSession.title);
    
    // Agregar mensaje de bienvenida
    if (initialMessage) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: initialMessage,
        timestamp: Date.now(),
        metadata: {
          temperament: 'amigable',
          confidence: 1.0
        }
      };
      setMessages([welcomeMessage]);
    }
  };

  // Función para cambiar a una sesión específica
  const switchToSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setTemperament(session.temperament as TemperamentType);
      setSessionTitle(session.title);
    }
  };

  // Función para eliminar sesión
  const deleteSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        switchToSession(updatedSessions[updatedSessions.length - 1].id);
      } else {
        createNewSession();
      }
    }
    
    // Actualizar localStorage
    localStorage.setItem('fermentia_chat_sessions', JSON.stringify(updatedSessions));
  };

  // Función para guardar sesión actual
  const saveCurrentSession = () => {
    if (!currentSessionId || messages.length === 0) return;
    
    const updatedSessions = chatSessions.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages, 
            temperament,
            title: sessionTitle || session.title,
            updatedAt: Date.now() 
          }
        : session
    );
    
    setChatSessions(updatedSessions);
    localStorage.setItem('fermentia_chat_sessions', JSON.stringify(updatedSessions));
  };

  // Guardar automáticamente cuando cambien los mensajes
  useEffect(() => {
    if (persistSession && currentSessionId && messages.length > 0) {
      saveCurrentSession();
    }
  }, [messages, persistSession, currentSessionId]);

  // Inicializar primera sesión si no hay ninguna
  useEffect(() => {
    if (persistSession && isOpen && chatSessions.length === 0) {
      createNewSession();
    }
  }, [persistSession, isOpen]);

  // Persistir mensajes en localStorage si persistSession está activado
  useEffect(() => {
    if (persistSession && isOpen) {
      const savedMessages = localStorage.getItem(`fermentia_chat_${sessionId}`);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.warn('Error al cargar mensajes guardados:', error);
        }
      } else if (initialMessage) {
        // Agregar mensaje inicial de Fermentia
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: initialMessage,
          timestamp: Date.now(),
          metadata: {
            temperament: 'amigable',
            confidence: 1.0
          }
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [persistSession, isOpen, sessionId, initialMessage]);

  // Guardar mensajes cuando cambien
  useEffect(() => {
    if (persistSession && messages.length > 0) {
      localStorage.setItem(`fermentia_chat_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, persistSession, sessionId]);

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
        sessionId
      );
      
      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.text,
        timestamp: Date.now(),
        metadata: {
          confidence: response.confidence,
          executedAction: response.actions?.[0]?.id,
          temperament: temperament
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setActions(prev => [...prev, ...(response.actions || [])]);
      setConfidence(response.confidence || null);

      // Detectar acciones de viñedos y notificar
      const vineyardActions = response.actions?.filter(action => 
        action.entity === 'vineyard' && 
        ['CREATE', 'UPDATE', 'DELETE'].includes(action.type) &&
        action.executed
      );

      if (vineyardActions && vineyardActions.length > 0) {
        // Notificar sobre acciones ejecutadas
        for (const action of vineyardActions) {
          if (action.type === 'DELETE') {
            // Mensaje especial para eliminaciones
            const deleteNotification: Message = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: `✅ ¡Listo! ${action.description} He actualizado tu lista de viñedos. ¿Hay algo más en lo que pueda ayudarte?`,
              timestamp: Date.now() + 1000,
              metadata: {
                temperament: 'amigable',
                confidence: 1.0,
                executedAction: action.id
              }
            };
            
            setTimeout(() => {
              setMessages(prev => [...prev, deleteNotification]);
            }, 1500);
          }
        }

        // Notificar al componente padre para actualizar la lista
        if (onVineyardAction) {
          setTimeout(() => {
            onVineyardAction();
          }, 2000);
        }
      }

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

  // Función para generar más sugerencias
  const generateMoreSuggestions = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    const suggestionPrompts = [
      "Dame 3 consejos específicos para mejorar la calidad de mis uvas",
      "¿Qué recomendaciones tienes para optimizar el riego en esta época?",
      "Sugiere estrategias preventivas contra plagas comunes",
      "¿Cómo puedo mejorar el rendimiento de mis viñedos?",
      "Dame consejos para la próxima cosecha"
    ];
    
    const randomPrompt = suggestionPrompts[Math.floor(Math.random() * suggestionPrompts.length)];
    
    try {
      const response = await chatWithFermentia(
        messages, 
        randomPrompt, 
        currentSessionId || `session_${Date.now()}`
      );
      
      const suggestionMessage: Message = { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: `🌟 **Aquí tienes algunas sugerencias adicionales:**\n\n${response.text}`,
        timestamp: Date.now(),
        metadata: {
          confidence: response.confidence,
          temperament: temperament
        }
      };
      
      setMessages(prev => [...prev, suggestionMessage]);
      setActions(prev => [...prev, ...(response.actions || [])]);
      setConfidence(response.confidence || null);

    } catch (error) {
       console.error('Error generating suggestions:', error);
       const errorMessage: Message = { 
         id: Date.now().toString(), 
         role: 'assistant', 
         content: "No pude generar sugerencias en este momento. ¿Hay algo específico en lo que te gustaría que te ayude?",
         timestamp: Date.now()
       };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const initialMessage = messages.find(m => m.role === 'assistant')?.content || 
      "Hola, soy **Fermentia**, tu asistente especializado en viticultura. Estoy aquí para ayudarte con todas tus necesidades relacionadas con el cuidado de viñedos y la producción de vino. ¿En qué puedo asistirte hoy?";
    
    if (currentSessionId) {
      saveCurrentSession();
    }
    
    // Crear nueva sesión
    const newSessionId = `session_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: initialMessage,
      timestamp: Date.now(),
      metadata: {
        temperament: 'amigable',
        confidence: 1.0
      }
    };
    setMessages([welcomeMessage]);
    setActions([]);
    setConfidence(null);
  };

  const exportChat = () => {
    const chatData = {
      sessionId: currentSessionId,
      messages,
      actions,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fermentia_chat_${currentSessionId || 'session'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

              {/* Botones de gestión de conversación */}
              <div className="grid grid-cols-3 gap-2 border-t pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearChat}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva Conversación
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateMoreSuggestions}
                  disabled={isLoading}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Brain className="h-4 w-4 mr-1" />
                  {isLoading ? 'Generando...' : 'Más Sugerencias'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportChat}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exportar Chat
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Conversaciones Guardadas</h3>
                  <Badge variant="outline">
                    {chatSessions.length} sesiones
                  </Badge>
                </div>
                
                {currentSessionId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">Sesión Actual</p>
                        <p className="text-sm text-green-600">ID: {currentSessionId}</p>
                        <p className="text-sm text-green-600">{messages.length} mensajes</p>
                      </div>
                      {confidence && (
                        <Badge variant="outline" className="bg-white">
                          {(confidence * 100).toFixed(1)}% confianza
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {chatSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay conversaciones guardadas aún</p>
                    <p className="text-sm">Las conversaciones se guardan automáticamente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatSessions.map((session) => (
                      <Card key={session.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4" />
                                <span className="font-medium">
                                  {session.title || `Sesión ${session.id.split('_')[1]}`}
                                </span>
                                {session.id === currentSessionId && (
                                  <Badge variant="outline" className="text-xs">Actual</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {session.messages.length} mensajes
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.createdAt).toLocaleDateString()} a las{' '}
                                {new Date(session.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => switchToSession(session.id)}
                                disabled={session.id === currentSessionId}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteSession(session.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
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
