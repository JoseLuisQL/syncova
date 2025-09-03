import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function testFinalValidation() {
  try {
    console.log('🧪 PRUEBA FINAL: Validación completa del sistema\n');

    // 1. Obtener vacuna AMA o similar
    let vacuna = await prisma.vacuna.findFirst({
      where: { 
        nombre: { contains: 'AMA', mode: 'insensitive' },
        estado: 'activo' 
      }
    });

    if (!vacuna) {
      vacuna = await prisma.vacuna.findFirst({
        where: { estado: 'activo' }
      });
    }

    if (!vacuna) {
      console.error('❌ No se encontró vacuna activa');
      return;
    }

    console.log(`✅ Vacuna: ${vacuna.nombre}`);

    // 2. Crear lote con datos similares al caso reportado
    const fechaIngresoAnterior = new Date('2025-09-02T19:00:00.000Z'); // Fecha anterior
    const tiempoActual = new Date();

    const loteData = {
      numero: `VAC-2025-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      vacunaId: vacuna.id,
      fechaIngreso: fechaIngresoAnterior.toISOString(),
      fechaVencimiento: new Date('2027-09-15').toISOString(),
      formaIngreso: '3° TRIMESTRE',
      comprobanteClase: 'PECOSA',
      numeroComprobante: '444',
      cantidadInicial: 100,
      cantidadActual: 100,
      observaciones: 'Validación final del sistema'
    };

    console.log(`\n📦 Creando lote:`);
    console.log(`   Número: ${loteData.numero}`);
    console.log(`   Fecha ingreso (lote): ${fechaIngresoAnterior.toISOString()}`);
    console.log(`   Tiempo actual: ${tiempoActual.toISOString()}`);
    console.log(`   Cantidad inicial: ${loteData.cantidadInicial}`);

    // 3. Crear lote via API
    const response = await axios.post('http://localhost:3001/api/lotes-vacunas', loteData);
    
    if (response.status !== 201) {
      console.error(`❌ Error HTTP: ${response.status}`);
      return;
    }

    const loteCreado = response.data.data;
    console.log(`✅ Lote creado: ${loteCreado.numero}`);

    // 4. Esperar procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Verificar lote en BD
    const loteEnBD = await prisma.loteVacuna.findUnique({
      where: { id: loteCreado.id },
      include: { vacuna: { select: { nombre: true } } }
    });

    // 6. Verificar movimiento Kardex
    const movimientoKardex = await prisma.kardex.findFirst({
      where: {
        loteId: loteCreado.id,
        tipo: 'vacuna',
        tipoMovimiento: 'ingreso'
      }
    });

    if (!loteEnBD || !movimientoKardex) {
      console.error('❌ No se encontraron datos en BD');
      return;
    }

    // 7. Análisis completo
    console.log('\n📊 RESULTADOS FINALES:');
    
    // Problema 1: Duplicación de cantidades
    const cantidadCorrecta = loteEnBD.cantidadActual === loteEnBD.cantidadInicial;
    console.log(`\n🔍 PROBLEMA 1 - Duplicación de cantidades:`);
    console.log(`   Cantidad inicial: ${loteEnBD.cantidadInicial}`);
    console.log(`   Cantidad actual: ${loteEnBD.cantidadActual}`);
    console.log(`   Estado: ${cantidadCorrecta ? '✅ SOLUCIONADO' : '❌ PERSISTE'}`);

    // Problema 2: Fecha de movimiento
    const fechaMovimiento = new Date(movimientoKardex.fechaMovimiento);
    const fechaIngreso = new Date(loteEnBD.fechaIngreso);
    const diferenciaConActual = Math.abs(fechaMovimiento.getTime() - tiempoActual.getTime()) / (1000 * 60);
    const usaFechaIngreso = Math.abs(fechaMovimiento.getTime() - fechaIngreso.getTime()) < 60000; // 1 minuto
    
    console.log(`\n🔍 PROBLEMA 2 - Fecha de movimiento:`);
    console.log(`   Fecha ingreso lote: ${fechaIngreso.toISOString()}`);
    console.log(`   Fecha movimiento: ${fechaMovimiento.toISOString()}`);
    console.log(`   Diferencia con tiempo actual: ${diferenciaConActual.toFixed(2)} minutos`);
    console.log(`   Estado: ${!usaFechaIngreso && diferenciaConActual < 5 ? '✅ SOLUCIONADO' : '❌ PERSISTE'}`);

    // 8. Mostrar registro como aparecería en BD
    console.log('\n📋 REGISTRO EN BASE DE DATOS (como aparecería):');
    console.log(`"${movimientoKardex.id}"\t"${movimientoKardex.tipoMovimiento}"\t${movimientoKardex.cantidad}\t${movimientoKardex.saldoAnterior}\t${movimientoKardex.saldoActual}\t\t"${movimientoKardex.establecimientoDestinoId}"\t"${movimientoKardex.documento}"\t"${movimientoKardex.numeroDocumento}"\t"${movimientoKardex.observaciones}"\t"${movimientoKardex.usuarioId}"\t"${fechaMovimiento.toISOString()}"\t"${movimientoKardex.createdAt.toISOString()}"`);

    // 9. Comparación con caso reportado
    console.log('\n📋 COMPARACIÓN CON CASO REPORTADO:');
    console.log(`   ANTES: fecha_movimiento = "2025-09-02 19:00:00-05" (fecha ingreso)`);
    console.log(`   AHORA: fecha_movimiento = "${fechaMovimiento.toISOString()}" (fecha actual)`);

    // 10. Resumen final
    const todoSolucionado = cantidadCorrecta && !usaFechaIngreso && diferenciaConActual < 5;
    
    console.log('\n🎯 RESUMEN FINAL:');
    console.log(`   ✅ Cantidades correctas: ${cantidadCorrecta ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Fecha movimiento actual: ${!usaFechaIngreso && diferenciaConActual < 5 ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Kardex registrado: SÍ`);
    console.log(`   ✅ Estado lote: ${loteEnBD.estado}`);

    if (todoSolucionado) {
      console.log('\n🎉 ¡TODOS LOS PROBLEMAS SOLUCIONADOS!');
      console.log('   ✅ No hay duplicación de cantidades');
      console.log('   ✅ Fecha de movimiento usa tiempo actual');
      console.log('   ✅ Sistema Kardex funciona correctamente');
    } else {
      console.log('\n⚠️ Algunos problemas pueden persistir');
    }

    // 11. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await prisma.kardex.delete({ where: { id: movimientoKardex.id } });
    await prisma.loteVacuna.delete({ where: { id: loteEnBD.id } });
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
testFinalValidation();
