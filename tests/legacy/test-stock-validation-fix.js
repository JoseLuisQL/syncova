/**
 * Script de prueba para verificar la corrección del error de validación de stock
 * Este script simula la llamada que estaba fallando desde otras PCs en la red
 */

const API_BASE_URL = 'http://192.168.18.20:3001/api'; // IP de la PC servidor

async function testStockValidation() {
  console.log('🧪 Probando validación de stock desde red local...');
  console.log(`📍 URL del servidor: ${API_BASE_URL}`);
  
  try {
    // Datos de prueba para validación de stock
    const testData = {
      centroAcopioId: 'test-centro-id',
      mes: 1,
      anio: 2024,
      tipoVale: 'completo'
    };

    console.log('📤 Enviando solicitud de validación de stock...');
    console.log('📋 Datos de prueba:', JSON.stringify(testData, null, 2));

    const response = await fetch(`${API_BASE_URL}/vales/validar-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`📊 Estado de respuesta: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Validación exitosa!');
      console.log('📄 Respuesta del servidor:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error en la validación:');
      console.log('📄 Respuesta de error:', errorText);
    }

  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('🔍 Posibles causas:');
      console.log('   - El servidor backend no está ejecutándose');
      console.log('   - La IP del servidor es incorrecta');
      console.log('   - Hay un firewall bloqueando la conexión');
      console.log('   - El puerto 3001 no está disponible');
    }
  }
}

async function testServerHealth() {
  console.log('\n🏥 Probando salud del servidor...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor funcionando correctamente');
      console.log('📄 Estado:', data);
    } else {
      console.log('⚠️ Servidor respondió con error:', response.status);
    }
  } catch (error) {
    console.error('❌ No se pudo conectar al servidor:', error.message);
  }
}

async function testApiInfo() {
  console.log('\n📊 Probando información de la API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API disponible');
      console.log('📄 Información:', data);
    } else {
      console.log('⚠️ API respondió con error:', response.status);
    }
  } catch (error) {
    console.error('❌ No se pudo conectar a la API:', error.message);
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas de conectividad y validación de stock...\n');
  
  await testServerHealth();
  await testApiInfo();
  await testStockValidation();
  
  console.log('\n✨ Pruebas completadas');
}

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

// Exportar para uso en navegador
if (typeof window !== 'undefined') {
  window.testStockValidation = testStockValidation;
  window.testServerHealth = testServerHealth;
  window.testApiInfo = testApiInfo;
  window.runAllTests = runAllTests;
}
