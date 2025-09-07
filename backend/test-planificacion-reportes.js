/**
 * Script de prueba para los endpoints de reportes de planificación
 * Ejecutar con: node test-planificacion-reportes.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/reportes/planificacion';

async function testEndpoints() {
  console.log('🧪 Iniciando pruebas de endpoints de reportes de planificación...\n');

  const tests = [
    {
      name: 'Programación Anual',
      method: 'GET',
      url: `${BASE_URL}/programacion-anual?anio=2025`,
      expectedStatus: 401 // Esperamos 401 por falta de autenticación
    },
    {
      name: 'Cumplimiento de Metas',
      method: 'GET',
      url: `${BASE_URL}/cumplimiento-metas?anio=2025`,
      expectedStatus: 401
    },
    {
      name: 'Proyección de Demanda',
      method: 'GET',
      url: `${BASE_URL}/proyeccion-demanda?anio=2025`,
      expectedStatus: 401
    },
    {
      name: 'Distribución Geográfica',
      method: 'GET',
      url: `${BASE_URL}/distribucion-geografica?anio=2025`,
      expectedStatus: 401
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`📋 Probando: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        validateStatus: () => true // No lanzar error en códigos de estado HTTP
      });

      if (response.status === test.expectedStatus) {
        console.log(`   ✅ PASÓ - Estado: ${response.status}`);
        if (response.data && response.data.message) {
          console.log(`   📝 Mensaje: ${response.data.message}`);
        }
        passed++;
      } else {
        console.log(`   ❌ FALLÓ - Esperado: ${test.expectedStatus}, Recibido: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('📊 Resumen de pruebas:');
  console.log(`   ✅ Pasaron: ${passed}`);
  console.log(`   ❌ Fallaron: ${failed}`);
  console.log(`   📈 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! Los endpoints están correctamente registrados.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar la configuración de rutas.');
  }
}

// Ejecutar pruebas
testEndpoints().catch(error => {
  console.error('💥 Error ejecutando pruebas:', error.message);
  process.exit(1);
});
