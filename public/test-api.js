// Función simple para test de API desde el navegador
// Se puede usar en la consola del navegador para debugging

async function testMockAPI() {
  const API_URL = 'https://6895921e039a1a2b288f86c2.mockapi.io/vinedos';
  
  try {
    console.log('🔄 Testing MockAPI connection...');
    console.log('📡 URL:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API connection successful!');
    console.log('📊 Data received:', data.length, 'vineyards');
    console.log('📋 Sample data:', data[0]);
    
    return data;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return null;
  }
}

// Auto-ejecutar si está en el navegador
if (typeof window !== 'undefined') {
  window.testMockAPI = testMockAPI;
  console.log('🛠️ testMockAPI function available globally. Call testMockAPI() to test the API.');
}
