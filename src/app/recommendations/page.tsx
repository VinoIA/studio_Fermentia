'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, AlertTriangle, CheckCircle, Info, Lightbulb, TrendingUp } from 'lucide-react';
import type { AIRecommendation } from '@/types';

interface RecommendationsPageState {
  recommendations: AIRecommendation[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const priorityColors = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500'
};

const priorityIcons = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Info,
  low: Lightbulb
};

const typeIcons = {
  warning: AlertTriangle,
  suggestion: Lightbulb,
  insight: Info,
  optimization: TrendingUp
};

export default function RecommendationsPage() {
  const [state, setState] = useState<RecommendationsPageState>({
    recommendations: [],
    loading: false,
    error: null,
    lastUpdated: null
  });

  const generateRecommendations = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simular llamada a la API de recomendaciones
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType: 'general' })
      });

      if (!response.ok) {
        throw new Error('Error al generar recomendaciones');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        recommendations: data.recommendations || [],
        loading: false,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false
      }));
    }
  };

  useEffect(() => {
    // Cargar recomendaciones al iniciar
    generateRecommendations();
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      critical: 'Crítico',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      warning: 'Alerta',
      suggestion: 'Sugerencia',
      insight: 'Perspectiva',
      optimization: 'Optimización'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recomendaciones de IA</h1>
          <p className="text-gray-600 mt-2">
            Análisis inteligente y sugerencias para optimizar tus viñedos
          </p>
        </div>
        <Button 
          onClick={generateRecommendations}
          disabled={state.loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
          {state.loading ? 'Generando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Status Bar */}
      {state.lastUpdated && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Última actualización: {formatTimestamp(state.lastUpdated)}
            {state.recommendations.length > 0 && 
              ` - ${state.recommendations.length} recomendación(es) disponible(s)`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {state.loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium">Generando recomendaciones...</p>
                <Progress value={undefined} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      {!state.loading && state.recommendations.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {state.recommendations.map((recommendation) => {
            const PriorityIcon = priorityIcons[recommendation.priority];
            const TypeIcon = typeIcons[recommendation.type];
            
            return (
              <Card key={recommendation.id} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-gray-600" />
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(recommendation.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-white ${priorityColors[recommendation.priority]}`}
                      >
                        {getPriorityLabel(recommendation.priority)}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {recommendation.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {recommendation.description}
                  </CardDescription>
                  
                  {/* Confidence Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Confianza</span>
                      <span>{Math.round(recommendation.confidence * 100)}%</span>
                    </div>
                    <Progress 
                      value={recommendation.confidence * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Additional Data */}
                  {recommendation.data && (
                    <div className="pt-3 border-t">
                      <div className="text-xs text-gray-500 space-y-1">
                        {Object.entries(recommendation.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium">
                              {Array.isArray(value) ? value.length : 
                               typeof value === 'object' ? 'Ver detalles' : 
                               String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-400 pt-2">
                    {formatTimestamp(recommendation.timestamp)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!state.loading && state.recommendations.length === 0 && !state.error && (
        <Card>
          <CardContent className="p-12 text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay recomendaciones disponibles
            </h3>
            <p className="text-gray-500 mb-6">
              Haz clic en "Actualizar" para generar nuevas recomendaciones basadas en el estado actual de tus viñedos.
            </p>
            <Button onClick={generateRecommendations}>
              Generar Recomendaciones
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
