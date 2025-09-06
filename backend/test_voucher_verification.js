const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function testVoucherVerification() {
  try {
    console.log('🔍 TESTING VOUCHER VERIFICATION FUNCTIONALITY\n');

    // 1. Find an establishment with existing vouchers
    console.log('📄 PASO 1: Buscando establecimientos con vales existentes...');
    
    const valesExistentes = await prisma.valeEntrega.findMany({
      where: {
        estado: 'generado',
        mes: 11,
        anio: 2025
      },
      include: {
        detalles: {
          include: {
            establecimiento: {
              select: { id: true, nombre: true }
            },
            vacuna: {
              select: { id: true, nombre: true }
            }
          }
        }
      },
      take: 3
    });

    if (valesExistentes.length === 0) {
      console.log('❌ No se encontraron vales existentes para probar');
      return;
    }

    console.log(`✅ Encontrados ${valesExistentes.length} vales para probar:`);
    valesExistentes.forEach(vale => {
      console.log(`   - Vale ${vale.numero}: ${vale.detalles.length} detalles`);
    });

    // 2. Test the verification function with an establishment that has vouchers
    const primeraVale = valesExistentes[0];
    const primerDetalle = primeraVale.detalles[0];
    
    if (!primerDetalle) {
      console.log('❌ No se encontraron detalles en el primer vale');
      return;
    }

    console.log('\n📋 PASO 2: Probando verificación de vales existentes...');
    console.log(`   Establecimiento: ${primerDetalle.establecimiento.nombre}`);
    console.log(`   Vacuna: ${primerDetalle.vacuna.nombre}`);
    console.log(`   Período: ${primeraVale.mes}/${primeraVale.anio}`);

    // Import the ValeService to test the function
    const { ValeService } = require('./src/services/ValeService');

    const resultado = await ValeService.verificarValesExistentesParaEstablecimiento(
      primerDetalle.establecimientoId,
      primerDetalle.vacunaId,
      primeraVale.mes,
      primeraVale.anio
    );

    console.log('\n🔍 RESULTADO DE VERIFICACIÓN:');
    console.log(`   Success: ${resultado.success}`);
    if (resultado.success) {
      console.log(`   Existen vales: ${resultado.data.existenVales}`);
      console.log(`   Vales encontrados: ${resultado.data.valesEncontrados.length}`);
      
      if (resultado.data.valesEncontrados.length > 0) {
        console.log('\n📄 VALES ENCONTRADOS:');
        resultado.data.valesEncontrados.forEach(vale => {
          console.log(`   - ${vale.numero} (${vale.fechaGeneracion.toISOString().split('T')[0]})`);
          console.log(`     Detalles: ${vale.detalles.length}`);
        });
      }
    } else {
      console.log(`   Error: ${resultado.error}`);
    }

    // 3. Test with an establishment that should NOT have vouchers
    console.log('\n📋 PASO 3: Probando con establecimiento sin vales...');
    
    // Find an establishment that doesn't have vouchers for this period
    const establecimientoSinVales = await prisma.establecimiento.findFirst({
      where: {
        estado: 'activo',
        NOT: {
          id: {
            in: valesExistentes.flatMap(v => v.detalles.map(d => d.establecimientoId))
          }
        }
      },
      select: { id: true, nombre: true }
    });

    if (establecimientoSinVales) {
      console.log(`   Establecimiento: ${establecimientoSinVales.nombre}`);
      
      const resultadoSinVales = await ValeService.verificarValesExistentesParaEstablecimiento(
        establecimientoSinVales.id,
        primerDetalle.vacunaId,
        primeraVale.mes,
        primeraVale.anio
      );

      console.log('\n🔍 RESULTADO (Sin vales):');
      console.log(`   Success: ${resultadoSinVales.success}`);
      if (resultadoSinVales.success) {
        console.log(`   Existen vales: ${resultadoSinVales.data.existenVales}`);
        console.log(`   Vales encontrados: ${resultadoSinVales.data.valesEncontrados.length}`);
      }
    } else {
      console.log('   No se encontró establecimiento sin vales para probar');
    }

    console.log('\n✅ PRUEBA DE VERIFICACIÓN DE VALES COMPLETADA');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testVoucherVerification();
