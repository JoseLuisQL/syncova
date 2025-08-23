/**
 * Diagnostic script to analyze the current state of the voucher system
 * and identify any existing issues with quantity accumulation
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeVoucherSystem() {
  console.log('🔍 Analyzing voucher system for quantity accumulation issues...\n');
  
  try {
    // 1. Find all voucher numbers that appear in kardex but not in active vouchers
    console.log('📋 Checking for reused voucher numbers...');
    
    const kardexVouchers = await prisma.kardex.findMany({
      where: {
        documento: 'VALE_ENTREGA'
      },
      select: {
        numeroDocumento: true,
        createdAt: true
      },
      distinct: ['numeroDocumento']
    });
    
    const activeVouchers = await prisma.valeEntrega.findMany({
      select: {
        numero: true,
        fechaGeneracion: true
      }
    });
    
    const activeVoucherNumbers = new Set(activeVouchers.map(v => v.numero));
    const reusedNumbers = kardexVouchers.filter(k => !activeVoucherNumbers.has(k.numeroDocumento));
    
    console.log(`Found ${kardexVouchers.length} unique voucher numbers in kardex`);
    console.log(`Found ${activeVouchers.length} active vouchers`);
    console.log(`Found ${reusedNumbers.length} potentially reused voucher numbers`);
    
    if (reusedNumbers.length > 0) {
      console.log('\n⚠️  Potentially reused voucher numbers:');
      reusedNumbers.slice(0, 5).forEach(v => {
        console.log(`  - ${v.numeroDocumento} (first used: ${v.createdAt})`);
      });
      if (reusedNumbers.length > 5) {
        console.log(`  ... and ${reusedNumbers.length - 5} more`);
      }
    }
    
    // 2. Check for voucher numbers with multiple generation cycles
    console.log('\n📊 Analyzing voucher generation patterns...');
    
    for (const voucherNum of kardexVouchers.slice(0, 10)) { // Check first 10
      const movements = await prisma.kardex.findMany({
        where: {
          numeroDocumento: voucherNum.numeroDocumento,
          documento: 'VALE_ENTREGA',
          tipoMovimiento: 'salida'
        },
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          createdAt: true,
          cantidad: true,
          tipo: true
        }
      });
      
      if (movements.length > 0) {
        // Group by creation date (same day = same generation)
        const generations = [];
        let currentGeneration = [];
        let lastDate = null;
        
        for (const movement of movements) {
          const movementDate = movement.createdAt.toDateString();
          if (lastDate !== movementDate) {
            if (currentGeneration.length > 0) {
              generations.push(currentGeneration);
            }
            currentGeneration = [];
            lastDate = movementDate;
          }
          currentGeneration.push(movement);
        }
        
        if (currentGeneration.length > 0) {
          generations.push(currentGeneration);
        }
        
        if (generations.length > 1) {
          console.log(`\n🔄 Voucher ${voucherNum.numeroDocumento} has ${generations.length} generations:`);
          generations.forEach((gen, index) => {
            const totalQuantity = gen.reduce((sum, m) => sum + m.cantidad, 0);
            console.log(`  Generation ${index + 1}: ${gen.length} movements, ${totalQuantity} total quantity (${gen[0].createdAt.toDateString()})`);
          });
        }
      }
    }
    
    // 3. Check for reversions and their corresponding original movements
    console.log('\n🔄 Analyzing reversions...');
    
    const reversions = await prisma.kardex.findMany({
      where: {
        documento: 'REVERSION'
      },
      select: {
        numeroDocumento: true,
        cantidad: true,
        tipo: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${reversions.length} reversion entries`);
    
    // Group reversions by voucher number
    const reversionsByVoucher = {};
    reversions.forEach(rev => {
      const voucherNum = rev.numeroDocumento.replace('REVERSION-VALE-', '');
      if (!reversionsByVoucher[voucherNum]) {
        reversionsByVoucher[voucherNum] = [];
      }
      reversionsByVoucher[voucherNum].push(rev);
    });
    
    console.log(`Reversions found for ${Object.keys(reversionsByVoucher).length} different vouchers`);
    
    // 4. Check for potential accumulation issues
    console.log('\n🚨 Checking for potential accumulation issues...');
    
    let issuesFound = 0;
    
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
        issuesFound++;
        console.log(`⚠️  Issue found in voucher ${voucherNum}:`);
        console.log(`    Original movements: ${originalMovements.length} entries, ${originalTotal} total quantity`);
        console.log(`    Reversions: ${revs.length} entries, ${reversionTotal} total quantity`);
        console.log(`    Excess reversal: ${reversionTotal - originalTotal} units`);
      }
    }
    
    if (issuesFound === 0) {
      console.log('✅ No accumulation issues detected in existing reversions');
    } else {
      console.log(`❌ Found ${issuesFound} vouchers with potential accumulation issues`);
    }
    
    // 5. Summary
    console.log('\n📈 SUMMARY:');
    console.log(`- Total voucher numbers in kardex: ${kardexVouchers.length}`);
    console.log(`- Active vouchers: ${activeVouchers.length}`);
    console.log(`- Potentially reused numbers: ${reusedNumbers.length}`);
    console.log(`- Total reversions: ${reversions.length}`);
    console.log(`- Vouchers with reversions: ${Object.keys(reversionsByVoucher).length}`);
    console.log(`- Accumulation issues found: ${issuesFound}`);
    
    if (reusedNumbers.length > 0 || issuesFound > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      if (reusedNumbers.length > 0) {
        console.log('- The voucher numbering system should be updated to prevent reuse');
      }
      if (issuesFound > 0) {
        console.log('- Existing accumulation issues should be investigated and corrected');
      }
      console.log('- The reversal logic fix should prevent future issues');
    } else {
      console.log('\n✅ System appears to be in good state!');
    }
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
if (require.main === module) {
  analyzeVoucherSystem().catch(console.error);
}

module.exports = { analyzeVoucherSystem };
