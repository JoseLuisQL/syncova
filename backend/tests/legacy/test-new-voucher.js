const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

/**
 * Test script to generate a new delivery voucher and verify the sequential deduction logic
 */
async function testNewVoucher() {
  try {
    console.log('🧪 TESTING NEW VOUCHER WITH FIXED SEQUENTIAL LOGIC\n');

    // Find a collection center with establishments
    // Note: Using CentroAcopio model instead of Establecimiento with tipo 'centro_acopio'
    const centroAcopio = await prisma.centroAcopio.findFirst({
      where: {
        estado: 'activo'
      },
      include: {
        establecimientos: {
          where: {
            estado: 'activo'
          },
          take: 3 // Test with 3 establishments
        }
      }
    });

    if (!centroAcopio || centroAcopio.establecimientos.length === 0) {
      console.log('❌ No se encontró centro de acopio con establecimientos');
      return;
    }

    console.log(`📍 Centro de acopio: ${centroAcopio.nombre}`);
    console.log(`🏢 Establecimientos: ${centroAcopio.establecimientos.length}`);

    // Find a vaccine with stock
    const vacunaConStock = await prisma.vacuna.findFirst({
      where: {
        estado: 'activo',
        lotes: {
          some: {
            estado: 'disponible',
            cantidadActual: { gt: 50 }
          }
        }
      },
      include: {
        lotes: {
          where: {
            estado: 'disponible',
            cantidadActual: { gt: 0 }
          },
          select: {
            cantidadActual: true
          }
        }
      }
    });

    if (!vacunaConStock) {
      console.log('❌ No se encontró vacuna con stock suficiente');
      return;
    }

    const stockTotal = vacunaConStock.lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
    console.log(`💉 Vacuna seleccionada: ${vacunaConStock.nombre} (Stock: ${stockTotal})`);

    // Find a user
    const usuario = await prisma.usuario.findFirst({
      where: { estado: 'activo' }
    });

    if (!usuario) {
      console.log('❌ No se encontró usuario activo');
      return;
    }

    // Create movements for testing
    const movimientos = [];
    const cantidadPorEstablecimiento = 5; // Small amount for testing

    for (const establecimiento of centroAcopio.establecimientos) {
      movimientos.push({
        establecimientoId: establecimiento.id,
        vacunaId: vacunaConStock.id,
        cantidadProgramada: cantidadPorEstablecimiento,
        cantidadAdicional: 0
      });
    }

    console.log(`\n📋 Generando vale con ${movimientos.length} movimientos...`);

    // Generate the voucher using the ValeService
    const axios = require('axios');
    
    try {
      const response = await axios.post('http://localhost:3001/api/vales', {
        centroAcopioId: centroAcopio.id,
        mes: 1,
        anio: 2025,
        movimientos: movimientos,
        usuarioId: usuario.id,
        observaciones: 'Vale de prueba para verificar lógica secuencial'
      });

      if (response.data.success) {
        const nuevoVale = response.data.data;
        console.log(`✅ Vale generado exitosamente: ${nuevoVale.numero}`);

        // Wait a moment for the database to be updated
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now test the sequential logic on this new voucher
        await testVoucherSequentialLogic(nuevoVale.numero);

      } else {
        console.log('❌ Error generando vale:', response.data.error);
      }

    } catch (apiError) {
      console.log('❌ Error llamando API:', apiError.message);
      console.log('   Intentando generar vale directamente...');
      
      // Fallback: generate voucher directly
      await generateVoucherDirectly(centroAcopio, movimientos, usuario);
    }

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate voucher directly using database
 */
async function generateVoucherDirectly(centroAcopio, movimientos, usuario) {
  console.log('📋 Generando vale directamente en base de datos...');
  
  // This is a simplified version - in production use ValeService
  const valeNumero = `TEST-${Date.now()}`;
  
  const vale = await prisma.valeEntrega.create({
    data: {
      numero: valeNumero,
      centroAcopioId: centroAcopio.id,
      mes: 1,
      anio: 2025,
      estado: 'generado',
      totalVacunas: movimientos.reduce((sum, mov) => sum + mov.cantidadProgramada, 0),
      totalEstablecimientos: movimientos.length,
      usuarioId: usuario.id,
      observaciones: 'Vale de prueba directo'
    }
  });

  console.log(`✅ Vale creado: ${vale.numero}`);
  
  // Create details
  for (const mov of movimientos) {
    await prisma.valeDetalle.create({
      data: {
        valeEntregaId: vale.id,
        establecimientoId: mov.establecimientoId,
        vacunaId: mov.vacunaId,
        cantidadProgramada: mov.cantidadProgramada,
        cantidadAdicional: mov.cantidadAdicional || 0
      }
    });
  }

  console.log('⚠️ Vale creado pero sin afectación de stock (requiere ValeService)');
}

/**
 * Test sequential logic on a specific voucher
 */
async function testVoucherSequentialLogic(valeNumero) {
  console.log(`\n🔍 ANALIZANDO LÓGICA SECUENCIAL DEL VALE: ${valeNumero}`);

  // Get all movements for this voucher
  const movimientos = await prisma.kardex.findMany({
    where: {
      numeroDocumento: valeNumero
    },
    orderBy: [
      { tipo: 'asc' },
      { itemId: 'asc' },
      { fechaMovimiento: 'asc' }
    ]
  });

  console.log(`📊 Total movimientos encontrados: ${movimientos.length}`);

  // Group by type and item
  const grupos = {};
  movimientos.forEach(mov => {
    const key = `${mov.tipo}-${mov.itemId}`;
    if (!grupos[key]) {
      grupos[key] = [];
    }
    grupos[key].push(mov);
  });

  // Analyze each group
  let allCorrect = true;
  
  for (const [key, movs] of Object.entries(grupos)) {
    const [tipo, itemId] = key.split('-');
    console.log(`\n   🔍 ${tipo.toUpperCase()} ${itemId.substring(0, 8)}... (${movs.length} movimientos):`);

    let expectedBalance = movs[0].saldoAnterior;
    let isSequential = true;

    movs.forEach((mov, index) => {
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

    const status = isSequential ? '✅ CORRECTO' : '❌ INCORRECTO';
    console.log(`      Balance secuencial: ${status}`);
    
    if (!isSequential) {
      allCorrect = false;
    }
  }

  console.log(`\n${allCorrect ? '✅' : '❌'} RESULTADO GENERAL: ${allCorrect ? 'TODOS LOS BALANCES CORRECTOS' : 'HAY ERRORES EN LOS BALANCES'}`);
}

// Run the test
testNewVoucher();
