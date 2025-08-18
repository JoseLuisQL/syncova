const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIVoucherGeneration() {
  try {
    console.log('🧪 TESTING API VOUCHER GENERATION WITH STOCK UPDATES\n');

    // 1. Verificar stock inicial
    console.log('📊 PASO 1: Verificando stock inicial...');
    const stockInicial = await getStockSnapshot();
    console.log(`   Lotes de vacunas con stock: ${stockInicial.vacunas.length}`);
    console.log(`   Lotes de jeringas con stock: ${stockInicial.jeringas.length}`);
    
    // Mostrar algunos lotes con stock
    if (stockInicial.vacunas.length > 0) {
      console.log('   📦 Primeros lotes de vacunas:');
      stockInicial.vacunas.slice(0, 3).forEach(lote => {
        console.log(`      • ${lote.numero}: ${lote.cantidadActual} unidades (${lote.vacuna.nombre})`);
      });
    }

    if (stockInicial.jeringas.length > 0) {
      console.log('   💉 Primeros lotes de jeringas:');
      stockInicial.jeringas.slice(0, 3).forEach(lote => {
        console.log(`      • ${lote.numero}: ${lote.cantidadActual} unidades (${lote.jeringa.tipo})`);
      });
    }

    // 2. Verificar movimientos disponibles
    console.log('\n📋 PASO 2: Verificando movimientos disponibles...');
    const centroId = 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c'; // Centro de Salud Andahuaylas
    
    const movimientos = await prisma.movimientoVacuna.findMany({
      where: {
        mes: 11,
        anio: 2025,
        entrega: { gt: 0 },
        establecimiento: {
          centroAcopioId: centroId
        }
      },
      include: {
        establecimiento: {
          select: { nombre: true }
        },
        vacuna: {
          select: { nombre: true, presentacion: true }
        }
      },
      take: 5
    });

    console.log(`   Movimientos encontrados: ${movimientos.length}`);
    let totalVacunasRequeridas = 0;
    movimientos.forEach(mov => {
      console.log(`   • ${mov.establecimiento.nombre} - ${mov.vacuna.nombre}: ${mov.entrega} unidades`);
      totalVacunasRequeridas += mov.entrega;
    });
    console.log(`   📊 Total vacunas requeridas: ${totalVacunasRequeridas}`);

    if (movimientos.length === 0) {
      console.log('❌ No hay movimientos para generar vale');
      return;
    }

    // 3. Generar vale usando la API
    console.log('\n🔄 PASO 3: Generando vale usando API...');
    
    const valeData = {
      centroAcopioId: centroId,
      mes: 11,
      anio: 2025,
      usuarioId: 'temp-user-id',
      observaciones: 'Vale de prueba para testing de stock - API',
      afectarStock: true // CRÍTICO: Asegurar que se afecte el stock
    };

    console.log('   📝 Datos del vale:', JSON.stringify(valeData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/vales/generar', valeData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('   📄 Response completa:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      const resultado = response.data.data;
      console.log(`   ✅ Vale generado exitosamente: ${resultado.vale.numero}`);
      console.log(`   📄 ID del vale: ${resultado.vale.id}`);
      console.log(`   📊 Detalles de vacunas: ${resultado.vale.detalles.length}`);
      console.log(`   💉 Detalles de jeringas: ${resultado.vale.detallesJeringas.length}`);
      
      // Mostrar resumen de stocks afectados
      if (resultado.stocksAfectados) {
        console.log(`   📦 Stocks de vacunas afectados: ${resultado.stocksAfectados.vacunas.length}`);
        console.log(`   💉 Stocks de jeringas afectados: ${resultado.stocksAfectados.jeringas.length}`);
        
        // Mostrar detalles de stocks afectados
        resultado.stocksAfectados.vacunas.forEach(stock => {
          console.log(`      📦 Lote ${stock.loteId}: ${stock.saldoAnterior} → ${stock.saldoNuevo} (afectado: ${stock.cantidadAfectada})`);
        });
        
        resultado.stocksAfectados.jeringas.forEach(stock => {
          console.log(`      💉 Lote ${stock.loteId}: ${stock.saldoAnterior} → ${stock.saldoNuevo} (afectado: ${stock.cantidadAfectada})`);
        });
      }
    } else {
      console.log(`   ❌ Error generando vale: ${response.data.error}`);
      return;
    }

    // 4. Verificar stock después de generar vale
    console.log('\n📊 PASO 4: Verificando stock después del vale...');
    const stockFinal = await getStockSnapshot();
    
    // 5. Comparar stocks
    console.log('\n🔍 PASO 5: Comparando stocks...');
    await compareStocks(stockInicial, stockFinal, totalVacunasRequeridas);

    // 6. Verificar detalles del vale en la base de datos
    console.log('\n📄 PASO 6: Verificando vale en base de datos...');
    const valeCompleto = await prisma.vale.findUnique({
      where: { id: response.data.data.vale.id },
      include: {
        detalles: {
          include: {
            loteVacuna: {
              include: { vacuna: true }
            }
          }
        },
        detallesJeringas: {
          include: {
            loteJeringa: {
              include: { jeringa: true }
            }
          }
        }
      }
    });

    console.log(`   📦 Detalles de vacunas en el vale: ${valeCompleto.detalles.length}`);
    valeCompleto.detalles.forEach(detalle => {
      console.log(`      • Lote ${detalle.loteVacuna.numero}: ${detalle.cantidad} unidades de ${detalle.loteVacuna.vacuna.nombre}`);
    });

    console.log(`   💉 Detalles de jeringas en el vale: ${valeCompleto.detallesJeringas.length}`);
    valeCompleto.detallesJeringas.forEach(detalle => {
      console.log(`      • Lote ${detalle.loteJeringa.numero}: ${detalle.cantidad} unidades de ${detalle.loteJeringa.jeringa.tipo}`);
    });

    // 7. Verificar movimientos de kardex
    console.log('\n📋 PASO 7: Verificando movimientos de kardex...');
    const kardexVacunas = await prisma.kardexVacuna.findMany({
      where: {
        numeroDocumento: valeCompleto.numero
      },
      include: {
        loteVacuna: {
          include: { vacuna: true }
        }
      }
    });

    const kardexJeringas = await prisma.kardexJeringa.findMany({
      where: {
        numeroDocumento: valeCompleto.numero
      },
      include: {
        loteJeringa: {
          include: { jeringa: true }
        }
      }
    });

    console.log(`   📦 Movimientos kardex vacunas: ${kardexVacunas.length}`);
    kardexVacunas.forEach(kardex => {
      console.log(`      • ${kardex.loteVacuna.vacuna.nombre} - Lote ${kardex.loteVacuna.numero}: ${kardex.tipoMovimiento} ${kardex.cantidad} (${kardex.saldoAnterior} → ${kardex.saldoActual})`);
    });

    console.log(`   💉 Movimientos kardex jeringas: ${kardexJeringas.length}`);
    kardexJeringas.forEach(kardex => {
      console.log(`      • ${kardex.loteJeringa.jeringa.tipo} - Lote ${kardex.loteJeringa.numero}: ${kardex.tipoMovimiento} ${kardex.cantidad} (${kardex.saldoAnterior} → ${kardex.saldoActual})`);
    });

  } catch (error) {
    console.error('❌ Error en test de API:', error.message);
    if (error.response) {
      console.error('   📄 Response data:', error.response.data);
      console.error('   📊 Status:', error.response.status);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function getStockSnapshot() {
  const vacunas = await prisma.loteVacuna.findMany({
    where: {
      estado: 'disponible',
      cantidadActual: { gt: 0 }
    },
    include: {
      vacuna: { select: { nombre: true } }
    },
    orderBy: { numero: 'asc' }
  });

  const jeringas = await prisma.loteJeringa.findMany({
    where: {
      estado: 'disponible',
      cantidadActual: { gt: 0 }
    },
    include: {
      jeringa: { select: { tipo: true } }
    },
    orderBy: { numero: 'asc' }
  });

  return { vacunas, jeringas };
}

async function compareStocks(inicial, final, totalRequerido) {
  console.log('   🔍 Comparación de stocks:');
  
  // Crear mapas para comparación fácil
  const inicialMap = new Map();
  inicial.vacunas.forEach(lote => {
    inicialMap.set(lote.numero, lote.cantidadActual);
  });
  inicial.jeringas.forEach(lote => {
    inicialMap.set(lote.numero, lote.cantidadActual);
  });

  const finalMap = new Map();
  final.vacunas.forEach(lote => {
    finalMap.set(lote.numero, lote.cantidadActual);
  });
  final.jeringas.forEach(lote => {
    finalMap.set(lote.numero, lote.cantidadActual);
  });

  let stockAfectado = false;
  let totalDescontado = 0;

  // Verificar cambios en vacunas
  inicial.vacunas.forEach(lote => {
    const stockInicial = inicialMap.get(lote.numero);
    const stockFinal = finalMap.get(lote.numero) || 0;
    const diferencia = stockInicial - stockFinal;
    
    if (diferencia > 0) {
      console.log(`      📦 ${lote.numero}: ${stockInicial} → ${stockFinal} (descontado: ${diferencia})`);
      stockAfectado = true;
      totalDescontado += diferencia;
    }
  });

  // Verificar cambios en jeringas
  inicial.jeringas.forEach(lote => {
    const stockInicial = inicialMap.get(lote.numero);
    const stockFinal = finalMap.get(lote.numero) || 0;
    const diferencia = stockInicial - stockFinal;
    
    if (diferencia > 0) {
      console.log(`      💉 ${lote.numero}: ${stockInicial} → ${stockFinal} (descontado: ${diferencia})`);
      stockAfectado = true;
    }
  });

  if (stockAfectado) {
    console.log(`   ✅ STOCK AFECTADO CORRECTAMENTE`);
    console.log(`   📊 Total vacunas descontadas: ${totalDescontado}`);
    console.log(`   📊 Total requerido: ${totalRequerido}`);
  } else {
    console.log(`   ❌ PROBLEMA: EL STOCK NO FUE AFECTADO`);
    console.log(`   🚨 Esta es la falla crítica que necesita ser corregida`);
  }
}

// Ejecutar test
testAPIVoucherGeneration()
  .then(() => {
    console.log('\n✅ Test de API de generación de vale completado');
  })
  .catch(error => {
    console.error('\n❌ Error en test de API:', error);
    process.exit(1);
  });
