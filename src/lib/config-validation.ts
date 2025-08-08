// src/lib/config-validation.ts

/**
 * Valida que todas las variables de entorno necesarias estén configuradas
 */
export function validateConfig() {
  const errors: string[] = [];
  
  // Validar OpenAI API Key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'tu_clave_de_openai_aquí') {
    errors.push('OPENAI_API_KEY no está configurada correctamente');
  }
  
  // Validar que la API key tenga el formato correcto
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY no tiene el formato correcto (debe empezar con sk-)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Verifica la conectividad con OpenAI
 */
export async function testOpenAIConnection() {
  try {
    const { openai } = await import('@/ai/openai');
    
    // Hacer una llamada simple para verificar la conexión
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5
    });
    
    return {
      success: true,
      message: 'Conexión con OpenAI exitosa'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Hook para validar configuración en el lado del cliente
 */
export function useConfigValidation() {
  if (typeof window !== 'undefined') {
    // En el cliente, solo verificamos que las variables públicas estén configuradas
    const publicConfig = {
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    };
    
    return {
      isClientConfigValid: Object.values(publicConfig).every(Boolean),
      publicConfig
    };
  }
  
  return { isClientConfigValid: true, publicConfig: {} };
}
