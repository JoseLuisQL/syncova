const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function checkMovementsAbancay() {
  try {
    console.log('🔍 VERIFICANDO MOVIMIENTOS PARA CENTRO ABANCAY\n');

    const centroId = '5e63c00a-2289-4d56-afa5-0f50e56fb959'; // Centro de Acopio Abancay

    // 1. Verificar que el centro existe
    console.log('🏢 PASO 1: Verificando centro de acopio...');
    const centro = await prisma.centroAcopio.findUnique({
      where: { id: centroId },
      select: { nombre: true, codigo: true, estado: true }
    });

    if (centro) {
      console.log(`   ✅ Centro encontrado: ${centro.nombre} (${centro.codigo}) - Estado: ${centro.estado}`);
    } else {
      console.log('   ❌ Centro no encontrado');
      return;
    }

    // 2. Verificar movimientos para diciembre 2025
    console.log('\n📋 PASO 2: Verificando movimientos para diciembre 2025...');
    const movimientos = await prisma.movimientoVacuna.findMany({
      where: {
        mes: 12,
        anio: 2025,
        entrega: { gt: 0 },
        establecimiento: {
          centroAcopioId: centroId
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
      take: 10
    });

    console.log(`   Movimientos encontrados: ${movimientos.length}`);

    if (movimientos.length === 0) {
      console.log('   ❌ No hay movimientos con entregas para diciembre 2025');
      
      // Verificar si hay movimientos para otros meses
      console.log('\n📋 Verificando movimientos para otros períodos...');
      const otrosMovimientos = await prisma.movimientoVacuna.findMany({
        where: {
          entrega: { gt: 0 },
          establecimiento: {
            centroAcopioId: centroId
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
        take: 5
      });

      console.log(`   Movimientos en otros períodos: ${otrosMovimientos.length}`);
      
      if (otrosMovimientos.length > 0) {
        console.log('   📊 Últimos movimientos encontrados:');
        otrosMovimientos.forEach(mov => {
          console.log(`      • ${mov.establecimiento.nombre} - ${mov.vacuna.nombre}: ${mov.entrega} unidades (${mov.mes}/${mov.anio})`);
        });

        // Sugerir usar un período que tenga movimientos
        const ultimoMovimiento = otrosMovimientos[0];
        console.log(`\n💡 Sugerencia: Usar mes ${ultimoMovimiento.mes}, año ${ultimoMovimiento.anio} para las pruebas`);
      }

    } else {
      console.log('   ✅ Movimientos encontrados para diciembre 2025:');
      let totalVacunas = 0;
      movimientos.forEach(mov => {
        console.log(`      • ${mov.establecimiento.nombre} - ${mov.vacuna.nombre}: ${mov.entrega} unidades`);
        totalVacunas += mov.entrega;
      });
      console.log(`   📊 Total vacunas requeridas: ${totalVacunas}`);
    }

    // 3. Verificar establecimientos bajo este centro
    console.log('\n🏥 PASO 3: Verificando establecimientos bajo este centro...');
    const establecimientos = await prisma.establecimiento.findMany({
      where: {
        centroAcopioId: centroId
      },
      select: {
        id: true,
        nombre: true,
        tipo: true
      },
      take: 10
    });

    console.log(`   Establecimientos encontrados: ${establecimientos.length}`);
    establecimientos.forEach(est => {
      console.log(`      • ${est.nombre} (${est.tipo})`);
    });

  } catch (error) {
    console.error('❌ Error verificando movimientos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMovementsAbancay().catch(console.error);
