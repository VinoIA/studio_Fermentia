// src/components/ui/ai-recommendations.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle,
  X,
  RefreshCw,
  Clock,
  Target,
  Activity,
  Settings
} from 'lucide-react';
import { analyzeDataAndRecommend } from '@/ai/tools/crud-tools';
import type { AIRecommendation } from '@/types';

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeDataAndRecommend({ dataType: 'general' });
      if (result.success && result.data?.recommendations) {
        setRecommendations(result.data.recommendations);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
    
    // Auto-refresh cada 5 minutos si está habilitado
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadRecommendations();
      }, 5 * 60 * 1000); // 5 minutos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Lightbulb className="h-4 w-4" />;
      case 'low':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4" />;
      case 'optimization':
        return <TrendingUp className="h-4 w-4" />;
      case 'insight':
        return <Brain className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const markAsImplemented = (id: string) => {
    setRecommendations(prev => 
      prev.map(r => r.id === id ? { ...r, implemented: true } : r)
    );
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const getNextRefreshTime = () => {
    if (!autoRefresh || !lastUpdate) return null;
    const nextRefresh = new Date(lastUpdate.getTime() + 5 * 60 * 1000);
    return nextRefresh;
  };

  if (recommendations.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Recomendaciones de IA
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Switch
                checked={autoRefresh}
                onCheckedChange={toggleAutoRefresh}
                id="auto-refresh"
              />
              <label htmlFor="auto-refresh" className="text-muted-foreground">
                Auto
              </label>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadRecommendations}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay recomendaciones en este momento</p>
            <p className="text-xs mt-2">La IA analizará tus datos automáticamente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Recomendaciones de IA
          {recommendations.length > 0 && (
            <Badge variant="secondary">{recommendations.length}</Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Switch
              checked={autoRefresh}
              onCheckedChange={toggleAutoRefresh}
              id="auto-refresh-main"
            />
            <label htmlFor="auto-refresh-main" className="text-muted-foreground">
              Auto
            </label>
          </div>
          {lastUpdate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{lastUpdate.toLocaleTimeString()}</span>
              {autoRefresh && getNextRefreshTime() && (
                <span className="text-green-600">
                  • Próx: {getNextRefreshTime()?.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          recommendations.map((recommendation) => (
            <div 
              key={recommendation.id}
              className={`p-3 rounded-lg border ${
                recommendation.implemented 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                  : 'bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(recommendation.type)}
                    <span className="font-medium text-sm">{recommendation.title}</span>
                    <Badge variant={getPriorityColor(recommendation.priority)} className="text-xs">
                      {recommendation.priority}
                    </Badge>
                    {recommendation.type === 'warning' && recommendation.priority === 'critical' && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        ¡URGENTE!
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {recommendation.description}
                  </p>
                  
                  {/* Mostrar acciones específicas si están disponibles */}
                  {recommendation.data?.actions && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Acciones recomendadas:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {recommendation.data.actions.map((action: string, index: number) => (
                          <li key={index} className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mostrar beneficios si están disponibles */}
                  {recommendation.data?.benefits && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Beneficios:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {recommendation.data.benefits.map((benefit: string, index: number) => (
                          <li key={index} className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>Confianza: {(recommendation.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(recommendation.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {!recommendation.implemented && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsImplemented(recommendation.id)}
                      className="h-8 w-8 p-0"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissRecommendation(recommendation.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
