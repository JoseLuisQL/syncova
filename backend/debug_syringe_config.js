const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function debugSyringeConfig() {
  try {
    console.log('🔍 DEBUGGING SYRINGE CONFIGURATION LOGIC\n');

    const valeNumero = '6804-2025-002';

    // 1. Get the vaccines that were processed in the voucher
    console.log('📋 PASO 1: Obteniendo vacunas procesadas en el vale...');
    
    const kardexVacunas = await prisma.kardex.findMany({
      where: {
        numeroDocumento: valeNumero,
        tipo: 'vacuna'
      },
      include: {
        // Get vaccine info through itemId
      }
    });

    console.log(`   Movimientos de vacunas encontrados: ${kardexVacunas.length}`);

    // Get unique vaccine IDs
    const vacunaIds = [...new Set(kardexVacunas.map(k => k.itemId))];
    console.log(`   Vacunas únicas procesadas: ${vacunaIds.length}`);

    // 2. For each vaccine, check what syringe configuration should apply
    for (const vacunaId of vacunaIds) {
      console.log(`\n🔍 ANALIZANDO VACUNA: ${vacunaId}`);
      
      // Get vaccine info
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { nombre: true, dosisPorFrasco: true }
      });

      if (!vacuna) {
        console.log(`   ❌ Vacuna no encontrada`);
        continue;
      }

      console.log(`   📦 Vacuna: ${vacuna.nombre} (${vacuna.dosisPorFrasco} dosis/frasco)`);

      // Get total quantity for this vaccine
      const totalCantidad = kardexVacunas
        .filter(k => k.itemId === vacunaId)
        .reduce((sum, k) => sum + k.cantidad, 0);
      
      console.log(`   📊 Cantidad total afectada: ${totalCantidad} unidades`);

      // Check center-specific configuration
      const centroId = 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c';
      
      console.log(`   🏢 Verificando configuración específica del centro...`);
      const configCentro = await prisma.configuracionJeringaVacunaCentro.findMany({
        where: {
          centroAcopioId: centroId,
          vacunaId: vacunaId,
          activo: true
        },
        include: {
          jeringa: {
            select: { tipo: true, capacidad: true, color: true }
          }
        },
        orderBy: { prioridad: 'asc' }
      });

      if (configCentro.length > 0) {
        console.log(`   ✅ Configuración específica encontrada: ${configCentro.length} jeringas`);
        configCentro.forEach(config => {
          const jeringasNecesarias = totalCantidad * vacuna.dosisPorFrasco * Number(config.multiplicador);
          console.log(`      • ${config.jeringa.tipo}: ${jeringasNecesarias} unidades (multiplicador: ${config.multiplicador})`);
        });
      } else {
        console.log(`   ⚠️ No hay configuración específica del centro`);
        
        // Check default configuration
        console.log(`   🌐 Verificando configuración por defecto...`);
        const configDefecto = await prisma.configuracionJeringaVacunaDefecto.findMany({
          where: {
            vacunaId: vacunaId,
            activo: true
          },
          include: {
            jeringa: {
              select: { tipo: true, capacidad: true, color: true }
            }
          },
          orderBy: { prioridad: 'asc' }
        });

        if (configDefecto.length > 0) {
          console.log(`   ✅ Configuración por defecto encontrada: ${configDefecto.length} jeringas`);
          configDefecto.forEach(config => {
            const jeringasNecesarias = totalCantidad * vacuna.dosisPorFrasco * Number(config.multiplicador);
            console.log(`      • ${config.jeringa.tipo}: ${jeringasNecesarias} unidades (multiplicador: ${config.multiplicador})`);
          });
        } else {
          console.log(`   ❌ No hay configuración por defecto para esta vacuna`);
        }
      }
    }

    // 3. Test the ConfiguracionJeringaVacunaService directly
    console.log(`\n🧪 PASO 3: Probando ConfiguracionJeringaVacunaService directamente...`);
    
    // Import the service
    const { ConfiguracionJeringaVacunaService } = require('./src/services/ConfiguracionJeringaVacunaService.ts');
    
    for (const vacunaId of vacunaIds.slice(0, 2)) { // Test first 2 vaccines
      console.log(`\n🔬 Probando servicio para vacuna: ${vacunaId}`);
      
      const totalCantidad = kardexVacunas
        .filter(k => k.itemId === vacunaId)
        .reduce((sum, k) => sum + k.cantidad, 0);

      try {
        // Test without fallback
        const resultSinFallback = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
          vacunaId,
          totalCantidad,
          'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c',
          false
        );

        console.log(`   📊 Sin fallback - Success: ${resultSinFallback.success}, Data length: ${resultSinFallback.data?.length || 0}`);
        
        if (resultSinFallback.success && resultSinFallback.data) {
          resultSinFallback.data.forEach(config => {
            console.log(`      • Jeringa: ${config.jeringaId}, Cantidad: ${config.cantidad}, Multiplicador: ${config.multiplicador}`);
          });
        }

        // Test with fallback
        const resultConFallback = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
          vacunaId,
          totalCantidad,
          'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c',
          true
        );

        console.log(`   📊 Con fallback - Success: ${resultConFallback.success}, Data length: ${resultConFallback.data?.length || 0}`);
        
        if (resultConFallback.success && resultConFallback.data) {
          resultConFallback.data.forEach(config => {
            console.log(`      • Jeringa: ${config.jeringaId}, Cantidad: ${config.cantidad}, Multiplicador: ${config.multiplicador}`);
          });
        }

      } catch (error) {
        console.log(`   ❌ Error probando servicio: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSyringeConfig().catch(console.error);
