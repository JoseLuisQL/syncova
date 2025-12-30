const axios = require('axios');

/**
 * Script de prueba para verificar que los filtros de fecha del Kardex funcionan correctamente
 * Prueba el rango de fechas desde 29/08/2025 hasta 31/08/2025
 */
async function testKardexDateFilter() {
  try {
    console.log('🧪 PRUEBA DE FILTROS DE FECHA EN KARDEX\n');

    // Configurar las fechas de prueba
    const fechaInicio = '2025-08-29';
    const fechaFin = '2025-08-31';

    console.log(`📅 Probando filtro de fechas:`);
    console.log(`   Fecha inicio: ${fechaInicio}`);
    console.log(`   Fecha fin: ${fechaFin}\n`);

    // 1. Probar obtener movimientos con filtro de fecha
    console.log('🔍 PASO 1: Obteniendo movimientos con filtro de fecha...');
    
    const movimientosResponse = await axios.get('http://localhost:3001/api/kardex', {
      params: {
        fechaInicio,
        fechaFin,
        limit: 50
      }
    });

    if (!movimientosResponse.data.success) {
      console.log('❌ Error obteniendo movimientos:', movimientosResponse.data.message);
      return;
    }

    const movimientos = movimientosResponse.data.data.movimientos;
    const total = movimientosResponse.data.data.total;

    console.log(`   ✅ Movimientos encontrados: ${movimientos.length} de ${total} total`);

    if (movimientos.length > 0) {
      console.log('\n📊 MOVIMIENTOS ENCONTRADOS:');
      movimientos.forEach((mov, index) => {
        const fecha = new Date(mov.fechaMovimiento);
        const fechaFormateada = fecha.toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        console.log(`   ${index + 1}. ${mov.tipo.toUpperCase()} - ${mov.tipoMovimiento} - ${mov.cantidad} unidades`);
        console.log(`      Fecha: ${fechaFormateada}`);
        console.log(`      Documento: ${mov.documento} ${mov.numeroDocumento}`);
        console.log(`      Observaciones: ${mov.observaciones}`);
        console.log('');
      });

      // Verificar que todas las fechas están en el rango esperado
      console.log('🔍 VERIFICANDO RANGO DE FECHAS:');
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin);
      fechaFinObj.setHours(23, 59, 59, 999); // Incluir todo el día final

      let movimientosFueraDeRango = 0;
      movimientos.forEach((mov, index) => {
        const fechaMov = new Date(mov.fechaMovimiento);
        if (fechaMov < fechaInicioObj || fechaMov > fechaFinObj) {
          console.log(`   ❌ Movimiento ${index + 1} fuera de rango: ${fechaMov.toISOString()}`);
          movimientosFueraDeRango++;
        }
      });

      if (movimientosFueraDeRango === 0) {
        console.log('   ✅ Todos los movimientos están dentro del rango de fechas especificado');
      } else {
        console.log(`   ❌ ${movimientosFueraDeRango} movimientos están fuera del rango`);
      }
    } else {
      // Si no hay movimientos, inicializar la variable
      let movimientosFueraDeRango = 0;
    }

    // 2. Probar estadísticas con filtro de fecha
    console.log('\n🔍 PASO 2: Obteniendo estadísticas con filtro de fecha...');
    
    const estadisticasResponse = await axios.get('http://localhost:3001/api/kardex/estadisticas', {
      params: {
        fechaInicio,
        fechaFin
      }
    });

    if (!estadisticasResponse.data.success) {
      console.log('❌ Error obteniendo estadísticas:', estadisticasResponse.data.message);
      return;
    }

    const estadisticas = estadisticasResponse.data.data;
    console.log('   ✅ Estadísticas obtenidas:');
    console.log(`      Total movimientos: ${estadisticas.totalMovimientos}`);
    console.log(`      Total ingresos: ${estadisticas.totalIngresos}`);
    console.log(`      Total salidas: ${estadisticas.totalSalidas}`);
    console.log(`      Movimientos por tipo:`, estadisticas.movimientosPorTipo);

    // 3. Probar casos específicos
    console.log('\n🔍 PASO 3: Probando casos específicos...');

    // Probar solo el día 31/08/2025
    console.log('\n   📅 Probando solo el día 31/08/2025:');
    const soloFin = await axios.get('http://localhost:3001/api/kardex', {
      params: {
        fechaInicio: '2025-08-31',
        fechaFin: '2025-08-31',
        limit: 20
      }
    });

    if (soloFin.data.success) {
      console.log(`      ✅ Movimientos del 31/08/2025: ${soloFin.data.data.movimientos.length}`);
      
      // Mostrar algunos movimientos del día 31
      soloFin.data.data.movimientos.slice(0, 3).forEach((mov, index) => {
        const fecha = new Date(mov.fechaMovimiento);
        console.log(`         ${index + 1}. ${mov.tipoMovimiento} - ${fecha.toLocaleString('es-PE')}`);
      });
    } else {
      console.log('      ❌ Error obteniendo movimientos del 31/08/2025');
    }

    console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('\n📝 RESUMEN:');
    console.log(`   - Movimientos en rango ${fechaInicio} a ${fechaFin}: ${movimientos.length}`);
    console.log(`   - Total de registros que coinciden: ${total}`);

    // Verificar si movimientosFueraDeRango está definido
    const movimientosFueraDeRangoFinal = movimientos.length > 0 ?
      movimientos.filter(mov => {
        const fechaMov = new Date(mov.fechaMovimiento);
        const fechaInicioObj = new Date(fechaInicio);
        const fechaFinObj = new Date(fechaFin);
        fechaFinObj.setHours(23, 59, 59, 999);
        return fechaMov < fechaInicioObj || fechaMov > fechaFinObj;
      }).length : 0;

    console.log(`   - Filtro de fecha funcionando correctamente: ${movimientosFueraDeRangoFinal === 0 ? '✅ SÍ' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('   Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testKardexDateFilter();
