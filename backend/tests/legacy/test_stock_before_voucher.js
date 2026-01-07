const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStockLevels() {
  try {
    console.log('🔍 Verificando niveles de stock antes de generar vale...\n');

    // Verificar lotes de vacunas disponibles
    console.log('📊 LOTES DE VACUNAS:');
    const lotesVacunas = await prisma.loteVacuna.findMany({
      where: {
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      include: {
        vacuna: {
          select: { nombre: true, presentacion: true }
        }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ],
      take: 10
    });

    if (lotesVacunas.length === 0) {
      console.log('❌ No hay lotes de vacunas disponibles');
    } else {
      lotesVacunas.forEach(lote => {
        console.log(`   • ${lote.numero} - ${lote.vacuna.nombre} (${lote.vacuna.presentacion})`);
        console.log(`     Stock: ${lote.cantidadActual} unidades`);
        console.log(`     Vencimiento: ${lote.fechaVencimiento.toISOString().split('T')[0]}`);
        console.log('');
      });
    }

    // Verificar lotes de jeringas disponibles
    console.log('💉 LOTES DE JERINGAS:');
    const lotesJeringas = await prisma.loteJeringa.findMany({
      where: {
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      include: {
        jeringa: {
          select: { tipo: true, capacidad: true, color: true }
        }
      },
      orderBy: [
        { fechaIngreso: 'asc' }
      ],
      take: 10
    });

    if (lotesJeringas.length === 0) {
      console.log('❌ No hay lotes de jeringas disponibles');
    } else {
      lotesJeringas.forEach(lote => {
        console.log(`   • ${lote.numero} - ${lote.jeringa.tipo} ${lote.jeringa.capacidad} (${lote.jeringa.color})`);
        console.log(`     Stock: ${lote.cantidadActual} unidades`);
        if (lote.fechaVencimiento) {
          console.log(`     Vencimiento: ${lote.fechaVencimiento.toISOString().split('T')[0]}`);
        }
        console.log('');
      });
    }

    // Verificar movimientos disponibles para generar vale
    console.log('📋 MOVIMIENTOS DISPONIBLES PARA VALE:');
    const movimientos = await prisma.movimientoVacuna.findMany({
      where: {
        mes: 11,
        anio: 2025,
        entrega: { gt: 0 },
        establecimiento: {
          centroAcopioId: '5e63c00a-2289-4d56-afa5-0f50e56fb959' // Centro de Acopio Abancay
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

    if (movimientos.length === 0) {
      console.log('❌ No hay movimientos con entregas para generar vale');
    } else {
      let totalVacunasParaVale = 0;
      movimientos.forEach(mov => {
        console.log(`   • ${mov.establecimiento.nombre} - ${mov.vacuna.nombre}`);
        console.log(`     Entrega: ${mov.entrega} unidades`);
        totalVacunasParaVale += mov.entrega;
        console.log('');
      });
      console.log(`📊 Total vacunas que se afectarían: ${totalVacunasParaVale} unidades\n`);
    }

    // Verificar configuración de jeringas
    console.log('⚙️ CONFIGURACIÓN DE JERINGAS:');
    const configuraciones = await prisma.configuracionJeringaVacunaDefecto.findMany({
      include: {
        vacuna: { select: { nombre: true } },
        jeringa: { select: { tipo: true, capacidad: true } }
      },
      take: 5
    });

    if (configuraciones.length === 0) {
      console.log('❌ No hay configuraciones de jeringas por defecto');
    } else {
      configuraciones.forEach(config => {
        console.log(`   • ${config.vacuna.nombre} → ${config.jeringa.tipo} ${config.jeringa.capacidad}`);
        console.log(`     Multiplicador: ${config.multiplicador}`);
        console.log('');
      });
    }

    return {
      lotesVacunas: lotesVacunas.length,
      lotesJeringas: lotesJeringas.length,
      movimientos: movimientos.length,
      configuraciones: configuraciones.length
    };

  } catch (error) {
    console.error('❌ Error verificando stock:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
checkStockLevels()
  .then(result => {
    console.log('✅ Verificación completada:', result);
  })
  .catch(error => {
    console.error('❌ Error en verificación:', error);
    process.exit(1);
  });
