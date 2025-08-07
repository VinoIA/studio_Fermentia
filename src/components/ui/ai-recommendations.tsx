// src/components/ui/ai-recommendations.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { analyzeDataAndRecommend } from '@/ai/tools/crud-tools';
import type { AIRecommendation } from '@/types';

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
  }, []);

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

  if (recommendations.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Recomendaciones de IA
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadRecommendations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
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
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              {lastUpdate.toLocaleTimeString()}
            </span>
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
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Confianza: {(recommendation.confidence * 100).toFixed(1)}%</span>
                    <span>•</span>
                    <span>{new Date(recommendation.timestamp).toLocaleString()}</span>
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
