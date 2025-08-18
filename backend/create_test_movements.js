const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestMovements() {
  try {
    console.log('🔧 Creando movimientos de prueba para testing...\n');

    // Usar Centro de Salud Andahuaylas
    const centroId = 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c';
    
    // Verificar si ya existen movimientos para noviembre 2025
    const existingMovements = await prisma.movimientoVacuna.findMany({
      where: {
        mes: 11,
        anio: 2025,
        establecimiento: {
          centroAcopioId: centroId
        }
      }
    });

    if (existingMovements.length > 0) {
      console.log(`✅ Ya existen ${existingMovements.length} movimientos para noviembre 2025`);
      return;
    }

    // Obtener establecimientos del centro
    const establecimientos = await prisma.establecimiento.findMany({
      where: {
        centroAcopioId: centroId,
        estado: 'activo'
      },
      take: 3
    });

    console.log(`📍 Establecimientos encontrados: ${establecimientos.length}`);
    establecimientos.forEach(est => {
      console.log(`   • ${est.nombre}`);
    });

    // Obtener vacunas activas
    const vacunas = await prisma.vacuna.findMany({
      where: { estado: 'activo' },
      take: 3
    });

    console.log(`💉 Vacunas encontradas: ${vacunas.length}`);
    vacunas.forEach(vac => {
      console.log(`   • ${vac.nombre} (${vac.presentacion})`);
    });

    // Obtener un usuario activo
    const usuario = await prisma.usuario.findFirst({
      where: { estado: 'activo' }
    });

    if (!usuario) {
      console.log('❌ No hay usuarios activos');
      return;
    }

    console.log(`👤 Usuario: ${usuario.nombres} ${usuario.apellidos}\n`);

    // Crear movimientos de prueba
    console.log('📝 Creando movimientos de prueba...');
    let movimientosCreados = 0;

    for (const establecimiento of establecimientos) {
      for (const vacuna of vacunas) {
        const entrega = Math.floor(Math.random() * 50) + 20; // Entre 20 y 70 unidades
        
        await prisma.movimientoVacuna.create({
          data: {
            establecimientoId: establecimiento.id,
            vacunaId: vacuna.id,
            mes: 11,
            anio: 2025,
            programado: entrega + 10, // Programado un poco más que la entrega
            entrega: entrega,
            usuarioId: usuario.id
          }
        });

        console.log(`   ✅ ${establecimiento.nombre} - ${vacuna.nombre}: ${entrega} unidades`);
        movimientosCreados++;
      }
    }

    console.log(`\n🎉 Creados ${movimientosCreados} movimientos de prueba`);
    console.log(`📍 Centro: Centro de Salud Andahuaylas (${centroId})`);
    console.log(`📅 Período: Noviembre 2025`);

  } catch (error) {
    console.error('❌ Error creando movimientos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar creación
createTestMovements()
  .then(() => {
    console.log('✅ Movimientos de prueba creados exitosamente');
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
