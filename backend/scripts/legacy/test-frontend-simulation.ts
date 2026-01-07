import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function testFrontendSimulation() {
  try {
    console.log('🧪 PRUEBA: Simular creación de lote desde frontend\n');

    // 1. Obtener una vacuna existente
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' }
    });

    if (!vacuna) {
      console.error('❌ No se encontró ninguna vacuna activa');
      return;
    }

    console.log(`✅ Vacuna encontrada: ${vacuna.nombre} (ID: ${vacuna.id})`);

    // 2. Simular datos del frontend (exactamente como los envía LotesVacunasPage.tsx)
    const cantidadInicial = 150;
    const frontendData = {
      numero: `FRONTEND-TEST-${Date.now()}`,
      vacunaId: vacuna.id,
      fechaIngreso: new Date().toISOString(),
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      formaIngreso: '3° TRIMESTRE', // Valor del frontend
      comprobanteClase: 'PECOSA',
      numeroComprobante: `PECOSA-FRONTEND-${Date.now()}`,
      cantidadInicial,
      cantidadActual: cantidadInicial, // Frontend envía esto, pero debería ser ignorado
      observaciones: 'Lote de prueba simulando frontend'
    };

    console.log(`\n📦 Enviando datos del frontend:`);
    console.log(`   Cantidad inicial: ${frontendData.cantidadInicial}`);
    console.log(`   Cantidad actual: ${frontendData.cantidadActual}`);
    console.log(`   Forma ingreso: ${frontendData.formaIngreso}`);

    // 3. Hacer petición HTTP al backend (como lo hace el frontend)
    const response = await axios.post('http://localhost:3001/api/lotes-vacunas', frontendData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 201) {
      console.error(`❌ Error en respuesta HTTP: ${response.status}`);
      return;
    }

    const loteCreado = response.data.data;
    console.log(`✅ Lote creado exitosamente: ${loteCreado.numero}`);

    // 4. Esperar un momento para que se procese el Kardex
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Verificar el lote en la base de datos
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

    console.log('\n📊 RESULTADOS EN BASE DE DATOS:');
    console.log(`   Número de lote: ${loteEnBD.numero}`);
    console.log(`   Vacuna: ${loteEnBD.vacuna.nombre}`);
    console.log(`   Cantidad inicial: ${loteEnBD.cantidadInicial}`);
    console.log(`   Cantidad actual: ${loteEnBD.cantidadActual}`);
    console.log(`   Estado: ${loteEnBD.estado}`);
    console.log(`   Forma ingreso: ${loteEnBD.formaIngreso}`);

    // 6. Verificar que las cantidades son correctas
    const esCorrecta = loteEnBD.cantidadActual === loteEnBD.cantidadInicial;
    if (esCorrecta) {
      console.log('\n✅ ¡ÉXITO! Las cantidades son correctas (no hay duplicación)');
    } else {
      console.log('\n❌ ¡ERROR! Hay duplicación de cantidades');
      console.log(`   Esperado: ${loteEnBD.cantidadInicial}`);
      console.log(`   Actual: ${loteEnBD.cantidadActual}`);
      console.log(`   Diferencia: ${loteEnBD.cantidadActual - loteEnBD.cantidadInicial}`);
    }

    // 7. Verificar movimiento en Kardex
    const movimientoKardex = await prisma.kardex.findFirst({
      where: {
        loteId: loteEnBD.id,
        tipo: 'vacuna',
        tipoMovimiento: 'ingreso'
      },
      include: {
        establecimientoDestino: {
          select: { nombre: true }
        }
      }
    });

    if (movimientoKardex) {
      console.log('\n📝 MOVIMIENTO EN KARDEX:');
      console.log(`   Tipo: ${movimientoKardex.tipoMovimiento}`);
      console.log(`   Cantidad: ${movimientoKardex.cantidad}`);
      console.log(`   Saldo anterior: ${movimientoKardex.saldoAnterior}`);
      console.log(`   Saldo actual: ${movimientoKardex.saldoActual}`);
      console.log(`   Destino: ${movimientoKardex.establecimientoDestino?.nombre || 'N/A'}`);
      
      const kardexCorrecto = movimientoKardex.cantidad === cantidadInicial;
      if (kardexCorrecto) {
        console.log('✅ El movimiento en Kardex tiene la cantidad correcta');
      } else {
        console.log('❌ El movimiento en Kardex tiene cantidad incorrecta');
      }
    } else {
      console.log('\n⚠️ No se encontró movimiento en Kardex');
    }

    // 8. Verificar que el mapeo de forma de ingreso funcionó
    const formaIngresoCorrecta = loteEnBD.formaIngreso === 'TERCER_TRIMESTRE';
    if (formaIngresoCorrecta) {
      console.log('✅ El mapeo de forma de ingreso funcionó correctamente');
    } else {
      console.log(`❌ Error en mapeo de forma de ingreso: ${loteEnBD.formaIngreso}`);
    }

    // 9. Resumen final
    console.log('\n🎯 RESUMEN FINAL:');
    console.log(`   ✅ Cantidades correctas: ${esCorrecta ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Kardex registrado: ${movimientoKardex ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Forma ingreso mapeada: ${formaIngresoCorrecta ? 'SÍ' : 'NO'}`);
    
    const todoExitoso = esCorrecta && movimientoKardex && formaIngresoCorrecta;
    if (todoExitoso) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El problema está solucionado.');
    } else {
      console.log('\n❌ Algunas pruebas fallaron. Revisar implementación.');
    }

    // 10. Limpiar datos de prueba
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
testFrontendSimulation();
