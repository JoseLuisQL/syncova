import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para migrar datos de entrega_base
 * Copia el valor de 'entrega' a 'entrega_base' solo para movimientos que tienen entregas adicionales
 */
async function migrateEntregaBase() {
  console.log('🔄 Iniciando migración de entrega_base...');

  try {
    // Ejecutar la migración SQL
    const result = await prisma.$executeRaw`
      UPDATE "movimientos_vacunas"
      SET "entrega_base" = "entrega"
      WHERE id IN (
          SELECT DISTINCT mv.id
          FROM "movimientos_vacunas" mv
          INNER JOIN "entregas_adicionales" ea ON mv.id = ea.movimiento_vacuna_id
      )
    `;

    console.log(`✅ Migración de entrega_base completada. ${result} registros actualizados.`);

    // Verificar los resultados
    const movimientosConEntregaBase = await prisma.movimientoVacuna.count({
      where: {
        entregaBase: {
          not: null
        }
      }
    });

    const movimientosConEntregasAdicionales = await prisma.movimientoVacuna.count({
      where: {
        entregasAdicionales: {
          some: {}
        }
      }
    });

    console.log(`📊 Resumen de migración:`);
    console.log(`   - Movimientos con entrega_base: ${movimientosConEntregaBase}`);
    console.log(`   - Movimientos con entregas adicionales: ${movimientosConEntregasAdicionales}`);

    if (movimientosConEntregaBase === movimientosConEntregasAdicionales) {
      console.log('✅ La migración se completó correctamente. Todos los movimientos con entregas adicionales tienen entrega_base.');
    } else {
      console.log('⚠️  Advertencia: El número de registros no coincide. Revisar la migración.');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración si el script se ejecuta directamente
if (require.main === module) {
  migrateEntregaBase()
    .then(() => {
      console.log('🎉 Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la migración:', error);
      process.exit(1);
    });
}

export { migrateEntregaBase };
