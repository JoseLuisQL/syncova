import { PrismaClient, TipoMovimientoKardex } from '@prisma/client';
import { LoteVacunaService } from '../src/services/LoteVacunaService';
import { AlmacenCentralService } from '../src/services/AlmacenCentralService';

const prisma = new PrismaClient();

async function testLoteServiceFlow() {
  try {
    console.log('🧪 Probando flujo completo de LoteVacunaService...\n');

    // 1. Obtener una vacuna activa (la misma que usaste en el error)
    console.log('1️⃣ Obteniendo vacuna Dt pediatrico normal...');
    const vacuna = await prisma.vacuna.findFirst({
      where: { 
        nombre: { contains: 'Dt', mode: 'insensitive' },
        estado: 'activo' 
      },
      select: { id: true, nombre: true }
    });

    if (!vacuna) {
      console.log('❌ No se encontró la vacuna Dt pediatrico normal');
      return;
    }

    console.log(`✅ Vacuna encontrada: ${vacuna.nombre} (${vacuna.id})`);

    // 2. Preparar datos exactos como en tu error
    const loteData = {
      numero: `DT-TEST-${Date.now()}`,
      vacunaId: vacuna.id,
      fechaIngreso: new Date('2025-09-03T00:00:00.000Z'),
      fechaVencimiento: new Date('2027-09-16T00:00:00.000Z'),
      formaIngreso: 'TERCER_TRIMESTRE' as const,
      comprobanteClase: 'PECOSA' as const,
      numeroComprobante: '11111',
      cantidadInicial: 1000,
      cantidadActual: 1000
    };

    console.log('\n2️⃣ Datos del lote a crear:');
    console.log(JSON.stringify(loteData, null, 2));

    // 3. Verificar almacén central antes de crear el lote
    console.log('\n3️⃣ Verificando almacén central antes de crear lote...');
    const almacenResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
    
    if (!almacenResult.success) {
      console.log(`❌ Error al obtener almacén central: ${almacenResult.error}`);
      return;
    }

    console.log(`✅ Almacén central ID: ${almacenResult.data}`);

    // Verificar que el establecimiento existe
    const establecimiento = await prisma.establecimiento.findUnique({
      where: { id: almacenResult.data },
      select: { id: true, nombre: true, codigo: true, estado: true }
    });

    if (!establecimiento) {
      console.log(`❌ Establecimiento con ID ${almacenResult.data} no encontrado`);
      return;
    }

    console.log(`✅ Establecimiento válido: ${establecimiento.nombre} (${establecimiento.codigo}) - Estado: ${establecimiento.estado}`);

    // 4. Crear el lote usando LoteVacunaService
    console.log('\n4️⃣ Creando lote usando LoteVacunaService...');
    
    const result = await LoteVacunaService.create(loteData);

    if (result.success) {
      console.log(`✅ Lote creado exitosamente: ${result.data.numero}`);
      console.log(`   - ID: ${result.data.id}`);
      console.log(`   - Cantidad actual: ${result.data.cantidadActual}`);
      
      // Verificar si se creó el movimiento en Kardex
      const movimientoKardex = await prisma.kardex.findFirst({
        where: {
          loteId: result.data.id,
          tipo: 'vacuna'
        },
        select: {
          id: true,
          tipoMovimiento: true,
          cantidad: true,
          saldoAnterior: true,
          saldoActual: true,
          establecimientoDestinoId: true
        }
      });

      if (movimientoKardex) {
        console.log('✅ Movimiento Kardex creado:');
        console.log(`   - ID: ${movimientoKardex.id}`);
        console.log(`   - Tipo: ${movimientoKardex.tipoMovimiento}`);
        console.log(`   - Cantidad: ${movimientoKardex.cantidad}`);
        console.log(`   - Saldo anterior: ${movimientoKardex.saldoAnterior}`);
        console.log(`   - Saldo actual: ${movimientoKardex.saldoActual}`);
        console.log(`   - Establecimiento destino: ${movimientoKardex.establecimientoDestinoId}`);
      } else {
        console.log('❌ No se encontró movimiento Kardex para el lote');
      }

      // Verificar cantidad actual del lote
      const loteActualizado = await prisma.loteVacuna.findUnique({
        where: { id: result.data.id },
        select: { cantidadActual: true }
      });

      console.log(`📊 Cantidad actual del lote: ${loteActualizado?.cantidadActual}`);

    } else {
      console.log(`❌ Error al crear lote: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar prueba
testLoteServiceFlow();
