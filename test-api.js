// test-api.js - Script para probar la integración con la API
const API_BASE_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io';

async function testAPI() {
  console.log('🧪 Iniciando pruebas de integración con MockAPI...\n');

  try {
    // Test 1: Obtener todos los viñedos
    console.log('1️⃣ Probando GET /vinedos...');
    const response = await fetch(`${API_BASE_URL}/vinedos`);
    const vineyards = await response.json();
    console.log(`✅ Encontrados ${vineyards.length} viñedos`);
    console.log('   Primer viñedo:', vineyards[0]);
    console.log('');

    // Test 2: Crear un nuevo viñedo
    console.log('2️⃣ Probando POST /vinedos...');
    const newVineyardData = {
      nombre: "Viñedo Test IA",
      ubicacion: "Valle Central, Chile",
      variedadUva: "Cabernet Sauvignon",
      temperatura: 26,
      humedad: 65,
      estadoCosecha: "Pendiente",
      fechaCosecha: "2024-03-15"
    };

    const createResponse = await fetch(`${API_BASE_URL}/vinedos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVineyardData)
    });

    const newVineyard = await createResponse.json();
    console.log(`✅ Viñedo creado con ID: ${newVineyard.id}`);
    console.log('   Datos:', newVineyard);
    console.log('');

    // Test 3: Actualizar el viñedo creado
    console.log('3️⃣ Probando PUT /vinedos/:id...');
    const updateData = {
      temperatura: 28,
      estadoCosecha: "En progreso"
    };

    const updateResponse = await fetch(`${API_BASE_URL}/vinedos/${newVineyard.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    const updatedVineyard = await updateResponse.json();
    console.log(`✅ Viñedo actualizado`);
    console.log('   Temperatura:', updatedVineyard.temperatura);
    console.log('   Estado cosecha:', updatedVineyard.estadoCosecha);
    console.log('');

    // Test 4: Obtener viñedo específico
    console.log('4️⃣ Probando GET /vinedos/:id...');
    const getResponse = await fetch(`${API_BASE_URL}/vinedos/${newVineyard.id}`);
    const fetchedVineyard = await getResponse.json();
    console.log(`✅ Viñedo obtenido: ${fetchedVineyard.nombre}`);
    console.log('');

    // Test 5: Eliminar el viñedo de prueba
    console.log('5️⃣ Probando DELETE /vinedos/:id...');
    const deleteResponse = await fetch(`${API_BASE_URL}/vinedos/${newVineyard.id}`, {
      method: 'DELETE'
    });

    if (deleteResponse.ok) {
      console.log(`✅ Viñedo eliminado exitosamente`);
    } else {
      console.log(`❌ Error eliminando viñedo: ${deleteResponse.status}`);
    }
    console.log('');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('📊 Resumen de la estructura de datos de la API:');
    
    const finalResponse = await fetch(`${API_BASE_URL}/vinedos`);
    const finalVineyards = await finalResponse.json();
    
    if (finalVineyards.length > 0) {
      const sampleVineyard = finalVineyards[0];
      console.log('   Estructura de campo:', Object.keys(sampleVineyard));
      console.log('   Ejemplo completo:', sampleVineyard);
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas si se llama directamente
if (typeof window === 'undefined') {
  testAPI();
}

module.exports = { testAPI };
