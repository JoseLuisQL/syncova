const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function checkAvailableCenters() {
  try {
    console.log('🔍 VERIFICANDO CENTROS DE ACOPIO DISPONIBLES\n');

    // 1. Verificar centros de acopio
    console.log('🏢 PASO 1: Listando centros de acopio...');
    const centros = await prisma.centroAcopio.findMany({
      where: { estado: 'activo' },
      select: { id: true, nombre: true, codigo: true }
    });

    console.log(`   Centros encontrados: ${centros.length}`);
    centros.forEach(centro => {
      console.log(`      • ${centro.nombre} (${centro.codigo}) - ID: ${centro.id}`);
    });

    if (centros.length === 0) {
      console.log('   ❌ No hay centros de acopio activos');
      return;
    }

    // 2. Para cada centro, verificar si tiene movimientos
    console.log('\n📋 PASO 2: Verificando movimientos por centro...');
    
    for (const centro of centros) {
      console.log(`\n🏢 Centro: ${centro.nombre}`);
      
      // Verificar movimientos recientes
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: {
          entrega: { gt: 0 },
          establecimiento: {
            centroAcopioId: centro.id
          }
        },
        include: {
          establecimiento: {
            select: { nombre: true }
          },
          vacuna: {
            select: { nombre: true }
          }
        },
        orderBy: [
          { anio: 'desc' },
          { mes: 'desc' }
        ],
        take: 3
      });

      if (movimientos.length > 0) {
        console.log(`   ✅ ${movimientos.length} movimientos encontrados:`);
        movimientos.forEach(mov => {
          console.log(`      • ${mov.establecimiento.nombre} - ${mov.vacuna.nombre}: ${mov.entrega} unidades (${mov.mes}/${mov.anio})`);
        });

        // Verificar el período más reciente con movimientos
        const ultimoMovimiento = movimientos[0];
        console.log(`   💡 Último período con movimientos: ${ultimoMovimiento.mes}/${ultimoMovimiento.anio}`);
      } else {
        console.log(`   ❌ No hay movimientos con entregas`);
      }
    }

    // 3. Recomendar el mejor centro para pruebas
    console.log('\n💡 RECOMENDACIÓN PARA PRUEBAS:');
    
    for (const centro of centros) {
      const movimientosCount = await prisma.movimientoVacuna.count({
        where: {
          entrega: { gt: 0 },
          establecimiento: {
            centroAcopioId: centro.id
          }
        }
      });

      if (movimientosCount > 0) {
        const ultimoMovimiento = await prisma.movimientoVacuna.findFirst({
          where: {
            entrega: { gt: 0 },
            establecimiento: {
              centroAcopioId: centro.id
            }
          },
          orderBy: [
            { anio: 'desc' },
            { mes: 'desc' }
          ]
        });

        console.log(`   🎯 Usar centro: ${centro.nombre}`);
        console.log(`      ID: ${centro.id}`);
        console.log(`      Período recomendado: ${ultimoMovimiento.mes}/${ultimoMovimiento.anio}`);
        console.log(`      Total movimientos: ${movimientosCount}`);
        break;
      }
    }

  } catch (error) {
    console.error('❌ Error verificando centros:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAvailableCenters().catch(console.error);
