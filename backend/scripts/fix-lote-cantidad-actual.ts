/**
 * Script para corregir inconsistencias en cantidad_actual de lotes de vacunas
 * 
 * Este script identifica y corrige lotes donde la cantidad_actual no coincide
 * con el último saldo_actual registrado en el kardex para ese lote.
 * 
 * Problema identificado: La distribución proporcional con Math.round() en la 
 * generación de vales puede causar que se afecte 1 unidad menos de lo esperado
 * debido a errores de redondeo.
 */

import { prisma } from '../src/config/database';

interface LoteInconsistente {
  loteId: string;
  numeroLote: string;
  vacunaNombre: string;
  cantidadActualLote: number;
  ultimoSaldoKardex: number;
  diferencia: number;
}

async function identificarInconsistencias(): Promise<LoteInconsistente[]> {
  console.log('🔍 Identificando inconsistencias en cantidad_actual de lotes...');
  
  // Obtener todos los lotes de vacunas con sus últimos movimientos de kardex
  const lotes = await prisma.loteVacuna.findMany({
    include: {
      vacuna: {
        select: {
          nombre: true
        }
      }
    }
  });

  const inconsistencias: LoteInconsistente[] = [];

  for (const lote of lotes) {
    // Obtener el último movimiento de kardex para este lote
    const ultimoMovimiento = await prisma.kardex.findFirst({
      where: {
        loteId: lote.id,
        tipo: 'vacuna'
      },
      orderBy: {
        fechaMovimiento: 'desc'
      }
    });

    if (ultimoMovimiento) {
      const diferencia = lote.cantidadActual - ultimoMovimiento.saldoActual;
      
      if (diferencia !== 0) {
        inconsistencias.push({
          loteId: lote.id,
          numeroLote: lote.numero,
          vacunaNombre: lote.vacuna.nombre,
          cantidadActualLote: lote.cantidadActual,
          ultimoSaldoKardex: ultimoMovimiento.saldoActual,
          diferencia
        });
      }
    }
  }

  return inconsistencias;
}

async function corregirInconsistencias(inconsistencias: LoteInconsistente[]): Promise<void> {
  console.log(`🔧 Corrigiendo ${inconsistencias.length} inconsistencias encontradas...`);
  
  for (const inconsistencia of inconsistencias) {
    console.log(`📝 Corrigiendo lote ${inconsistencia.numeroLote} (${inconsistencia.vacunaNombre})`);
    console.log(`   Cantidad actual: ${inconsistencia.cantidadActualLote} → ${inconsistencia.ultimoSaldoKardex}`);
    
    // Actualizar la cantidad_actual del lote para que coincida con el kardex
    await prisma.loteVacuna.update({
      where: { id: inconsistencia.loteId },
      data: {
        cantidadActual: inconsistencia.ultimoSaldoKardex,
        estado: inconsistencia.ultimoSaldoKardex === 0 ? 'agotado' : 'disponible'
      }
    });
    
    console.log(`   ✅ Lote ${inconsistencia.numeroLote} corregido`);
  }
}

async function generarReporte(inconsistencias: LoteInconsistente[]): Promise<void> {
  console.log('\n📊 REPORTE DE INCONSISTENCIAS ENCONTRADAS');
  console.log('==========================================');
  
  if (inconsistencias.length === 0) {
    console.log('✅ No se encontraron inconsistencias en los lotes de vacunas.');
    return;
  }
  
  console.log(`Total de inconsistencias: ${inconsistencias.length}\n`);
  
  inconsistencias.forEach((inc, index) => {
    console.log(`${index + 1}. Lote: ${inc.numeroLote} (${inc.vacunaNombre})`);
    console.log(`   Cantidad en lote: ${inc.cantidadActualLote}`);
    console.log(`   Último saldo kardex: ${inc.ultimoSaldoKardex}`);
    console.log(`   Diferencia: ${inc.diferencia > 0 ? '+' : ''}${inc.diferencia}`);
    console.log('');
  });
}

async function main() {
  try {
    console.log('🚀 Iniciando corrección de cantidad_actual en lotes de vacunas...\n');
    
    // Paso 1: Identificar inconsistencias
    const inconsistencias = await identificarInconsistencias();
    
    // Paso 2: Generar reporte
    await generarReporte(inconsistencias);
    
    if (inconsistencias.length > 0) {
      // Paso 3: Corregir inconsistencias
      await corregirInconsistencias(inconsistencias);
      
      console.log('\n✅ Corrección completada exitosamente.');
      console.log('📋 Resumen:');
      console.log(`   - Lotes corregidos: ${inconsistencias.length}`);
      console.log(`   - Diferencias resueltas: ${inconsistencias.reduce((sum, inc) => sum + Math.abs(inc.diferencia), 0)} unidades`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

export { identificarInconsistencias, corregirInconsistencias, generarReporte };
