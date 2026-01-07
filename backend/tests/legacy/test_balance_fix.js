const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function testBalanceFix() {
  try {
    console.log('🧪 TESTING INVENTORY BALANCE FIX');
    console.log('='.repeat(50));

    // 1. Find a vaccine with existing stock
    console.log('\n1️⃣ Finding vaccine with existing stock...');
    const vacunaConStock = await prisma.vacuna.findFirst({
      where: {
        lotes: {
          some: {
            cantidadActual: { gt: 0 },
            estado: 'disponible'
          }
        }
      },
      include: {
        lotes: {
          where: {
            cantidadActual: { gt: 0 },
            estado: 'disponible'
          },
          orderBy: { fechaIngreso: 'asc' }
        }
      }
    });

    if (!vacunaConStock) {
      console.log('❌ No vaccine with stock found. Creating test data...');
      await createTestData();
      return;
    }

    console.log(`✅ Found vaccine: ${vacunaConStock.nombre}`);
    console.log(`   Available batches: ${vacunaConStock.lotes.length}`);
    
    // Calculate current total stock
    const stockActualTotal = vacunaConStock.lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
    console.log(`   Current total stock: ${stockActualTotal} units`);

    // Show current batches
    console.log('\n   Current batches:');
    vacunaConStock.lotes.forEach(lote => {
      console.log(`     • ${lote.numero}: ${lote.cantidadActual} units`);
    });

    // 2. Test creating a new batch entry (ingreso)
    console.log('\n2️⃣ Testing new batch entry (ingreso)...');
    
    // Get system user
    const usuarioSistema = await prisma.usuario.findFirst({
      where: { rol: 'administrador' }
    });

    if (!usuarioSistema) {
      console.log('❌ No admin user found');
      return;
    }

    // Get any establishment (since there's no almacen type in the enum)
    const establecimiento = await prisma.establecimiento.findFirst({
      where: {
        nombre: { contains: 'CHANKA' }
      }
    });

    if (!establecimiento) {
      // Fallback to any establishment
      const establecimiento = await prisma.establecimiento.findFirst();
      if (!establecimiento) {
        console.log('❌ No establishment found');
        return;
      }
    }

    // Create new batch
    const nuevoCantidad = 100;
    const nuevoLote = await prisma.loteVacuna.create({
      data: {
        numero: `TEST-BALANCE-${Date.now()}`,
        vacunaId: vacunaConStock.id,
        fechaIngreso: new Date(),
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        formaIngreso: 'PRIMER_TRIMESTRE',
        comprobanteClase: 'PECOSA',
        numeroComprobante: `TEST-${Date.now()}`,
        cantidadInicial: nuevoCantidad,
        cantidadActual: nuevoCantidad,
        estado: 'disponible',
        observaciones: 'Test batch for balance fix verification'
      }
    });

    console.log(`✅ Created new batch: ${nuevoLote.numero} with ${nuevoCantidad} units`);

    // 3. Test the KardexService with the fix
    console.log('\n3️⃣ Testing KardexService balance calculation...');
    
    const { KardexService } = require('./dist/services/KardexService');
    
    const kardexData = {
      tipo: 'vacuna',
      itemId: vacunaConStock.id,
      loteId: nuevoLote.id,
      tipoMovimiento: 'ingreso',
      cantidad: nuevoCantidad,
      establecimientoDestinoId: establecimiento.id,
      documento: 'PECOSA',
      numeroDocumento: `TEST-${Date.now()}`,
      observaciones: `Test ingreso for balance fix - Batch: ${nuevoLote.numero}`,
      usuarioId: usuarioSistema.id,
      fechaMovimiento: new Date()
    };

    const result = await KardexService.create(kardexData);

    if (!result.success) {
      console.log('❌ Error creating kardex movement:', result.error);
      return;
    }

    console.log('✅ Kardex movement created successfully!');
    console.log(`   Movement ID: ${result.data.id}`);
    console.log(`   Previous Balance (saldo_anterior): ${result.data.saldoAnterior}`);
    console.log(`   Current Balance (saldo_actual): ${result.data.saldoActual}`);
    console.log(`   Quantity: ${result.data.cantidad}`);

    // 4. Verify the calculation
    console.log('\n4️⃣ Verifying balance calculation...');
    
    const expectedSaldoAnterior = stockActualTotal; // Should be the total stock before this movement
    const expectedSaldoActual = stockActualTotal + nuevoCantidad; // Should be total + new quantity

    console.log(`   Expected saldo_anterior: ${expectedSaldoAnterior}`);
    console.log(`   Actual saldo_anterior: ${result.data.saldoAnterior}`);
    console.log(`   Expected saldo_actual: ${expectedSaldoActual}`);
    console.log(`   Actual saldo_actual: ${result.data.saldoActual}`);

    if (result.data.saldoAnterior === expectedSaldoAnterior && 
        result.data.saldoActual === expectedSaldoActual) {
      console.log('✅ BALANCE CALCULATION IS CORRECT!');
    } else {
      console.log('❌ BALANCE CALCULATION IS INCORRECT!');
    }

    // 5. Test with syringe
    console.log('\n5️⃣ Testing with syringe...');
    await testSyringeBalance();

    // 6. Clean up test data
    console.log('\n6️⃣ Cleaning up test data...');
    await prisma.kardex.delete({ where: { id: result.data.id } });
    await prisma.loteVacuna.delete({ where: { id: nuevoLote.id } });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testSyringeBalance() {
  try {
    // Find a syringe with existing stock
    const jeringaConStock = await prisma.jeringa.findFirst({
      where: {
        lotes: {
          some: {
            cantidadActual: { gt: 0 },
            estado: 'disponible'
          }
        }
      },
      include: {
        lotes: {
          where: {
            cantidadActual: { gt: 0 },
            estado: 'disponible'
          }
        }
      }
    });

    if (!jeringaConStock) {
      console.log('   ⚠️ No syringe with stock found, skipping syringe test');
      return;
    }

    console.log(`   Found syringe: ${jeringaConStock.tipo} ${jeringaConStock.capacidad}`);
    
    const stockActualTotal = jeringaConStock.lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
    console.log(`   Current total stock: ${stockActualTotal} units`);

    // Get system user and establishment
    const usuarioSistema = await prisma.usuario.findFirst({ where: { rol: 'administrador' } });
    const establecimiento = await prisma.establecimiento.findFirst();

    if (!usuarioSistema || !establecimiento) {
      console.log('   ⚠️ Missing system user or establishment, skipping syringe test');
      return;
    }

    // Create new syringe batch
    const nuevoCantidad = 50;
    const nuevoLote = await prisma.loteJeringa.create({
      data: {
        jeringaId: jeringaConStock.id,
        numero: `TEST-SYR-${Date.now()}`,
        fechaIngreso: new Date(),
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        formaIngreso: 'PRIMER_TRIMESTRE',
        comprobanteClase: 'PECOSA',
        numeroComprobante: `TEST-SYR-${Date.now()}`,
        cantidadInicial: nuevoCantidad,
        cantidadActual: nuevoCantidad,
        estado: 'disponible'
      }
    });

    // Test KardexService with syringe
    const { KardexService } = require('./dist/services/KardexService');
    
    const result = await KardexService.create({
      tipo: 'jeringa',
      itemId: jeringaConStock.id,
      loteId: nuevoLote.id,
      tipoMovimiento: 'ingreso',
      cantidad: nuevoCantidad,
      establecimientoDestinoId: establecimiento.id,
      documento: 'PECOSA',
      numeroDocumento: `TEST-SYR-${Date.now()}`,
      observaciones: `Test syringe ingreso for balance fix`,
      usuarioId: usuarioSistema.id
    });

    if (result.success) {
      console.log('   ✅ Syringe kardex movement created successfully!');
      console.log(`   Previous Balance: ${result.data.saldoAnterior} (expected: ${stockActualTotal})`);
      console.log(`   Current Balance: ${result.data.saldoActual} (expected: ${stockActualTotal + nuevoCantidad})`);
      
      if (result.data.saldoAnterior === stockActualTotal) {
        console.log('   ✅ SYRINGE BALANCE CALCULATION IS CORRECT!');
      } else {
        console.log('   ❌ SYRINGE BALANCE CALCULATION IS INCORRECT!');
      }

      // Clean up
      await prisma.kardex.delete({ where: { id: result.data.id } });
    }
    
    await prisma.loteJeringa.delete({ where: { id: nuevoLote.id } });

  } catch (error) {
    console.error('   ❌ Error testing syringe balance:', error);
  }
}

async function createTestData() {
  console.log('Creating minimal test data...');
  // This would create test data if needed
  console.log('Please run the seed script first to have test data available');
}

// Run the test
if (require.main === module) {
  testBalanceFix().catch(console.error);
}

module.exports = { testBalanceFix };
