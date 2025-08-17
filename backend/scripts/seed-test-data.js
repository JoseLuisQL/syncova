const { PrismaClient } = require('@prisma/client');

/**
 * Script para crear datos de prueba para la funcionalidad de configuración jeringa-vacuna
 */

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Iniciando creación de datos de prueba...');
  console.log('=' .repeat(60));

  try {
    // 1. Crear vacunas de prueba
    console.log('💉 Creando vacunas de prueba...');

    const vacunasData = [
      {
        nombre: 'BCG',
        tipo: 'Tuberculosis',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 20,
        tiempoVidaUtil: 24,
        temperaturaAlmacenamiento: '2-8°C',
        estado: 'activo'
      },
      {
        nombre: 'HVB Pediátrico',
        tipo: 'Hepatitis B',
        presentacion: 'Frasco monodosis',
        dosisPorFrasco: 1,
        tiempoVidaUtil: 36,
        temperaturaAlmacenamiento: '2-8°C',
        estado: 'activo'
      },
      {
        nombre: 'Pentavalente',
        tipo: 'Combinada',
        presentacion: 'Frasco multidosis',
        dosisPorFrasco: 10,
        tiempoVidaUtil: 24,
        temperaturaAlmacenamiento: '2-8°C',
        estado: 'activo'
      }
    ];

    const vacunas = [];
    for (const vacunaData of vacunasData) {
      try {
        // Verificar si ya existe
        let vacuna = await prisma.vacuna.findFirst({
          where: { nombre: vacunaData.nombre }
        });

        if (!vacuna) {
          vacuna = await prisma.vacuna.create({
            data: vacunaData
          });
          console.log(`  ✅ Vacuna creada: ${vacuna.nombre}`);
        } else {
          console.log(`  ⚠️  Vacuna ya existe: ${vacuna.nombre}`);
        }

        vacunas.push(vacuna);
      } catch (error) {
        console.log(`  ❌ Error creando vacuna ${vacunaData.nombre}:`, error.message);
      }
    }

    console.log(`✅ ${vacunas.length} vacunas creadas/actualizadas`);

    // 2. Crear jeringas de prueba
    console.log('💉 Creando jeringas de prueba...');

    const jeringasData = [
      {
        tipo: 'Descartable',
        capacidad: '1cc',
        color: 'Transparente',
        estado: 'activo'
      },
      {
        tipo: 'Descartable',
        capacidad: '0.5cc',
        color: 'Azul',
        estado: 'activo'
      },
      {
        tipo: 'Descartable',
        capacidad: '2cc',
        color: 'Verde',
        estado: 'activo'
      }
    ];

    const jeringas = [];
    for (const jeringaData of jeringasData) {
      try {
        // Verificar si ya existe
        let jeringa = await prisma.jeringa.findFirst({
          where: {
            tipo: jeringaData.tipo,
            capacidad: jeringaData.capacidad
          }
        });

        if (!jeringa) {
          jeringa = await prisma.jeringa.create({
            data: jeringaData
          });
          console.log(`  ✅ Jeringa creada: ${jeringa.tipo} ${jeringa.capacidad}`);
        } else {
          console.log(`  ⚠️  Jeringa ya existe: ${jeringa.tipo} ${jeringa.capacidad}`);
        }

        jeringas.push(jeringa);
      } catch (error) {
        console.log(`  ❌ Error creando jeringa ${jeringaData.tipo} ${jeringaData.capacidad}:`, error.message);
      }
    }

    console.log(`✅ ${jeringas.length} jeringas creadas/actualizadas`);

    // 3. Crear red y microred de prueba
    console.log('🏥 Creando estructura organizacional de prueba...');

    let red = await prisma.red.findFirst({
      where: { nombre: 'Red de Salud Lima Norte' }
    });

    if (!red) {
      red = await prisma.red.create({
        data: {
          nombre: 'Red de Salud Lima Norte',
          codigo: 'RSLN001',
          estado: 'activo'
        }
      });
      console.log(`  ✅ Red creada: ${red.nombre}`);
    } else {
      console.log(`  ⚠️  Red ya existe: ${red.nombre}`);
    }

    let microred = await prisma.microred.findFirst({
      where: {
        nombre: 'Microred Comas',
        redId: red.id
      }
    });

    if (!microred) {
      microred = await prisma.microred.create({
        data: {
          nombre: 'Microred Comas',
          codigo: 'MRC001',
          redId: red.id,
          estado: 'activo'
        }
      });
      console.log(`  ✅ Microred creada: ${microred.nombre}`);
    } else {
      console.log(`  ⚠️  Microred ya existe: ${microred.nombre}`);
    }

    // 4. Crear centro de acopio de prueba
    let centroAcopio = await prisma.centroAcopio.findFirst({
      where: {
        nombre: 'Centro de Acopio Principal',
        microredId: microred.id
      }
    });

    if (!centroAcopio) {
      centroAcopio = await prisma.centroAcopio.create({
        data: {
          nombre: 'Centro de Acopio Principal',
          codigo: 'CAP001',
          microredId: microred.id,
          direccion: 'Av. Principal 123, Comas, Lima',
          responsable: 'Dr. Juan Pérez',
          telefono: '01-234-5678',
          estado: 'activo'
        }
      });
      console.log(`  ✅ Centro de acopio creado: ${centroAcopio.nombre}`);
    } else {
      console.log(`  ⚠️  Centro de acopio ya existe: ${centroAcopio.nombre}`);
    }

    console.log(`✅ Estructura organizacional creada: ${red.nombre} > ${microred.nombre} > ${centroAcopio.nombre}`);

    // 5. Crear configuraciones por defecto de prueba
    console.log('⚙️  Creando configuraciones por defecto...');
    
    const configuracionesDefecto = await Promise.all([
      // BCG con jeringa de 1cc (multiplicador 1.0 - 1 jeringa por dosis)
      prisma.configuracionJeringaVacunaDefecto.upsert({
        where: { uk_vacuna_jeringa_defecto: { vacunaId: vacunas[0].id, jeringaId: jeringas[0].id } },
        update: {},
        create: {
          vacunaId: vacunas[0].id,
          jeringaId: jeringas[0].id,
          multiplicador: 1.0,
          prioridad: 1,
          activo: true
        }
      }),
      // HVB Pediátrico con jeringa de 0.5cc (multiplicador 1.0)
      prisma.configuracionJeringaVacunaDefecto.upsert({
        where: { uk_vacuna_jeringa_defecto: { vacunaId: vacunas[1].id, jeringaId: jeringas[1].id } },
        update: {},
        create: {
          vacunaId: vacunas[1].id,
          jeringaId: jeringas[1].id,
          multiplicador: 1.0,
          prioridad: 1,
          activo: true
        }
      }),
      // Pentavalente con jeringa de 1cc (multiplicador 1.0)
      prisma.configuracionJeringaVacunaDefecto.upsert({
        where: { uk_vacuna_jeringa_defecto: { vacunaId: vacunas[2].id, jeringaId: jeringas[0].id } },
        update: {},
        create: {
          vacunaId: vacunas[2].id,
          jeringaId: jeringas[0].id,
          multiplicador: 1.0,
          prioridad: 1,
          activo: true
        }
      })
    ]);

    console.log(`✅ ${configuracionesDefecto.length} configuraciones por defecto creadas`);

    // 6. Crear una configuración específica por centro
    console.log('🏢 Creando configuración específica por centro...');
    
    const configuracionCentro = await prisma.configuracionJeringaVacunaCentro.upsert({
      where: { 
        uk_centro_vacuna_jeringa: { 
          centroAcopioId: centroAcopio.id, 
          vacunaId: vacunas[0].id, 
          jeringaId: jeringas[0].id 
        } 
      },
      update: {},
      create: {
        centroAcopioId: centroAcopio.id,
        vacunaId: vacunas[0].id,
        jeringaId: jeringas[0].id,
        multiplicador: 1.2, // 20% más jeringas para este centro específico
        prioridad: 1,
        activo: true
      }
    });

    console.log(`✅ Configuración específica creada para ${centroAcopio.nombre} (multiplicador: 1.2)`);

    // 7. Crear algunos lotes de prueba para testing
    console.log('📦 Creando lotes de prueba...');
    
    const lotesVacunas = await Promise.all([
      prisma.loteVacuna.create({
        data: {
          numero: 'BCG-2024-001',
          vacunaId: vacunas[0].id,
          fechaVencimiento: new Date('2025-12-31'),
          fechaIngreso: new Date(),
          formaIngreso: 'PRIMER_TRIMESTRE',
          cantidadInicial: 100,
          cantidadActual: 100,
          estado: 'disponible',
          comprobanteClase: 'PECOSA',
          numeroComprobante: 'PECOSA-001'
        }
      }),
      prisma.loteVacuna.create({
        data: {
          numero: 'HVB-2024-001',
          vacunaId: vacunas[1].id,
          fechaVencimiento: new Date('2025-12-31'),
          fechaIngreso: new Date(),
          formaIngreso: 'PRIMER_TRIMESTRE',
          cantidadInicial: 50,
          cantidadActual: 50,
          estado: 'disponible',
          comprobanteClase: 'PECOSA',
          numeroComprobante: 'PECOSA-002'
        }
      })
    ]);

    const lotesJeringas = await Promise.all([
      prisma.loteJeringa.create({
        data: {
          numero: 'JER1CC-2024-001',
          jeringaId: jeringas[0].id,
          fechaVencimiento: new Date('2026-12-31'),
          fechaIngreso: new Date(),
          formaIngreso: 'PRIMER_TRIMESTRE',
          cantidadInicial: 1000,
          cantidadActual: 1000,
          estado: 'disponible',
          comprobanteClase: 'PECOSA',
          numeroComprobante: 'PECOSA-003'
        }
      }),
      prisma.loteJeringa.create({
        data: {
          numero: 'JER05CC-2024-001',
          jeringaId: jeringas[1].id,
          fechaVencimiento: new Date('2026-12-31'),
          fechaIngreso: new Date(),
          formaIngreso: 'PRIMER_TRIMESTRE',
          cantidadInicial: 500,
          cantidadActual: 500,
          estado: 'disponible',
          comprobanteClase: 'PECOSA',
          numeroComprobante: 'PECOSA-004'
        }
      })
    ]);

    console.log(`✅ ${lotesVacunas.length} lotes de vacunas y ${lotesJeringas.length} lotes de jeringas creados`);

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Datos de prueba creados exitosamente');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`  📋 Vacunas: ${vacunas.length}`);
    console.log(`  💉 Jeringas: ${jeringas.length}`);
    console.log(`  🏥 Centros de acopio: 1`);
    console.log(`  ⚙️  Configuraciones por defecto: ${configuracionesDefecto.length}`);
    console.log(`  🏢 Configuraciones por centro: 1`);
    console.log(`  📦 Lotes de vacunas: ${lotesVacunas.length}`);
    console.log(`  📦 Lotes de jeringas: ${lotesJeringas.length}`);

    return {
      vacunas,
      jeringas,
      centroAcopio,
      configuracionesDefecto,
      configuracionCentro,
      lotesVacunas,
      lotesJeringas
    };

  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedTestData().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { seedTestData };
