const axios = require('axios');

async function testStockComprehensive() {
  try {
    console.log('🧪 COMPREHENSIVE STOCK UPDATE TEST\n');

    // 1. Get initial stock snapshot
    console.log('📊 PASO 1: Snapshot inicial de stock...');
    
    const initialVaccineStock = await getStockSnapshot('vaccines');
    const initialSyringeStock = await getStockSnapshot('syringes');
    
    console.log(`   📦 Lotes de vacunas con stock: ${initialVaccineStock.length}`);
    console.log(`   💉 Lotes de jeringas con stock: ${initialSyringeStock.length}`);
    
    // Show some initial stock
    if (initialVaccineStock.length > 0) {
      console.log('   📦 Stock inicial de vacunas (primeros 3):');
      initialVaccineStock.slice(0, 3).forEach(lote => {
        console.log(`      • ${lote.numero}: ${lote.cantidadActual} unidades`);
      });
    }
    
    if (initialSyringeStock.length > 0) {
      console.log('   💉 Stock inicial de jeringas (primeros 3):');
      initialSyringeStock.slice(0, 3).forEach(lote => {
        console.log(`      • ${lote.numero}: ${lote.cantidadActual} unidades`);
      });
    }

    // 2. Generate a new voucher using a different center to avoid conflicts
    console.log('\n🔄 PASO 2: Generando nuevo vale...');
    
    // Use a different center that doesn't have existing vouchers
    const centroId = '364a7ad9-b753-438d-b0a0-c5a7bb9e67a6'; // Hospital Andahuaylas
    
    const valeData = {
      centroAcopioId: centroId,
      mes: 12, // Use December to avoid conflicts
      anio: 2025,
      usuarioId: 'temp-user-id',
      observaciones: 'Vale de prueba para testing comprehensivo de stock',
      afectarStock: true
    };

    console.log('   📝 Datos del vale:', JSON.stringify(valeData, null, 2));
    
    try {
      const response = await axios.post('http://localhost:3001/api/vales/generar', valeData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      if (response.data.success) {
        const resultado = response.data.data;
        console.log(`   ✅ Vale generado exitosamente: ${resultado.vale.numero}`);
        console.log(`   📊 Total vacunas: ${resultado.resumen.totalVacunas}`);
        console.log(`   🏢 Total establecimientos: ${resultado.resumen.totalEstablecimientos}`);
        
        // 3. Get final stock snapshot
        console.log('\n📊 PASO 3: Snapshot final de stock...');
        
        const finalVaccineStock = await getStockSnapshot('vaccines');
        const finalSyringeStock = await getStockSnapshot('syringes');
        
        // 4. Compare stocks
        console.log('\n🔍 PASO 4: Comparando stocks...');
        
        const vaccineChanges = compareStocks(initialVaccineStock, finalVaccineStock, 'vaccines');
        const syringeChanges = compareStocks(initialSyringeStock, finalSyringeStock, 'syringes');
        
        // 5. Verify kardex entries
        console.log('\n📋 PASO 5: Verificando entradas de kardex...');
        
        const kardexResponse = await axios.get('http://localhost:3001/api/kardex', {
          params: {
            numeroDocumento: resultado.vale.numero,
            limit: 100
          }
        });

        if (kardexResponse.data.success) {
          const kardexEntries = kardexResponse.data.data.movimientos || [];
          const vaccineEntries = kardexEntries.filter(k => k.tipo === 'vacuna');
          const syringeEntries = kardexEntries.filter(k => k.tipo === 'jeringa');
          
          console.log(`   📦 Entradas kardex vacunas: ${vaccineEntries.length}`);
          console.log(`   💉 Entradas kardex jeringas: ${syringeEntries.length}`);
          
          // Analyze movement types
          const vaccineSalidas = vaccineEntries.filter(k => k.tipoMovimiento === 'salida');
          const vaccineIngresos = vaccineEntries.filter(k => k.tipoMovimiento === 'ingreso');
          const syringeSalidas = syringeEntries.filter(k => k.tipoMovimiento === 'salida');
          const syringeIngresos = syringeEntries.filter(k => k.tipoMovimiento === 'ingreso');
          
          console.log(`   📦 Vacunas - Salidas: ${vaccineSalidas.length}, Ingresos: ${vaccineIngresos.length}`);
          console.log(`   💉 Jeringas - Salidas: ${syringeSalidas.length}, Ingresos: ${syringeIngresos.length}`);
          
          // Show some entries
          if (vaccineSalidas.length > 0) {
            console.log('   📦 Movimientos de vacunas (salidas):');
            vaccineSalidas.slice(0, 3).forEach(k => {
              console.log(`      • ${k.tipoMovimiento} ${k.cantidad} unidades (${k.saldoAnterior} → ${k.saldoActual})`);
            });
          }
          
          if (syringeSalidas.length > 0) {
            console.log('   💉 Movimientos de jeringas (salidas):');
            syringeSalidas.slice(0, 3).forEach(k => {
              console.log(`      • ${k.tipoMovimiento} ${k.cantidad} unidades (${k.saldoAnterior} → ${k.saldoActual})`);
            });
          }
          
          if (syringeIngresos.length > 0) {
            console.log('   ⚠️ Movimientos de jeringas (ingresos - posible problema):');
            syringeIngresos.slice(0, 3).forEach(k => {
              console.log(`      • ${k.tipoMovimiento} ${k.cantidad} unidades (${k.saldoAnterior} → ${k.saldoActual}) - ${k.documento}`);
            });
          }
        }
        
        // 6. Summary
        console.log('\n📊 RESUMEN:');
        console.log(`   📦 Cambios en stock de vacunas: ${vaccineChanges.totalChanged} lotes afectados`);
        console.log(`   💉 Cambios en stock de jeringas: ${syringeChanges.totalChanged} lotes afectados`);
        console.log(`   📦 Total vacunas descontadas: ${vaccineChanges.totalDeducted}`);
        console.log(`   💉 Total jeringas descontadas: ${syringeChanges.totalDeducted}`);
        
        if (vaccineChanges.totalDeducted > 0 && syringeChanges.totalDeducted > 0) {
          console.log('\n✅ STOCK UPDATES WORKING CORRECTLY');
          console.log('   Both vaccine and syringe stocks are being properly decremented');
        } else if (vaccineChanges.totalDeducted > 0 && syringeChanges.totalDeducted === 0) {
          console.log('\n⚠️ PARTIAL ISSUE: Vaccine stocks updated, syringe stocks not decremented');
        } else if (vaccineChanges.totalDeducted === 0) {
          console.log('\n❌ CRITICAL ISSUE: Vaccine stocks not being decremented');
        }
        
      } else {
        console.log(`   ❌ Error generando vale: ${response.data.error}`);
      }
    } catch (valeError) {
      if (valeError.response && valeError.response.status === 400) {
        console.log(`   ⚠️ No se pudo generar vale: ${valeError.response.data.message}`);
        console.log('   Esto puede ser normal si no hay movimientos para este centro/período');
      } else {
        throw valeError;
      }
    }

  } catch (error) {
    console.error('❌ Error en test comprehensivo:', error.message);
    if (error.response) {
      console.error('   📄 Response data:', error.response.data);
    }
    throw error;
  }
}

async function getStockSnapshot(type) {
  const endpoint = type === 'vaccines' ? 'lotes-vacunas' : 'lotes-jeringas';

  try {
    const response = await axios.get(`http://localhost:3001/api/${endpoint}`, {
      params: {
        estado: 'disponible',
        limit: 100
      }
    });

    console.log(`   📡 Response for ${type}:`, response.data.success ? 'success' : 'failed');

    if (response.data.success && response.data.data && response.data.data.lotes) {
      return response.data.data.lotes.filter(lote => lote.cantidadActual > 0);
    }

    console.log(`   ⚠️ No data found for ${type}`);
    return [];
  } catch (error) {
    console.log(`   ❌ Error getting ${type} stock:`, error.message);
    return [];
  }
}

function compareStocks(initial, final, type) {
  const initialMap = new Map();
  initial.forEach(lote => {
    initialMap.set(lote.numero, lote.cantidadActual);
  });

  const finalMap = new Map();
  final.forEach(lote => {
    finalMap.set(lote.numero, lote.cantidadActual);
  });

  let totalChanged = 0;
  let totalDeducted = 0;

  console.log(`   🔍 Cambios en ${type}:`);
  
  initial.forEach(lote => {
    const initialStock = initialMap.get(lote.numero);
    const finalStock = finalMap.get(lote.numero) || 0;
    const difference = initialStock - finalStock;
    
    if (difference !== 0) {
      console.log(`      • ${lote.numero}: ${initialStock} → ${finalStock} (${difference > 0 ? '-' : '+'}${Math.abs(difference)})`);
      totalChanged++;
      if (difference > 0) {
        totalDeducted += difference;
      }
    }
  });

  if (totalChanged === 0) {
    console.log(`      • No hay cambios en stock de ${type}`);
  }

  return { totalChanged, totalDeducted };
}

// Execute test
testStockComprehensive()
  .then(() => {
    console.log('\n✅ Test comprehensivo completado');
  })
  .catch(error => {
    console.error('\n❌ Error en test:', error);
    process.exit(1);
  });
