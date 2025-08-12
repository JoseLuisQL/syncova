const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedVacunas() {
  try {
    console.log('🌱 Iniciando seed de vacunas...');

    // Verificar si ya existen vacunas
    const existingVacunas = await prisma.vacuna.count();
    console.log(`📊 Vacunas existentes: ${existingVacunas}`);

    if (existingVacunas === 0) {
      console.log('📝 Creando vacunas de prueba...');

      const vacunas = [
        {
          nombre: 'BCG',
          tipo: 'Bacteriana',
          presentacion: 'Frasco multidosis',
          dosisPorFrasco: 20,
          tiempoVidaUtil: 24,
          temperaturaAlmacenamiento: '2°C a 8°C',
          estado: 'activo'
        },
        {
          nombre: 'Pentavalente',
          tipo: 'Combinada',
          presentacion: 'Frasco multidosis',
          dosisPorFrasco: 10,
          tiempoVidaUtil: 36,
          temperaturaAlmacenamiento: '2°C a 8°C',
          estado: 'activo'
        },
        {
          nombre: 'Hepatitis B',
          tipo: 'Viral',
          presentacion: 'Frasco multidosis',
          dosisPorFrasco: 10,
          tiempoVidaUtil: 36,
          temperaturaAlmacenamiento: '2°C a 8°C',
          estado: 'activo'
        },
        {
          nombre: 'Polio IPV',
          tipo: 'Viral',
          presentacion: 'Frasco multidosis',
          dosisPorFrasco: 10,
          tiempoVidaUtil: 24,
          temperaturaAlmacenamiento: '2°C a 8°C',
          estado: 'activo'
        },
        {
          nombre: 'Rotavirus',
          tipo: 'Viral',
          presentacion: 'Frasco unidosis',
          dosisPorFrasco: 1,
          tiempoVidaUtil: 24,
          temperaturaAlmacenamiento: '2°C a 8°C',
          estado: 'activo'
        },
        {
          nombre: 'Neumococo',
          tipo: 'Bacteriana',
          presentacion: 'Frasco unidosis',
          dosisPorFrasco: 1,
          tiempoVidaUtil: 36,
          temperaturaAlmacenamiento: '2°C a 8°C',
          estado: 'activo'
        },
        {
          nombre: 'SPR (Triple Viral)',
          tipo: 'Viral',
          presentacion: 'Frasco multidosis',
          dosisPorFrasco: 10,
          tiempoVidaUtil: 24,
          temperaturaAlmacenamiento: '2°C a 8°C',
          estado: 'activo'
        },
        {
          nombre: 'Varicela',
          tipo: 'Viral',
          presentacion: 'Frasco unidosis',
          dosisPorFrasco: 1,
          tiempoVidaUtil: 24,
          temperaturaAlmacenamiento: '2°C a 8°C',
          estado: 'activo'
        }
      ];

      for (const vacuna of vacunas) {
        await prisma.vacuna.create({
          data: vacuna
        });
        console.log(`✅ Vacuna creada: ${vacuna.nombre}`);
      }

      console.log(`🎉 Se crearon ${vacunas.length} vacunas exitosamente`);
    } else {
      console.log('ℹ️ Ya existen vacunas en la base de datos');
      
      // Mostrar las vacunas existentes
      const vacunas = await prisma.vacuna.findMany({
        select: {
          nombre: true,
          estado: true
        }
      });
      
      console.log('📋 Vacunas existentes:');
      vacunas.forEach(v => {
        console.log(`  - ${v.nombre} (${v.estado})`);
      });
    }

  } catch (error) {
    console.error('❌ Error al crear vacunas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedVacunas();
