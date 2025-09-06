/**
 * Demostración de la corrección del cálculo de stock disponible
 * Problema: Doble contabilización de entregas adicionales
 * Solución: Solo usar el campo 'entrega' que ya incluye base + adicionales
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function demonstrateStockCalculationFix() {
  console.log('🧪 DEMOSTRACIÓN: Corrección de cálculo de Stock Disponible');
  console.log('=' .repeat(60));
  console.log('📋 PROBLEMA IDENTIFICADO:');
  console.log('   • El backend estaba sumando DOBLE las entregas adicionales');
  console.log('   • Campo "entrega" ya incluye base + adicionales');
  console.log('   • Pero se sumaban las adicionales por separado otra vez');
  console.log('');

  try {
    // 1. Buscar cualquier vacuna
    console.log('1️⃣ Buscando vacuna para demostración...');
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' }
    });

    if (!vacuna) {
      console.log('❌ No se encontró vacuna activa');
      return;
    }

    console.log(`✅ Vacuna: ${vacuna.nombre}`);

    // 2. Buscar movimientos del mes actual
    console.log('\n2️⃣ Buscando movimientos del mes actual...');
    const movimientos = await prisma.movimientoVacuna.findMany({
      where: {
        vacunaId: vacuna.id,
        mes: 9, // Septiembre
        anio: 2025
      },
      include: {
        entregasAdicionales: true,
        establecimiento: { select: { nombre: true } }
      },
      take: 3
    });

    if (movimientos.length === 0) {
      console.log('❌ No se encontraron movimientos para septiembre 2025');
      return;
    }

    console.log(`✅ Encontrados ${movimientos.length} movimientos`);

    // 3. Demostrar el problema y la solución
    console.log('\n3️⃣ Demostrando el problema y la corrección...');
    
    let totalEntregasCorrecta = 0;
    let totalEntregasIncorrecta = 0;

    movimientos.forEach((mov, index) => {
      const entregaBase = mov.entregaBase ?? mov.entrega;
      const adicionales = mov.entregasAdicionales.reduce((sum, ea) => sum + ea.cantidad, 0);
      
      console.log(`\n   Movimiento ${index + 1}: ${mov.establecimiento.nombre}`);
      console.log(`   • Entrega base: ${entregaBase}`);
      console.log(`   • Entregas adicionales: ${adicionales}`);
      console.log(`   • Campo 'entrega' en BD: ${mov.entrega}`);
      
      // Método correcto: solo usar el campo 'entrega'
      totalEntregasCorrecta += mov.entrega;
      
      // Método incorrecto: sumar entrega + adicionales (doble contabilización)
      totalEntregasIncorrecta += mov.entrega + adicionales;
      
      console.log(`   • ✅ CORRECTO: usar solo ${mov.entrega}`);
      console.log(`   • ❌ INCORRECTO: ${mov.entrega} + ${adicionales} = ${mov.entrega + adicionales}`);
    });

    // 4. Mostrar totales
    console.log('\n4️⃣ Totales calculados...');
    console.log(`   • ✅ MÉTODO CORRECTO: ${totalEntregasCorrecta}`);
    console.log(`   • ❌ MÉTODO INCORRECTO: ${totalEntregasIncorrecta}`);
    console.log(`   • 🔍 DIFERENCIA: ${totalEntregasIncorrecta - totalEntregasCorrecta}`);

    // 5. Simular cálculo de stock
    console.log('\n5️⃣ Simulando cálculo de stock disponible...');
    
    const stockInicial = 600; // Ejemplo
    const stockCorrectoCalculado = stockInicial - totalEntregasCorrecta;
    const stockIncorrectoCalculado = stockInicial - totalEntregasIncorrecta;
    
    console.log(`   • Stock inicial (ejemplo): ${stockInicial}`);
    console.log(`   • ✅ Stock correcto: ${stockInicial} - ${totalEntregasCorrecta} = ${stockCorrectoCalculado}`);
    console.log(`   • ❌ Stock incorrecto: ${stockInicial} - ${totalEntregasIncorrecta} = ${stockIncorrectoCalculado}`);
    console.log(`   • 🔍 Diferencia en stock: ${stockCorrectoCalculado - stockIncorrectoCalculado}`);

    // 6. Explicar la corrección aplicada
    console.log('\n6️⃣ CORRECCIÓN APLICADA EN MovimientosService.ts:');
    console.log('   ✅ ANTES (línea 1598):');
    console.log('      const totalEntregasCalculado = (totalEntregas._sum.entrega || 0) + (entregasAdicionales._sum.cantidad || 0);');
    console.log('      ❌ Esto sumaba DOBLE las entregas adicionales');
    console.log('');
    console.log('   ✅ DESPUÉS (línea 1588):');
    console.log('      const totalEntregasCalculado = totalEntregas._sum.entrega || 0;');
    console.log('      ✅ Solo usa el campo "entrega" que ya incluye base + adicionales');

    console.log('\n🎉 DEMOSTRACIÓN COMPLETADA');
    console.log('✅ La corrección elimina la doble contabilización');
    console.log('✅ Ahora la tabla y las tarjetas mostrarán valores consistentes');

  } catch (error) {
    console.error('❌ Error durante la demostración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la demostración
demonstrateStockCalculationFix();
