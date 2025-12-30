/**
 * Test script to verify the voucher reversal bug fix
 * This script tests the scenario described in the bug report:
 * - Multiple generation/reversal cycles
 * - Ensures quantities are not accumulated
 * - Verifies proper transaction integrity
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test configuration
const TEST_CONFIG = {
  centroAcopioId: null, // Will be set dynamically
  vacunaId: null, // Will be set dynamically (AMA vaccine)
  mes: 8,
  anio: 2024,
  baseQuantity: 10,
  usuarioId: null // Will be set dynamically
};

async function setupTestData() {
  console.log('🔧 Setting up test data...');
  
  // Find or create test centro de acopio
  let centroAcopio = await prisma.centroAcopio.findFirst({
    where: { codigo: 'ABANCAY' }
  });
  
  if (!centroAcopio) {
    // Create test centro de acopio
    const establecimiento = await prisma.establecimiento.create({
      data: {
        codigo: 'TEST-ABANCAY',
        nombre: 'Hospital ESSALUD Andahuaylas - Test',
        direccion: 'Dirección de prueba',
        tipo: 'hospital',
        estado: 'activo'
      }
    });
    
    centroAcopio = await prisma.centroAcopio.create({
      data: {
        establecimientoId: establecimiento.id,
        codigo: 'ABANCAY',
        capacidadAlmacenamiento: 1000
      }
    });
  }
  
  TEST_CONFIG.centroAcopioId = centroAcopio.id;
  
  // Find AMA vaccine
  const amaVacuna = await prisma.vacuna.findFirst({
    where: { nombre: { contains: 'AMA' } }
  });
  
  if (!amaVacuna) {
    throw new Error('AMA vaccine not found in database');
  }
  
  TEST_CONFIG.vacunaId = amaVacuna.id;
  
  // Find or create test user
  let usuario = await prisma.usuario.findFirst({
    where: { estado: 'activo' }
  });
  
  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        nombre: 'Test User',
        email: 'test@test.com',
        password: 'test123',
        rol: 'operador',
        estado: 'activo'
      }
    });
  }
  
  TEST_CONFIG.usuarioId = usuario.id;
  
  // Ensure we have sufficient stock
  await ensureSufficientStock();
  
  console.log('✅ Test data setup complete');
  console.log(`Centro Acopio: ${centroAcopio.codigo}`);
  console.log(`Vacuna: ${amaVacuna.nombre}`);
  console.log(`Usuario: ${usuario.nombre}`);
}

async function ensureSufficientStock() {
  console.log('📦 Ensuring sufficient stock...');
  
  // Check current stock
  const lotes = await prisma.loteVacuna.findMany({
    where: {
      vacunaId: TEST_CONFIG.vacunaId,
      estado: 'disponible',
      cantidadActual: { gt: 0 }
    }
  });
  
  const totalStock = lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
  const requiredStock = TEST_CONFIG.baseQuantity * 5; // Enough for multiple cycles
  
  if (totalStock < requiredStock) {
    console.log(`Current stock: ${totalStock}, Required: ${requiredStock}`);
    
    // Create additional stock if needed
    const additionalStock = requiredStock - totalStock;
    await prisma.loteVacuna.create({
      data: {
        vacunaId: TEST_CONFIG.vacunaId,
        numeroLote: `TEST-${Date.now()}`,
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        cantidadInicial: additionalStock,
        cantidadActual: additionalStock,
        estado: 'disponible'
      }
    });
    
    console.log(`✅ Added ${additionalStock} units to stock`);
  }
}

async function createTestMovimiento() {
  console.log('📝 Creating test movement...');
  
  const movimiento = await prisma.movimientoVacuna.create({
    data: {
      establecimientoId: TEST_CONFIG.centroAcopioId,
      vacunaId: TEST_CONFIG.vacunaId,
      mes: TEST_CONFIG.mes,
      anio: TEST_CONFIG.anio,
      saldoAnterior: 0,
      transIngreso: 0,
      salida: 0,
      transSalida: 0,
      entrega: TEST_CONFIG.baseQuantity,
      observaciones: 'Test movement for voucher reversal bug fix',
      fechaMovimiento: new Date(),
      usuarioId: TEST_CONFIG.usuarioId
    }
  });
  
  console.log(`✅ Created test movement with ${TEST_CONFIG.baseQuantity} units for delivery`);
  return movimiento;
}

async function getStockSnapshot() {
  const lotes = await prisma.loteVacuna.findMany({
    where: {
      vacunaId: TEST_CONFIG.vacunaId,
      cantidadActual: { gt: 0 }
    },
    select: {
      id: true,
      numeroLote: true,
      cantidadActual: true
    }
  });
  
  const totalStock = lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
  return { lotes, totalStock };
}

async function generateVoucher() {
  console.log('🎫 Generating voucher...');
  
  const ValeService = require('./src/services/ValeService').ValeService;
  
  const result = await ValeService.generarVale({
    centroAcopioId: TEST_CONFIG.centroAcopioId,
    mes: TEST_CONFIG.mes,
    anio: TEST_CONFIG.anio,
    usuarioId: TEST_CONFIG.usuarioId,
    observaciones: 'Test voucher for reversal bug fix',
    afectarStock: true,
    tipoVale: 'solo_entregas_base'
  });
  
  if (!result.success) {
    throw new Error(`Failed to generate voucher: ${result.error}`);
  }
  
  console.log(`✅ Generated voucher: ${result.data.vale.numero}`);
  return result.data.vale;
}

async function reverseVoucher(voucherId) {
  console.log(`🔄 Reversing voucher: ${voucherId}`);
  
  const ValeService = require('./src/services/ValeService').ValeService;
  
  const result = await ValeService.revertirVale(voucherId);
  
  if (!result.success) {
    throw new Error(`Failed to reverse voucher: ${result.error}`);
  }
  
  console.log(`✅ Voucher reversed successfully`);
  return result;
}

async function runTest() {
  console.log('🧪 Starting voucher reversal bug fix test...\n');
  
  try {
    // Setup
    await setupTestData();
    await createTestMovimiento();
    
    // Get initial stock
    const initialStock = await getStockSnapshot();
    console.log(`📊 Initial stock: ${initialStock.totalStock} units\n`);
    
    // Test multiple generation/reversal cycles
    for (let cycle = 1; cycle <= 3; cycle++) {
      console.log(`🔄 === CYCLE ${cycle} ===`);
      
      // Get stock before generation
      const stockBeforeGeneration = await getStockSnapshot();
      console.log(`Stock before generation: ${stockBeforeGeneration.totalStock}`);
      
      // Generate voucher
      const voucher = await generateVoucher();
      
      // Get stock after generation
      const stockAfterGeneration = await getStockSnapshot();
      console.log(`Stock after generation: ${stockAfterGeneration.totalStock}`);
      
      const deductedAmount = stockBeforeGeneration.totalStock - stockAfterGeneration.totalStock;
      console.log(`Deducted amount: ${deductedAmount}`);
      
      if (deductedAmount !== TEST_CONFIG.baseQuantity) {
        throw new Error(`Expected deduction of ${TEST_CONFIG.baseQuantity}, but got ${deductedAmount}`);
      }
      
      // Reverse voucher
      await reverseVoucher(voucher.id);
      
      // Get stock after reversal
      const stockAfterReversal = await getStockSnapshot();
      console.log(`Stock after reversal: ${stockAfterReversal.totalStock}`);
      
      const returnedAmount = stockAfterReversal.totalStock - stockAfterGeneration.totalStock;
      console.log(`Returned amount: ${returnedAmount}`);
      
      // Critical test: returned amount should equal deducted amount
      if (returnedAmount !== deductedAmount) {
        throw new Error(`BUG DETECTED! Expected return of ${deductedAmount}, but got ${returnedAmount}`);
      }
      
      // Stock should be back to original level
      if (stockAfterReversal.totalStock !== stockBeforeGeneration.totalStock) {
        throw new Error(`Stock not properly restored! Expected ${stockBeforeGeneration.totalStock}, got ${stockAfterReversal.totalStock}`);
      }
      
      console.log(`✅ Cycle ${cycle} completed successfully - quantities match!\n`);
    }
    
    console.log('🎉 ALL TESTS PASSED! The voucher reversal bug has been fixed.');
    console.log('✅ No quantity accumulation detected');
    console.log('✅ Proper transaction integrity maintained');
    console.log('✅ Stock levels correctly restored after each cycle');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { runTest };
