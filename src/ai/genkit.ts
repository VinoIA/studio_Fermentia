import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Verificar que la API key esté configurada
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error('GOOGLE_GENAI_API_KEY no está configurada en las variables de entorno');
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
