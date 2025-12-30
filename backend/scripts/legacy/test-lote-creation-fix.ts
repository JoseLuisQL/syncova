import { PrismaClient } from '@prisma/client';
import { LoteVacunaService } from '../src/services/LoteVacunaService';

const prisma = new PrismaClient();

async function testLoteCreationFix() {
  try {
    console.log('🧪 PRUEBA: Verificar que la creación de lotes no duplique cantidades\n');

    // 1. Obtener una vacuna existente
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' }
    });

    if (!vacuna) {
      console.error('❌ No se encontró ninguna vacuna activa');
      return;
    }

    console.log(`✅ Vacuna encontrada: ${vacuna.nombre} (ID: ${vacuna.id})`);

    // 2. Crear datos de prueba para el lote
    const cantidadInicial = 100;
    const loteData = {
      numero: `TEST-FIX-${Date.now()}`,
      vacunaId: vacuna.id,
      fechaIngreso: new Date(),
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
      formaIngreso: 'TERCER_TRIMESTRE' as const,
      comprobanteClase: 'PECOSA' as const,
      numeroComprobante: `PECOSA-FIX-${Date.now()}`,
      cantidadInicial,
      cantidadActual: cantidadInicial, // Esto debería ser ignorado por el servicio
      observaciones: 'Lote de prueba para verificar fix de duplicación'
    };

    console.log(`\n📦 Creando lote con cantidad inicial: ${cantidadInicial}`);

    // 3. Crear el lote usando el servicio
    const result = await LoteVacunaService.create(loteData);

    if (!result.success) {
      console.error(`❌ Error al crear lote: ${result.error}`);
      return;
    }

    console.log(`✅ Lote creado exitosamente: ${result.data.numero}`);

    // 4. Esperar un momento para que se procese el Kardex
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Verificar el lote creado
    const loteCreado = await prisma.loteVacuna.findUnique({
      where: { id: result.data.id },
      include: {
        vacuna: {
          select: { nombre: true }
        }
      }
    });

    if (!loteCreado) {
      console.error('❌ No se pudo encontrar el lote creado');
      return;
    }

    console.log('\n📊 RESULTADOS:');
    console.log(`   Número de lote: ${loteCreado.numero}`);
    console.log(`   Vacuna: ${loteCreado.vacuna.nombre}`);
    console.log(`   Cantidad inicial: ${loteCreado.cantidadInicial}`);
    console.log(`   Cantidad actual: ${loteCreado.cantidadActual}`);
    console.log(`   Estado: ${loteCreado.estado}`);

    // 6. Verificar que las cantidades son correctas
    if (loteCreado.cantidadActual === loteCreado.cantidadInicial) {
      console.log('\n✅ ¡ÉXITO! Las cantidades son correctas (no hay duplicación)');
    } else {
      console.log('\n❌ ¡ERROR! Hay duplicación de cantidades');
      console.log(`   Esperado: ${loteCreado.cantidadInicial}`);
      console.log(`   Actual: ${loteCreado.cantidadActual}`);
    }

    // 7. Verificar movimiento en Kardex
    const movimientoKardex = await prisma.kardex.findFirst({
      where: {
        loteId: loteCreado.id,
        tipo: 'vacuna',
        tipoMovimiento: 'ingreso'
      }
    });

    if (movimientoKardex) {
      console.log('\n📝 MOVIMIENTO EN KARDEX:');
      console.log(`   Tipo: ${movimientoKardex.tipoMovimiento}`);
      console.log(`   Cantidad: ${movimientoKardex.cantidad}`);
      console.log(`   Saldo anterior: ${movimientoKardex.saldoAnterior}`);
      console.log(`   Saldo actual: ${movimientoKardex.saldoActual}`);
      
      if (movimientoKardex.cantidad === cantidadInicial) {
        console.log('✅ El movimiento en Kardex tiene la cantidad correcta');
      } else {
        console.log('❌ El movimiento en Kardex tiene cantidad incorrecta');
      }
    } else {
      console.log('\n⚠️ No se encontró movimiento en Kardex');
    }

    // 8. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    
    // Eliminar movimiento de Kardex
    if (movimientoKardex) {
      await prisma.kardex.delete({
        where: { id: movimientoKardex.id }
      });
    }
    
    // Eliminar lote
    await prisma.loteVacuna.delete({
      where: { id: loteCreado.id }
    });
    
    console.log('✅ Datos de prueba eliminados');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testLoteCreationFix();
