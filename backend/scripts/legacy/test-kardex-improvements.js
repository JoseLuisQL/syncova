const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testKardexImprovements() {
  console.log('🧪 Iniciando pruebas de mejoras en Kardex...\n');

  try {
    // 1. Verificar que ALMACÉN (CHANKA) existe
    console.log('1️⃣ Verificando existencia de ALMACÉN (CHANKA)...');
    const almacenChanka = await prisma.centroAcopio.findUnique({
      where: { codigo: 'CHANKA-001' }
    });

    if (almacenChanka) {
      console.log(`✅ ALMACÉN (CHANKA) encontrado: ${almacenChanka.nombre} (ID: ${almacenChanka.id})`);
    } else {
      console.log('❌ ALMACÉN (CHANKA) no encontrado');
      return;
    }

    // 2. Probar creación de lote de vacuna y verificar registro en Kardex
    console.log('\n2️⃣ Probando creación de lote de vacuna...');
    
    // Obtener una vacuna existente
    const vacuna = await prisma.vacuna.findFirst({
      where: { estado: 'activo' }
    });

    if (!vacuna) {
      console.log('❌ No se encontró vacuna activa para prueba');
      return;
    }

    // Contar movimientos de Kardex antes
    const kardexAntes = await prisma.kardex.count();
    console.log(`📊 Movimientos en Kardex antes: ${kardexAntes}`);

    // Crear lote de vacuna
    const loteVacuna = await prisma.loteVacuna.create({
      data: {
        numero: `TEST-VAC-${Date.now()}`,
        vacunaId: vacuna.id,
        fechaIngreso: new Date(),
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        formaIngreso: 'PRIMER_TRIMESTRE',
        comprobanteClase: 'PECOSA',
        numeroComprobante: `PECOSA-${Date.now()}`,
        cantidadInicial: 100,
        cantidadActual: 100,
        estado: 'disponible'
      }
    });

    console.log(`✅ Lote de vacuna creado: ${loteVacuna.numero}`);

    // Verificar que se creó movimiento en Kardex
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar un poco para el procesamiento asíncrono
    
    const kardexDespues = await prisma.kardex.count();
    console.log(`📊 Movimientos en Kardex después: ${kardexDespues}`);

    if (kardexDespues > kardexAntes) {
      console.log('✅ Se registró movimiento en Kardex automáticamente');
      
      // Verificar detalles del movimiento
      const movimientoKardex = await prisma.kardex.findFirst({
        where: {
          loteId: loteVacuna.id,
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

    // 3. Probar creación de lote de jeringa
    console.log('\n3️⃣ Probando creación de lote de jeringa...');
    
    const jeringa = await prisma.jeringa.findFirst({
      where: { estado: 'activo' }
    });

    if (!jeringa) {
      console.log('❌ No se encontró jeringa activa para prueba');
      return;
    }

    const kardexAntesJeringa = await prisma.kardex.count();
    
    const loteJeringa = await prisma.loteJeringa.create({
      data: {
        numero: `TEST-JER-${Date.now()}`,
        jeringaId: jeringa.id,
        fechaIngreso: new Date(),
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        formaIngreso: 'PRIMER_TRIMESTRE',
        comprobanteClase: 'PECOSA',
        numeroComprobante: `PECOSA-JER-${Date.now()}`,
        cantidadInicial: 50,
        cantidadActual: 50,
        estado: 'disponible'
      }
    });

    console.log(`✅ Lote de jeringa creado: ${loteJeringa.numero}`);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const kardexDespuesJeringa = await prisma.kardex.count();
    
    if (kardexDespuesJeringa > kardexAntesJeringa) {
      console.log('✅ Se registró movimiento de jeringa en Kardex automáticamente');
    } else {
      console.log('❌ NO se registró movimiento de jeringa en Kardex automáticamente');
    }

    // 4. Verificar movimientos existentes en Kardex
    console.log('\n4️⃣ Verificando movimientos existentes en Kardex...');
    
    const movimientosKardex = await prisma.kardex.findMany({
      include: {
        establecimientoOrigen: {
          select: { nombre: true, codigo: true }
        },
        establecimientoDestino: {
          select: { nombre: true, codigo: true }
        }
      },
      orderBy: { fechaMovimiento: 'desc' },
      take: 10
    });

    console.log(`📊 Últimos ${movimientosKardex.length} movimientos en Kardex:`);
    
    let movimientosConEstablecimientos = 0;
    let movimientosSinEstablecimientos = 0;
    
    movimientosKardex.forEach((mov, index) => {
      console.log(`   ${index + 1}. ${mov.tipoMovimiento} - ${mov.tipo} - ${mov.cantidad} unidades`);
      console.log(`      Origen: ${mov.establecimientoOrigen?.nombre || 'NULL'}`);
      console.log(`      Destino: ${mov.establecimientoDestino?.nombre || 'NULL'}`);
      console.log(`      Documento: ${mov.documento} - ${mov.numeroDocumento}`);
      
      if (mov.establecimientoOrigenId || mov.establecimientoDestinoId) {
        movimientosConEstablecimientos++;
      } else {
        movimientosSinEstablecimientos++;
      }
      console.log('');
    });

    console.log(`📈 Resumen de establecimientos en Kardex:`);
    console.log(`   - Con establecimientos: ${movimientosConEstablecimientos}`);
    console.log(`   - Sin establecimientos: ${movimientosSinEstablecimientos}`);

    // 5. Limpiar datos de prueba
    console.log('\n5️⃣ Limpiando datos de prueba...');
    
    await prisma.kardex.deleteMany({
      where: {
        OR: [
          { loteId: loteVacuna.id },
          { loteId: loteJeringa.id }
        ]
      }
    });
    
    await prisma.loteVacuna.delete({
      where: { id: loteVacuna.id }
    });
    
    await prisma.loteJeringa.delete({
      where: { id: loteJeringa.id }
    });
    
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 Pruebas de mejoras en Kardex completadas!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar las pruebas
testKardexImprovements();
