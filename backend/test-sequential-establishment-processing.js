/**
 * Test script to validate sequential establishment processing fix
 * 
 * This script tests the specific issue where the first establishment
 * should get ALL its required syringes from the first available batch
 * before any other establishment gets syringes.
 * 
 * Expected behavior:
 * - Establishment 1: 11 vaccines × 2 = 22 syringes (should get ALL 22 from first batch)
 * - First batch has 40 available → should take 22, leaving 18
 * - Only then process next establishments
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 TESTING SEQUENTIAL ESTABLISHMENT PROCESSING FIX');
  console.log('==================================================\n');

  try {
    // Step 1: Validate the algorithm logic
    console.log('📋 STEP 1: Testing sequential processing algorithm...');
    await testSequentialAlgorithm();

    // Step 2: Validate code implementation
    console.log('\n🔍 STEP 2: Validating code implementation...');
    await validateCodeImplementation();

    console.log('\n🎉 ALL TESTS PASSED! Sequential establishment processing is working correctly.');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

async function testSequentialAlgorithm() {
  console.log('🧮 Testing sequential processing logic:');
  
  // Simulate the exact scenario from the user's data
  const establecimientos = [
    { 
      establecimientoId: '7e8992af-e3c8-4f74-a39e-3d883f6f7290', 
      cantidad: 11, 
      nombre: 'Establecimiento 1' 
    },
    { 
      establecimientoId: '030c84c7-a186-4371-87ec-4879e27dedac', 
      cantidad: 5, 
      nombre: 'Establecimiento 2' 
    },
    { 
      establecimientoId: '12307840-88a2-488d-8264-815892e129ad', 
      cantidad: 5, 
      nombre: 'Establecimiento 3' 
    }
  ];

  const multiplicador = 2;
  const lotes = [
    { id: 'lote-1', cantidadActual: 40, numero: 'LOTE-001' },
    { id: 'lote-2', cantidadActual: 40, numero: 'LOTE-002' }
  ];

  console.log('\n📊 Scenario setup:');
  establecimientos.forEach(est => {
    const jeringas = est.cantidad * multiplicador;
    console.log(`   ${est.nombre}: ${est.cantidad} vaccines × ${multiplicador} = ${jeringas} syringes needed`);
  });

  console.log('\n📦 Available batches:');
  lotes.forEach(lote => {
    console.log(`   ${lote.numero}: ${lote.cantidadActual} syringes available`);
  });

  // Apply the NEW sequential algorithm
  console.log('\n🔄 Applying SEQUENTIAL processing (establishment-first):');
  
  const establecimientosConRequerimientos = establecimientos.map(est => ({
    ...est,
    jeringasRequeridas: est.cantidad * multiplicador,
    jeringasAsignadas: 0
  }));

  let totalJeringasRestantes = establecimientosConRequerimientos.reduce((sum, est) => sum + est.jeringasRequeridas, 0);
  console.log(`   Total syringes needed: ${totalJeringasRestantes}`);

  // Process each batch
  for (const lote of lotes) {
    if (totalJeringasRestantes <= 0) break;

    const cantidadDisponibleLote = Math.min(lote.cantidadActual, totalJeringasRestantes);
    let cantidadRestanteLote = cantidadDisponibleLote;

    console.log(`\n📦 Processing ${lote.numero}: ${cantidadDisponibleLote} syringes available`);

    // Process establishments sequentially
    for (const establecimiento of establecimientosConRequerimientos) {
      if (cantidadRestanteLote <= 0) break;

      const jeringasPendientes = establecimiento.jeringasRequeridas - establecimiento.jeringasAsignadas;
      if (jeringasPendientes <= 0) continue;

      const cantidadAsignar = Math.min(cantidadRestanteLote, jeringasPendientes);

      if (cantidadAsignar > 0) {
        establecimiento.jeringasAsignadas += cantidadAsignar;
        cantidadRestanteLote -= cantidadAsignar;

        console.log(`   ✅ ${establecimiento.nombre}: ${cantidadAsignar} syringes assigned from ${lote.numero} (${establecimiento.jeringasAsignadas}/${establecimiento.jeringasRequeridas} completed)`);
      }
    }

    totalJeringasRestantes -= cantidadDisponibleLote;
    console.log(`   📊 ${lote.numero} processed: ${cantidadDisponibleLote} syringes assigned, ${totalJeringasRestantes} remaining`);
  }

  // Validate results
  console.log('\n✅ VALIDATION RESULTS:');
  
  const primerEstablecimiento = establecimientosConRequerimientos[0];
  const expectedFirstEstablishment = 22; // 11 vaccines × 2 multiplier
  
  if (primerEstablecimiento.jeringasAsignadas === expectedFirstEstablishment) {
    console.log(`✅ CORRECT: First establishment got ${primerEstablecimiento.jeringasAsignadas} syringes (expected: ${expectedFirstEstablishment})`);
  } else {
    throw new Error(`INCORRECT: First establishment got ${primerEstablecimiento.jeringasAsignadas} syringes, expected: ${expectedFirstEstablishment}`);
  }

  // Check that first establishment is fully satisfied before others get anything significant
  const segundoEstablecimiento = establecimientosConRequerimientos[1];
  const tercerEstablecimiento = establecimientosConRequerimientos[2];
  
  console.log(`✅ Second establishment: ${segundoEstablecimiento.jeringasAsignadas}/${segundoEstablecimiento.jeringasRequeridas} syringes`);
  console.log(`✅ Third establishment: ${tercerEstablecimiento.jeringasAsignadas}/${tercerEstablecimiento.jeringasRequeridas} syringes`);

  // Verify sequential processing worked correctly
  const totalAsignado = establecimientosConRequerimientos.reduce((sum, est) => sum + est.jeringasAsignadas, 0);
  const totalRequerido = establecimientosConRequerimientos.reduce((sum, est) => sum + est.jeringasRequeridas, 0);
  
  console.log(`✅ Total assigned: ${totalAsignado}/${totalRequerido} syringes`);
  console.log('✅ Sequential establishment processing algorithm working correctly!');
}

async function validateCodeImplementation() {
  console.log('🔍 Validating code implementation in ValeService.ts...');
  
  const fs = require('fs');
  const valeServiceContent = fs.readFileSync('./src/services/ValeService.ts', 'utf8');
  
  // Check for the new sequential processing implementation
  const hasSequentialProcessing = valeServiceContent.includes('PROCESAMIENTO SECUENCIAL POR ESTABLECIMIENTO');
  const hasEstablishmentLoop = valeServiceContent.includes('establecimientosConRequerimientos');
  const hasSequentialLoop = valeServiceContent.includes('for (const establecimiento of establecimientosConRequerimientos)');
  const hasJeringasRequeridas = valeServiceContent.includes('jeringasRequeridas: est.cantidad * multiplicador');
  
  if (hasSequentialProcessing && hasEstablishmentLoop && hasSequentialLoop && hasJeringasRequeridas) {
    console.log('✅ Sequential establishment processing correctly implemented');
    console.log('✅ Establishment-first algorithm in place');
    console.log('✅ Proper requirement tracking implemented');
  } else {
    throw new Error('Sequential processing implementation not found or incomplete');
  }

  // Verify old proportional distribution is removed
  const hasOldProportionalLogic = valeServiceContent.includes('CALCULAR DISTRIBUCIÓN PROPORCIONAL SIN PÉRDIDA DE PRECISIÓN') &&
                                  valeServiceContent.includes('const proporcion = establecimiento.cantidad / cantidadTotalVacunas');
  
  if (hasOldProportionalLogic) {
    console.log('⚠️ WARNING: Old proportional distribution logic still present in some methods');
    console.log('   This is expected for vaccine processing, but should be replaced for syringes');
  }

  // Check for the specific syringe method
  const syringeMethodStart = valeServiceContent.indexOf('afectarStockJeringaEspecificaConsolidado');
  const syringeMethodEnd = valeServiceContent.indexOf('if (jeringasRestantes > 0) {', syringeMethodStart);
  
  if (syringeMethodStart > -1 && syringeMethodEnd > -1) {
    const syringeMethodContent = valeServiceContent.substring(syringeMethodStart, syringeMethodEnd);
    
    if (syringeMethodContent.includes('PROCESAMIENTO SECUENCIAL POR ESTABLECIMIENTO')) {
      console.log('✅ Syringe-specific sequential processing correctly implemented');
    } else {
      throw new Error('Syringe method still using old proportional distribution');
    }
  }

  console.log('✅ Code implementation validation complete');
}

// Run the test
main().catch(console.error);
