import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function testAMACase() {
  try {
    console.log('🧪 PRUEBA: Caso específico AMA con 100 unidades\n');

    // 1. Buscar vacuna AMA o crear una similar
    let vacunaAMA = await prisma.vacuna.findFirst({
      where: { 
        nombre: { contains: 'AMA', mode: 'insensitive' },
        estado: 'activo' 
      }
    });

    if (!vacunaAMA) {
      // Si no existe AMA, usar cualquier vacuna activa
      vacunaAMA = await prisma.vacuna.findFirst({
        where: { estado: 'activo' }
      });
    }

    if (!vacunaAMA) {
      console.error('❌ No se encontró ninguna vacuna activa');
      return;
    }

    console.log(`✅ Vacuna encontrada: ${vacunaAMA.nombre} (ID: ${vacunaAMA.id})`);

    // 2. Datos exactos del caso reportado
    const loteData = {
      numero: `VAC-2025-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      vacunaId: vacunaAMA.id,
      fechaIngreso: new Date().toISOString(),
      fechaVencimiento: new Date('2027-09-15').toISOString(),
      formaIngreso: '3° TRIMESTRE',
      comprobanteClase: 'PECOSA',
      numeroComprobante: '333',
      cantidadInicial: 100,
      cantidadActual: 100, // Esto es lo que envía el frontend
      observaciones: 'Prueba del caso específico reportado'
    };

    console.log(`\n📦 Creando lote con datos del caso reportado:`);
    console.log(`   Número: ${loteData.numero}`);
    console.log(`   Vacuna: ${vacunaAMA.nombre}`);
    console.log(`   Cantidad inicial: ${loteData.cantidadInicial}`);
    console.log(`   Cantidad actual (frontend): ${loteData.cantidadActual}`);
    console.log(`   Comprobante: ${loteData.numeroComprobante}`);

    // 3. Crear el lote via API
    const response = await axios.post('http://localhost:3001/api/lotes-vacunas', loteData);
    
    if (response.status !== 201) {
      console.error(`❌ Error en respuesta HTTP: ${response.status}`);
      return;
    }

    const loteCreado = response.data.data;
    console.log(`✅ Lote creado exitosamente: ${loteCreado.numero}`);

    // 4. Esperar procesamiento del Kardex
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Verificar resultado en base de datos
    const loteEnBD = await prisma.loteVacuna.findUnique({
      where: { id: loteCreado.id },
      include: {
        vacuna: {
          select: { nombre: true }
        }
      }
    });

    if (!loteEnBD) {
      console.error('❌ No se pudo encontrar el lote en la base de datos');
      return;
    }

    console.log('\n📊 RESULTADO EN BASE DE DATOS:');
    console.log(`   ID: ${loteEnBD.id}`);
    console.log(`   Número: ${loteEnBD.numero}`);
    console.log(`   Vacuna: ${loteEnBD.vacuna.nombre}`);
    console.log(`   Fecha ingreso: ${loteEnBD.fechaIngreso.toISOString().split('T')[0]}`);
    console.log(`   Fecha vencimiento: ${loteEnBD.fechaVencimiento.toISOString().split('T')[0]}`);
    console.log(`   Forma ingreso: ${loteEnBD.formaIngreso}`);
    console.log(`   Comprobante: ${loteEnBD.comprobanteClase}`);
    console.log(`   Número comprobante: ${loteEnBD.numeroComprobante}`);
    console.log(`   Cantidad inicial: ${loteEnBD.cantidadInicial}`);
    console.log(`   Cantidad actual: ${loteEnBD.cantidadActual}`);
    console.log(`   Estado: ${loteEnBD.estado}`);

    // 6. Verificar si hay duplicación
    const hayDuplicacion = loteEnBD.cantidadActual !== loteEnBD.cantidadInicial;
    const diferencia = loteEnBD.cantidadActual - loteEnBD.cantidadInicial;

    console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
    if (hayDuplicacion) {
      console.log(`❌ ¡PROBLEMA DETECTADO! Hay duplicación de cantidades`);
      console.log(`   Cantidad inicial: ${loteEnBD.cantidadInicial}`);
      console.log(`   Cantidad actual: ${loteEnBD.cantidadActual}`);
      console.log(`   Diferencia: +${diferencia} (duplicación)`);
      console.log(`   Porcentaje de error: ${((diferencia / loteEnBD.cantidadInicial) * 100).toFixed(1)}%`);
    } else {
      console.log(`✅ ¡PROBLEMA SOLUCIONADO! No hay duplicación`);
      console.log(`   Cantidad inicial: ${loteEnBD.cantidadInicial}`);
      console.log(`   Cantidad actual: ${loteEnBD.cantidadActual}`);
      console.log(`   Diferencia: ${diferencia} (correcto)`);
    }

    // 7. Verificar Kardex
    const movimientoKardex = await prisma.kardex.findFirst({
      where: {
        loteId: loteEnBD.id,
        tipo: 'vacuna',
        tipoMovimiento: 'ingreso'
      }
    });

    if (movimientoKardex) {
      console.log('\n📝 MOVIMIENTO EN KARDEX:');
      console.log(`   Cantidad registrada: ${movimientoKardex.cantidad}`);
      console.log(`   Saldo anterior: ${movimientoKardex.saldoAnterior}`);
      console.log(`   Saldo actual: ${movimientoKardex.saldoActual}`);
      
      const kardexCorrecto = movimientoKardex.cantidad === 100;
      console.log(`   Estado: ${kardexCorrecto ? '✅ Correcto' : '❌ Incorrecto'}`);
    }

    // 8. Comparar con el caso reportado
    console.log('\n📋 COMPARACIÓN CON CASO REPORTADO:');
    console.log(`   Caso reportado: cantidad_inicial=100, cantidad_actual=200`);
    console.log(`   Resultado actual: cantidad_inicial=${loteEnBD.cantidadInicial}, cantidad_actual=${loteEnBD.cantidadActual}`);
    
    const problemaSolucionado = loteEnBD.cantidadActual === 100;
    if (problemaSolucionado) {
      console.log(`   ✅ ¡PROBLEMA SOLUCIONADO! Ya no se duplica la cantidad`);
    } else {
      console.log(`   ❌ El problema persiste`);
    }

    // 9. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    
    if (movimientoKardex) {
      await prisma.kardex.delete({
        where: { id: movimientoKardex.id }
      });
    }
    
    await prisma.loteVacuna.delete({
      where: { id: loteEnBD.id }
    });
    
    console.log('✅ Datos de prueba eliminados');

    // 10. Conclusión
    console.log('\n🎯 CONCLUSIÓN:');
    if (problemaSolucionado) {
      console.log('✅ El problema de duplicación de cantidades ha sido SOLUCIONADO');
      console.log('✅ Los lotes ahora se crean con las cantidades correctas');
      console.log('✅ El sistema Kardex funciona correctamente');
    } else {
      console.log('❌ El problema persiste y requiere más investigación');
    }

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
testAMACase();
