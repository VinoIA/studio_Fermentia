// src/components/ui/typing-message.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageMetadata {
  confidence?: number;
  temperament?: string;
  executedAction?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

interface TypingMessageProps {
  message: Message;
  enableTyping?: boolean;
  typingSpeed?: number;
}

export function TypingMessage({ message, enableTyping = true, typingSpeed = 30 }: TypingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (message.role === 'assistant' && enableTyping) {
      setIsTyping(true);
      setDisplayedContent('');
      
      let index = 0;
      const content = message.content;
      
      const typeInterval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, typingSpeed);

      return () => clearInterval(typeInterval);
    } else {
      setDisplayedContent(message.content);
      setIsTyping(false);
    }
  }, [message.content, message.role, enableTyping, typingSpeed]);

  // Efecto del cursor parpadeante
  useEffect(() => {
    if (isTyping) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    } else {
      setShowCursor(false);
    }
  }, [isTyping]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTemperamentEmoji = (temperament?: string) => {
    switch (temperament) {
      case 'amigable': return '😊';
      case 'profesional': return '🤝';
      case 'técnico': return '🔬';
      case 'casual': return '😎';
      default: return '🤖';
    }
  };

  return (
    <div className={`flex gap-3 p-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}>
          {message.role === 'user' ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 space-y-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
          message.role === 'user' 
            ? 'bg-blue-500 text-white ml-auto' 
            : 'bg-muted'
        }`}>
          {message.role === 'assistant' ? (
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-2">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children, ...props }) => <p className="mb-2 last:mb-0" {...props}>{children}</p>,
                  strong: ({ children, ...props }) => <strong className="font-semibold text-primary" {...props}>{children}</strong>,
                  em: ({ children, ...props }) => <em className="italic text-muted-foreground" {...props}>{children}</em>,
                  ul: ({ children, ...props }) => <ul className="list-disc list-inside space-y-1 ml-2" {...props}>{children}</ul>,
                  ol: ({ children, ...props }) => <ol className="list-decimal list-inside space-y-1 ml-2" {...props}>{children}</ol>,
                  li: ({ children, ...props }) => <li className="text-sm" {...props}>{children}</li>,
                  h1: ({ children, ...props }) => <h1 className="text-lg font-bold mb-2" {...props}>{children}</h1>,
                  h2: ({ children, ...props }) => <h2 className="text-md font-semibold mb-2" {...props}>{children}</h2>,
                  h3: ({ children, ...props }) => <h3 className="text-sm font-semibold mb-1" {...props}>{children}</h3>,
                  table: ({ children, ...props }) => (
                    <div className="w-full overflow-x-auto my-2">
                      <table className="w-full text-sm border-collapse" {...props}>{children}</table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-muted/50" {...props}>{children}</thead>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="text-left px-3 py-2 font-semibold border-b" {...props}>{children}</th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-3 py-2 align-top border-b" {...props}>{children}</td>
                  ),
                  code: ({ children, ...props }) => (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic" {...props}>{children}</blockquote>
                  )
                }}
              >
                {displayedContent}
              </ReactMarkdown>
              {isTyping && showCursor && (
                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1">|</span>
              )}
            </div>
          ) : (
            <div>{message.content}</div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 text-xs text-muted-foreground ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTimestamp(message.timestamp)}</span>
          
          {message.role === 'assistant' && (
            <>
              {message.metadata?.temperament && (
                <Badge variant="outline" className="text-xs">
                  {getTemperamentEmoji(message.metadata.temperament)} {message.metadata.temperament}
                </Badge>
              )}
              
              {message.metadata?.confidence && (
                <Badge 
                  variant={message.metadata.confidence > 0.8 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {Math.round(message.metadata.confidence * 100)}% confianza
                </Badge>
              )}
              
              {message.metadata?.executedAction && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  ✅ Acción ejecutada
                </Badge>
              )}
              
              {isTyping && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  🤖 Escribiendo...
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
