const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function checkAMAVaccine() {
  try {
    console.log('🔍 VERIFICANDO VACUNA AMA Y CONFIGURACIONES\n');

    // 1. Find AMA vaccine
    console.log('📋 PASO 1: Buscando vacuna AMA...');
    
    const amaVaccine = await prisma.vacuna.findFirst({
      where: {
        nombre: { contains: 'AMA', mode: 'insensitive' }
      }
    });

    if (amaVaccine) {
      console.log(`   ✅ Vacuna AMA encontrada: ${amaVaccine.id} - ${amaVaccine.nombre}`);
      
      // Check if this vaccine was in the voucher
      const kardexAMA = await prisma.kardex.findMany({
        where: {
          numeroDocumento: '6804-2025-002',
          tipo: 'vacuna',
          itemId: amaVaccine.id
        }
      });

      console.log(`   📊 Movimientos de AMA en el vale: ${kardexAMA.length}`);
      if (kardexAMA.length > 0) {
        const totalAMA = kardexAMA.reduce((sum, k) => sum + k.cantidad, 0);
        console.log(`   📦 Cantidad total de AMA: ${totalAMA} unidades`);
      }

    } else {
      console.log('   ❌ Vacuna AMA no encontrada');
    }

    // 2. Check all default configurations
    console.log('\n🌐 PASO 2: Verificando todas las configuraciones por defecto...');
    
    const allDefaultConfigs = await prisma.configuracionJeringaVacunaDefecto.findMany({
      where: {
        activo: true
      },
      include: {
        vacuna: {
          select: { id: true, nombre: true }
        },
        jeringa: {
          select: { tipo: true, capacidad: true, color: true }
        }
      }
    });

    console.log(`   Configuraciones por defecto encontradas: ${allDefaultConfigs.length}`);
    
    allDefaultConfigs.forEach(config => {
      console.log(`   • ${config.vacuna.nombre} (${config.vacuna.id}) → ${config.jeringa.tipo}`);
      console.log(`     Multiplicador: ${config.multiplicador}, Prioridad: ${config.prioridad}`);
    });

    // 3. Check all vaccines in the voucher
    console.log('\n📋 PASO 3: Verificando todas las vacunas del vale...');
    
    const kardexVacunas = await prisma.kardex.findMany({
      where: {
        numeroDocumento: '6804-2025-002',
        tipo: 'vacuna'
      }
    });

    const vacunaIds = [...new Set(kardexVacunas.map(k => k.itemId))];
    
    for (const vacunaId of vacunaIds) {
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { nombre: true }
      });

      const hasDefaultConfig = allDefaultConfigs.some(config => config.vacunaId === vacunaId);
      
      console.log(`   • ${vacuna?.nombre || 'Unknown'} (${vacunaId}): ${hasDefaultConfig ? '✅ Tiene configuración' : '❌ Sin configuración'}`);
    }

    // 4. Check if there are any center-specific configurations
    console.log('\n🏢 PASO 4: Verificando configuraciones específicas del centro...');
    
    const centroConfigs = await prisma.configuracionJeringaVacunaCentro.findMany({
      where: {
        centroAcopioId: 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c',
        activo: true
      },
      include: {
        vacuna: {
          select: { nombre: true }
        },
        jeringa: {
          select: { tipo: true, capacidad: true }
        }
      }
    });

    console.log(`   Configuraciones específicas del centro: ${centroConfigs.length}`);
    
    centroConfigs.forEach(config => {
      console.log(`   • ${config.vacuna.nombre} → ${config.jeringa.tipo}`);
      console.log(`     Multiplicador: ${config.multiplicador}`);
    });

  } catch (error) {
    console.error('❌ Error verificando AMA:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAMAVaccine().catch(console.error);
