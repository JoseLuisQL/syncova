const axios = require('axios');

async function checkSyringeConfig() {
  try {
    console.log('🔍 CHECKING SYRINGE CONFIGURATION\n');

    // 1. Check syringe configurations
    console.log('⚙️ PASO 1: Verificando configuraciones de jeringas...');
    
    try {
      const configResponse = await axios.get('http://localhost:3001/api/configuracion-jeringa-vacuna');
      
      if (configResponse.data.success && configResponse.data.data) {
        const configuraciones = configResponse.data.data.configuraciones || [];
        console.log(`   📊 Total syringe configurations: ${configuraciones.length}`);
        
        if (configuraciones.length > 0) {
          console.log('   ✅ Syringe configurations found:');
          configuraciones.forEach(config => {
            console.log(`      • Vaccine: ${config.vacuna?.nombre || config.vacunaId}`);
            console.log(`        Syringe: ${config.jeringa?.tipo || config.jeringaId} (${config.jeringa?.capacidad || 'unknown'})`);
            console.log(`        Multiplier: ${config.multiplicador}`);
            console.log(`        Scope: ${config.centroAcopioId ? 'Center-specific' : 'System-wide'}`);
            console.log('');
          });
        } else {
          console.log('   ❌ NO SYRINGE CONFIGURATIONS FOUND');
          console.log('   🚨 This explains why syringe stocks are not being updated!');
        }
      } else {
        console.log('   ❌ Error getting configurations:', configResponse.data.error || 'Unknown error');
      }
    } catch (error) {
      console.log('   ❌ Error accessing configuration API:', error.message);
    }

    // 2. Check available vaccines
    console.log('💉 PASO 2: Verificando vacunas disponibles...');
    
    try {
      const vacunasResponse = await axios.get('http://localhost:3001/api/vacunas', {
        params: { limit: 10 }
      });
      
      if (vacunasResponse.data.success && vacunasResponse.data.data) {
        const vacunas = vacunasResponse.data.data.vacunas || [];
        console.log(`   📊 Total vaccines: ${vacunas.length}`);
        
        if (vacunas.length > 0) {
          console.log('   📦 Available vaccines:');
          vacunas.slice(0, 5).forEach(vacuna => {
            console.log(`      • ${vacuna.nombre} (${vacuna.presentacion}) - ID: ${vacuna.id}`);
          });
        }
      }
    } catch (error) {
      console.log('   ❌ Error getting vaccines:', error.message);
    }

    // 3. Check available syringes
    console.log('\n🩹 PASO 3: Verificando jeringas disponibles...');
    
    try {
      const jeringasResponse = await axios.get('http://localhost:3001/api/jeringas', {
        params: { limit: 10 }
      });
      
      if (jeringasResponse.data.success && jeringasResponse.data.data) {
        const jeringas = jeringasResponse.data.data.jeringas || [];
        console.log(`   📊 Total syringes: ${jeringas.length}`);
        
        if (jeringas.length > 0) {
          console.log('   🩹 Available syringes:');
          jeringas.slice(0, 5).forEach(jeringa => {
            console.log(`      • ${jeringa.tipo} ${jeringa.capacidad} (${jeringa.color}) - ID: ${jeringa.id}`);
          });
        }
      }
    } catch (error) {
      console.log('   ❌ Error getting syringes:', error.message);
    }

    // 4. Test configuration calculation for a specific vaccine
    console.log('\n🧪 PASO 4: Testing configuration calculation...');
    
    try {
      const vacunasResponse = await axios.get('http://localhost:3001/api/vacunas', { params: { limit: 1 } });
      
      if (vacunasResponse.data.success && vacunasResponse.data.data && vacunasResponse.data.data.vacunas.length > 0) {
        const testVacuna = vacunasResponse.data.data.vacunas[0];
        console.log(`   🧪 Testing with vaccine: ${testVacuna.nombre} (ID: ${testVacuna.id})`);
        
        try {
          const calcResponse = await axios.post('http://localhost:3001/api/configuracion-jeringa-vacuna/calcular', {
            vacunaId: testVacuna.id,
            cantidadVacunas: 10,
            usarFallback: false
          });
          
          if (calcResponse.data.success && calcResponse.data.data) {
            const jeringas = calcResponse.data.data.jeringas || [];
            console.log(`   📊 Calculated syringes needed: ${jeringas.length} types`);
            
            if (jeringas.length > 0) {
              console.log('   ✅ Configuration calculation working:');
              jeringas.forEach(jeringa => {
                console.log(`      • ${jeringa.cantidad} units of syringe ID: ${jeringa.jeringaId} (multiplier: ${jeringa.multiplicador})`);
              });
            } else {
              console.log('   ❌ No syringes calculated - missing configuration');
            }
          } else {
            console.log('   ❌ Configuration calculation failed:', calcResponse.data.error || 'Unknown error');
          }
        } catch (calcError) {
          console.log('   ❌ Error in configuration calculation:', calcError.message);
        }
      }
    } catch (error) {
      console.log('   ❌ Error testing configuration:', error.message);
    }

    // 5. Recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('1. If no syringe configurations are found, create default configurations');
    console.log('2. Each vaccine should have at least one syringe configuration');
    console.log('3. The multiplier determines how many syringes are needed per vaccine dose');
    console.log('4. Configurations can be system-wide or center-specific');
    console.log('5. Without configurations, syringe stocks will never be updated');

  } catch (error) {
    console.error('❌ Error in syringe configuration check:', error.message);
    if (error.response) {
      console.error('   📄 Response data:', error.response.data);
    }
    throw error;
  }
}

// Execute check
checkSyringeConfig()
  .then(() => {
    console.log('\n✅ Syringe configuration check completed');
  })
  .catch(error => {
    console.error('\n❌ Error in check:', error);
    process.exit(1);
  });
