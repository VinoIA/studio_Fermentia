# 🔑 Configuración de API Keys - Studio Fermentia

## ✅ **CONFIGURACIÓN ACTUAL (Solo OpenAI)**

Tu aplicación está configurada para usar **ÚNICAMENTE** la API de OpenAI.

### 🏠 **Desarrollo Local**
- **Archivo:** `.env.local`
- **Variable:** `OPENAI_API_KEY=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`

### 🚀 **Producción (Firebase/Google Cloud)**
- **Archivo:** `apphosting.yaml`
- **Variable:** `OPENAI_API_KEY=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`

## 🛡️ **Para Deploys en Diferentes Plataformas**

### **🔵 Firebase/Google Cloud (Ya configurado)**
- ✅ **Archivo:** `apphosting.yaml` (ya incluye tu API key)
- ✅ **Comando deploy:** `firebase deploy` o deploy automático

### **🟠 Netlify**
Si deploys en Netlify, configura en el panel:
1. Ve a **Site settings** → **Environment variables**
2. Agrega:
   ```
   OPENAI_API_KEY = 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
   ```

### **🟣 Vercel**
Si deploys en Vercel:
1. Ve a **Project Settings** → **Environment Variables**
2. Agrega:
   ```
   OPENAI_API_KEY = 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
   ```

## 🔍 **Verificación**

### **¿Cómo saber si está funcionando?**
1. En desarrollo: Revisa la consola - no debe mostrar errores de API key
2. En producción: Las funciones de IA (chat, recomendaciones) deben funcionar
3. Si hay error: Revisa que la variable se llame exactamente `OPENAI_API_KEY`

### **Funcionalidades que usan la API:**
- ✅ Chat con Fermentia (IA)
- ✅ Recomendaciones inteligentes de viñedos
- ✅ Sugerencias de optimización
- ✅ Análisis de datos de cosecha

## 🚨 **Importante**

- **NO** subas nunca archivos `.env.local` a Git
- **SÍ** puedes subir `apphosting.yaml` (es para producción)
- **Guarda** una copia de tu API key en lugar seguro
- **Verifica** que la API key sea válida en OpenAI

## 📝 **Comandos útiles**

```bash
# Verificar que las variables están configuradas
echo $OPENAI_API_KEY

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Deploy Firebase
firebase deploy
```

---
**✅ Todo configurado correctamente - Solo necesitas OpenAI!**
