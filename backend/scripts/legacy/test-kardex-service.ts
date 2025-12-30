import { prisma } from '../src/config/database';
import { KardexService } from '../src/services/KardexService';
import { AlmacenCentralService } from '../src/services/AlmacenCentralService';
import { TipoMovimientoKardex } from '@prisma/client';

async function testKardexService() {
  console.log('🧪 Probando KardexService directamente...\n');

  try {
    // 1. Obtener ID del almacén central
    console.log('1️⃣ Obteniendo ID del almacén central...');
    const almacenResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
    
    if (!almacenResult.success) {
      console.log(`❌ No se pudo obtener almacén central: ${almacenResult.error}`);
      return;
    }

    const almacenCentralId = almacenResult.data;
    console.log(`✅ ID del almacén central: ${almacenCentralId}`);

    // 2. Obtener una vacuna y lote para prueba
    console.log('\n2️⃣ Obteniendo vacuna y lote para prueba...');
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' }
    });

    if (!vacuna) {
      console.log('❌ No se encontró vacuna activa');
      return;
    }

    const lote = await prisma.loteVacuna.findFirst({
      where: { 
        vacunaId: vacuna.id,
        estado: 'disponible'
      }
    });

    if (!lote) {
      console.log('❌ No se encontró lote disponible');
      return;
    }

    console.log(`✅ Vacuna: ${vacuna.nombre} (${vacuna.id})`);
    console.log(`✅ Lote: ${lote.numero} (${lote.id})`);

    // 3. Obtener usuario administrador
    console.log('\n3️⃣ Obteniendo usuario administrador...');
    const usuario = await prisma.usuario.findFirst({
      where: { 
        rol: 'administrador',
        estado: 'activo'
      }
    });

    if (!usuario) {
      console.log('❌ No se encontró usuario administrador');
      return;
    }

    console.log(`✅ Usuario: ${usuario.nombres} ${usuario.apellidos} (${usuario.id})`);

    // 4. Probar generarMovimientoAutomatico
    console.log('\n4️⃣ Probando generarMovimientoAutomatico...');
    
    const kardexData = {
      tipo: 'vacuna' as const,
      itemId: vacuna.id,
      loteId: lote.id,
      tipoMovimiento: TipoMovimientoKardex.ingreso,
      cantidad: 10,
      establecimientoDestinoId: almacenCentralId,
      documento: 'PECOSA' as const,
      numeroDocumento: `TEST-${Date.now()}`,
      observaciones: 'Prueba de registro automático en Kardex',
      usuarioId: usuario.id,
      fechaMovimiento: new Date()
    };

    console.log('📝 Datos para Kardex:');
    console.log(`   - Tipo: ${kardexData.tipo}`);
    console.log(`   - Item ID: ${kardexData.itemId}`);
    console.log(`   - Lote ID: ${kardexData.loteId}`);
    console.log(`   - Tipo Movimiento: ${kardexData.tipoMovimiento}`);
    console.log(`   - Cantidad: ${kardexData.cantidad}`);
    console.log(`   - Establecimiento Destino ID: ${kardexData.establecimientoDestinoId}`);
    console.log(`   - Usuario ID: ${kardexData.usuarioId}`);

    const kardexResult = await KardexService.generarMovimientoAutomatico(kardexData);

    if (kardexResult.success) {
      console.log('✅ Movimiento de Kardex creado exitosamente!');
      console.log(`   - ID: ${kardexResult.data.id}`);
      
      // Limpiar el movimiento de prueba
      await prisma.kardex.delete({
        where: { id: kardexResult.data.id }
      });
      console.log('🧹 Movimiento de prueba eliminado');
      
    } else {
      console.log(`❌ Error al crear movimiento de Kardex: ${kardexResult.error}`);
    }

    console.log('\n🎉 Prueba de KardexService completada!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testKardexService();
