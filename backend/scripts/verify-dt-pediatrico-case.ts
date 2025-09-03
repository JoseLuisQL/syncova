/**
 * Script para verificar específicamente el caso de DT Pediátrico mencionado por el usuario
 * 
 * Analiza los lotes:
 * - DT-2025-152 (b2acfb25-a75c-4979-9699-7c9f1fa7c343)
 * - DT-2025-857 (0484ff65-81dc-4e91-8eab-0fc1ed2010bc)
 * 
 * Y verifica la consistencia entre cantidad_actual y movimientos de kardex
 */

import { prisma } from '../src/config/database';

interface MovimientoAnalisis {
  id: string;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  fechaMovimiento: Date;
  establecimientoDestino?: string;
}

interface LoteAnalisis {
  id: string;
  numero: string;
  cantidadInicial: number;
  cantidadActual: number;
  estado: string;
  movimientos: MovimientoAnalisis[];
  totalSalidas: number;
  cantidadCalculada: number;
  esConsistente: boolean;
}

async function analizarLoteDTPediatrico(loteId: string): Promise<LoteAnalisis | null> {
  // Obtener información del lote
  const lote = await prisma.loteVacuna.findUnique({
    where: { id: loteId },
    include: {
      vacuna: {
        select: {
          nombre: true
        }
      }
    }
  });

  if (!lote) {
    console.log(`❌ Lote ${loteId} no encontrado`);
    return null;
  }

  // Obtener todos los movimientos de kardex para este lote
  const movimientos = await prisma.kardex.findMany({
    where: {
      loteId: loteId,
      tipo: 'vacuna'
    },
    include: {
      establecimientoDestino: {
        select: {
          nombre: true
        }
      }
    },
    orderBy: {
      fechaMovimiento: 'asc'
    }
  });

  // Analizar movimientos
  const movimientosAnalisis: MovimientoAnalisis[] = movimientos.map(mov => ({
    id: mov.id,
    cantidad: mov.cantidad,
    saldoAnterior: mov.saldoAnterior,
    saldoActual: mov.saldoActual,
    fechaMovimiento: mov.fechaMovimiento,
    establecimientoDestino: mov.establecimientoDestino?.nombre
  }));

  // Calcular total de salidas
  const totalSalidas = movimientos
    .filter(mov => mov.tipoMovimiento === 'salida')
    .reduce((sum, mov) => sum + mov.cantidad, 0);

  // Calcular cantidad que debería tener
  const cantidadCalculada = lote.cantidadInicial - totalSalidas;

  // Verificar consistencia
  const esConsistente = lote.cantidadActual === cantidadCalculada;

  return {
    id: lote.id,
    numero: lote.numero,
    cantidadInicial: lote.cantidadInicial,
    cantidadActual: lote.cantidadActual,
    estado: lote.estado,
    movimientos: movimientosAnalisis,
    totalSalidas,
    cantidadCalculada,
    esConsistente
  };
}

async function verificarCasoDTPediatrico(): Promise<void> {
  console.log('🔍 Verificando caso específico de DT Pediátrico...\n');

  const loteIds = [
    'b2acfb25-a75c-4979-9699-7c9f1fa7c343', // DT-2025-152
    '0484ff65-81dc-4e91-8eab-0fc1ed2010bc'  // DT-2025-857
  ];

  for (const loteId of loteIds) {
    const analisis = await analizarLoteDTPediatrico(loteId);
    
    if (!analisis) continue;

    console.log(`📦 LOTE: ${analisis.numero} (${loteId})`);
    console.log('=' .repeat(60));
    console.log(`Cantidad inicial: ${analisis.cantidadInicial}`);
    console.log(`Cantidad actual (BD): ${analisis.cantidadActual}`);
    console.log(`Estado: ${analisis.estado}`);
    console.log(`Total salidas: ${analisis.totalSalidas}`);
    console.log(`Cantidad calculada: ${analisis.cantidadCalculada}`);
    console.log(`¿Es consistente?: ${analisis.esConsistente ? '✅ SÍ' : '❌ NO'}`);
    
    if (!analisis.esConsistente) {
      const diferencia = analisis.cantidadActual - analisis.cantidadCalculada;
      console.log(`Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia} unidades`);
    }

    console.log('\n📋 MOVIMIENTOS DE KARDEX:');
    console.log('Fecha\t\t\tCantidad\tSaldo Ant.\tSaldo Act.\tDestino');
    console.log('-'.repeat(80));
    
    analisis.movimientos.forEach(mov => {
      const fecha = mov.fechaMovimiento.toISOString().split('T')[0];
      const destino = mov.establecimientoDestino || 'N/A';
      console.log(`${fecha}\t${mov.cantidad}\t\t${mov.saldoAnterior}\t\t${mov.saldoActual}\t\t${destino}`);
    });

    // Verificar secuencia de saldos
    console.log('\n🔍 VERIFICACIÓN DE SECUENCIA:');
    let saldoEsperado = analisis.cantidadInicial;
    let secuenciaCorrecta = true;

    for (let i = 0; i < analisis.movimientos.length; i++) {
      const mov = analisis.movimientos[i];
      
      if (mov.saldoAnterior !== saldoEsperado) {
        console.log(`❌ Movimiento ${i + 1}: Saldo anterior incorrecto. Esperado: ${saldoEsperado}, Actual: ${mov.saldoAnterior}`);
        secuenciaCorrecta = false;
      }
      
      const saldoCalculado = mov.saldoAnterior - mov.cantidad;
      if (mov.saldoActual !== saldoCalculado) {
        console.log(`❌ Movimiento ${i + 1}: Saldo actual incorrecto. Esperado: ${saldoCalculado}, Actual: ${mov.saldoActual}`);
        secuenciaCorrecta = false;
      }
      
      saldoEsperado = mov.saldoActual;
    }

    if (secuenciaCorrecta) {
      console.log('✅ Secuencia de saldos en kardex es correcta');
    }

    // Verificar si el último saldo coincide con cantidad_actual
    if (analisis.movimientos.length > 0) {
      const ultimoSaldo = analisis.movimientos[analisis.movimientos.length - 1].saldoActual;
      if (ultimoSaldo !== analisis.cantidadActual) {
        console.log(`❌ INCONSISTENCIA: Último saldo kardex (${ultimoSaldo}) ≠ cantidad_actual (${analisis.cantidadActual})`);
        console.log(`🔧 CORRECCIÓN NECESARIA: Actualizar cantidad_actual a ${ultimoSaldo}`);
      } else {
        console.log('✅ Último saldo kardex coincide con cantidad_actual');
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }
}

async function main() {
  try {
    await verificarCasoDTPediatrico();
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

export { verificarCasoDTPediatrico, analizarLoteDTPediatrico };
