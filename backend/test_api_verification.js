const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function testApiVerification() {
  try {
    console.log('🔍 TESTING API VERIFICATION ENDPOINT\n');

    // Get existing voucher details
    const existingVoucher = await prisma.valeEntrega.findFirst({
      where: { estado: 'generado' },
      include: {
        detalles: {
          include: {
            establecimiento: {
              select: { id: true, nombre: true }
            },
            vacuna: {
              select: { id: true, nombre: true }
            }
          }
        }
      }
    });

    if (!existingVoucher || !existingVoucher.detalles.length) {
      console.log('❌ No se encontró vale con detalles para probar');
      return;
    }

    const firstDetail = existingVoucher.detalles[0];
    console.log(`📄 Vale encontrado: ${existingVoucher.numero}`);
    console.log(`   Establecimiento: ${firstDetail.establecimiento.nombre}`);
    console.log(`   Vacuna: ${firstDetail.vacuna.nombre}`);
    console.log(`   Período: ${existingVoucher.mes}/${existingVoucher.anio}`);

    // Test the API endpoint using fetch
    const baseUrl = 'http://localhost:3001/api';
    const endpoint = `${baseUrl}/vales/verificar-existencia`;
    const params = new URLSearchParams({
      establecimientoId: firstDetail.establecimientoId,
      vacunaId: firstDetail.vacunaId,
      mes: existingVoucher.mes.toString(),
      anio: existingVoucher.anio.toString()
    });

    console.log(`\n🌐 Probando endpoint: ${endpoint}?${params}`);

    try {
      const response = await fetch(`${endpoint}?${params}`);
      const result = await response.json();

      console.log('\n🔍 RESULTADO DE LA API:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${result.success}`);
      
      if (result.success) {
        console.log(`   Existen vales: ${result.data.existenVales}`);
        console.log(`   Vales encontrados: ${result.data.valesEncontrados.length}`);
        
        if (result.data.valesEncontrados.length > 0) {
          console.log('\n📄 VALES ENCONTRADOS:');
          result.data.valesEncontrados.forEach(vale => {
            console.log(`   - ${vale.numero} (${new Date(vale.fechaGeneracion).toLocaleDateString()})`);
          });
        }
      } else {
        console.log(`   Error: ${result.error}`);
      }

      // Test with non-existing establishment
      console.log('\n🔍 PROBANDO CON ESTABLECIMIENTO SIN VALES...');
      
      const establishmentWithoutVouchers = await prisma.establecimiento.findFirst({
        where: {
          estado: 'activo',
          NOT: {
            id: {
              in: existingVoucher.detalles.map(d => d.establecimientoId)
            }
          }
        }
      });

      if (establishmentWithoutVouchers) {
        const paramsNoVouchers = new URLSearchParams({
          establecimientoId: establishmentWithoutVouchers.id,
          vacunaId: firstDetail.vacunaId,
          mes: existingVoucher.mes.toString(),
          anio: existingVoucher.anio.toString()
        });

        const responseNoVouchers = await fetch(`${endpoint}?${paramsNoVouchers}`);
        const resultNoVouchers = await responseNoVouchers.json();

        console.log(`   Establecimiento: ${establishmentWithoutVouchers.nombre}`);
        console.log(`   Status: ${responseNoVouchers.status}`);
        console.log(`   Success: ${resultNoVouchers.success}`);
        
        if (resultNoVouchers.success) {
          console.log(`   Existen vales: ${resultNoVouchers.data.existenVales}`);
          console.log(`   Vales encontrados: ${resultNoVouchers.data.valesEncontrados.length}`);
        }
      }

    } catch (fetchError) {
      console.error('❌ Error al conectar con la API:', fetchError.message);
      console.log('💡 Asegúrese de que el servidor backend esté ejecutándose en http://localhost:3001');
    }

    console.log('\n✅ PRUEBA DE API COMPLETADA');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ fetch no está disponible. Instalando node-fetch...');
  try {
    const fetch = require('node-fetch');
    global.fetch = fetch;
  } catch (e) {
    console.log('❌ node-fetch no está instalado. Ejecute: npm install node-fetch');
    process.exit(1);
  }
}

testApiVerification();
