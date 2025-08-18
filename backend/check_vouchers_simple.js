const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function checkVouchers() {
  try {
    console.log('🔍 VERIFICANDO VALES EXISTENTES\n');

    // 1. Verificar vales existentes para Centro de Salud Andahuaylas
    console.log('📄 PASO 1: Verificando vales existentes...');
    const centroId = 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c'; // Centro de Salud Andahuaylas
    
    const vales = await prisma.valeEntrega.findMany({
      where: {
        centroAcopioId: centroId,
        mes: 11,
        anio: 2025
      },
      include: {
        centroAcopio: {
          select: { nombre: true }
        },
        detalles: {
          include: {
            establecimiento: {
              select: { nombre: true }
            },
            vacuna: {
              select: { nombre: true, presentacion: true }
            }
          }
        }
      },
      orderBy: { fechaGeneracion: 'desc' }
    });

    console.log(`   Vales encontrados: ${vales.length}`);

    if (vales.length === 0) {
      console.log('❌ No hay vales para este centro en 11/2025');
      return;
    }

    // 2. Analizar cada vale
    for (const vale of vales) {
      console.log(`\n📋 VALE: ${vale.numero}`);
      console.log(`   Centro: ${vale.centroAcopio.nombre}`);
      console.log(`   Fecha: ${vale.fechaGeneracion.toISOString().split('T')[0]}`);
      console.log(`   Estado: ${vale.estado}`);
      console.log(`   Tipo: ${vale.tipoVale}`);
      console.log(`   Detalles: ${vale.detalles.length}`);

      // Mostrar detalles
      if (vale.detalles.length > 0) {
        console.log('   📦 Detalles del vale:');
        vale.detalles.forEach(detalle => {
          const cantidadTotal = (detalle.cantidadProgramada || 0) + (detalle.cantidadAdicional || 0);
          console.log(`      • ${detalle.establecimiento.nombre}: ${cantidadTotal} unidades de ${detalle.vacuna.nombre}`);
        });
      }

      // 3. Verificar movimientos de kardex para este vale
      console.log(`\n📊 KARDEX para vale ${vale.numero}:`);
      
      const kardexMovimientos = await prisma.kardex.findMany({
        where: {
          numeroDocumento: vale.numero
        },
        include: {
          usuario: {
            select: { nombres: true, apellidos: true }
          }
        },
        orderBy: { fechaMovimiento: 'desc' }
      });

      if (kardexMovimientos.length === 0) {
        console.log('   ❌ NO HAY MOVIMIENTOS DE KARDEX - ESTO ES EL PROBLEMA');
      } else {
        console.log(`   ✅ Movimientos encontrados: ${kardexMovimientos.length}`);
        kardexMovimientos.forEach(mov => {
          console.log(`      • ${mov.tipo}: ${mov.tipoMovimiento} de ${mov.cantidad} unidades`);
          console.log(`        Saldo: ${mov.saldoAnterior} → ${mov.saldoActual}`);
          console.log(`        Fecha: ${mov.fechaMovimiento.toISOString().split('T')[0]}`);
        });
      }
    }

    // 4. Verificar stock actual de algunos lotes
    console.log(`\n🔍 VERIFICANDO STOCK ACTUAL DE LOTES:`);
    
    const lotesVacunas = await prisma.loteVacuna.findMany({
      where: {
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      include: {
        vacuna: {
          select: { nombre: true }
        }
      },
      orderBy: { fechaVencimiento: 'asc' },
      take: 5
    });

    lotesVacunas.forEach(lote => {
      console.log(`   📦 Lote ${lote.numero} (${lote.vacuna.nombre}): ${lote.cantidadActual} unidades`);
    });

  } catch (error) {
    console.error('❌ Error verificando vales:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVouchers().catch(console.error);
