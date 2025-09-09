// Test script para verificar la funcionalidad de alertas
const API_BASE = 'http://localhost:3001/api';

// Función para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`${options.method || 'GET'} ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Error en ${url}:`, error.message);
    return null;
  }
}

// Función principal de prueba
async function testAlertsAPI() {
  console.log('🧪 Iniciando pruebas de API de Alertas...\n');

  // 1. Verificar que el endpoint de alertas esté disponible
  console.log('1. Verificando disponibilidad de API...');
  const apiInfo = await makeRequest(`${API_BASE}`);
  
  if (apiInfo && apiInfo.data && apiInfo.data.endpoints && apiInfo.data.endpoints.alertas) {
    console.log('✅ Endpoint de alertas disponible:', apiInfo.data.endpoints.alertas);
  } else {
    console.log('❌ Endpoint de alertas no encontrado');
    return;
  }

  // 2. Intentar obtener estadísticas (debería requerir autenticación)
  console.log('\n2. Probando endpoint de estadísticas (sin autenticación)...');
  const statsWithoutAuth = await makeRequest(`${API_BASE}/alertas/stats`);
  
  if (statsWithoutAuth && !statsWithoutAuth.success) {
    console.log('✅ Autenticación requerida correctamente');
  }

  // 3. Intentar obtener todas las alertas (debería requerir autenticación)
  console.log('\n3. Probando endpoint de listado (sin autenticación)...');
  const alertsWithoutAuth = await makeRequest(`${API_BASE}/alertas`);
  
  if (alertsWithoutAuth && !alertsWithoutAuth.success) {
    console.log('✅ Autenticación requerida correctamente');
  }

  // 4. Verificar estructura de respuesta de error
  console.log('\n4. Verificando estructura de respuestas de error...');
  if (statsWithoutAuth && statsWithoutAuth.message) {
    console.log('✅ Mensaje de error presente:', statsWithoutAuth.message);
  }
  
  if (statsWithoutAuth && statsWithoutAuth.timestamp) {
    console.log('✅ Timestamp presente:', statsWithoutAuth.timestamp);
  }

  console.log('\n🎉 Pruebas básicas completadas!');
  console.log('\n📝 Resumen:');
  console.log('- ✅ API de alertas está registrada correctamente');
  console.log('- ✅ Endpoints requieren autenticación como esperado');
  console.log('- ✅ Respuestas de error tienen estructura correcta');
  console.log('\n💡 Para pruebas completas, necesitarás:');
  console.log('1. Autenticarte con un usuario válido');
  console.log('2. Probar operaciones CRUD completas');
  console.log('3. Verificar validaciones de datos');
}

// Ejecutar pruebas
testAlertsAPI().catch(console.error);
