// src/components/ui/ai-notification-system.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  X, 
  Bell,
  BellRing,
  CheckCircle,
  Clock
} from 'lucide-react';
import { analyzeDataAndRecommend } from '@/ai/tools/crud-tools';
import type { AIRecommendation } from '@/types';

interface NotificationProps {
  enabled?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function AINotificationSystem({ 
  enabled = true, 
  position = 'top-right' 
}: NotificationProps) {
  const [notifications, setNotifications] = useState<AIRecommendation[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const checkForCriticalRecommendations = async () => {
      try {
        const result = await analyzeDataAndRecommend({ dataType: 'general' });
        if (result.success && result.data?.recommendations) {
          const criticalRecommendations = result.data.recommendations.filter(
            (r: AIRecommendation) => r.priority === 'critical' || r.priority === 'high'
          );
          
          // Solo mostrar notificaciones nuevas (basado en timestamp)
          const newNotifications = criticalRecommendations.filter(
            (newRec: AIRecommendation) => !notifications.some(
              existing => existing.id === newRec.id
            )
          );

          if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev].slice(0, 5)); // Máximo 5 notificaciones
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Error checking critical recommendations:', error);
      }
    };

    // Verificar inmediatamente
    checkForCriticalRecommendations();

    // Verificar cada 2 minutos para recomendaciones críticas
    const interval = setInterval(checkForCriticalRecommendations, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [enabled, notifications]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length === 1) {
      setIsVisible(false);
    }
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <BellRing className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!enabled || !isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full space-y-2`}>
      {notifications.map((notification, index) => (
        <Card key={notification.id} className={`
          shadow-lg border-l-4 transition-all duration-300 ease-in-out
          ${notification.priority === 'critical' 
            ? 'border-l-red-500 bg-red-50 dark:bg-red-950' 
            : 'border-l-orange-500 bg-orange-50 dark:bg-orange-950'
          }
          ${index === 0 ? 'animate-slide-in-right' : ''}
        `}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getPriorityIcon(notification.priority)}
                  <span className="font-medium text-sm">{notification.title}</span>
                  <Badge 
                    variant={notification.priority === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.priority === 'critical' ? 'CRÍTICO' : 'IMPORTANTE'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-6 w-6 p-0 shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={dismissAllNotifications}
            className="text-xs"
          >
            Cerrar todas ({notifications.length})
          </Button>
        </div>
      )}
    </div>
  );
}

// Hook para usar el sistema de notificaciones
export function useAINotifications() {
  const [hasUnreadCritical, setHasUnreadCritical] = useState(false);

  useEffect(() => {
    const checkCriticalRecommendations = async () => {
      try {
        const result = await analyzeDataAndRecommend({ dataType: 'general' });
        if (result.success && result.data?.recommendations) {
          const hasCritical = result.data.recommendations.some(
            (r: AIRecommendation) => r.priority === 'critical'
          );
          setHasUnreadCritical(hasCritical);
        }
      } catch (error) {
        console.error('Error checking critical recommendations:', error);
      }
    };

    checkCriticalRecommendations();
    const interval = setInterval(checkCriticalRecommendations, 60 * 1000); // Cada minuto

    return () => clearInterval(interval);
  }, []);

  return { hasUnreadCritical };
}
