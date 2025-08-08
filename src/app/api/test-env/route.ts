// Endpoint temporal para verificar variables de entorno
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyPreview: apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'No configurada',
    envLoaded: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
