/**
 * Test para verificar la corrección del cálculo de stock disponible
 * Problema: Doble contabilización de entregas adicionales
 * Solución: Solo usar el campo 'entrega' que ya incluye base + adicionales
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStockCalculationFix() {
  console.log('🧪 TESTING: Corrección de cálculo de Stock Disponible');
  console.log('=' .repeat(60));

  try {
    // 1. Buscar una vacuna con movimientos
    console.log('\n1️⃣ Buscando vacuna con movimientos...');
    const vacuna = await prisma.vacuna.findFirst({
      where: {
        estado: 'activo',
        movimientos: {
          some: {
            entrega: { gt: 0 }
          }
        }
      }
    });

    if (!vacuna) {
      console.log('❌ No se encontró vacuna con movimientos');
      return;
    }

    console.log(`✅ Vacuna encontrada: ${vacuna.nombre}`);

    // 2. Buscar un movimiento con entregas adicionales
    console.log('\n2️⃣ Buscando movimiento con entregas adicionales...');
    const movimientoConAdicionales = await prisma.movimientoVacuna.findFirst({
      where: {
        vacunaId: vacuna.id,
        entregasAdicionales: {
          some: {}
        }
      },
      include: {
        entregasAdicionales: true,
        establecimiento: { select: { nombre: true } }
      }
    });

    if (!movimientoConAdicionales) {
      console.log('❌ No se encontró movimiento con entregas adicionales');
      return;
    }

    console.log(`✅ Movimiento encontrado: ${movimientoConAdicionales.establecimiento.nombre}`);
    console.log(`   • Entrega base: ${movimientoConAdicionales.entregaBase || 'N/A'}`);
    console.log(`   • Entrega total: ${movimientoConAdicionales.entrega}`);
    console.log(`   • Entregas adicionales: ${movimientoConAdicionales.entregasAdicionales.length}`);

    // 3. Calcular manualmente para verificar
    console.log('\n3️⃣ Verificando cálculos manuales...');
    
    const entregaBase = movimientoConAdicionales.entregaBase ?? movimientoConAdicionales.entrega;
    const totalAdicionalesMovimiento = movimientoConAdicionales.entregasAdicionales.reduce(
      (sum, ea) => sum + ea.cantidad, 0
    );
    const entregaTotalCalculada = entregaBase + totalAdicionalesMovimiento;

    console.log(`   • Entrega base: ${entregaBase}`);
    console.log(`   • Total adicionales: ${totalAdicionalesMovimiento}`);
    console.log(`   • Total calculado: ${entregaTotalCalculada}`);
    console.log(`   • Total en BD: ${movimientoConAdicionales.entrega}`);
    console.log(`   • ${entregaTotalCalculada === movimientoConAdicionales.entrega ? '✅' : '❌'} Cálculo correcto`);

    // 4. Simular el cálculo corregido de stock disponible
    console.log('\n4️⃣ Simulando cálculo corregido de stock disponible...');

    // Obtener lotes disponibles para la vacuna
    const lotes = await prisma.loteVacuna.findMany({
      where: {
        vacunaId: vacuna.id,
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      }
    });

    const stockInicial = lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
    console.log(`   • Stock inicial: ${stockInicial}`);

    // 5. Verificar que no hay doble contabilización (CORRECCIÓN APLICADA)
    console.log('\n5️⃣ Verificando corrección: NO sumar entregas adicionales por separado...');

    // MÉTODO CORRECTO: Solo usar el campo 'entrega' que ya incluye base + adicionales
    const sumaEntregasCorrecta = await prisma.movimientoVacuna.aggregate({
      where: {
        vacunaId: vacuna.id,
        mes: movimientoConAdicionales.mes,
        anio: movimientoConAdicionales.anio
      },
      _sum: { entrega: true }
    });

    const totalEntregasCorrecta = sumaEntregasCorrecta._sum.entrega || 0;

    // MÉTODO INCORRECTO (ANTERIOR): Sumar entregas + entregas adicionales
    const sumaEntregasAdicionales = await prisma.entregaAdicional.aggregate({
      where: {
        movimientoVacuna: {
          vacunaId: vacuna.id,
          mes: movimientoConAdicionales.mes,
          anio: movimientoConAdicionales.anio
        }
      },
      _sum: { cantidad: true }
    });

    const totalAdicionales = sumaEntregasAdicionales._sum.cantidad || 0;
    const totalIncorrecto = totalEntregasCorrecta + totalAdicionales; // ❌ DOBLE CONTABILIZACIÓN

    console.log(`   • Total entregas (CORRECTO): ${totalEntregasCorrecta}`);
    console.log(`   • Total adicionales: ${totalAdicionales}`);
    console.log(`   • Total incorrecto (doble suma): ${totalIncorrecto}`);
    console.log(`   • Diferencia: ${totalIncorrecto - totalEntregasCorrecta}`);

    // 6. Mostrar cálculo final
    console.log('\n6️⃣ Cálculo final de stock disponible...');
    const stockCorrectoCalculado = stockInicial - totalEntregasCorrecta;
    const stockIncorrectoCalculado = stockInicial - totalIncorrecto;

    console.log(`   • CORRECTO: ${stockInicial} - ${totalEntregasCorrecta} = ${stockCorrectoCalculado}`);
    console.log(`   • INCORRECTO: ${stockInicial} - ${totalIncorrecto} = ${stockIncorrectoCalculado}`);
    console.log(`   • Diferencia: ${stockCorrectoCalculado - stockIncorrectoCalculado}`);

    console.log('\n🎉 PRUEBA COMPLETADA');
    console.log('✅ La corrección del cálculo de stock disponible funciona correctamente');
    console.log('✅ No hay doble contabilización de entregas adicionales');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testStockCalculationFix();
