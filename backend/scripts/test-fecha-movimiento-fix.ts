import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function testFechaMovimientoFix() {
  try {
    console.log('🧪 PRUEBA: Verificar que fecha_movimiento usa fecha actual\n');

    // 1. Obtener vacuna y jeringa para pruebas
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' }
    });

    const jeringa = await prisma.jeringa.findFirst({
      where: { estado: 'activo' }
    });

    if (!vacuna || !jeringa) {
      console.error('❌ No se encontraron vacuna o jeringa activas');
      return;
    }

    console.log(`✅ Vacuna encontrada: ${vacuna.nombre}`);
    console.log(`✅ Jeringa encontrada: ${jeringa.tipo}`);

    // 2. Registrar tiempo de inicio de la prueba
    const tiempoInicioPrueba = new Date();
    console.log(`\n⏰ Tiempo inicio prueba: ${tiempoInicioPrueba.toISOString()}`);

    // 3. Crear lote de vacuna con fecha de ingreso diferente (ayer)
    const fechaIngresoAnterior = new Date();
    fechaIngresoAnterior.setDate(fechaIngresoAnterior.getDate() - 1); // Ayer
    fechaIngresoAnterior.setHours(10, 0, 0, 0); // 10:00 AM

    const loteVacunaData = {
      numero: `TEST-VAC-FECHA-${Date.now()}`,
      vacunaId: vacuna.id,
      fechaIngreso: fechaIngresoAnterior.toISOString(),
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      formaIngreso: '2° TRIMESTRE',
      comprobanteClase: 'PECOSA',
      numeroComprobante: '555',
      cantidadInicial: 75,
      cantidadActual: 75,
      observaciones: 'Prueba fecha movimiento - vacuna'
    };

    console.log(`\n📦 Creando lote de vacuna:`);
    console.log(`   Fecha ingreso (lote): ${fechaIngresoAnterior.toISOString()}`);
    console.log(`   Cantidad: ${loteVacunaData.cantidadInicial}`);

    // 4. Crear lote de jeringa con fecha de ingreso diferente
    const loteJeringaData = {
      numero: `TEST-JER-FECHA-${Date.now()}`,
      jeringaId: jeringa.id,
      fechaIngreso: fechaIngresoAnterior.toISOString(),
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      formaIngreso: '2° TRIMESTRE',
      comprobanteClase: 'PECOSA',
      numeroComprobante: '666',
      cantidadInicial: 50,
      cantidadActual: 50,
      observaciones: 'Prueba fecha movimiento - jeringa'
    };

    console.log(`\n💉 Creando lote de jeringa:`);
    console.log(`   Fecha ingreso (lote): ${fechaIngresoAnterior.toISOString()}`);
    console.log(`   Cantidad: ${loteJeringaData.cantidadInicial}`);

    // 5. Crear ambos lotes via API
    const [responseVacuna, responseJeringa] = await Promise.all([
      axios.post('http://localhost:3001/api/lotes-vacunas', loteVacunaData),
      axios.post('http://localhost:3001/api/lotes-jeringas', loteJeringaData)
    ]);

    if (responseVacuna.status !== 201 || responseJeringa.status !== 201) {
      console.error('❌ Error en respuestas HTTP');
      return;
    }

    const loteVacunaCreado = responseVacuna.data.data;
    const loteJeringaCreado = responseJeringa.data.data;

    console.log(`✅ Lote vacuna creado: ${loteVacunaCreado.numero}`);
    console.log(`✅ Lote jeringa creado: ${loteJeringaCreado.numero}`);

    // 6. Esperar procesamiento del Kardex
    await new Promise(resolve => setTimeout(resolve, 3000));

    const tiempoFinPrueba = new Date();
    console.log(`⏰ Tiempo fin prueba: ${tiempoFinPrueba.toISOString()}`);

    // 7. Verificar movimientos en Kardex
    const movimientoVacuna = await prisma.kardex.findFirst({
      where: {
        loteId: loteVacunaCreado.id,
        tipo: 'vacuna',
        tipoMovimiento: 'ingreso'
      }
    });

    const movimientoJeringa = await prisma.kardex.findFirst({
      where: {
        loteId: loteJeringaCreado.id,
        tipo: 'jeringa',
        tipoMovimiento: 'ingreso'
      }
    });

    console.log('\n📊 ANÁLISIS DE FECHAS:');

    // 8. Analizar movimiento de vacuna
    if (movimientoVacuna) {
      const fechaMovimientoVacuna = new Date(movimientoVacuna.fechaMovimiento);
      const diferenciaVacuna = Math.abs(fechaMovimientoVacuna.getTime() - tiempoInicioPrueba.getTime());
      const minutosDiferenciaVacuna = diferenciaVacuna / (1000 * 60);

      console.log(`\n📦 VACUNA - Movimiento Kardex:`);
      console.log(`   Fecha ingreso lote: ${fechaIngresoAnterior.toISOString()}`);
      console.log(`   Fecha movimiento: ${fechaMovimientoVacuna.toISOString()}`);
      console.log(`   Diferencia con tiempo actual: ${minutosDiferenciaVacuna.toFixed(2)} minutos`);

      const usaFechaActual = minutosDiferenciaVacuna < 5; // Menos de 5 minutos de diferencia
      if (usaFechaActual) {
        console.log(`   ✅ CORRECTO: Usa fecha actual para movimiento`);
      } else {
        console.log(`   ❌ ERROR: No usa fecha actual (usa fecha ingreso del lote)`);
      }
    } else {
      console.log(`   ❌ No se encontró movimiento de vacuna en Kardex`);
    }

    // 9. Analizar movimiento de jeringa
    if (movimientoJeringa) {
      const fechaMovimientoJeringa = new Date(movimientoJeringa.fechaMovimiento);
      const diferenciaJeringa = Math.abs(fechaMovimientoJeringa.getTime() - tiempoInicioPrueba.getTime());
      const minutosDiferenciaJeringa = diferenciaJeringa / (1000 * 60);

      console.log(`\n💉 JERINGA - Movimiento Kardex:`);
      console.log(`   Fecha ingreso lote: ${fechaIngresoAnterior.toISOString()}`);
      console.log(`   Fecha movimiento: ${fechaMovimientoJeringa.toISOString()}`);
      console.log(`   Diferencia con tiempo actual: ${minutosDiferenciaJeringa.toFixed(2)} minutos`);

      const usaFechaActual = minutosDiferenciaJeringa < 5; // Menos de 5 minutos de diferencia
      if (usaFechaActual) {
        console.log(`   ✅ CORRECTO: Usa fecha actual para movimiento`);
      } else {
        console.log(`   ❌ ERROR: No usa fecha actual (usa fecha ingreso del lote)`);
      }
    } else {
      console.log(`   ❌ No se encontró movimiento de jeringa en Kardex`);
    }

    // 10. Resumen
    const vacunaCorrecta = movimientoVacuna && Math.abs(new Date(movimientoVacuna.fechaMovimiento).getTime() - tiempoInicioPrueba.getTime()) < 5 * 60 * 1000;
    const jeringaCorrecta = movimientoJeringa && Math.abs(new Date(movimientoJeringa.fechaMovimiento).getTime() - tiempoInicioPrueba.getTime()) < 5 * 60 * 1000;

    console.log('\n🎯 RESUMEN:');
    console.log(`   ✅ Vacuna usa fecha actual: ${vacunaCorrecta ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Jeringa usa fecha actual: ${jeringaCorrecta ? 'SÍ' : 'NO'}`);

    if (vacunaCorrecta && jeringaCorrecta) {
      console.log('\n🎉 ¡PROBLEMA SOLUCIONADO! Ambos tipos usan fecha actual para movimientos');
    } else {
      console.log('\n❌ El problema persiste en algunos casos');
    }

    // 11. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    
    if (movimientoVacuna) {
      await prisma.kardex.delete({ where: { id: movimientoVacuna.id } });
    }
    if (movimientoJeringa) {
      await prisma.kardex.delete({ where: { id: movimientoJeringa.id } });
    }
    
    await prisma.loteVacuna.delete({ where: { id: loteVacunaCreado.id } });
    await prisma.loteJeringa.delete({ where: { id: loteJeringaCreado.id } });
    
    console.log('✅ Datos de prueba eliminados');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    if (axios.isAxiosError(error)) {
      console.error('   Detalles HTTP:', error.response?.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testFechaMovimientoFix();
