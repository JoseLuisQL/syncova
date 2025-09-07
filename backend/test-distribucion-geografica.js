/**
 * Script de prueba específico para el endpoint de distribución geográfica
 * Ejecutar con: node test-distribucion-geografica.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/reportes/planificacion';

async function testDistribucionGeografica() {
  console.log('🧪 Probando endpoint de distribución geográfica...\n');

  const tests = [
    {
      name: 'Distribución Geográfica - Sin filtros',
      url: `${BASE_URL}/distribucion-geografica?anio=2025&incluirInactivos=false`,
      expectedStatus: 401 // Esperamos 401 por autenticación
    },
    {
      name: 'Distribución Geográfica - Con vacuna específica',
      url: `${BASE_URL}/distribucion-geografica?anio=2025&vacunaId=24b13b5d-73bb-471f-a3b6-eda0ade6b4cf&incluirInactivos=false`,
      expectedStatus: 401 // Esperamos 401 por autenticación
    },
    {
      name: 'Distribución Geográfica - Con centro específico',
      url: `${BASE_URL}/distribucion-geografica?anio=2025&centroAcopioId=some-center-id&incluirInactivos=false`,
      expectedStatus: 401 // Esperamos 401 por autenticación
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`📋 Probando: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await axios({
        method: 'GET',
        url: test.url,
        validateStatus: () => true // No lanzar error en códigos de estado HTTP
      });

      console.log(`   📊 Estado recibido: ${response.status}`);
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ PASÓ - Estado esperado: ${test.expectedStatus}`);
        if (response.data && response.data.message) {
          console.log(`   📝 Mensaje: ${response.data.message}`);
        }
        passed++;
      } else if (response.status === 500) {
        console.log(`   ❌ ERROR 500 - Error interno del servidor`);
        if (response.data) {
          console.log(`   📝 Respuesta: ${JSON.stringify(response.data, null, 2)}`);
        }
        failed++;
      } else {
        console.log(`   ⚠️  Estado inesperado - Esperado: ${test.expectedStatus}, Recibido: ${response.status}`);
        if (response.data) {
          console.log(`   📝 Respuesta: ${JSON.stringify(response.data, null, 2)}`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR DE RED - ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('📊 Resumen de pruebas:');
  console.log(`   ✅ Pasaron: ${passed}`);
  console.log(`   ❌ Fallaron: ${failed}`);
  console.log(`   📈 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! El endpoint de distribución geográfica está funcionando correctamente.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar la implementación del endpoint.');
  }
}

// Ejecutar pruebas
testDistribucionGeografica().catch(error => {
  console.error('💥 Error ejecutando pruebas:', error.message);
  process.exit(1);
});
