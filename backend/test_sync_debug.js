const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSyncIssue() {
  console.log('🔍 DEBUG: Investigando problema de sincronización entre Movimientos y Planificación\n');

  try {
    // 1. Buscar movimientos recientes con entregas > 0
    console.log('1. Buscando movimientos recientes con entregas...');
    const movimientosConEntrega = await prisma.movimientoVacuna.findMany({
      where: {
        entrega: {
          gt: 0
        }
      },
      include: {
        establecimiento: true,
        vacuna: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });

    if (movimientosConEntrega.length === 0) {
      console.log('❌ No se encontraron movimientos con entregas > 0');
      return;
    }

    console.log(`✅ Encontrados ${movimientosConEntrega.length} movimientos con entregas\n`);

    // 2. Para cada movimiento, verificar si existe planificación correspondiente
    for (const movimiento of movimientosConEntrega) {
      console.log(`📋 Analizando movimiento ID: ${movimiento.id}`);
      console.log(`   Establecimiento: ${movimiento.establecimiento.nombre}`);
      console.log(`   Vacuna: ${movimiento.vacuna.nombre}`);
      console.log(`   Mes/Año: ${movimiento.mes}/${movimiento.anio}`);
      console.log(`   Entrega: ${movimiento.entrega}`);

      // Buscar planificación correspondiente
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: {
          uk_planificacion_establecimiento_vacuna_anio: {
            establecimientoId: movimiento.establecimientoId,
            vacunaId: movimiento.vacunaId,
            anio: movimiento.anio
          }
        }
      });

      if (planificacion) {
        console.log(`   ✅ Planificación encontrada ID: ${planificacion.id}`);
        console.log(`   📊 Distribución mensual: [${planificacion.distribucionMensual.join(', ')}]`);
        console.log(`   🎯 Meta anual: ${planificacion.metaAnual}`);

        const mesIndex = movimiento.mes - 1;
        const entregaEnPlanificacion = planificacion.distribucionMensual[mesIndex] || 0;
        console.log(`   🔄 Entrega en planificación para mes ${movimiento.mes}: ${entregaEnPlanificacion}`);

        if (entregaEnPlanificacion !== movimiento.entrega) {
          console.log(`   ⚠️  DIFERENCIA DETECTADA: Movimiento=${movimiento.entrega}, Planificación=${entregaEnPlanificacion}`);
        } else {
          console.log(`   ✅ Sincronización correcta`);
        }
      } else {
        console.log(`   ❌ NO se encontró planificación para este establecimiento/vacuna/año`);
      }

      console.log('');
    }

    // 3. Verificar logs de sincronización en los últimos movimientos
    console.log('3. Revisando logs de sincronización...');
    const movimientosRecientes = await prisma.movimientoVacuna.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        entrega: true,
        updatedAt: true,
        establecimiento: {
          select: { nombre: true }
        },
        vacuna: {
          select: { nombre: true }
        }
      }
    });

    console.log('Últimos 10 movimientos actualizados:');
    movimientosRecientes.forEach(mov => {
      console.log(`   ${mov.id}: ${mov.establecimiento.nombre} - ${mov.vacuna.nombre} - Entrega: ${mov.entrega} - ${mov.updatedAt}`);
    });

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar diagnóstico
debugSyncIssue().catch(console.error);
