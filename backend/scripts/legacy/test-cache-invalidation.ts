import { PrismaClient } from '@prisma/client';
import { AlmacenCentralService } from '../src/services/AlmacenCentralService';
import { LoteVacunaService } from '../src/services/LoteVacunaService';

const prisma = new PrismaClient();

async function testCacheInvalidation() {
  try {
    console.log('🧪 Probando invalidación de cache del AlmacenCentralService...\n');

    // 1. Obtener almacén central (esto debería crear cache)
    console.log('1️⃣ Obteniendo almacén central (primera vez)...');
    const result1 = await AlmacenCentralService.obtenerIdAlmacenCentral();
    
    if (!result1.success) {
      console.log(`❌ Error: ${result1.error}`);
      return;
    }

    console.log(`✅ Almacén central obtenido: ${result1.data}`);

    // 2. Verificar que el establecimiento existe
    const establecimiento1 = await prisma.establecimiento.findUnique({
      where: { id: result1.data },
      select: { id: true, nombre: true, codigo: true }
    });

    if (!establecimiento1) {
      console.log('❌ Establecimiento no encontrado en BD');
      return;
    }

    console.log(`✅ Establecimiento verificado: ${establecimiento1.nombre} (${establecimiento1.codigo})`);

    // 3. Simular eliminación de datos (como hace el seeder)
    console.log('\n2️⃣ Simulando eliminación de datos (como npm run db:seed)...');
    
    // Eliminar el establecimiento específico
    await prisma.establecimiento.delete({
      where: { id: result1.data }
    });
    
    console.log('🗑️ Establecimiento eliminado de la BD');

    // 4. Intentar obtener almacén central nuevamente (debería detectar cache inválido)
    console.log('\n3️⃣ Intentando obtener almacén central con cache inválido...');
    const result2 = await AlmacenCentralService.obtenerIdAlmacenCentral();
    
    if (!result2.success) {
      console.log(`❌ Error: ${result2.error}`);
      return;
    }

    console.log(`✅ Almacén central obtenido (nuevo): ${result2.data}`);

    // 5. Verificar que el nuevo establecimiento existe
    const establecimiento2 = await prisma.establecimiento.findUnique({
      where: { id: result2.data },
      select: { id: true, nombre: true, codigo: true }
    });

    if (!establecimiento2) {
      console.log('❌ Nuevo establecimiento no encontrado en BD');
      return;
    }

    console.log(`✅ Nuevo establecimiento verificado: ${establecimiento2.nombre} (${establecimiento2.codigo})`);

    // 6. Probar creación de lote con el nuevo establecimiento
    console.log('\n4️⃣ Probando creación de lote con nuevo establecimiento...');
    
    // Obtener una vacuna activa
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' },
      select: { id: true, nombre: true }
    });

    if (!vacuna) {
      console.log('❌ No hay vacunas activas para probar');
      return;
    }

    const loteData = {
      numero: `TEST-CACHE-${Date.now()}`,
      vacunaId: vacuna.id,
      fechaIngreso: new Date(),
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      formaIngreso: 'PRIMER_TRIMESTRE' as const,
      comprobanteClase: 'PECOSA' as const,
      numeroComprobante: `TEST-${Date.now()}`,
      cantidadInicial: 100,
      cantidadActual: 100
    };

    const loteResult = await LoteVacunaService.create(loteData);

    if (loteResult.success) {
      console.log(`✅ Lote creado exitosamente: ${loteResult.data.numero}`);
      console.log(`   - Cantidad actual: ${loteResult.data.cantidadActual}`);
      
      // Verificar movimiento Kardex
      const movimiento = await prisma.kardex.findFirst({
        where: { loteId: loteResult.data.id },
        select: { id: true, establecimientoDestinoId: true }
      });

      if (movimiento) {
        console.log(`✅ Movimiento Kardex creado: ${movimiento.id}`);
        console.log(`   - Establecimiento destino: ${movimiento.establecimientoDestinoId}`);
        
        if (movimiento.establecimientoDestinoId === result2.data) {
          console.log('✅ El movimiento Kardex usa el nuevo establecimiento correctamente');
        } else {
          console.log('⚠️ El movimiento Kardex usa un establecimiento diferente');
        }
      } else {
        console.log('❌ No se creó movimiento Kardex');
      }
    } else {
      console.log(`❌ Error al crear lote: ${loteResult.error}`);
    }

    console.log('\n🎉 Prueba de invalidación de cache completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar prueba
testCacheInvalidation();
