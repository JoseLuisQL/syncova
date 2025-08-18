const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMovements() {
  try {
    console.log('🔍 Verificando movimientos existentes...\n');

    // Verificar centros de acopio disponibles
    console.log('🏢 CENTROS DE ACOPIO:');
    const centros = await prisma.centroAcopio.findMany({
      where: { estado: 'activo' },
      select: { id: true, nombre: true }
    });

    centros.forEach(centro => {
      console.log(`   • ${centro.nombre} (${centro.id})`);
    });
    console.log('');

    // Verificar movimientos existentes
    console.log('📋 MOVIMIENTOS EXISTENTES:');
    const movimientos = await prisma.movimientoVacuna.findMany({
      include: {
        establecimiento: {
          select: { nombre: true, centroAcopioId: true }
        },
        vacuna: {
          select: { nombre: true }
        }
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' }
      ],
      take: 10
    });

    if (movimientos.length === 0) {
      console.log('❌ No hay movimientos en el sistema');
    } else {
      movimientos.forEach(mov => {
        console.log(`   • ${mov.establecimiento.nombre} - ${mov.vacuna.nombre}`);
        console.log(`     Período: ${mov.mes}/${mov.anio}`);
        console.log(`     Programado: ${mov.programado}, Entrega: ${mov.entrega || 0}`);
        console.log(`     Centro: ${mov.establecimiento.centroAcopioId}`);
        console.log('');
      });
    }

    // Crear movimientos de prueba si no existen
    const centroAbancay = '5e63c00a-2289-4d56-afa5-0f50e56fb959';
    const movimientosAbancay = await prisma.movimientoVacuna.findMany({
      where: {
        mes: 11,
        anio: 2025,
        establecimiento: {
          centroAcopioId: centroAbancay
        }
      }
    });

    if (movimientosAbancay.length === 0) {
      console.log('🔧 Creando movimientos de prueba para Centro Abancay...');
      
      // Obtener establecimientos del centro Abancay
      const establecimientos = await prisma.establecimiento.findMany({
        where: {
          centroAcopioId: centroAbancay,
          estado: 'activo'
        },
        take: 3
      });

      // Obtener vacunas activas
      const vacunas = await prisma.vacuna.findMany({
        where: { estado: 'activo' },
        take: 2
      });

      if (establecimientos.length > 0 && vacunas.length > 0) {
        for (const establecimiento of establecimientos) {
          for (const vacuna of vacunas) {
            await prisma.movimientoVacuna.create({
              data: {
                establecimientoId: establecimiento.id,
                vacunaId: vacuna.id,
                mes: 11,
                anio: 2025,
                programado: 100,
                entrega: 80, // Cantidad que se incluirá en el vale
                usuarioId: 'temp-user-id'
              }
            });
            console.log(`   ✅ Creado: ${establecimiento.nombre} - ${vacuna.nombre} (80 unidades)`);
          }
        }
      }
    } else {
      console.log(`✅ Ya existen ${movimientosAbancay.length} movimientos para Abancay 11/2025`);
    }

  } catch (error) {
    console.error('❌ Error verificando movimientos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
checkMovements()
  .then(() => {
    console.log('✅ Verificación de movimientos completada');
  })
  .catch(error => {
    console.error('❌ Error en verificación:', error);
    process.exit(1);
  });
