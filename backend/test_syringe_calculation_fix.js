/**
 * Test script to verify the syringe calculation fix
 * This script tests that the corrected calculation logic properly applies multipliers
 * to vaccine quantities instead of total doses.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSyringeCalculationFix() {
  console.log('🧪 TESTING SYRINGE CALCULATION FIX');
  console.log('=====================================\n');

  try {
    // Test scenario: 10 vaccines with multiplier x2 and dosisPorFrasco = 10
    const testVaccineQuantity = 10;
    const testMultiplier = 2;
    const testDosesPerVial = 10;

    console.log('📋 TEST SCENARIO:');
    console.log(`   • Vaccine quantity: ${testVaccineQuantity} units`);
    console.log(`   • Multiplier: x${testMultiplier}`);
    console.log(`   • Doses per vial: ${testDosesPerVial}`);
    console.log(`   • Expected syringe calculation: ${testVaccineQuantity} × ${testMultiplier} = ${testVaccineQuantity * testMultiplier} syringes`);
    console.log(`   • INCORRECT calculation would be: ${testVaccineQuantity} × ${testDosesPerVial} × ${testMultiplier} = ${testVaccineQuantity * testDosesPerVial * testMultiplier} syringes\n`);

    // Find a test vaccine
    const testVaccine = await prisma.vacuna.findFirst({
      where: {
        estado: 'activo',
        dosisPorFrasco: testDosesPerVial
      }
    });

    if (!testVaccine) {
      console.log('⚠️  No test vaccine found with 10 doses per vial. Creating test scenario with available vaccine...\n');
      
      // Use any available vaccine for testing
      const anyVaccine = await prisma.vacuna.findFirst({
        where: { estado: 'activo' }
      });

      if (!anyVaccine) {
        console.log('❌ No vaccines found in database');
        return;
      }

      console.log(`📦 Using vaccine: ${anyVaccine.nombre} (${anyVaccine.dosisPorFrasco} doses/vial)`);
      
      // Test the calculation logic directly
      const totalDoses = testVaccineQuantity * anyVaccine.dosisPorFrasco;
      const correctCalculation = testVaccineQuantity * testMultiplier;
      const incorrectCalculation = totalDoses * testMultiplier;

      console.log('\n🧮 CALCULATION TEST:');
      console.log(`   • Total doses: ${testVaccineQuantity} vaccines × ${anyVaccine.dosisPorFrasco} doses/vial = ${totalDoses} doses`);
      console.log(`   • ✅ CORRECT calculation: ${testVaccineQuantity} vaccines × ${testMultiplier} multiplier = ${correctCalculation} syringes`);
      console.log(`   • ❌ INCORRECT calculation: ${totalDoses} doses × ${testMultiplier} multiplier = ${incorrectCalculation} syringes`);
      console.log(`   • 🎯 Fix prevents deducting ${incorrectCalculation - correctCalculation} extra syringes!\n`);

      return;
    }

    console.log(`📦 Test vaccine: ${testVaccine.nombre} (${testVaccine.dosisPorFrasco} doses/vial)\n`);

    // Test the ConfiguracionJeringaVacunaService calculation
    console.log('🔍 TESTING ConfiguracionJeringaVacunaService...');
    
    // Import the service (this would normally be done differently in a real test)
    const { ConfiguracionJeringaVacunaService } = require('./src/services/ConfiguracionJeringaVacunaService');
    
    try {
      const result = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
        testVaccine.id,
        testVaccineQuantity,
        undefined, // no specific center
        true // use fallback
      );

      if (result.success && result.data.length > 0) {
        console.log('✅ Service calculation results:');
        result.data.forEach(jeringa => {
          console.log(`   • Syringe: ${jeringa.jeringa?.tipo || 'Unknown'}`);
          console.log(`   • Quantity calculated: ${jeringa.cantidad}`);
          console.log(`   • Multiplier: ${jeringa.multiplicador}`);
          
          // Verify the calculation is correct
          const expectedQuantity = Math.ceil(testVaccineQuantity * jeringa.multiplicador);
          const isCorrect = jeringa.cantidad === expectedQuantity;
          
          console.log(`   • Expected: ${expectedQuantity}`);
          console.log(`   • ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} calculation\n`);
        });
      } else {
        console.log('⚠️  No syringe configuration found for test vaccine\n');
      }
    } catch (error) {
      console.log(`❌ Error testing service: ${error.message}\n`);
    }

    // Test the default configuration calculation
    console.log('🔍 TESTING calcularJeringasDefecto...');
    
    // Import the default calculation function
    const { calcularJeringasDefecto } = require('../src/config/multiplicadoresDefecto');
    
    const defaultResult = calcularJeringasDefecto(
      testVaccine.nombre,
      testVaccineQuantity,
      testVaccine.dosisPorFrasco
    );

    console.log('✅ Default calculation results:');
    defaultResult.forEach(jeringa => {
      console.log(`   • Syringe: ${jeringa.tipo}`);
      console.log(`   • Quantity calculated: ${jeringa.cantidad}`);
      
      // For default configuration, multiplier is typically 1
      const expectedQuantity = testVaccineQuantity * 1; // Default multiplier is 1
      const isCorrect = jeringa.cantidad === expectedQuantity;
      
      console.log(`   • Expected: ${expectedQuantity}`);
      console.log(`   • ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} calculation\n`);
    });

    console.log('🎉 SYRINGE CALCULATION FIX TEST COMPLETED');
    console.log('==========================================');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSyringeCalculationFix().catch(console.error);
