/**
 * Script principal para ejecutar la corrección de lotes de vacunas
 * 
 * Este script ejecuta de manera segura la corrección de inconsistencias
 * en cantidad_actual de lotes de vacunas, con opciones de verificación
 * y rollback si es necesario.
 */

import { prisma } from '../src/config/database';
import { identificarInconsistencias, corregirInconsistencias, generarReporte } from './fix-lote-cantidad-actual';
import { verificarCasoDTPediatrico } from './verify-dt-pediatrico-case';

interface OpcionesEjecucion {
  verificarSolo?: boolean;
  corregir?: boolean;
  verificarCasoEspecifico?: boolean;
  crearBackup?: boolean;
}

async function crearBackupLotes(): Promise<void> {
  console.log('💾 Creando backup de lotes antes de la corrección...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace(/-/g, '');
  const backupTable = `lotes_vacunas_backup_${timestamp.split('T')[0]}`;

  try {
    // Crear tabla de backup
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "${backupTable}" AS
      SELECT * FROM lotes_vacunas;
    `);

    console.log(`✅ Backup creado en tabla: ${backupTable}`);
  } catch (error) {
    console.error('❌ Error creando backup:', error);
    throw error;
  }
}

async function verificarIntegridadDatos(): Promise<boolean> {
  console.log('🔍 Verificando integridad de datos...');
  
  try {
    // Verificar que no hay lotes con cantidad_actual negativa
    const lotesNegativos = await prisma.loteVacuna.count({
      where: {
        cantidadActual: {
          lt: 0
        }
      }
    });
    
    if (lotesNegativos > 0) {
      console.error(`❌ Se encontraron ${lotesNegativos} lotes con cantidad_actual negativa`);
      return false;
    }
    
    // Verificar que todos los lotes tienen movimientos de kardex
    const lotesSinKardex = await prisma.loteVacuna.count({
      where: {
        NOT: {
          id: {
            in: await prisma.kardex.findMany({
              where: { tipo: 'vacuna' },
              select: { loteId: true },
              distinct: ['loteId']
            }).then(results => results.map(r => r.loteId))
          }
        }
      }
    });
    
    if (lotesSinKardex > 0) {
      console.warn(`⚠️ Se encontraron ${lotesSinKardex} lotes sin movimientos de kardex`);
    }
    
    console.log('✅ Verificación de integridad completada');
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error);
    return false;
  }
}

async function ejecutarCorreccion(opciones: OpcionesEjecucion = {}): Promise<void> {
  console.log('🚀 Iniciando proceso de corrección de lotes de vacunas...\n');
  
  // Verificar integridad inicial
  const integridadOk = await verificarIntegridadDatos();
  if (!integridadOk) {
    console.error('❌ Problemas de integridad detectados. Abortando corrección.');
    return;
  }
  
  // Crear backup si se solicita
  if (opciones.crearBackup) {
    await crearBackupLotes();
  }
  
  // Verificar caso específico si se solicita
  if (opciones.verificarCasoEspecifico) {
    console.log('\n📋 VERIFICACIÓN DEL CASO ESPECÍFICO DT PEDIÁTRICO:');
    console.log('='.repeat(60));
    await verificarCasoDTPediatrico();
  }
  
  // Identificar inconsistencias
  const inconsistencias = await identificarInconsistencias();
  
  // Generar reporte
  await generarReporte(inconsistencias);
  
  if (inconsistencias.length === 0) {
    console.log('✅ No se requieren correcciones.');
    return;
  }
  
  // Solo verificar o también corregir
  if (opciones.verificarSolo) {
    console.log('\n📋 Modo verificación únicamente. No se realizaron correcciones.');
    return;
  }
  
  if (opciones.corregir) {
    console.log('\n🔧 Procediendo con las correcciones...');
    
    // Ejecutar correcciones en transacción
    await prisma.$transaction(async (tx) => {
      for (const inconsistencia of inconsistencias) {
        await tx.loteVacuna.update({
          where: { id: inconsistencia.loteId },
          data: {
            cantidadActual: inconsistencia.ultimoSaldoKardex,
            estado: inconsistencia.ultimoSaldoKardex === 0 ? 'agotado' : 'disponible'
          }
        });
      }
    });
    
    console.log('✅ Correcciones aplicadas exitosamente.');
    
    // Verificar que las correcciones fueron exitosas
    const inconsistenciasPostCorreccion = await identificarInconsistencias();
    if (inconsistenciasPostCorreccion.length === 0) {
      console.log('✅ Verificación post-corrección: Todas las inconsistencias fueron resueltas.');
    } else {
      console.warn(`⚠️ Aún quedan ${inconsistenciasPostCorreccion.length} inconsistencias después de la corrección.`);
    }
  } else {
    console.log('\n📋 Para aplicar las correcciones, ejecute el script con la opción --corregir');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  const opciones: OpcionesEjecucion = {
    verificarSolo: args.includes('--verificar-solo'),
    corregir: args.includes('--corregir'),
    verificarCasoEspecifico: args.includes('--caso-dt'),
    crearBackup: args.includes('--backup')
  };
  
  // Si no se especifica ninguna opción, mostrar ayuda
  if (args.length === 0) {
    console.log('📋 SCRIPT DE CORRECCIÓN DE LOTES DE VACUNAS');
    console.log('==========================================\n');
    console.log('Opciones disponibles:');
    console.log('  --verificar-solo     Solo identificar inconsistencias, no corregir');
    console.log('  --corregir          Identificar y corregir inconsistencias');
    console.log('  --caso-dt           Verificar específicamente el caso DT Pediátrico');
    console.log('  --backup            Crear backup antes de las correcciones');
    console.log('\nEjemplos:');
    console.log('  npm run script scripts/run-lote-correction.ts -- --verificar-solo');
    console.log('  npm run script scripts/run-lote-correction.ts -- --corregir --backup');
    console.log('  npm run script scripts/run-lote-correction.ts -- --caso-dt');
    return;
  }
  
  try {
    await ejecutarCorreccion(opciones);
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

export { ejecutarCorreccion };
