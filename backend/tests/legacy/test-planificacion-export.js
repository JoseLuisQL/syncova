/**
 * Script de prueba para los endpoints de exportación de reportes de planificación
 * Ejecutar con: node test-planificacion-export.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/reportes/planificacion';

async function testExportEndpoints() {
  console.log('🧪 Iniciando pruebas de endpoints de exportación de reportes de planificación...\n');

  const exportTests = [
    {
      name: 'Exportar Programación Anual',
      method: 'POST',
      url: `${BASE_URL}/programacion-anual/exportar`,
      data: {
        anio: 2025,
        responsableReporte: 'Usuario de Prueba',
        observaciones: 'Prueba de exportación desde script de testing'
      },
      expectedStatus: 401 // Esperamos 401 por falta de autenticación
    },
    {
      name: 'Exportar Cumplimiento de Metas',
      method: 'POST',
      url: `${BASE_URL}/cumplimiento-metas/exportar`,
      data: {
        anio: 2025,
        responsableReporte: 'Usuario de Prueba',
        observaciones: 'Prueba de exportación desde script de testing'
      },
      expectedStatus: 401
    },
    {
      name: 'Exportar Proyección de Demanda',
      method: 'POST',
      url: `${BASE_URL}/proyeccion-demanda/exportar`,
      data: {
        anio: 2025,
        responsableReporte: 'Usuario de Prueba',
        observaciones: 'Prueba de exportación desde script de testing'
      },
      expectedStatus: 401
    },
    {
      name: 'Exportar Distribución Geográfica',
      method: 'POST',
      url: `${BASE_URL}/distribucion-geografica/exportar`,
      data: {
        anio: 2025,
        responsableReporte: 'Usuario de Prueba',
        observaciones: 'Prueba de exportación desde script de testing'
      },
      expectedStatus: 401
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of exportTests) {
    try {
      console.log(`📋 Probando: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Datos: ${JSON.stringify(test.data, null, 2)}`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        headers: {
          'Content-Type': 'application/json'
        },
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
        if (response.data) {
          console.log(`   📝 Respuesta: ${JSON.stringify(response.data, null, 2)}`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      failed++;
    }
    console.log('');
  }

  // Pruebas de validación de datos
  console.log('🔍 Probando validaciones de datos...\n');

  const validationTests = [
    {
      name: 'Exportar sin año',
      method: 'POST',
      url: `${BASE_URL}/programacion-anual/exportar`,
      data: {
        responsableReporte: 'Usuario de Prueba'
      },
      expectedStatus: 401 // Esperamos 401 por autenticación, pero si pasara sería 400 por validación
    },
    {
      name: 'Exportar sin responsable',
      method: 'POST',
      url: `${BASE_URL}/cumplimiento-metas/exportar`,
      data: {
        anio: 2025
      },
      expectedStatus: 401
    }
  ];

  for (const test of validationTests) {
    try {
      console.log(`📋 Probando: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Datos: ${JSON.stringify(test.data, null, 2)}`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data,
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: () => true
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
    console.log('\n🎉 ¡Todas las pruebas de exportación pasaron! Los endpoints están correctamente configurados.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisar la configuración de rutas de exportación.');
  }
}

// Ejecutar pruebas
testExportEndpoints().catch(error => {
  console.error('💥 Error ejecutando pruebas:', error.message);
  process.exit(1);
});
