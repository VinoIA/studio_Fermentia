// src/ai/openai.ts
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY no está configurada en las variables de entorno');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuraciones predefinidas para el temperamento de la IA
export const AI_TEMPERAMENTS = {
  creativo: {
    temperature: 0.9,
    top_p: 0.95,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    description: "IA creativa e innovadora, genera ideas originales y soluciones poco convencionales"
  },
  formal: {
    temperature: 0.3,
    top_p: 0.8,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    description: "IA formal y profesional, respuestas estructuradas y técnicas"
  },
  técnico: {
    temperature: 0.4,
    top_p: 0.85,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    description: "IA especializada en aspectos técnicos, datos precisos y análisis detallados"
  },
  directo: {
    temperature: 0.2,
    top_p: 0.7,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    description: "IA directa y concisa, respuestas claras y al punto"
  },
  amigable: {
    temperature: 0.7,
    top_p: 0.9,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    description: "IA amigable y conversacional, tono cálido y accesible"
  }
} as const;

export type TemperamentType = keyof typeof AI_TEMPERAMENTS;
