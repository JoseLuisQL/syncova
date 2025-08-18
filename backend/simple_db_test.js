const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function simpleTest() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const valeCount = await prisma.vale.count();
    console.log(`   Total vales in database: ${valeCount}`);
    
    // Test specific query
    const vales = await prisma.vale.findMany({
      where: {
        mes: 11,
        anio: 2025
      },
      select: {
        id: true,
        numero: true,
        centroAcopioId: true,
        fechaGeneracion: true,
        estado: true
      },
      take: 5
    });
    
    console.log(`   Vales for 11/2025: ${vales.length}`);
    vales.forEach(vale => {
      console.log(`      • ${vale.numero} - ${vale.estado} (${vale.fechaGeneracion.toISOString().split('T')[0]})`);
    });
    
    // Check kardex entries
    const kardexVacunas = await prisma.kardexVacuna.count();
    const kardexJeringas = await prisma.kardexJeringa.count();
    
    console.log(`   Total kardex vacunas: ${kardexVacunas}`);
    console.log(`   Total kardex jeringas: ${kardexJeringas}`);
    
    if (vales.length > 0) {
      // Check kardex for first vale
      const primeVale = vales[0];
      const kardexVale = await prisma.kardexVacuna.count({
        where: { numeroDocumento: primeVale.numero }
      });
      
      console.log(`   Kardex entries for vale ${primeVale.numero}: ${kardexVale}`);
      
      if (kardexVale === 0) {
        console.log('   🚨 PROBLEMA: Vale sin movimientos de kardex - stock no actualizado');
      } else {
        console.log('   ✅ Vale con movimientos de kardex - stock actualizado');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest()
  .then(() => {
    console.log('✅ Test completado');
  })
  .catch(error => {
    console.error('❌ Error en test:', error);
    process.exit(1);
  });
