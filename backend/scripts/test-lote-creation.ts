import { PrismaClient, TipoMovimientoKardex } from '@prisma/client';
import { LoteVacunaService } from '../src/services/LoteVacunaService';
import { KardexService } from '../src/services/KardexService';
import { AlmacenCentralService } from '../src/services/AlmacenCentralService';

const prisma = new PrismaClient();

async function testLoteCreation() {
  try {
    console.log('🧪 Probando creación de lote paso a paso...\n');

    // 1. Obtener una vacuna activa
    console.log('1️⃣ Obteniendo vacuna activa...');
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' },
      select: { id: true, nombre: true }
    });

    if (!vacuna) {
      console.log('❌ No hay vacunas activas');
      return;
    }

    console.log(`✅ Vacuna encontrada: ${vacuna.nombre} (${vacuna.id})`);

    // 2. Verificar almacén central
    console.log('\n2️⃣ Verificando almacén central...');
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

    // 3. Verificar usuario administrador
    console.log('\n3️⃣ Verificando usuario administrador...');
    const usuarioAdmin = await prisma.usuario.findFirst({
      where: {
        rol: 'administrador',
        estado: 'activo'
      },
      select: { id: true, nombres: true, apellidos: true }
    });

    if (!usuarioAdmin) {
      console.log('❌ No hay usuarios administradores activos');
      return;
    }

    console.log(`✅ Usuario administrador: ${usuarioAdmin.nombres} ${usuarioAdmin.apellidos} (${usuarioAdmin.id})`);

    // 4. Probar creación directa de movimiento Kardex
    console.log('\n4️⃣ Probando creación directa de movimiento Kardex...');
    
    // Primero crear un lote temporal para probar
    const loteTemp = await prisma.loteVacuna.create({
      data: {
        numero: `TEST-KARDEX-${Date.now()}`,
        vacunaId: vacuna.id,
        fechaIngreso: new Date(),
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        formaIngreso: 'PRIMER_TRIMESTRE',
        comprobanteClase: 'PECOSA',
        numeroComprobante: `TEST-${Date.now()}`,
        cantidadInicial: 100,
        cantidadActual: 0,
        estado: 'disponible'
      }
    });

    console.log(`✅ Lote temporal creado: ${loteTemp.numero} (${loteTemp.id})`);

    // Probar KardexService directamente
    const kardexData = {
      tipo: 'vacuna' as const,
      itemId: vacuna.id,
      loteId: loteTemp.id,
      tipoMovimiento: TipoMovimientoKardex.ingreso,
      cantidad: 100,
      establecimientoDestinoId: almacenResult.data,
      documento: 'PECOSA',
      numeroDocumento: `TEST-${Date.now()}`,
      observaciones: 'Prueba de creación de movimiento Kardex',
      usuarioId: usuarioAdmin.id,
      fechaMovimiento: new Date()
    };

    console.log('📝 Datos para Kardex:', JSON.stringify(kardexData, null, 2));

    const kardexResult = await KardexService.create(kardexData);

    if (kardexResult.success) {
      console.log('✅ Movimiento Kardex creado exitosamente');
      console.log(`   - ID: ${kardexResult.data.id}`);
      console.log(`   - Saldo anterior: ${kardexResult.data.saldoAnterior}`);
      console.log(`   - Saldo actual: ${kardexResult.data.saldoActual}`);
    } else {
      console.log(`❌ Error al crear movimiento Kardex: ${kardexResult.error}`);
    }

    // Limpiar lote temporal
    await prisma.loteVacuna.delete({ where: { id: loteTemp.id } });
    console.log('🧹 Lote temporal eliminado');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar prueba
testLoteCreation();
