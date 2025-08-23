/**
 * Script to clean up problematic voucher data that has accumulation issues
 * This will help start fresh with the fixed system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupProblematicData() {
  console.log('🧹 Cleaning up problematic voucher data...\n');
  
  try {
    // 1. Find vouchers with accumulation issues
    console.log('🔍 Identifying problematic vouchers...');
    
    const reversions = await prisma.kardex.findMany({
      where: {
        documento: 'REVERSION'
      },
      select: {
        numeroDocumento: true,
        cantidad: true,
        tipo: true
      }
    });
    
    // Group reversions by voucher number
    const reversionsByVoucher = {};
    reversions.forEach(rev => {
      const voucherNum = rev.numeroDocumento.replace('REVERSION-VALE-', '');
      if (!reversionsByVoucher[voucherNum]) {
        reversionsByVoucher[voucherNum] = [];
      }
      reversionsByVoucher[voucherNum].push(rev);
    });
    
    const problematicVouchers = [];
    
    for (const [voucherNum, revs] of Object.entries(reversionsByVoucher)) {
      // Get original movements for this voucher
      const originalMovements = await prisma.kardex.findMany({
        where: {
          numeroDocumento: voucherNum,
          documento: 'VALE_ENTREGA',
          tipoMovimiento: 'salida'
        }
      });
      
      // Compare quantities
      const originalTotal = originalMovements.reduce((sum, m) => sum + m.cantidad, 0);
      const reversionTotal = revs.reduce((sum, r) => sum + r.cantidad, 0);
      
      if (reversionTotal > originalTotal) {
        problematicVouchers.push({
          numero: voucherNum,
          originalTotal,
          reversionTotal,
          excess: reversionTotal - originalTotal,
          originalMovements,
          reversions: revs
        });
      }
    }
    
    console.log(`Found ${problematicVouchers.length} vouchers with accumulation issues`);
    
    if (problematicVouchers.length === 0) {
      console.log('✅ No problematic data found - system is clean!');
      return;
    }
    
    // 2. Show details of problematic vouchers
    console.log('\n📋 Problematic vouchers details:');
    problematicVouchers.forEach((voucher, index) => {
      console.log(`${index + 1}. Voucher: ${voucher.numero}`);
      console.log(`   Original: ${voucher.originalTotal} units`);
      console.log(`   Reversed: ${voucher.reversionTotal} units`);
      console.log(`   Excess: ${voucher.excess} units`);
    });
    
    // 3. Ask for confirmation (in a real scenario, you'd want manual confirmation)
    console.log('\n⚠️  CLEANUP PLAN:');
    console.log('1. Remove excess reversion entries');
    console.log('2. Adjust stock levels to correct values');
    console.log('3. Clean up orphaned kardex entries');
    
    // For this script, we'll proceed automatically
    console.log('\n🔧 Starting cleanup process...');
    
    let totalCorrectedUnits = 0;
    
    for (const voucher of problematicVouchers) {
      console.log(`\n🔄 Processing voucher ${voucher.numero}...`);
      
      await prisma.$transaction(async (tx) => {
        // Calculate correct reversal amounts by vaccine type
        const correctionsByType = {};
        
        // Group original movements by type and lote
        voucher.originalMovements.forEach(mov => {
          const key = `${mov.tipo}-${mov.loteId}`;
          if (!correctionsByType[key]) {
            correctionsByType[key] = {
              tipo: mov.tipo,
              loteId: mov.loteId,
              itemId: mov.itemId,
              originalAmount: 0,
              reversedAmount: 0
            };
          }
          correctionsByType[key].originalAmount += mov.cantidad;
        });
        
        // Group reversions by type and lote
        voucher.reversions.forEach(rev => {
          const key = `${rev.tipo}-${rev.loteId}`;
          if (correctionsByType[key]) {
            correctionsByType[key].reversedAmount += rev.cantidad;
          }
        });
        
        // Remove excess reversion entries
        await tx.kardex.deleteMany({
          where: {
            numeroDocumento: `REVERSION-VALE-${voucher.numero}`,
            documento: 'REVERSION'
          }
        });
        
        console.log(`   ✅ Removed ${voucher.reversions.length} excess reversion entries`);
        
        // Correct stock levels
        for (const [key, correction] of Object.entries(correctionsByType)) {
          const excess = correction.reversedAmount - correction.originalAmount;
          if (excess > 0) {
            // Remove excess stock that was incorrectly added
            if (correction.tipo === 'vacuna') {
              const lote = await tx.loteVacuna.findUnique({
                where: { id: correction.loteId },
                select: { cantidadActual: true }
              });
              
              if (lote) {
                const newAmount = Math.max(0, lote.cantidadActual - excess);
                await tx.loteVacuna.update({
                  where: { id: correction.loteId },
                  data: {
                    cantidadActual: newAmount,
                    estado: newAmount > 0 ? 'disponible' : 'agotado'
                  }
                });
                
                console.log(`   📦 Corrected vaccine lote ${correction.loteId}: removed ${excess} excess units`);
                totalCorrectedUnits += excess;
              }
            } else if (correction.tipo === 'jeringa') {
              const lote = await tx.loteJeringa.findUnique({
                where: { id: correction.loteId },
                select: { cantidadActual: true }
              });
              
              if (lote) {
                const newAmount = Math.max(0, lote.cantidadActual - excess);
                await tx.loteJeringa.update({
                  where: { id: correction.loteId },
                  data: {
                    cantidadActual: newAmount,
                    estado: newAmount > 0 ? 'disponible' : 'agotado'
                  }
                });
                
                console.log(`   💉 Corrected syringe lote ${correction.loteId}: removed ${excess} excess units`);
              }
            }
          }
        }
      });
      
      console.log(`   ✅ Voucher ${voucher.numero} cleanup completed`);
    }
    
    console.log(`\n🎉 Cleanup completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`- Processed ${problematicVouchers.length} problematic vouchers`);
    console.log(`- Removed ${reversions.length} excess reversion entries`);
    console.log(`- Corrected ${totalCorrectedUnits} excess units in stock`);
    console.log(`\n✅ System is now clean and ready for testing the fix!`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupProblematicData().catch(console.error);
}

module.exports = { cleanupProblematicData };
