const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function checkExistingVouchers() {
  try {
    console.log('🔍 VERIFICANDO VALES EXISTENTES Y STOCK UPDATES\n');

    // 1. Verificar vales existentes para Centro de Salud Andahuaylas
    console.log('📄 PASO 1: Verificando vales existentes...');
    const centroId = 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c'; // Centro de Salud Andahuaylas
    
    const vales = await prisma.vale.findMany({
      where: {
        centroAcopioId: centroId,
        mes: 11,
        anio: 2025
      },
      include: {
        centroAcopio: {
          select: { nombre: true }
        },
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
      },
      orderBy: { fechaGeneracion: 'desc' }
    });

    console.log(`   Vales encontrados: ${vales.length}`);
    
    if (vales.length === 0) {
      console.log('   ❌ No hay vales para este centro y período');
      return;
    }

    // 2. Analizar cada vale
    for (const vale of vales) {
      console.log(`\n📋 VALE: ${vale.numero}`);
      console.log(`   Centro: ${vale.centroAcopio.nombre}`);
      console.log(`   Fecha: ${vale.fechaGeneracion.toISOString().split('T')[0]}`);
      console.log(`   Estado: ${vale.estado}`);
      console.log(`   Detalles vacunas: ${vale.detalles.length}`);
      console.log(`   Detalles jeringas: ${vale.detallesJeringas.length}`);

      // Mostrar detalles de vacunas
      if (vale.detalles.length > 0) {
        console.log('   📦 Vacunas en el vale:');
        vale.detalles.forEach(detalle => {
          console.log(`      • Lote ${detalle.loteVacuna.numero}: ${detalle.cantidad} unidades de ${detalle.loteVacuna.vacuna.nombre}`);
        });
      }

      // Mostrar detalles de jeringas
      if (vale.detallesJeringas.length > 0) {
        console.log('   💉 Jeringas en el vale:');
        vale.detallesJeringas.forEach(detalle => {
          console.log(`      • Lote ${detalle.loteJeringa.numero}: ${detalle.cantidad} unidades de ${detalle.loteJeringa.jeringa.tipo}`);
        });
      }

      // 3. Verificar movimientos de kardex para este vale
      console.log(`\n📊 KARDEX para vale ${vale.numero}:`);
      
      const kardexVacunas = await prisma.kardexVacuna.findMany({
        where: {
          numeroDocumento: vale.numero
        },
        include: {
          loteVacuna: {
            include: { vacuna: true }
          }
        }
      });

      const kardexJeringas = await prisma.kardexJeringa.findMany({
        where: {
          numeroDocumento: vale.numero
        },
        include: {
          loteJeringa: {
            include: { jeringa: true }
          }
        }
      });

      console.log(`   📦 Movimientos kardex vacunas: ${kardexVacunas.length}`);
      if (kardexVacunas.length > 0) {
        kardexVacunas.forEach(kardex => {
          console.log(`      • ${kardex.loteVacuna.vacuna.nombre} - Lote ${kardex.loteVacuna.numero}:`);
          console.log(`        ${kardex.tipoMovimiento} ${kardex.cantidad} unidades (${kardex.saldoAnterior} → ${kardex.saldoActual})`);
        });
      } else {
        console.log('      ❌ NO HAY MOVIMIENTOS DE KARDEX PARA VACUNAS - PROBLEMA CRÍTICO');
      }

      console.log(`   💉 Movimientos kardex jeringas: ${kardexJeringas.length}`);
      if (kardexJeringas.length > 0) {
        kardexJeringas.forEach(kardex => {
          console.log(`      • ${kardex.loteJeringa.jeringa.tipo} - Lote ${kardex.loteJeringa.numero}:`);
          console.log(`        ${kardex.tipoMovimiento} ${kardex.cantidad} unidades (${kardex.saldoAnterior} → ${kardex.saldoActual})`);
        });
      } else {
        console.log('      ❌ NO HAY MOVIMIENTOS DE KARDEX PARA JERINGAS - PROBLEMA CRÍTICO');
      }

      // 4. Verificar estado actual de los lotes mencionados en el vale
      console.log(`\n🔍 ESTADO ACTUAL DE LOTES para vale ${vale.numero}:`);
      
      for (const detalle of vale.detalles) {
        const loteActual = await prisma.loteVacuna.findUnique({
          where: { id: detalle.loteVacunaId },
          include: { vacuna: true }
        });

        if (loteActual) {
          console.log(`   📦 Lote ${loteActual.numero} (${loteActual.vacuna.nombre}):`);
          console.log(`      Stock actual: ${loteActual.cantidadActual} unidades`);
          console.log(`      Estado: ${loteActual.estado}`);
          console.log(`      Cantidad en vale: ${detalle.cantidad} unidades`);
        }
      }

      for (const detalle of vale.detallesJeringas) {
        const loteActual = await prisma.loteJeringa.findUnique({
          where: { id: detalle.loteJeringaId },
          include: { jeringa: true }
        });

        if (loteActual) {
          console.log(`   💉 Lote ${loteActual.numero} (${loteActual.jeringa.tipo}):`);
          console.log(`      Stock actual: ${loteActual.cantidadActual} unidades`);
          console.log(`      Estado: ${loteActual.estado}`);
          console.log(`      Cantidad en vale: ${detalle.cantidad} unidades`);
        }
      }
    }

    // 5. Resumen del análisis
    console.log('\n📊 RESUMEN DEL ANÁLISIS:');
    
    let totalValesConKardexVacunas = 0;
    let totalValesConKardexJeringas = 0;
    let totalValesSinKardexVacunas = 0;
    let totalValesSinKardexJeringas = 0;

    for (const vale of vales) {
      const kardexVacunas = await prisma.kardexVacuna.count({
        where: { numeroDocumento: vale.numero }
      });
      
      const kardexJeringas = await prisma.kardexJeringa.count({
        where: { numeroDocumento: vale.numero }
      });

      if (kardexVacunas > 0) {
        totalValesConKardexVacunas++;
      } else {
        totalValesSinKardexVacunas++;
      }

      if (kardexJeringas > 0) {
        totalValesConKardexJeringas++;
      } else {
        totalValesSinKardexJeringas++;
      }
    }

    console.log(`   📄 Total vales analizados: ${vales.length}`);
    console.log(`   ✅ Vales con kardex de vacunas: ${totalValesConKardexVacunas}`);
    console.log(`   ❌ Vales SIN kardex de vacunas: ${totalValesSinKardexVacunas}`);
    console.log(`   ✅ Vales con kardex de jeringas: ${totalValesConKardexJeringas}`);
    console.log(`   ❌ Vales SIN kardex de jeringas: ${totalValesSinKardexJeringas}`);

    if (totalValesSinKardexVacunas > 0 || totalValesSinKardexJeringas > 0) {
      console.log('\n🚨 PROBLEMA CRÍTICO IDENTIFICADO:');
      console.log('   Los vales se están generando pero NO se están actualizando los stocks');
      console.log('   Esto confirma el problema reportado por el usuario');
    } else {
      console.log('\n✅ Los stocks se están actualizando correctamente');
    }

  } catch (error) {
    console.error('❌ Error verificando vales:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
checkExistingVouchers()
  .then(() => {
    console.log('\n✅ Verificación de vales existentes completada');
  })
  .catch(error => {
    console.error('\n❌ Error en verificación:', error);
    process.exit(1);
  });
