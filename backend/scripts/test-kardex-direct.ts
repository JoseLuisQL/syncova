import { prisma } from '../src/config/database';
import { LoteVacunaService } from '../src/services/LoteVacunaService';
import { LoteJeringaService } from '../src/services/LoteJeringaService';
import { AlmacenCentralService } from '../src/services/AlmacenCentralService';

async function testKardexDirect() {
  console.log('🧪 Iniciando pruebas directas de mejoras en Kardex...\n');

  try {
    // 1. Verificar que ALMACÉN (CHANKA) existe
    console.log('1️⃣ Verificando existencia de ALMACÉN (CHANKA)...');
    const almacenResult = await AlmacenCentralService.obtenerAlmacenCentral();
    
    if (almacenResult.success) {
      console.log(`✅ ALMACÉN (CHANKA) encontrado: ${almacenResult.data.nombre} (ID: ${almacenResult.data.id})`);
    } else {
      console.log(`❌ ALMACÉN (CHANKA) no encontrado: ${almacenResult.error}`);
      return;
    }

    // 2. Obtener una vacuna existente
    console.log('\n2️⃣ Obteniendo vacuna para prueba...');
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' }
    });

    if (!vacuna) {
      console.log('❌ No se encontró vacuna activa para prueba');
      return;
    }

    console.log(`✅ Vacuna encontrada: ${vacuna.nombre} (ID: ${vacuna.id})`);

    // 3. Contar movimientos de Kardex antes
    const kardexAntes = await prisma.kardex.count();
    console.log(`📊 Movimientos en Kardex antes: ${kardexAntes}`);

    // 4. Crear lote de vacuna usando el servicio
    console.log('\n3️⃣ Creando lote de vacuna usando LoteVacunaService...');
    
    const loteData = {
      numero: `TEST-DIRECT-${Date.now()}`,
      vacunaId: vacuna.id,
      fechaIngreso: new Date(),
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      formaIngreso: 'PRIMER_TRIMESTRE' as const,
      comprobanteClase: 'PECOSA' as const,
      numeroComprobante: `PECOSA-DIRECT-${Date.now()}`,
      cantidadInicial: 100,
      cantidadActual: 100,
      observaciones: 'Lote de prueba para validar Kardex'
    };

    const resultLote = await LoteVacunaService.create(loteData);
    
    if (resultLote.success) {
      console.log(`✅ Lote creado exitosamente: ${resultLote.data.numero}`);
      
      // 5. Verificar movimientos de Kardex después
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar procesamiento
      
      const kardexDespues = await prisma.kardex.count();
      console.log(`📊 Movimientos en Kardex después: ${kardexDespues}`);
      
      if (kardexDespues > kardexAntes) {
        console.log('✅ Se registró movimiento en Kardex automáticamente');
        
        // Verificar detalles del movimiento
        const movimientoKardex = await prisma.kardex.findFirst({
          where: {
            loteId: resultLote.data.id,
            tipo: 'vacuna'
          },
          include: {
            establecimientoOrigen: true,
            establecimientoDestino: true
          }
        });

        if (movimientoKardex) {
          console.log(`📝 Detalles del movimiento:`);
          console.log(`   - Tipo: ${movimientoKardex.tipoMovimiento}`);
          console.log(`   - Cantidad: ${movimientoKardex.cantidad}`);
          console.log(`   - Documento: ${movimientoKardex.documento}`);
          console.log(`   - Establecimiento Origen: ${movimientoKardex.establecimientoOrigen?.nombre || 'NULL'}`);
          console.log(`   - Establecimiento Destino: ${movimientoKardex.establecimientoDestino?.nombre || 'NULL'}`);
          
          if (movimientoKardex.establecimientoDestino?.codigo === 'CHANKA-001') {
            console.log('✅ Establecimiento destino es ALMACÉN (CHANKA) correctamente');
          } else {
            console.log('❌ Establecimiento destino NO es ALMACÉN (CHANKA)');
          }
        }
      } else {
        console.log('❌ NO se registró movimiento en Kardex automáticamente');
      }
      
      // 6. Limpiar datos de prueba
      console.log('\n4️⃣ Limpiando datos de prueba...');
      
      await prisma.kardex.deleteMany({
        where: { loteId: resultLote.data.id }
      });
      
      await prisma.loteVacuna.delete({
        where: { id: resultLote.data.id }
      });
      
      console.log('✅ Datos de prueba eliminados');
      
    } else {
      console.log(`❌ Error al crear lote: ${resultLote.error}`);
    }

    console.log('\n🎉 Pruebas directas completadas!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar las pruebas
testKardexDirect();
