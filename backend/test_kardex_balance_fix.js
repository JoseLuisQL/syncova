/**
 * Test script to verify the Kardex balance calculation fix
 * Tests sequential balance tracking for vaccine movements
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testKardexBalanceFix() {
  console.log('🧪 Testing Kardex Balance Calculation Fix');
  console.log('==========================================');

  try {
    // Find a recent voucher with multiple movements
    const recentVoucher = await prisma.valeEntrega.findFirst({
      where: {
        estado: 'generado'
      },
      orderBy: {
        fechaGeneracion: 'desc'
      },
      include: {
        centroAcopio: true
      }
    });

    if (!recentVoucher) {
      console.log('❌ No vouchers found for testing');
      return;
    }

    console.log(`📋 Testing voucher: ${recentVoucher.numero}`);
    console.log(`🏢 Centro: ${recentVoucher.centroAcopio.nombre}`);
    console.log(`📅 Fecha: ${recentVoucher.fechaGeneracion.toISOString().split('T')[0]}`);

    // Get Kardex movements for this voucher
    const kardexMovements = await prisma.kardex.findMany({
      where: {
        numeroDocumento: recentVoucher.numero,
        tipo: 'vacuna'
      },
      include: {
        lote: {
          include: {
            vacuna: true
          }
        },
        establecimientoDestino: true
      },
      orderBy: [
        { fechaMovimiento: 'asc' },
        { id: 'asc' }
      ]
    });

    if (kardexMovements.length === 0) {
      console.log('❌ No Kardex movements found for this voucher');
      return;
    }

    console.log(`\n📊 Found ${kardexMovements.length} Kardex movements`);
    console.log('='.repeat(80));

    // Group by vaccine to analyze balance sequences
    const movementsByVaccine = {};
    kardexMovements.forEach(movement => {
      const vaccineId = movement.itemId;
      if (!movementsByVaccine[vaccineId]) {
        movementsByVaccine[vaccineId] = [];
      }
      movementsByVaccine[vaccineId].push(movement);
    });

    let hasBalanceErrors = false;

    // Analyze each vaccine's movements
    for (const [vaccineId, movements] of Object.entries(movementsByVaccine)) {
      const vaccineName = movements[0].lote.vacuna.nombre;
      console.log(`\n💉 Vaccine: ${vaccineName} (${movements.length} movements)`);
      console.log('-'.repeat(60));

      let expectedBalance = movements[0].saldoAnterior;
      let isSequential = true;

      movements.forEach((movement, index) => {
        const isCorrect = movement.saldoAnterior === expectedBalance;
        const expectedAfter = expectedBalance - movement.cantidad;
        const isAfterCorrect = movement.saldoActual === expectedAfter;

        console.log(`${index + 1}. ${movement.establecimientoDestino?.nombre || 'Unknown'}`);
        console.log(`   Quantity: ${movement.cantidad}`);
        console.log(`   Balance: ${movement.saldoAnterior} → ${movement.saldoActual} ${isCorrect && isAfterCorrect ? '✅' : '❌'}`);
        console.log(`   Expected: ${expectedBalance} → ${expectedAfter}`);

        if (!isCorrect || !isAfterCorrect) {
          isSequential = false;
          hasBalanceErrors = true;
          console.log(`   ❌ BALANCE ERROR: Expected ${expectedBalance} → ${expectedAfter}, got ${movement.saldoAnterior} → ${movement.saldoActual}`);
        }

        // Update expected balance for next movement
        expectedBalance = expectedAfter;
      });

      if (isSequential) {
        console.log(`   ✅ Sequential balance tracking is CORRECT`);
      } else {
        console.log(`   ❌ Sequential balance tracking has ERRORS`);
      }
    }

    console.log('\n' + '='.repeat(80));
    if (hasBalanceErrors) {
      console.log('❌ BALANCE CALCULATION ERRORS DETECTED');
      console.log('   The fix needs to be applied or there are remaining issues.');
    } else {
      console.log('✅ ALL BALANCE CALCULATIONS ARE CORRECT');
      console.log('   Sequential balance tracking is working properly.');
    }

    // Additional verification: Check if all movements with same saldoAnterior/saldoActual exist
    console.log('\n🔍 Checking for duplicate balance values (old bug pattern)...');
    
    for (const [vaccineId, movements] of Object.entries(movementsByVaccine)) {
      const vaccineName = movements[0].lote.vacuna.nombre;
      const uniqueBalances = new Set(movements.map(m => `${m.saldoAnterior}-${m.saldoActual}`));
      
      if (uniqueBalances.size === 1 && movements.length > 1) {
        console.log(`❌ ${vaccineName}: All ${movements.length} movements have identical balances (OLD BUG DETECTED)`);
        hasBalanceErrors = true;
      } else if (uniqueBalances.size < movements.length) {
        console.log(`⚠️  ${vaccineName}: Some movements have duplicate balances (${uniqueBalances.size}/${movements.length} unique)`);
      } else {
        console.log(`✅ ${vaccineName}: All movements have unique balances (${uniqueBalances.size}/${movements.length})`);
      }
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get current stock total for a vaccine
async function getCurrentStockTotal(vaccineId) {
  const result = await prisma.loteVacuna.aggregate({
    where: {
      vacunaId: vaccineId,
      cantidadActual: { gt: 0 }
    },
    _sum: {
      cantidadActual: true
    }
  });
  
  return result._sum.cantidadActual || 0;
}

// Run the test
if (require.main === module) {
  testKardexBalanceFix().catch(console.error);
}

module.exports = { testKardexBalanceFix };
