// src/components/ui/vineyard-crud-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  AlertTriangle,
  TrendingUp,
  Droplets,
  Thermometer,
  Leaf,
  Bot,
  CheckCircle
} from 'lucide-react';
import type { Vineyard } from '@/types';
import { createVineyard, deleteVineyard } from '@/lib/api';
import { chatWithFermentia } from '@/app/actions';

interface VineyardCRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  vineyard?: Vineyard | null;
  mode: 'create' | 'delete' | 'view';
  onSuccess?: (vineyard?: Vineyard) => void;
}

// Formulario de datos del viñedo
interface VineyardFormData {
  name: string;
  location: string;
  grapeVarietals: string;
  totalPlots: number;
  temperature: number;
  humidity: number;
  harvestStatus: string;
  harvestDate: string;
  iotData: {
    pests: boolean;
    temp_mean_7d: number;
    hr_max_3d: number;
    soil_moist_mean_24h: number;
    ndvi_anom: number;
    evi_anom: number;
    sin_day: number;
    cos_day: number;
    variedad_onehot: number[];
    surface_ha: number;
  };
}

const defaultFormData: VineyardFormData = {
  name: '',
  location: '',
  grapeVarietals: '',
  totalPlots: 10,
  temperature: 22,
  humidity: 65,
  harvestStatus: 'Pendiente',
  harvestDate: new Date().toISOString().split('T')[0],
  iotData: {
    pests: false,
    temp_mean_7d: 22.5,
    hr_max_3d: 75,
    soil_moist_mean_24h: 45,
    ndvi_anom: 0.1,
    evi_anom: 0.05,
    sin_day: 0.5,
    cos_day: 0.86,
    variedad_onehot: [1, 0, 0, 0],
    surface_ha: 10
  }
};

export function VineyardCRUDModal({ isOpen, onClose, vineyard, mode, onSuccess }: VineyardCRUDModalProps) {
  const [formData, setFormData] = useState<VineyardFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [showAI, setShowAI] = useState(false);

  // Inicializar formulario cuando cambia el viñedo
  useEffect(() => {
    if (vineyard && (mode === 'view' || mode === 'delete')) {
      setFormData({
        name: vineyard.name,
        location: vineyard.location,
        grapeVarietals: vineyard.grapeVarietals,
        totalPlots: vineyard.totalPlots || 10, // Valor por defecto si es undefined
        temperature: vineyard.temperature,
        humidity: vineyard.humidity,
        harvestStatus: vineyard.harvestStatus,
        harvestDate: vineyard.harvestDate,
        iotData: {
          pests: vineyard.iotData?.pests || false,
          temp_mean_7d: vineyard.iotData?.temp_mean_7d || vineyard.temperature,
          hr_max_3d: vineyard.iotData?.hr_max_3d || vineyard.humidity,
          soil_moist_mean_24h: vineyard.iotData?.soil_moist_mean_24h || 50,
          ndvi_anom: vineyard.iotData?.ndvi_anom || 0,
          evi_anom: vineyard.iotData?.evi_anom || 0,
          sin_day: vineyard.iotData?.sin_day || 0,
          cos_day: vineyard.iotData?.cos_day || 0,
          variedad_onehot: vineyard.iotData?.variedad_onehot || [1, 0, 0],
          surface_ha: vineyard.iotData?.surface_ha || 10
        }
      });
    } else {
      setFormData(defaultFormData);
    }
    setError('');
    setAiSuggestions('');
  }, [vineyard, mode]);

  // Obtener sugerencias de IA
  const getAISuggestions = async () => {
    if (!formData.name && !formData.location) return;
    
    setShowAI(true);
    try {
      const context = mode === 'create' 
        ? `Estoy creando un nuevo viñedo con nombre "${formData.name}" en "${formData.location}". Variedades: ${formData.grapeVarietals}.`
        : `Estoy revisando el viñedo "${formData.name}" en "${formData.location}". Datos IoT actuales: ${JSON.stringify(formData.iotData)}.`;
      
      const response = await chatWithFermentia(
        [],
        `${context} Dame 3-4 sugerencias breves y específicas para optimizar este viñedo considerando su ubicación, variedades y condiciones. Sé conciso y práctico.`
      );
      
      setAiSuggestions(response.text);
    } catch (error) {
      setAiSuggestions('Error obteniendo sugerencias de IA');
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('iotData.')) {
      const iotField = field.replace('iotData.', '');
      setFormData(prev => ({
        ...prev,
        iotData: {
          ...prev.iotData,
          [iotField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Validar datos del formulario
  const validateFormData = (data: VineyardFormData): string | null => {
    if (!data.name.trim()) return 'El nombre del viñedo es requerido';
    if (!data.location.trim()) return 'La ubicación es requerida';
    if (!data.grapeVarietals.trim()) return 'La variedad de uva es requerida';
    if (data.totalPlots < 1) return 'El número de parcelas debe ser mayor a 0';
    if (data.temperature < -10 || data.temperature > 50) return 'La temperatura debe estar entre -10°C y 50°C';
    if (data.humidity < 0 || data.humidity > 100) return 'La humedad debe estar entre 0% y 100%';
    if (!data.harvestStatus.trim()) return 'El estado de cosecha es requerido';
    if (!data.harvestDate) return 'La fecha de cosecha es requerida';
    return null;
  };

  // Convertir formData a formato compatible con la API
  const convertFormDataForAPI = (data: VineyardFormData) => {
    return {
      name: data.name,
      location: data.location,
      grapeVarietals: data.grapeVarietals,
      totalPlots: data.totalPlots,
      temperature: data.temperature,
      humidity: data.humidity,
      harvestStatus: data.harvestStatus,
      harvestDate: data.harvestDate,
      iotData: data.iotData
    };
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validar datos antes de enviar (excepto para delete)
      if (mode !== 'delete') {
        const validationError = validateFormData(formData);
        if (validationError) {
          setError(validationError);
          setIsLoading(false);
          return;
        }
      }

      const apiData = convertFormDataForAPI(formData);
      
      if (mode === 'create') {
        console.log('🔄 Creating vineyard with data:', apiData);
        const result = await createVineyard(apiData);
        console.log('✅ Vineyard created:', result);
        onSuccess?.(result);
        onClose();
      } else if (mode === 'delete' && vineyard) {
        console.log(`🔄 Deleting vineyard: ${vineyard.name} (ID: ${vineyard.id})`);
        console.log('🔄 Vineyard details:', {
          id: vineyard.id,
          name: vineyard.name,
          location: vineyard.location
        });
        
        const success = await deleteVineyard(vineyard.id);
        
        if (success) {
          console.log('✅ Vineyard deleted successfully');
          onSuccess?.();
          onClose();
        } else {
          throw new Error('Delete operation returned false');
        }
      }
    } catch (error) {
      console.error('❌ Error in CRUD operation:', error);
      
      // Crear un mensaje de error más descriptivo
      let errorMessage = 'Error desconocido en la operación';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Personalizar mensajes para diferentes tipos de errores
        if (errorMessage.includes('404')) {
          errorMessage = `No se pudo encontrar el viñedo "${vineyard?.name || 'desconocido'}" en la base de datos. Es posible que ya haya sido eliminado.`;
        } else if (errorMessage.includes('Failed to delete')) {
          errorMessage = `Error al eliminar el viñedo "${vineyard?.name || 'desconocido'}": ${errorMessage}`;
        } else if (errorMessage.includes('not found')) {
          errorMessage = `El viñedo "${vineyard?.name || 'desconocido'}" no se encuentra en el sistema.`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Crear Nuevo Viñedo';
      case 'delete': return 'Eliminar Viñedo';
      case 'view': return 'Detalles del Viñedo';
      default: return 'Viñedo';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'create': return 'Crear Viñedo';
      case 'delete': return 'Eliminar';
      default: return 'Cerrar';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' && <Plus className="h-5 w-5" />}
            {mode === 'delete' && <Trash2 className="h-5 w-5" />}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Crea un nuevo viñedo con información detallada y datos IoT.'}
            {mode === 'delete' && '¿Estás seguro de que quieres eliminar este viñedo? Esta acción no se puede deshacer.'}
            {mode === 'view' && 'Información detallada del viñedo.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {mode === 'delete' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">⚠️ Confirmar Eliminación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Estás a punto de eliminar el viñedo <strong>"{vineyard?.name}"</strong> 
                en <strong>{vineyard?.location}</strong>.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Eliminando...' : 'Eliminar Definitivamente'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="iot">Datos IoT</TabsTrigger>
              <TabsTrigger value="ai">Sugerencias IA</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Viñedo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Viñedo Santa Elena"
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ej: Valle del Maipo, Chile"
                    disabled={mode === 'view'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grapeVarietals">Variedades de Uva</Label>
                  <Input
                    id="grapeVarietals"
                    value={formData.grapeVarietals}
                    onChange={(e) => handleInputChange('grapeVarietals', e.target.value)}
                    placeholder="Ej: Cabernet Sauvignon, Merlot"
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalPlots">Número de Parcelas</Label>
                  <Input
                    id="totalPlots"
                    type="number"
                    value={formData.totalPlots}
                    onChange={(e) => handleInputChange('totalPlots', parseInt(e.target.value) || 1)}
                    min={1}
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperatura (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || 0)}
                      min={-10}
                      max={50}
                      disabled={mode === 'view'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="humidity">Humedad (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      value={formData.humidity}
                      onChange={(e) => handleInputChange('humidity', parseFloat(e.target.value) || 0)}
                      min={0}
                      max={100}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="harvestStatus">Estado de Cosecha</Label>
                    <select
                      id="harvestStatus"
                      value={formData.harvestStatus}
                      onChange={(e) => handleInputChange('harvestStatus', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      disabled={mode === 'view'}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En progreso">En progreso</option>
                      <option value="Finalizada">Finalizada</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="harvestDate">Fecha de Cosecha</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="iot" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Condiciones Ambientales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Temperatura Media 7 días (°C)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.iotData.temp_mean_7d}
                        onChange={(e) => handleInputChange('iotData.temp_mean_7d', parseFloat(e.target.value) || 0)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Humedad Relativa Máxima 3 días (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.iotData.hr_max_3d}
                        onChange={(e) => handleInputChange('iotData.hr_max_3d', parseFloat(e.target.value) || 0)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Humedad del Suelo 24h (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.iotData.soil_moist_mean_24h}
                        onChange={(e) => handleInputChange('iotData.soil_moist_mean_24h', parseFloat(e.target.value) || 0)}
                        disabled={mode === 'view'}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      Datos Satelitales y Superficie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Anomalía NDVI</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.iotData.ndvi_anom}
                        onChange={(e) => handleInputChange('iotData.ndvi_anom', parseFloat(e.target.value) || 0)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Anomalía EVI</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.iotData.evi_anom}
                        onChange={(e) => handleInputChange('iotData.evi_anom', parseFloat(e.target.value) || 0)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Superficie (ha)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.iotData.surface_ha}
                        onChange={(e) => handleInputChange('iotData.surface_ha', parseFloat(e.target.value) || 0)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Detección de Plagas</Label>
                      <Switch
                        checked={formData.iotData.pests}
                        onCheckedChange={(checked) => handleInputChange('iotData.pests', checked)}
                        disabled={mode === 'view'}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {formData.iotData.pests && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Alerta de Plagas Detectada:</strong> Se han identificado posibles plagas en este viñedo. 
                    Recomendamos realizar una inspección visual y considerar tratamientos preventivos.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Sugerencias de Fermentia IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showAI ? (
                    <div className="text-center py-8">
                      <Button onClick={getAISuggestions} className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Obtener Sugerencias de IA
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Fermentia analizará los datos del viñedo y proporcionará recomendaciones personalizadas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiSuggestions ? (
                        <div className="prose prose-sm max-w-none">
                          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="whitespace-pre-wrap">{aiSuggestions}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Analizando datos con IA...</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {mode !== 'view' && mode !== 'delete' && (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Guardando...' : getButtonText()}
            </Button>
          </div>
        )}

        {mode === 'view' && (
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
