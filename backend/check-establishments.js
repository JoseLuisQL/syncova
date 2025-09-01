const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEstablecimientos() {
  try {
    console.log('🔍 Checking establishments in database...');
    
    // Check all establishments with San Jeronimo
    const sanJeronimoEst = await prisma.establecimiento.findMany({
      where: { nombre: { contains: 'San Jeronimo', mode: 'insensitive' } },
      select: { id: true, nombre: true, tipo: true, centroAcopioId: true }
    });
    
    console.log('\n📍 Establishments with "San Jeronimo":');
    sanJeronimoEst.forEach(est => {
      console.log(`- ${est.nombre} (tipo: ${est.tipo}, centroAcopioId: ${est.centroAcopioId})`);
    });
    
    // Get the centro de acopio ID from the first establishment found
    const centroAcopioId = sanJeronimoEst.length > 0 ? sanJeronimoEst[0].centroAcopioId : null;

    let possibleCentros = [];
    if (centroAcopioId) {
      possibleCentros = await prisma.establecimiento.findMany({
        where: { id: centroAcopioId },
        select: { id: true, nombre: true, tipo: true, centroAcopioId: true }
      });
    }
    
    console.log('\n🏢 Possible centro de acopio (no centroAcopioId):');
    possibleCentros.forEach(est => {
      console.log(`- ${est.nombre} (tipo: ${est.tipo})`);
    });
    
    // Check establishments under San Jeronimo centro
    if (possibleCentros.length > 0) {
      const centroId = possibleCentros[0].id;
      const subEstablecimientos = await prisma.establecimiento.findMany({
        where: { centroAcopioId: centroId },
        select: { id: true, nombre: true, tipo: true }
      });
      
      console.log(`\n🏥 Establishments under ${possibleCentros[0].nombre}:`);
      subEstablecimientos.forEach(est => {
        console.log(`- ${est.nombre} (tipo: ${est.tipo})`);
      });
    }
    
    // Check AMA vaccine stock
    const amaVaccine = await prisma.vacuna.findFirst({
      where: { nombre: { contains: 'AMA', mode: 'insensitive' } }
    });
    
    if (amaVaccine) {
      const lotesAMA = await prisma.loteVacuna.findMany({
        where: {
          vacunaId: amaVaccine.id,
          estado: 'disponible',
          cantidadActual: { gt: 0 }
        },
        orderBy: [
          { fechaVencimiento: 'asc' },
          { fechaIngreso: 'asc' }
        ]
      });

      const stockActual = lotesAMA.reduce((sum, lote) => sum + lote.cantidadActual, 0);
      console.log(`\n💉 AMA Vaccine Stock: ${stockActual} units in ${lotesAMA.length} lots`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEstablecimientos();
