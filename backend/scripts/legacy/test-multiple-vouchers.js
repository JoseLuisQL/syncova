const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMultipleVouchers() {
  try {
    console.log('🧪 Iniciando prueba de múltiples vales de entregas adicionales...');

    // Buscar cualquier establecimiento para usar como centro de acopio de prueba
    const establecimiento = await prisma.establecimiento.findFirst();

    if (!establecimiento) {
      console.error('❌ No se encontró ningún establecimiento para la prueba');
      return;
    }

    console.log(`📍 Usando establecimiento como centro de acopio de prueba: ${establecimiento.nombre} (${establecimiento.id})`);

    // Buscar un usuario existente
    const usuario = await prisma.usuario.findFirst();
    if (!usuario) {
      console.error('❌ No se encontró ningún usuario para la prueba');
      return;
    }

    const testData = {
      centroAcopioId: establecimiento.id,
      mes: 12,
      anio: 2024,
      usuarioId: usuario.id
    };

    console.log(`📅 Período de prueba: ${testData.mes}/${testData.anio}`);

    // Limpiar vales existentes para este período (solo para prueba)
    console.log('🧹 Limpiando vales existentes para este período...');
    await prisma.valeEntrega.deleteMany({
      where: {
        centroAcopioId: testData.centroAcopioId,
        mes: testData.mes,
        anio: testData.anio
      }
    });

    // Prueba 1: Crear vale completo
    console.log('\n📝 Prueba 1: Creando vale completo...');
    try {
      const valeCompleto = await prisma.valeEntrega.create({
        data: {
          numero: 'TEST-COMPLETO-001',
          centroAcopioId: testData.centroAcopioId,
          mes: testData.mes,
          anio: testData.anio,
          estado: 'generado',
          tipoVale: 'completo',
          gruposEntregasAdicionales: null,
          usuarioId: testData.usuarioId,
          observaciones: 'Vale de prueba - completo'
        }
      });
      console.log(`✅ Vale completo creado: ${valeCompleto.numero}`);
    } catch (error) {
      console.error(`❌ Error creando vale completo: ${error.message}`);
    }

    // Limpiar para siguiente prueba
    await prisma.valeEntrega.deleteMany({
      where: {
        centroAcopioId: testData.centroAcopioId,
        mes: testData.mes,
        anio: testData.anio
      }
    });

    // Prueba 2: Crear múltiples vales de entregas adicionales
    console.log('\n📝 Prueba 2: Creando múltiples vales de entregas adicionales...');

    // Vale de entregas adicionales #1 (grupo 1)
    try {
      const vale1 = await prisma.valeEntrega.create({
        data: {
          numero: 'TEST-ADIC-001',
          centroAcopioId: testData.centroAcopioId,
          mes: testData.mes,
          anio: testData.anio,
          estado: 'generado',
          tipoVale: 'solo_adicionales',
          gruposEntregasAdicionales: '1',
          usuarioId: testData.usuarioId,
          observaciones: 'Vale de prueba - entregas adicionales grupo 1'
        }
      });
      console.log(`✅ Vale entregas adicionales #1 creado: ${vale1.numero}`);
    } catch (error) {
      console.error(`❌ Error creando vale entregas adicionales #1: ${error.message}`);
    }

    // Vale de entregas adicionales #2 (grupo 2)
    try {
      const vale2 = await prisma.valeEntrega.create({
        data: {
          numero: 'TEST-ADIC-002',
          centroAcopioId: testData.centroAcopioId,
          mes: testData.mes,
          anio: testData.anio,
          estado: 'generado',
          tipoVale: 'solo_adicionales',
          gruposEntregasAdicionales: '2',
          usuarioId: testData.usuarioId,
          observaciones: 'Vale de prueba - entregas adicionales grupo 2'
        }
      });
      console.log(`✅ Vale entregas adicionales #2 creado: ${vale2.numero}`);
    } catch (error) {
      console.error(`❌ Error creando vale entregas adicionales #2: ${error.message}`);
    }

    // Vale de entregas adicionales #3 (grupos 1,3)
    try {
      const vale3 = await prisma.valeEntrega.create({
        data: {
          numero: 'TEST-ADIC-003',
          centroAcopioId: testData.centroAcopioId,
          mes: testData.mes,
          anio: testData.anio,
          estado: 'generado',
          tipoVale: 'solo_adicionales',
          gruposEntregasAdicionales: '1,3',
          usuarioId: testData.usuarioId,
          observaciones: 'Vale de prueba - entregas adicionales grupos 1,3'
        }
      });
      console.log(`✅ Vale entregas adicionales #3 creado: ${vale3.numero}`);
    } catch (error) {
      console.error(`❌ Error creando vale entregas adicionales #3: ${error.message}`);
    }

    // Prueba 3: Intentar crear vale duplicado (debe fallar)
    console.log('\n📝 Prueba 3: Intentando crear vale duplicado (debe fallar)...');
    try {
      await prisma.valeEntrega.create({
        data: {
          numero: 'TEST-ADIC-004',
          centroAcopioId: testData.centroAcopioId,
          mes: testData.mes,
          anio: testData.anio,
          estado: 'generado',
          tipoVale: 'solo_adicionales',
          gruposEntregasAdicionales: '1', // Mismo grupo que el primer vale
          usuarioId: testData.usuarioId,
          observaciones: 'Vale de prueba - duplicado (debe fallar)'
        }
      });
      console.log(`❌ ERROR: Vale duplicado se creó cuando no debería`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`✅ Constraint único funcionando correctamente: ${error.message}`);
      } else {
        console.error(`❌ Error inesperado: ${error.message}`);
      }
    }

    // Mostrar resumen
    console.log('\n📊 Resumen de vales creados:');
    const valesCreados = await prisma.valeEntrega.findMany({
      where: {
        centroAcopioId: testData.centroAcopioId,
        mes: testData.mes,
        anio: testData.anio
      },
      select: {
        numero: true,
        tipoVale: true,
        gruposEntregasAdicionales: true,
        observaciones: true
      }
    });

    valesCreados.forEach((vale, index) => {
      console.log(`  ${index + 1}. ${vale.numero} - Tipo: ${vale.tipoVale} - Grupos: ${vale.gruposEntregasAdicionales || 'N/A'}`);
    });

    console.log(`\n🎉 Prueba completada. Se crearon ${valesCreados.length} vales exitosamente.`);

    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await prisma.valeEntrega.deleteMany({
      where: {
        centroAcopioId: testData.centroAcopioId,
        mes: testData.mes,
        anio: testData.anio
      }
    });
    console.log('✅ Datos de prueba limpiados');

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testMultipleVouchers()
    .then(() => {
      console.log('🏁 Prueba finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en la prueba:', error);
      process.exit(1);
    });
}

module.exports = { testMultipleVouchers };
