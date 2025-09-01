const axios = require('axios');

/**
 * Script de debug para analizar los datos de kardex y entender el problema con las fechas
 */
async function debugKardexDates() {
  try {
    console.log('🔍 DEBUG: ANÁLISIS DE FECHAS EN KARDEX\n');

    // 1. Obtener todos los movimientos sin filtro de fecha
    console.log('📊 PASO 1: Obteniendo todos los movimientos (sin filtro de fecha)...');
    
    const todosMovimientos = await axios.get('http://localhost:3001/api/kardex', {
      params: {
        limit: 100
      }
    });

    if (!todosMovimientos.data.success) {
      console.log('❌ Error obteniendo movimientos:', todosMovimientos.data.message);
      return;
    }

    const movimientos = todosMovimientos.data.data.movimientos;
    console.log(`   ✅ Total de movimientos encontrados: ${movimientos.length}`);

    if (movimientos.length === 0) {
      console.log('   ❌ No hay movimientos en la base de datos');
      return;
    }

    // 2. Analizar las fechas de los movimientos
    console.log('\n📅 PASO 2: Analizando fechas de los movimientos...');
    
    const fechasAnalisis = movimientos.map(mov => {
      const fecha = new Date(mov.fechaMovimiento);
      return {
        id: mov.id,
        fechaOriginal: mov.fechaMovimiento,
        fechaParseada: fecha,
        fechaISO: fecha.toISOString(),
        fechaLocal: fecha.toLocaleString('es-PE'),
        año: fecha.getFullYear(),
        mes: fecha.getMonth() + 1,
        dia: fecha.getDate(),
        tipo: mov.tipo,
        tipoMovimiento: mov.tipoMovimiento,
        documento: mov.numeroDocumento
      };
    });

    // Mostrar las primeras 10 fechas
    console.log('\n   📋 Primeros 10 movimientos con análisis de fechas:');
    fechasAnalisis.slice(0, 10).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.tipo} - ${item.tipoMovimiento}`);
      console.log(`      Fecha original: ${item.fechaOriginal}`);
      console.log(`      Fecha parseada: ${item.fechaLocal}`);
      console.log(`      Fecha ISO: ${item.fechaISO}`);
      console.log(`      Año/Mes/Día: ${item.año}/${item.mes.toString().padStart(2, '0')}/${item.dia.toString().padStart(2, '0')}`);
      console.log(`      Documento: ${item.documento}`);
      console.log('');
    });

    // 3. Buscar movimientos específicos de agosto 2025
    console.log('🔍 PASO 3: Buscando movimientos de agosto 2025...');
    
    const movimientosAgosto2025 = fechasAnalisis.filter(item => 
      item.año === 2025 && item.mes === 8
    );

    console.log(`   ✅ Movimientos de agosto 2025: ${movimientosAgosto2025.length}`);

    if (movimientosAgosto2025.length > 0) {
      console.log('\n   📋 Movimientos de agosto 2025:');
      movimientosAgosto2025.forEach((item, index) => {
        console.log(`   ${index + 1}. Día ${item.dia} - ${item.tipo} - ${item.tipoMovimiento} - ${item.documento}`);
        console.log(`      Fecha completa: ${item.fechaLocal}`);
      });

      // Buscar específicamente los días 29, 30, 31
      const diasEspecificos = [29, 30, 31];
      diasEspecificos.forEach(dia => {
        const movimientosDia = movimientosAgosto2025.filter(item => item.dia === dia);
        console.log(`\n   📅 Movimientos del día ${dia}/08/2025: ${movimientosDia.length}`);
        movimientosDia.forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.fechaLocal} - ${item.tipoMovimiento} - ${item.documento}`);
        });
      });
    }

    // 4. Probar filtros con diferentes formatos de fecha
    console.log('\n🧪 PASO 4: Probando diferentes formatos de fecha...');

    const formatosFecha = [
      '2025-08-31',
      '2025-08-31T00:00:00',
      '2025-08-31T00:00:00.000Z',
      '2025-08-31T00:00:00-05:00'
    ];

    for (const formato of formatosFecha) {
      console.log(`\n   🔍 Probando formato: ${formato}`);
      try {
        const response = await axios.get('http://localhost:3001/api/kardex', {
          params: {
            fechaInicio: formato,
            fechaFin: formato,
            limit: 10
          }
        });

        if (response.data.success) {
          console.log(`      ✅ Resultado: ${response.data.data.movimientos.length} movimientos`);
        } else {
          console.log(`      ❌ Error: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`      ❌ Error de conexión: ${error.message}`);
      }
    }

    // 5. Verificar zona horaria del servidor
    console.log('\n🌍 PASO 5: Información de zona horaria...');
    console.log(`   Zona horaria del sistema: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log(`   Fecha actual del sistema: ${new Date().toISOString()}`);
    console.log(`   Fecha local del sistema: ${new Date().toLocaleString('es-PE')}`);

  } catch (error) {
    console.error('❌ Error en el debug:', error.message);
    if (error.response) {
      console.error('   Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar el debug
debugKardexDates();
