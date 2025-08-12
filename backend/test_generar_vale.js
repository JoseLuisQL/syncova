const axios = require('axios');

async function testGenerarVale() {
  console.log('🧪 TEST: Generar Vale de Entrega');
  console.log('============================================================');
  
  try {
    const data = {
      centroAcopioId: '5e63c00a-2289-4d56-afa5-0f50e56fb959', // Centro de Acopio Abancay
      mes: 11,
      anio: 2025,
      usuarioId: 'temp-user-id',
      observaciones: 'Vale de prueba generado desde test',
      afectarStock: true
    };
    
    console.log('📡 Enviando solicitud de generación de vale...');
    console.log('   Centro:', data.centroAcopioId);
    console.log('   Período:', `${data.mes}/${data.anio}`);
    console.log('   Afectar Stock:', data.afectarStock);
    console.log('   Observaciones:', data.observaciones);
    
    const response = await axios.post('http://localhost:3001/api/vales/generar', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ RESPUESTA EXITOSA:');
    console.log('   Success:', response.data.success);
    console.log('   Message:', response.data.message);
    console.log('   Data:', JSON.stringify(response.data, null, 2));

    if (response.data.data) {
      const resumen = response.data.data;
      console.log('\n📊 RESUMEN DE GENERACIÓN:');
      console.log('   Vale Número:', resumen.vale.numero);
      console.log('   Estado:', resumen.vale.estado);
      console.log('   Total Vacunas:', resumen.totalVacunas);
      console.log('   Total Establecimientos:', resumen.totalEstablecimientos);
      console.log('   Detalles:', resumen.detalles.length, 'registros');
      
      if (resumen.stocksAfectados) {
        console.log('\n💉 STOCKS AFECTADOS:');
        console.log('   Vacunas:', resumen.stocksAfectados.vacunas.length, 'lotes');
        console.log('   Jeringas:', resumen.stocksAfectados.jeringas.length, 'lotes');
      }
      
      if (resumen.errores && resumen.errores.length > 0) {
        console.log('\n⚠️ ERRORES:');
        resumen.errores.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    }
    
    console.log('\n✅ TEST COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.error('\n❌ ERROR EN TEST:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.error || 'Error desconocido');
      console.error('   Message:', error.response.data?.message || 'Sin mensaje');
      
      if (error.response.data?.details) {
        console.error('   Details:', error.response.data.details);
      }
    } else if (error.request) {
      console.error('   No response received:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n❌ TEST FALLÓ');
  }
}

// Ejecutar test
testGenerarVale();
