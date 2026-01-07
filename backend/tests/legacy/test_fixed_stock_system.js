const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

const API_BASE_URL = 'http://localhost:3001/api';

async function testFixedStockSystem() {
  try {
    console.log('🧪 TESTING FIXED STOCK SYSTEM\n');

    // 1. Take initial stock snapshot
    console.log('📸 PASO 1: Snapshot inicial de stock...');
    const initialStock = await getStockSnapshot();
    console.log(`   📦 Lotes de vacunas disponibles: ${initialStock.vaccines.length}`);
    console.log(`   💉 Lotes de jeringas disponibles: ${initialStock.syringes.length}`);

    // Show some initial stock
    if (initialStock.vaccines.length > 0) {
      console.log('   📦 Primeros lotes de vacunas:');
      initialStock.vaccines.slice(0, 3).forEach(lote => {
        console.log(`      • ${lote.numero}: ${lote.cantidadActual} unidades`);
      });
    }

    if (initialStock.syringes.length > 0) {
      console.log('   💉 Primeros lotes de jeringas:');
      initialStock.syringes.slice(0, 3).forEach(lote => {
        console.log(`      • ${lote.numero}: ${lote.cantidadActual} unidades`);
      });
    }

    // 2. Generate a test voucher
    console.log('\n🎫 PASO 2: Generando vale de prueba...');
    
    const voucherData = {
      centroAcopioId: 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c', // Centro de Salud Andahuaylas (que sabemos tiene movimientos)
      mes: 11,
      anio: 2025,
      usuarioId: 'temp-user-id',
      observaciones: 'Vale de prueba para verificar sistema de stock corregido',
      afectarStock: true,
      tipoVale: 'solo_adicionales' // Usar solo adicionales para evitar conflicto con vale completo existente
    };

    console.log('   📝 Datos del vale:', JSON.stringify(voucherData, null, 2));

    try {
      const response = await axios.post(`${API_BASE_URL}/vales/generar`, voucherData);
      
      if (response.data.success) {
        console.log('   ✅ Vale generado exitosamente!');
        console.log(`   📄 Número: ${response.data.data.numero}`);
        console.log(`   🆔 ID: ${response.data.data.valeId}`);
        console.log(`   📊 Total vacunas: ${response.data.data.totalVacunas}`);
        console.log(`   🏢 Total establecimientos: ${response.data.data.totalEstablecimientos}`);

        const valeId = response.data.data.valeId;
        const valeNumero = response.data.data.numero;

        // 3. Take stock snapshot after voucher generation
        console.log('\n📸 PASO 3: Snapshot después de generar vale...');
        const afterVoucherStock = await getStockSnapshot();

        // 4. Verify stock deductions
        console.log('\n🔍 PASO 4: Verificando deducciones de stock...');
        const stockChanges = compareStockSnapshots(initialStock, afterVoucherStock);
        
        console.log(`   📦 Lotes de vacunas afectados: ${stockChanges.vaccinesChanged}`);
        console.log(`   💉 Lotes de jeringas afectados: ${stockChanges.syringesChanged}`);

        if (stockChanges.vaccinesChanged > 0) {
          console.log('   ✅ Stock de vacunas fue deducido correctamente');
        } else {
          console.log('   ❌ Stock de vacunas NO fue deducido');
        }

        if (stockChanges.syringesChanged > 0) {
          console.log('   ✅ Stock de jeringas fue deducido correctamente');
        } else {
          console.log('   ❌ Stock de jeringas NO fue deducido');
        }

        // 5. Verify kardex entries
        console.log('\n📋 PASO 5: Verificando entradas de kardex...');
        const kardexEntries = await prisma.kardex.findMany({
          where: {
            numeroDocumento: valeNumero,
            tipoMovimiento: 'salida'
          }
        });

        const vaccineKardex = kardexEntries.filter(entry => entry.tipo === 'vacuna');
        const syringeKardex = kardexEntries.filter(entry => entry.tipo === 'jeringa');

        console.log(`   📦 Entradas de kardex de vacunas: ${vaccineKardex.length}`);
        console.log(`   💉 Entradas de kardex de jeringas: ${syringeKardex.length}`);

        if (vaccineKardex.length > 0) {
          console.log('   ✅ Kardex de vacunas creado correctamente');
          vaccineKardex.forEach(entry => {
            console.log(`      • Cantidad: ${entry.cantidad}, Saldo: ${entry.saldoAnterior} → ${entry.saldoActual}`);
          });
        } else {
          console.log('   ❌ Kardex de vacunas NO fue creado');
        }

        if (syringeKardex.length > 0) {
          console.log('   ✅ Kardex de jeringas creado correctamente');
          syringeKardex.forEach(entry => {
            console.log(`      • Cantidad: ${entry.cantidad}, Saldo: ${entry.saldoAnterior} → ${entry.saldoActual}`);
          });
        } else {
          console.log('   ❌ Kardex de jeringas NO fue creado');
        }

        // 6. Test voucher reversal
        console.log('\n🔄 PASO 6: Probando reversión de vale...');
        
        try {
          const reversalResponse = await axios.post(`${API_BASE_URL}/vales/${valeId}/revertir`);
          
          if (reversalResponse.data.success) {
            console.log('   ✅ Vale revertido exitosamente!');
            console.log(`   📝 Mensaje: ${reversalResponse.data.data.message}`);

            // 7. Verify stock restoration
            console.log('\n📸 PASO 7: Verificando restauración de stock...');
            const afterReversalStock = await getStockSnapshot();
            const reversalChanges = compareStockSnapshots(afterVoucherStock, afterReversalStock);

            console.log(`   📦 Lotes de vacunas restaurados: ${reversalChanges.vaccinesChanged}`);
            console.log(`   💉 Lotes de jeringas restaurados: ${reversalChanges.syringesChanged}`);

            if (reversalChanges.vaccinesChanged > 0) {
              console.log('   ✅ Stock de vacunas restaurado correctamente');
            } else {
              console.log('   ⚠️ Stock de vacunas no cambió en la reversión');
            }

            if (reversalChanges.syringesChanged > 0) {
              console.log('   ✅ Stock de jeringas restaurado correctamente');
            } else {
              console.log('   ⚠️ Stock de jeringas no cambió en la reversión');
            }

            // 8. Verify reversal kardex entries
            console.log('\n📋 PASO 8: Verificando kardex de reversión...');
            const reversalKardex = await prisma.kardex.findMany({
              where: {
                numeroDocumento: valeNumero,
                tipoMovimiento: 'entrada',
                documento: 'REVERSION_VALE'
              }
            });

            console.log(`   🔄 Entradas de kardex de reversión: ${reversalKardex.length}`);
            
            if (reversalKardex.length > 0) {
              console.log('   ✅ Kardex de reversión creado correctamente');
            } else {
              console.log('   ❌ Kardex de reversión NO fue creado');
            }

          } else {
            console.log('   ❌ Error al revertir vale:', reversalResponse.data.error);
          }
        } catch (reversalError) {
          console.log('   ❌ Error en API de reversión:', reversalError.response?.data?.message || reversalError.message);
        }

        // 9. Final summary
        console.log('\n📊 RESUMEN FINAL:');
        const allTestsPassed = 
          stockChanges.vaccinesChanged > 0 && 
          stockChanges.syringesChanged > 0 && 
          vaccineKardex.length > 0 && 
          syringeKardex.length > 0;

        if (allTestsPassed) {
          console.log('   🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema de stock está funcionando correctamente.');
        } else {
          console.log('   ⚠️ Algunas pruebas fallaron. Revisar los detalles arriba.');
        }

      } else {
        console.log('   ❌ Error al generar vale:', response.data.error);
      }

    } catch (apiError) {
      console.log('   ❌ Error en API:', apiError.response?.data?.message || apiError.message);
    }

  } catch (error) {
    console.error('❌ Error crítico en las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getStockSnapshot() {
  const vaccines = await prisma.loteVacuna.findMany({
    where: {
      estado: 'disponible',
      cantidadActual: { gt: 0 }
    },
    select: {
      id: true,
      numero: true,
      cantidadActual: true
    },
    orderBy: { numero: 'asc' }
  });

  const syringes = await prisma.loteJeringa.findMany({
    where: {
      estado: 'disponible',
      cantidadActual: { gt: 0 }
    },
    select: {
      id: true,
      numero: true,
      cantidadActual: true
    },
    orderBy: { numero: 'asc' }
  });

  return { vaccines, syringes };
}

function compareStockSnapshots(before, after) {
  let vaccinesChanged = 0;
  let syringesChanged = 0;

  // Compare vaccines
  for (const beforeLot of before.vaccines) {
    const afterLot = after.vaccines.find(lot => lot.id === beforeLot.id);
    if (afterLot && afterLot.cantidadActual !== beforeLot.cantidadActual) {
      vaccinesChanged++;
    }
  }

  // Compare syringes
  for (const beforeLot of before.syringes) {
    const afterLot = after.syringes.find(lot => lot.id === beforeLot.id);
    if (afterLot && afterLot.cantidadActual !== beforeLot.cantidadActual) {
      syringesChanged++;
    }
  }

  return { vaccinesChanged, syringesChanged };
}

testFixedStockSystem().catch(console.error);
