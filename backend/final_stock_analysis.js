const axios = require('axios');

async function finalStockAnalysis() {
  try {
    console.log('🔍 FINAL STOCK ANALYSIS - IDENTIFYING THE REAL ISSUE\n');

    // 1. Check all available stock without filters
    console.log('📊 PASO 1: Verificando todo el stock disponible...');
    
    try {
      const vaccineResponse = await axios.get('http://localhost:3001/api/lotes-vacunas', {
        params: { limit: 10 }
      });
      
      console.log('   📦 Vaccine API response:', vaccineResponse.data.success ? 'success' : 'failed');
      if (vaccineResponse.data.success && vaccineResponse.data.data) {
        const lotes = vaccineResponse.data.data.lotes || [];
        console.log(`   📦 Total vaccine lots: ${lotes.length}`);
        
        const availableLots = lotes.filter(lote => lote.estado === 'disponible' && lote.cantidadActual > 0);
        console.log(`   📦 Available vaccine lots with stock: ${availableLots.length}`);
        
        availableLots.slice(0, 3).forEach(lote => {
          console.log(`      • ${lote.numero}: ${lote.cantidadActual} units (${lote.estado})`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error getting vaccine stock:', error.message);
    }

    try {
      const syringeResponse = await axios.get('http://localhost:3001/api/lotes-jeringas', {
        params: { limit: 10 }
      });
      
      console.log('   💉 Syringe API response:', syringeResponse.data.success ? 'success' : 'failed');
      if (syringeResponse.data.success && syringeResponse.data.data) {
        const lotes = syringeResponse.data.data.lotes || [];
        console.log(`   💉 Total syringe lots: ${lotes.length}`);
        
        const availableLots = lotes.filter(lote => lote.estado === 'disponible' && lote.cantidadActual > 0);
        console.log(`   💉 Available syringe lots with stock: ${availableLots.length}`);
        
        availableLots.slice(0, 3).forEach(lote => {
          console.log(`      • ${lote.numero}: ${lote.cantidadActual} units (${lote.estado})`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error getting syringe stock:', error.message);
    }

    // 2. Check existing vouchers and their kardex
    console.log('\n📄 PASO 2: Analizando vales existentes...');
    
    try {
      const valesResponse = await axios.get('http://localhost:3001/api/vales', {
        params: { limit: 5 }
      });
      
      if (valesResponse.data.success && valesResponse.data.data) {
        const vales = valesResponse.data.data.vales || [];
        console.log(`   📄 Total vouchers found: ${vales.length}`);
        
        for (const vale of vales.slice(0, 2)) {
          console.log(`\n   📋 Analyzing voucher: ${vale.numero}`);
          console.log(`      Date: ${vale.fechaGeneracion.split('T')[0]}`);
          console.log(`      Status: ${vale.estado}`);
          console.log(`      Total vaccines: ${vale.totalVacunas}`);
          
          // Check kardex for this voucher
          try {
            const kardexResponse = await axios.get('http://localhost:3001/api/kardex', {
              params: {
                numeroDocumento: vale.numero,
                limit: 20
              }
            });
            
            if (kardexResponse.data.success && kardexResponse.data.data) {
              const movimientos = kardexResponse.data.data.movimientos || [];
              console.log(`      📊 Kardex entries: ${movimientos.length}`);
              
              const vaccineMovements = movimientos.filter(m => m.tipo === 'vacuna');
              const syringeMovements = movimientos.filter(m => m.tipo === 'jeringa');
              
              console.log(`      📦 Vaccine movements: ${vaccineMovements.length}`);
              console.log(`      💉 Syringe movements: ${syringeMovements.length}`);
              
              // Analyze movement types
              const vaccineSalidas = vaccineMovements.filter(m => m.tipoMovimiento === 'salida');
              const vaccineIngresos = vaccineMovements.filter(m => m.tipoMovimiento === 'ingreso');
              const syringeSalidas = syringeMovements.filter(m => m.tipoMovimiento === 'salida');
              const syringeIngresos = syringeMovements.filter(m => m.tipoMovimiento === 'ingreso');
              
              console.log(`      📦 Vaccine - Outgoing: ${vaccineSalidas.length}, Incoming: ${vaccineIngresos.length}`);
              console.log(`      💉 Syringe - Outgoing: ${syringeSalidas.length}, Incoming: ${syringeIngresos.length}`);
              
              // Show problematic syringe incoming movements
              if (syringeIngresos.length > 0) {
                console.log(`      ⚠️ Problematic syringe incoming movements:`);
                syringeIngresos.slice(0, 3).forEach(m => {
                  console.log(`         • ${m.tipoMovimiento} ${m.cantidad} units (${m.saldoAnterior} → ${m.saldoActual}) - ${m.documento}`);
                });
              }
              
              // Calculate net effect
              const vaccineNetDeduction = vaccineSalidas.reduce((sum, m) => sum + m.cantidad, 0) - 
                                        vaccineIngresos.reduce((sum, m) => sum + m.cantidad, 0);
              const syringeNetDeduction = syringeSalidas.reduce((sum, m) => sum + m.cantidad, 0) - 
                                        syringeIngresos.reduce((sum, m) => sum + m.cantidad, 0);
              
              console.log(`      📊 Net vaccine deduction: ${vaccineNetDeduction}`);
              console.log(`      📊 Net syringe deduction: ${syringeNetDeduction}`);
              
              if (vaccineNetDeduction > 0 && syringeNetDeduction <= 0) {
                console.log(`      🚨 PROBLEM IDENTIFIED: Vaccines deducted but syringes not properly deducted`);
              } else if (vaccineNetDeduction > 0 && syringeNetDeduction > 0) {
                console.log(`      ✅ Both vaccines and syringes properly deducted`);
              } else if (vaccineNetDeduction <= 0) {
                console.log(`      🚨 PROBLEM: Vaccines not properly deducted`);
              }
            }
          } catch (kardexError) {
            console.log(`      ❌ Error getting kardex: ${kardexError.message}`);
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Error getting vouchers:', error.message);
    }

    // 3. Summary and recommendations
    console.log('\n📊 FINAL ANALYSIS SUMMARY:');
    console.log('Based on the analysis above:');
    console.log('1. If vaccine movements show proper "salida" entries but syringes show "ingreso" entries,');
    console.log('   then the issue is with the syringe stock update logic creating compensating entries.');
    console.log('2. If both vaccines and syringes show proper "salida" entries, then the system is working correctly.');
    console.log('3. If neither vaccines nor syringes show proper "salida" entries, then the afectarStock parameter is not working.');
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Check if the syringe configuration is causing automatic adjustments');
    console.log('2. Verify that the afectarStock parameter is being properly passed and processed');
    console.log('3. Review the syringe stock update logic for any compensating mechanisms');
    console.log('4. Ensure that the kardex entries match the actual stock changes in the database');

  } catch (error) {
    console.error('❌ Error in final analysis:', error.message);
    if (error.response) {
      console.error('   📄 Response data:', error.response.data);
    }
    throw error;
  }
}

// Execute analysis
finalStockAnalysis()
  .then(() => {
    console.log('\n✅ Final stock analysis completed');
  })
  .catch(error => {
    console.error('\n❌ Error in analysis:', error);
    process.exit(1);
  });
