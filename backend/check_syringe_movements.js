const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function checkSyringeMovements() {
  try {
    console.log('🔍 VERIFICANDO MOVIMIENTOS DE JERINGAS\n');

    const valeNumero = '6804-2025-002';

    // 1. Verificar kardex de jeringas para este vale
    console.log('💉 PASO 1: Verificando kardex de jeringas...');
    
    const kardexJeringas = await prisma.kardex.findMany({
      where: {
        numeroDocumento: valeNumero,
        tipo: 'jeringa'
      },
      orderBy: { fechaMovimiento: 'desc' }
    });

    console.log(`   Movimientos de jeringas encontrados: ${kardexJeringas.length}`);

    if (kardexJeringas.length === 0) {
      console.log('   ❌ NO HAY MOVIMIENTOS DE JERINGAS - PROBLEMA IDENTIFICADO');
    } else {
      kardexJeringas.forEach(mov => {
        console.log(`      • Jeringa: ${mov.tipoMovimiento} de ${mov.cantidad} unidades`);
        console.log(`        Saldo: ${mov.saldoAnterior} → ${mov.saldoActual}`);
      });
    }

    // 2. Verificar configuración de jeringas para el centro
    console.log('\n⚙️ PASO 2: Verificando configuración de jeringas...');
    const centroId = 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c';
    
    const configuraciones = await prisma.configuracionJeringaVacunaCentro.findMany({
      where: {
        centroAcopioId: centroId,
        activo: true
      },
      include: {
        jeringa: {
          select: { tipo: true, capacidad: true, color: true }
        },
        centroAcopio: {
          select: { nombre: true }
        },
        vacuna: {
          select: { nombre: true }
        }
      }
    });

    console.log(`   Configuraciones encontradas: ${configuraciones.length}`);
    
    if (configuraciones.length === 0) {
      console.log('   ❌ NO HAY CONFIGURACIONES DE JERINGAS PARA ESTE CENTRO');
    } else {
      configuraciones.forEach(config => {
        console.log(`      • ${config.vacuna.nombre} → ${config.jeringa.tipo} ${config.jeringa.capacidad} (${config.jeringa.color})`);
        console.log(`        Multiplicador: ${config.multiplicador}`);
      });
    }

    // 3. Verificar configuración global de jeringas
    console.log('\n🌐 PASO 3: Verificando configuración global de jeringas...');
    
    const configuracionesGlobales = await prisma.configuracionJeringaVacunaDefecto.findMany({
      where: {
        activo: true
      },
      include: {
        jeringa: {
          select: { tipo: true, capacidad: true, color: true }
        },
        vacuna: {
          select: { nombre: true }
        }
      }
    });

    console.log(`   Configuraciones globales encontradas: ${configuracionesGlobales.length}`);
    
    configuracionesGlobales.forEach(config => {
      console.log(`      • ${config.vacuna.nombre} → ${config.jeringa.tipo} ${config.jeringa.capacidad} (${config.jeringa.color})`);
      console.log(`        Multiplicador: ${config.multiplicador}`);
    });

    // 4. Verificar stock de jeringas disponibles
    console.log('\n📦 PASO 4: Verificando stock de jeringas...');
    
    const lotesJeringas = await prisma.loteJeringa.findMany({
      where: {
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      include: {
        jeringa: {
          select: { tipo: true, capacidad: true, color: true }
        }
      },
      orderBy: { fechaIngreso: 'asc' },
      take: 5
    });

    console.log(`   Lotes de jeringas disponibles: ${lotesJeringas.length}`);
    
    lotesJeringas.forEach(lote => {
      console.log(`      • Lote ${lote.numero}: ${lote.cantidadActual} unidades`);
      console.log(`        Tipo: ${lote.jeringa.tipo} ${lote.jeringa.capacidad} (${lote.jeringa.color})`);
    });

    // 5. Calcular jeringas que deberían haberse afectado
    console.log('\n🧮 PASO 5: Calculando jeringas que deberían afectarse...');
    
    const kardexVacunas = await prisma.kardex.findMany({
      where: {
        numeroDocumento: valeNumero,
        tipo: 'vacuna'
      }
    });

    let totalVacunasAfectadas = 0;
    kardexVacunas.forEach(mov => {
      totalVacunasAfectadas += mov.cantidad;
    });

    console.log(`   Total vacunas afectadas: ${totalVacunasAfectadas}`);

    // Calcular jeringas necesarias basándose en configuraciones
    if (configuraciones.length > 0) {
      console.log('   📊 Jeringas que deberían haberse afectado (configuración específica):');
      configuraciones.forEach(config => {
        const jeringasNecesarias = totalVacunasAfectadas * config.multiplicador;
        console.log(`      • ${config.jeringa.tipo}: ${jeringasNecesarias} unidades`);
      });
    } else if (configuracionesGlobales.length > 0) {
      console.log('   📊 Jeringas que deberían haberse afectado (configuración global):');
      configuracionesGlobales.forEach(config => {
        const jeringasNecesarias = totalVacunasAfectadas * config.multiplicador;
        console.log(`      • ${config.jeringa.tipo}: ${jeringasNecesarias} unidades`);
      });
    } else {
      console.log('   ❌ NO HAY CONFIGURACIONES DE JERINGAS - NO SE PUEDEN CALCULAR');
    }

  } catch (error) {
    console.error('❌ Error verificando movimientos de jeringas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSyringeMovements().catch(console.error);
