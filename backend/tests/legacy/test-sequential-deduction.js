const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

/**
 * Test script to verify sequential stock deduction logic for both vaccines and syringes
 */
async function testSequentialDeduction() {
  try {
    console.log('🧪 TESTING SEQUENTIAL STOCK DEDUCTION LOGIC\n');

    // Test 1: Verify vaccine sequential deduction (should already work)
    console.log('📋 TEST 1: Verificando deducción secuencial de vacunas...');
    await testVaccineSequentialDeduction();

    // Test 2: Verify syringe sequential deduction (newly implemented)
    console.log('\n📋 TEST 2: Verificando deducción secuencial de jeringas...');
    await testSyringeSequentialDeduction();

    // Test 3: Verify consolidated deduction logic
    console.log('\n📋 TEST 3: Verificando lógica consolidada...');
    await testConsolidatedDeduction();

    console.log('\n✅ TODOS LOS TESTS COMPLETADOS');

  } catch (error) {
    console.error('❌ Error en tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Test vaccine sequential deduction logic
 */
async function testVaccineSequentialDeduction() {
  // Find a recent vaccine delivery voucher
  const recentVale = await prisma.valeEntrega.findFirst({
    where: {
      estado: 'generado'
    },
    orderBy: { createdAt: 'desc' },
    include: {
      detalles: {
        include: {
          vacuna: true
        }
      }
    }
  });

  if (!recentVale) {
    console.log('   ⚠️ No se encontraron vales recientes para probar');
    return;
  }

  console.log(`   📄 Analizando vale: ${recentVale.numero}`);

  // Get vaccine movements for this voucher
  const vaccineMovements = await prisma.kardex.findMany({
    where: {
      numeroDocumento: recentVale.numero,
      tipo: 'vacuna'
    },
    orderBy: { fechaMovimiento: 'asc' }
  });

  console.log(`   💉 Movimientos de vacunas encontrados: ${vaccineMovements.length}`);

  // Group by vaccine and analyze sequential balance
  const vaccineGroups = {};
  vaccineMovements.forEach(mov => {
    const vacunaId = mov.itemId;
    if (!vaccineGroups[vacunaId]) {
      vaccineGroups[vacunaId] = [];
    }
    vaccineGroups[vacunaId].push(mov);
  });

  // Analyze each vaccine group
  for (const [vacunaId, movements] of Object.entries(vaccineGroups)) {
    console.log(`\n   🔍 Analizando vacuna ${vacunaId} (${movements.length} movimientos):`);

    let expectedBalance = movements[0].saldoAnterior;
    let isSequential = true;

    movements.forEach((mov, index) => {
      const expectedAfter = expectedBalance - mov.cantidad;
      const actualBefore = mov.saldoAnterior;
      const actualAfter = mov.saldoActual;

      console.log(`      ${index + 1}. Cantidad: ${mov.cantidad}, Balance: ${actualBefore} → ${actualAfter}`);

      if (actualBefore !== expectedBalance || actualAfter !== expectedAfter) {
        isSequential = false;
        console.log(`         ❌ ERROR: Esperado ${expectedBalance} → ${expectedAfter}`);
      }

      expectedBalance = expectedAfter;
    });

    console.log(`      ${isSequential ? '✅' : '❌'} Balance secuencial: ${isSequential ? 'CORRECTO' : 'INCORRECTO'}`);
  }
}

/**
 * Test syringe sequential deduction logic
 */
async function testSyringeSequentialDeduction() {
  // Find a recent delivery voucher with syringe movements
  const recentVale = await prisma.valeEntrega.findFirst({
    where: {
      estado: 'generado'
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!recentVale) {
    console.log('   ⚠️ No se encontraron vales recientes para probar');
    return;
  }

  console.log(`   📄 Analizando vale: ${recentVale.numero}`);

  // Get syringe movements for this voucher
  const syringeMovements = await prisma.kardex.findMany({
    where: {
      numeroDocumento: recentVale.numero,
      tipo: 'jeringa'
    },
    orderBy: { fechaMovimiento: 'asc' }
  });

  console.log(`   💉 Movimientos de jeringas encontrados: ${syringeMovements.length}`);

  if (syringeMovements.length === 0) {
    console.log('   ⚠️ No hay movimientos de jeringas para analizar');
    return;
  }

  // Group by syringe and analyze sequential balance
  const syringeGroups = {};
  syringeMovements.forEach(mov => {
    const jeringaId = mov.itemId;
    if (!syringeGroups[jeringaId]) {
      syringeGroups[jeringaId] = [];
    }
    syringeGroups[jeringaId].push(mov);
  });

  // Analyze each syringe group
  for (const [jeringaId, movements] of Object.entries(syringeGroups)) {
    console.log(`\n   🔍 Analizando jeringa ${jeringaId} (${movements.length} movimientos):`);

    let expectedBalance = movements[0].saldoAnterior;
    let isSequential = true;

    movements.forEach((mov, index) => {
      const expectedAfter = expectedBalance - mov.cantidad;
      const actualBefore = mov.saldoAnterior;
      const actualAfter = mov.saldoActual;

      console.log(`      ${index + 1}. Cantidad: ${mov.cantidad}, Balance: ${actualBefore} → ${actualAfter}`);

      if (actualBefore !== expectedBalance || actualAfter !== expectedAfter) {
        isSequential = false;
        console.log(`         ❌ ERROR: Esperado ${expectedBalance} → ${expectedAfter}`);
      }

      expectedBalance = expectedAfter;
    });

    console.log(`      ${isSequential ? '✅' : '❌'} Balance secuencial: ${isSequential ? 'CORRECTO' : 'INCORRECTO'}`);
  }
}

/**
 * Test consolidated deduction logic
 */
async function testConsolidatedDeduction() {
  // Get the most recent voucher with multiple establishments
  const consolidatedVale = await prisma.valeEntrega.findFirst({
    where: {
      estado: 'generado',
      totalEstablecimientos: { gt: 1 }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      detalles: {
        include: {
          establecimiento: {
            select: { nombre: true }
          }
        }
      }
    }
  });

  if (!consolidatedVale) {
    console.log('   ⚠️ No se encontraron vales consolidados para probar');
    return;
  }

  console.log(`   📄 Analizando vale consolidado: ${consolidatedVale.numero}`);
  console.log(`   🏢 Establecimientos: ${consolidatedVale.totalEstablecimientos}`);

  // Get all movements for this voucher
  const allMovements = await prisma.kardex.findMany({
    where: {
      numeroDocumento: consolidatedVale.numero
    },
    orderBy: [
      { tipo: 'asc' },
      { itemId: 'asc' },
      { fechaMovimiento: 'asc' }
    ]
  });

  console.log(`   📊 Total movimientos: ${allMovements.length}`);

  // Group by type and item
  const movementGroups = {};
  allMovements.forEach(mov => {
    const key = `${mov.tipo}-${mov.itemId}`;
    if (!movementGroups[key]) {
      movementGroups[key] = [];
    }
    movementGroups[key].push(mov);
  });

  // Analyze each group
  for (const [key, movements] of Object.entries(movementGroups)) {
    const [tipo, itemId] = key.split('-');
    console.log(`\n   🔍 Analizando ${tipo} ${itemId} (${movements.length} movimientos):`);

    let expectedBalance = movements[0].saldoAnterior;
    let isSequential = true;

    movements.forEach((mov, index) => {
      const expectedAfter = expectedBalance - mov.cantidad;
      const actualBefore = mov.saldoAnterior;
      const actualAfter = mov.saldoActual;

      if (actualBefore !== expectedBalance || actualAfter !== expectedAfter) {
        isSequential = false;
      }

      expectedBalance = expectedAfter;
    });

    console.log(`      ${isSequential ? '✅' : '❌'} Balance secuencial: ${isSequential ? 'CORRECTO' : 'INCORRECTO'}`);
  }
}

// Run the tests
testSequentialDeduction();
