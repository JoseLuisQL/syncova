import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Verificando datos insertados...\n');

  try {
    // Verificar vacunas
    console.log('💉 VACUNAS:');
    const vacunas = await prisma.vacuna.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        nombre: true,
        tipo: true,
        estado: true,
        _count: {
          select: {
            lotes: true
          }
        }
      }
    });

    vacunas.forEach((vacuna, index) => {
      console.log(`${index + 1}. ${vacuna.nombre} (${vacuna.tipo}) - Estado: ${vacuna.estado} - Lotes: ${vacuna._count.lotes}`);
    });

    console.log(`\n📊 Total vacunas: ${vacunas.length}`);
    console.log(`✅ Vacunas activas: ${vacunas.filter(v => v.estado === 'activo').length}`);
    console.log(`❌ Vacunas inactivas: ${vacunas.filter(v => v.estado === 'inactivo').length}`);

    // Verificar lotes de vacunas
    console.log('\n📦 LOTES DE VACUNAS:');
    const lotes = await prisma.loteVacuna.findMany({
      include: {
        vacuna: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: [
        { vacuna: { nombre: 'asc' } },
        { numero: 'asc' }
      ]
    });

    const lotesPorVacuna = lotes.reduce((acc, lote) => {
      const vacunaNombre = lote.vacuna.nombre;
      if (!acc[vacunaNombre]) {
        acc[vacunaNombre] = [];
      }
      acc[vacunaNombre].push(lote);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(lotesPorVacuna).forEach(([vacunaNombre, lotesVacuna]) => {
      console.log(`\n${vacunaNombre}:`);
      lotesVacuna.forEach(lote => {
        const fechaVenc = new Date(lote.fechaVencimiento).toLocaleDateString('es-PE');
        console.log(`  - ${lote.numero} | Inicial: ${lote.cantidadInicial} | Actual: ${lote.cantidadActual} | Vence: ${fechaVenc} | Estado: ${lote.estado}`);
      });
    });

    console.log(`\n📊 Total lotes: ${lotes.length}`);
    console.log(`✅ Disponibles: ${lotes.filter(l => l.estado === 'disponible').length}`);
    console.log(`⚠️ Agotados: ${lotes.filter(l => l.estado === 'agotado').length}`);
    console.log(`❌ Vencidos: ${lotes.filter(l => l.estado === 'vencido').length}`);

    // Verificar stock total por vacuna
    console.log('\n📈 STOCK ACTUAL POR VACUNA:');
    const stockPorVacuna = await prisma.vacuna.findMany({
      select: {
        nombre: true,
        lotes: {
          select: {
            cantidadActual: true,
            estado: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    stockPorVacuna.forEach(vacuna => {
      const stockTotal = vacuna.lotes
        .filter(lote => lote.estado === 'disponible')
        .reduce((sum, lote) => sum + lote.cantidadActual, 0);
      
      const totalLotes = vacuna.lotes.length;
      const lotesDisponibles = vacuna.lotes.filter(l => l.estado === 'disponible').length;
      
      console.log(`${vacuna.nombre}: ${stockTotal} unidades (${lotesDisponibles}/${totalLotes} lotes disponibles)`);
    });

    // Verificar jeringas
    console.log('\n💉 JERINGAS:');
    const jeringas = await prisma.jeringa.findMany({
      orderBy: { tipo: 'asc' },
      select: {
        tipo: true,
        capacidad: true,
        color: true,
        estado: true,
        _count: {
          select: {
            lotes: true
          }
        }
      }
    });

    jeringas.forEach((jeringa, index) => {
      console.log(`${index + 1}. ${jeringa.tipo}`);
      console.log(`   Capacidad: ${jeringa.capacidad} | Color: ${jeringa.color} | Estado: ${jeringa.estado} | Lotes: ${jeringa._count.lotes}`);
    });

    console.log(`\n📊 Total jeringas: ${jeringas.length}`);
    console.log(`✅ Jeringas activas: ${jeringas.filter(j => j.estado === 'activo').length}`);

    // Verificar lotes de jeringas
    console.log('\n📦 LOTES DE JERINGAS:');
    const lotesJeringas = await prisma.loteJeringa.findMany({
      include: {
        jeringa: {
          select: {
            tipo: true
          }
        }
      },
      orderBy: [
        { jeringa: { tipo: 'asc' } },
        { numero: 'asc' }
      ]
    });

    const lotesPorJeringa = lotesJeringas.reduce((acc, lote) => {
      const jeringaTipo = lote.jeringa.tipo;
      if (!acc[jeringaTipo]) {
        acc[jeringaTipo] = [];
      }
      acc[jeringaTipo].push(lote);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(lotesPorJeringa).forEach(([jeringaTipo, lotesJeringa]) => {
      console.log(`\n${jeringaTipo}:`);
      lotesJeringa.forEach(lote => {
        const fechaVenc = lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toLocaleDateString('es-PE') : 'Sin vencimiento';
        console.log(`  - ${lote.numero} | Inicial: ${lote.cantidadInicial} | Actual: ${lote.cantidadActual} | Vence: ${fechaVenc} | Estado: ${lote.estado}`);
      });
    });

    console.log(`\n📊 Total lotes jeringas: ${lotesJeringas.length}`);
    console.log(`✅ Disponibles: ${lotesJeringas.filter(l => l.estado === 'disponible').length}`);
    console.log(`⚠️ Agotados: ${lotesJeringas.filter(l => l.estado === 'agotado').length}`);
    console.log(`❌ Vencidos: ${lotesJeringas.filter(l => l.estado === 'vencido').length}`);

    // Verificar stock total por jeringa
    console.log('\n📈 STOCK ACTUAL POR JERINGA:');
    const stockPorJeringa = await prisma.jeringa.findMany({
      select: {
        tipo: true,
        lotes: {
          select: {
            cantidadActual: true,
            estado: true
          }
        }
      },
      orderBy: { tipo: 'asc' }
    });

    stockPorJeringa.forEach(jeringa => {
      const stockTotal = jeringa.lotes
        .filter(lote => lote.estado === 'disponible')
        .reduce((sum, lote) => sum + lote.cantidadActual, 0);

      const totalLotes = jeringa.lotes.length;
      const lotesDisponibles = jeringa.lotes.filter(l => l.estado === 'disponible').length;

      console.log(`${jeringa.tipo}: ${stockTotal} unidades (${lotesDisponibles}/${totalLotes} lotes disponibles)`);
    });

    console.log('\n✅ Verificación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
