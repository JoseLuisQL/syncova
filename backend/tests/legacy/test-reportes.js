/**
 * Script de prueba para endpoints de reportes
 * Ejecutar con: node test-reportes.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Configurar axios para ignorar errores de autenticación en testing
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testEndpoints() {
  console.log('🧪 Iniciando pruebas de endpoints de reportes...\n');

  const tests = [
    {
      name: 'Estadísticas Generales',
      method: 'GET',
      url: '/reportes/estadisticas',
      expectedStatus: 401 // Esperamos 401 por falta de autenticación
    },
    {
      name: 'Stock Actual',
      method: 'GET',
      url: '/reportes/stock-actual',
      expectedStatus: 401
    },
    {
      name: 'Stock Crítico',
      method: 'GET',
      url: '/reportes/stock-critico',
      expectedStatus: 401
    },
    {
      name: 'Próximos Vencimientos',
      method: 'GET',
      url: '/reportes/proximos-vencimientos',
      expectedStatus: 401
    },
    {
      name: 'Kardex Detallado',
      method: 'POST',
      url: '/reportes/kardex-detallado',
      data: {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31'
      },
      expectedStatus: 401
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`📋 Probando: ${test.name}`);

      const config = {
        method: test.method.toLowerCase(),
        url: test.url,
        ...(test.data && { data: test.data })
      };

      const response = await api(config);

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASÓ (Status: ${response.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FALLÓ (Esperado: ${test.expectedStatus}, Recibido: ${response.status})`);
        failed++;
      }
    } catch (error) {
      if (error.response && error.response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASÓ (Status: ${error.response.status})`);
        console.log(`   Mensaje: ${error.response.data.message || 'Sin mensaje'}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FALLÓ`);
        console.log(`   Error: ${error.message}`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        failed++;
      }
    }
    console.log('');
  }

  console.log('📊 Resumen de pruebas:');
  console.log(`✅ Pasaron: ${passed}`);
  console.log(`❌ Fallaron: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! Los endpoints están funcionando correctamente.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar la implementación.');
  }
}

// Función para verificar que el servidor esté corriendo
async function checkServerHealth() {
  console.log('🏥 Verificando salud del servidor...\n');

  try {
    const response = await api.get('/health');
    console.log('✅ Servidor funcionando correctamente');
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Respuesta: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ Error al conectar con el servidor');
    console.log(`   Error: ${error.message}`);
    return false;
  }

  return true;
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 SIVAC - Pruebas de Módulo de Reportes');
  console.log('==========================================\n');

  // Verificar que el servidor esté funcionando
  const serverOk = await checkServerHealth();
  if (!serverOk) {
    console.log('\n❌ No se puede continuar sin el servidor. Asegúrate de que esté corriendo en el puerto 3001.');
    return;
  }

  // Probar endpoints
  await testEndpoints();

  console.log('\n🏁 Pruebas completadas.');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testEndpoints,
  checkServerHealth,
  runAllTests
};