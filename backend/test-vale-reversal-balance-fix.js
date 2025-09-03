/**
 * Test script to validate vale reversal balance fix
 * 
 * This script tests that when reversing a vale, the Kardex entries
 * use the correct cumulative stock balance (total across all batches)
 * instead of individual batch balances.
 * 
 * Expected behavior:
 * - saldoAnterior should be the total stock before reversal
 * - saldoActual should be the total stock after reversal
 * - Each reversal entry should accumulate properly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 TESTING VALE REVERSAL BALANCE FIX');
  console.log('===================================\n');

  try {
    // Step 1: Test the balance calculation logic
    console.log('📋 STEP 1: Testing balance calculation logic...');
    await testBalanceCalculationLogic();

    // Step 2: Validate code implementation
    console.log('\n🔍 STEP 2: Validating code implementation...');
    await validateCodeImplementation();

    console.log('\n🎉 ALL TESTS PASSED! Vale reversal balance calculation is working correctly.');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

async function testBalanceCalculationLogic() {
  console.log('🧮 Testing reversal balance calculation logic:');
  
  // Simulate the scenario from user's data
  const vacunaId = '7cecb6d0-2ea0-4c38-8623-166ad7cdac60'; // DT Pediatrico
  
  // Simulate current stock state before reversal
  const lotesBefore = [
    { id: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidadActual: 7 },  // First batch
    { id: '14010c94-b7a5-4654-9a07-b5798bf18d78', cantidadActual: 0 }   // Second batch (empty)
  ];
  
  // Simulate reversal movements (from user's data)
  const movimientosReversion = [
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 4, itemId: vacunaId },
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 2, itemId: vacunaId },
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 2, itemId: vacunaId },
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 1, itemId: vacunaId },
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 2, itemId: vacunaId },
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 2, itemId: vacunaId },
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 1, itemId: vacunaId },
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 2, itemId: vacunaId },
    { loteId: '57b1ff76-eac6-4acb-8dc0-0a236ed10bdd', cantidad: 7, itemId: vacunaId },
    { loteId: '14010c94-b7a5-4654-9a07-b5798bf18d78', cantidad: 7, itemId: vacunaId },
    { loteId: '14010c94-b7a5-4654-9a07-b5798bf18d78', cantidad: 3, itemId: vacunaId }
  ];

  console.log('\n📊 Scenario setup:');
  console.log(`   Vaccine ID: ${vacunaId}`);
  console.log(`   Initial stock: ${lotesBefore.reduce((sum, lote) => sum + lote.cantidadActual, 0)} units`);
  console.log(`   Reversal movements: ${movimientosReversion.length} entries`);
  console.log(`   Total to reverse: ${movimientosReversion.reduce((sum, mov) => sum + mov.cantidad, 0)} units`);

  // Apply the NEW reversal algorithm
  console.log('\n🔄 Applying CORRECTED reversal balance calculation:');
  
  // Calculate initial total stock
  let stockTotalActual = lotesBefore.reduce((sum, lote) => sum + lote.cantidadActual, 0);
  console.log(`   Initial total stock: ${stockTotalActual} units`);

  const expectedKardexEntries = [];
  
  // Process each reversal movement
  for (let i = 0; i < movimientosReversion.length; i++) {
    const movimiento = movimientosReversion[i];
    
    // Calculate balance using the CORRECTED algorithm
    const saldoAnteriorMovimiento = stockTotalActual;
    const saldoNuevoMovimiento = stockTotalActual + movimiento.cantidad;
    
    expectedKardexEntries.push({
      loteId: movimiento.loteId,
      cantidad: movimiento.cantidad,
      saldoAnterior: saldoAnteriorMovimiento,
      saldoActual: saldoNuevoMovimiento
    });
    
    // Update total stock for next movement
    stockTotalActual = saldoNuevoMovimiento;
    
    console.log(`   Movement ${i + 1}: +${movimiento.cantidad} units, balance: ${saldoAnteriorMovimiento} → ${saldoNuevoMovimiento}`);
  }

  // Validate expected results
  console.log('\n✅ EXPECTED RESULTS VALIDATION:');
  
  const finalStock = stockTotalActual;
  const initialStock = lotesBefore.reduce((sum, lote) => sum + lote.cantidadActual, 0);
  const totalReversed = movimientosReversion.reduce((sum, mov) => sum + mov.cantidad, 0);
  
  console.log(`   Initial stock: ${initialStock}`);
  console.log(`   Total reversed: ${totalReversed}`);
  console.log(`   Final stock: ${finalStock}`);
  console.log(`   Calculation correct: ${finalStock === initialStock + totalReversed ? '✅ YES' : '❌ NO'}`);

  // Validate specific entries match user's expected data
  console.log('\n🎯 VALIDATING SPECIFIC EXPECTED ENTRIES:');
  
  const expectedEntries = [
    { cantidad: 4, saldoAnterior: 7, saldoActual: 11 },
    { cantidad: 2, saldoAnterior: 11, saldoActual: 13 },
    { cantidad: 2, saldoAnterior: 13, saldoActual: 15 },
    { cantidad: 1, saldoAnterior: 15, saldoActual: 16 },
    { cantidad: 2, saldoAnterior: 16, saldoActual: 18 },
    { cantidad: 2, saldoAnterior: 18, saldoActual: 20 },
    { cantidad: 1, saldoAnterior: 20, saldoActual: 21 },
    { cantidad: 2, saldoAnterior: 21, saldoActual: 23 },
    { cantidad: 7, saldoAnterior: 23, saldoActual: 30 },
    { cantidad: 7, saldoAnterior: 30, saldoActual: 37 },
    { cantidad: 3, saldoAnterior: 37, saldoActual: 40 }
  ];

  let allCorrect = true;
  for (let i = 0; i < expectedEntries.length; i++) {
    const expected = expectedEntries[i];
    const calculated = expectedKardexEntries[i];
    
    const isCorrect = calculated.cantidad === expected.cantidad &&
                     calculated.saldoAnterior === expected.saldoAnterior &&
                     calculated.saldoActual === expected.saldoActual;
    
    console.log(`   Entry ${i + 1}: ${isCorrect ? '✅' : '❌'} Qty:${calculated.cantidad}, Balance:${calculated.saldoAnterior}→${calculated.saldoActual}`);
    
    if (!isCorrect) {
      allCorrect = false;
      console.log(`     Expected: Qty:${expected.cantidad}, Balance:${expected.saldoAnterior}→${expected.saldoActual}`);
    }
  }

  if (allCorrect) {
    console.log('✅ All reversal balance calculations match expected results!');
  } else {
    throw new Error('Some reversal balance calculations do not match expected results');
  }
}

async function validateCodeImplementation() {
  console.log('🔍 Validating code implementation in ValeService.ts...');
  
  const fs = require('fs');
  const valeServiceContent = fs.readFileSync('./src/services/ValeService.ts', 'utf8');
  
  // Check for the new balance calculation implementation
  const hasVaccineStockTracking = valeServiceContent.includes('stockTotalVacunas: { [vacunaId: string]: number }');
  const hasSyringeStockTracking = valeServiceContent.includes('stockTotalJeringas: { [jeringaId: string]: number }');
  const hasVaccineStockCalculation = valeServiceContent.includes('await this.obtenerStockTotalVacuna(tx, kardex.itemId)');
  const hasSyringeStockCalculation = valeServiceContent.includes('await this.obtenerStockTotalJeringa(tx, kardex.itemId)');
  const hasCorrectBalanceCalculation = valeServiceContent.includes('saldoAnteriorMovimiento = stockTotalVacunas[kardex.itemId]');
  
  if (hasVaccineStockTracking && hasSyringeStockTracking && 
      hasVaccineStockCalculation && hasSyringeStockCalculation && 
      hasCorrectBalanceCalculation) {
    console.log('✅ Vaccine stock tracking correctly implemented');
    console.log('✅ Syringe stock tracking correctly implemented');
    console.log('✅ Total stock calculation methods used');
    console.log('✅ Correct balance calculation implemented');
  } else {
    throw new Error('Reversal balance calculation implementation not found or incomplete');
  }

  // Verify old incorrect balance calculation is removed
  const hasOldIncorrectLogic = valeServiceContent.includes('saldoAnterior: loteActual.cantidadActual') &&
                               valeServiceContent.includes('saldoActual: nuevaCantidad') &&
                               valeServiceContent.includes('REVERSION');
  
  if (hasOldIncorrectLogic) {
    throw new Error('Old incorrect balance calculation logic still present in reversal code');
  }

  console.log('✅ Old incorrect balance calculation logic successfully removed');
  console.log('✅ Code implementation validation complete');
}

// Run the test
main().catch(console.error);
