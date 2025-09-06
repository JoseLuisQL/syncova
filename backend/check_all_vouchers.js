const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function checkAllVouchers() {
  try {
    console.log('🔍 VERIFICANDO TODOS LOS VALES EN LA BASE DE DATOS\n');

    // Check all vouchers
    const allVouchers = await prisma.valeEntrega.findMany({
      include: {
        centroAcopio: {
          select: { nombre: true }
        }
      },
      orderBy: { fechaGeneracion: 'desc' },
      take: 10
    });

    console.log(`📄 Total de vales en la base de datos: ${allVouchers.length}`);

    if (allVouchers.length > 0) {
      console.log('\n📋 VALES ENCONTRADOS:');
      allVouchers.forEach(vale => {
        console.log(`   - ${vale.numero} (${vale.estado}) - ${vale.centroAcopio.nombre} - ${vale.mes}/${vale.anio}`);
      });

      // Test with the first voucher found
      const firstVoucher = allVouchers[0];
      console.log(`\n🔍 PROBANDO CON VALE: ${firstVoucher.numero}`);

      // Get details of this voucher
      const voucherDetails = await prisma.valeDetalle.findMany({
        where: { valeEntregaId: firstVoucher.id },
        include: {
          establecimiento: {
            select: { id: true, nombre: true }
          },
          vacuna: {
            select: { id: true, nombre: true }
          }
        },
        take: 3
      });

      console.log(`   Detalles encontrados: ${voucherDetails.length}`);
      
      if (voucherDetails.length > 0) {
        const firstDetail = voucherDetails[0];
        console.log(`   Primer detalle: ${firstDetail.establecimiento.nombre} - ${firstDetail.vacuna.nombre}`);

        // Test the verification function
        const { ValeService } = require('./src/services/ValeService');

        const resultado = await ValeService.verificarValesExistentesParaEstablecimiento(
          firstDetail.establecimientoId,
          firstDetail.vacunaId,
          firstVoucher.mes,
          firstVoucher.anio
        );

        console.log('\n🔍 RESULTADO DE VERIFICACIÓN:');
        console.log(`   Success: ${resultado.success}`);
        if (resultado.success) {
          console.log(`   Existen vales: ${resultado.data.existenVales}`);
          console.log(`   Vales encontrados: ${resultado.data.valesEncontrados.length}`);
        } else {
          console.log(`   Error: ${resultado.error}`);
        }
      }
    } else {
      console.log('❌ No hay vales en la base de datos');
      
      // Let's create a test voucher to verify the functionality
      console.log('\n🔧 CREANDO VALE DE PRUEBA...');
      
      // Get a center and establishment
      const centro = await prisma.centroAcopio.findFirst({
        where: { estado: 'activo' }
      });

      const establecimiento = await prisma.establecimiento.findFirst({
        where: { 
          estado: 'activo',
          centroAcopioId: centro?.id
        }
      });

      const vacuna = await prisma.vacuna.findFirst({
        where: { estado: 'activo' }
      });

      if (centro && establecimiento && vacuna) {
        console.log(`   Centro: ${centro.nombre}`);
        console.log(`   Establecimiento: ${establecimiento.nombre}`);
        console.log(`   Vacuna: ${vacuna.nombre}`);

        // Create a test voucher
        const testVoucher = await prisma.valeEntrega.create({
          data: {
            numero: `TEST-2025-001`,
            centroAcopioId: centro.id,
            mes: 12,
            anio: 2025,
            estado: 'generado',
            totalVacunas: 100,
            totalEstablecimientos: 1,
            usuarioId: 'test-user',
            observaciones: 'Vale de prueba para verificación'
          }
        });

        // Create a detail for the voucher
        await prisma.valeDetalle.create({
          data: {
            valeEntregaId: testVoucher.id,
            establecimientoId: establecimiento.id,
            vacunaId: vacuna.id,
            cantidadProgramada: 100,
            cantidadAdicional: 0,
            cantidadTotal: 100
          }
        });

        console.log(`✅ Vale de prueba creado: ${testVoucher.numero}`);

        // Now test the verification function
        const { ValeService } = require('./src/services/ValeService');

        const resultado = await ValeService.verificarValesExistentesParaEstablecimiento(
          establecimiento.id,
          vacuna.id,
          12,
          2025
        );

        console.log('\n🔍 RESULTADO DE VERIFICACIÓN CON VALE DE PRUEBA:');
        console.log(`   Success: ${resultado.success}`);
        if (resultado.success) {
          console.log(`   Existen vales: ${resultado.data.existenVales}`);
          console.log(`   Vales encontrados: ${resultado.data.valesEncontrados.length}`);
        } else {
          console.log(`   Error: ${resultado.error}`);
        }

        // Clean up test voucher
        await prisma.valeDetalle.deleteMany({
          where: { valeEntregaId: testVoucher.id }
        });
        await prisma.valeEntrega.delete({
          where: { id: testVoucher.id }
        });
        console.log('🧹 Vale de prueba eliminado');
      }
    }

    console.log('\n✅ VERIFICACIÓN COMPLETADA');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllVouchers();
