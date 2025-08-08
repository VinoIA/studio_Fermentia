// Test simple para verificar la API de recomendaciones
const API_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io/vinedos';

async function testRecommendationsAPI() {
  try {
    console.log('🔄 Probando conexión con MockAPI...');
    
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Conexión exitosa con MockAPI');
    console.log(`📊 Datos obtenidos: ${data.length} viñedos`);
    
    // Mostrar estructura de datos
    if (data.length > 0) {
      console.log('📋 Estructura del primer viñedo:');
      console.log(JSON.stringify(data[0], null, 2));
    }
    
    // Simular análisis de recomendaciones
    console.log('\n🤖 Generando recomendaciones...');
    
    const recommendations = [];
    data.forEach((vineyard) => {
      if (vineyard.temperatura > 25) {
        recommendations.push({
          vineyard: vineyard.nombre,
          type: 'Temperatura alta',
          suggestion: `Considerar riego adicional para ${vineyard.nombre}`
        });
      }
      if (vineyard.humedad > 70) {
        recommendations.push({
          vineyard: vineyard.nombre,
          type: 'Humedad alta',
          suggestion: `Mejorar ventilación en ${vineyard.nombre}`
        });
      }
    });
    
    console.log(`✅ Se generaron ${recommendations.length} recomendaciones:`);
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.vineyard}: ${rec.suggestion}`);
    });
    
  } catch (error) {
    console.error('❌ Error al probar la API:', error.message);
  }
}

testRecommendationsAPI();
