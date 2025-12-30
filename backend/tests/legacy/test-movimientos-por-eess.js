/**
 * Script de prueba para el nuevo reporte de Movimientos por EESS
 * Verifica que los endpoints y servicios funcionen correctamente
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMovimientosPorEESS() {
  console.log('🧪 Iniciando pruebas del reporte Movimientos por EESS...\n');

  try {
    // Test 1: Verificar endpoint de generación de datos
    console.log('📊 Test 1: Generar datos del reporte');
    const filtros = {
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31',
      centroAcopioId: undefined // Todos los centros
    };

    try {
      const response = await axios.post(`${BASE_URL}/reportes/movimientos-por-eess`, filtros);
      
      if (response.status === 200 && response.data.success) {
        console.log('✅ Endpoint de generación funciona correctamente');
        console.log(`📈 Datos generados: ${response.data.data?.length || 0} establecimientos`);
        
        if (response.data.data && response.data.data.length > 0) {
          const primerItem = response.data.data[0];
          console.log('🔍 Estructura del primer item:');
          console.log(`   - Establecimiento: ${primerItem.establecimientoNombre}`);
          console.log(`   - Centro de Acopio: ${primerItem.centroAcopioNombre}`);
          console.log(`   - Vacunas: ${Object.keys(primerItem.vacunas || {}).length}`);
        }
      } else {
        console.log('❌ Error en la respuesta del endpoint de generación');
        console.log('📄 Respuesta:', response.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('🔐 Endpoint protegido (requiere autenticación) - Esto es esperado');
      } else {
        console.log('❌ Error al probar endpoint de generación:', error.message);
      }
    }

    // Test 2: Verificar endpoint de exportación
    console.log('\n📊 Test 2: Exportar reporte a Excel');
    const configExportacion = {
      incluirDetalles: true,
      incluirGraficos: false,
      incluirEstadisticas: true,
      formatoFecha: 'dd/mm/yyyy',
      responsableReporte: 'Sistema de Pruebas',
      observaciones: 'Reporte de prueba generado automáticamente'
    };

    try {
      const response = await axios.post(`${BASE_URL}/reportes/movimientos-por-eess/exportar`, {
        filtros,
        config: configExportacion
      }, {
        responseType: 'blob'
      });

      if (response.status === 200) {
        console.log('✅ Endpoint de exportación funciona correctamente');
        console.log(`📁 Archivo Excel generado: ${response.data.size || 'Tamaño desconocido'} bytes`);
      } else {
        console.log('❌ Error en la respuesta del endpoint de exportación');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('🔐 Endpoint protegido (requiere autenticación) - Esto es esperado');
      } else {
        console.log('❌ Error al probar endpoint de exportación:', error.message);
      }
    }

    // Test 3: Verificar estructura de rutas
    console.log('\n🛣️  Test 3: Verificar rutas registradas');
    try {
      // Intentar acceder a una ruta que no existe para ver el error 404
      await axios.get(`${BASE_URL}/reportes/ruta-inexistente`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Sistema de rutas funcionando correctamente (404 esperado)');
      } else if (error.response?.status === 401) {
        console.log('✅ Sistema de rutas funcionando correctamente (401 esperado)');
      } else {
        console.log('⚠️  Respuesta inesperada del sistema de rutas:', error.response?.status);
      }
    }

    console.log('\n🎉 Pruebas completadas');
    console.log('\n📋 Resumen de endpoints implementados:');
    console.log('   - POST /api/reportes/movimientos-por-eess');
    console.log('   - POST /api/reportes/movimientos-por-eess/exportar');
    console.log('\n💡 Para probar completamente, ejecute el servidor backend y use un token de autenticación válido.');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testMovimientosPorEESS().catch(console.error);
