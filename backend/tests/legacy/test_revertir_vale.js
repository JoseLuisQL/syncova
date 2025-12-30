const axios = require('axios');

async function testRevertirVale() {
  try {
    console.log('🧪 TEST: Revertir Vale de Entrega');
    console.log('============================================================');
    
    // Primero, obtener un vale existente para revertir
    console.log('📡 Obteniendo vales existentes...');
    const valesResponse = await axios.get('http://localhost:3001/api/vales?limit=5');
    
    if (!valesResponse.data.success || !valesResponse.data.data.vales.length) {
      console.log('❌ No hay vales disponibles para revertir');
      return;
    }
    
    // Buscar un vale en estado 'generado'
    const valeParaRevertir = valesResponse.data.data.vales.find(vale => vale.estado === 'generado');
    
    if (!valeParaRevertir) {
      console.log('❌ No hay vales en estado "generado" para revertir');
      console.log('📊 Vales disponibles:');
      valesResponse.data.data.vales.forEach(vale => {
        console.log(`   - ${vale.numero}: ${vale.estado}`);
      });
      return;
    }
    
    console.log(`📄 Vale seleccionado para revertir: ${valeParaRevertir.numero}`);
    console.log(`   Estado: ${valeParaRevertir.estado}`);
    console.log(`   Centro: ${valeParaRevertir.centroAcopio.nombre}`);
    console.log(`   Período: ${valeParaRevertir.mes}/${valeParaRevertir.anio}`);
    
    // Intentar revertir el vale
    console.log('\n🔄 Enviando solicitud de reversión...');
    const response = await axios.post(`http://localhost:3001/api/vales/${valeParaRevertir.id}/revertir`);
    
    if (response.data.success) {
      console.log('\n✅ VALE REVERTIDO EXITOSAMENTE:');
      console.log('   Success:', response.data.success);
      console.log('   Message:', response.data.message);
      console.log('   Data:', response.data.data);
      
      // Verificar que el vale ya no existe
      console.log('\n🔍 Verificando que el vale fue eliminado...');
      try {
        const verificacionResponse = await axios.get(`http://localhost:3001/api/vales/${valeParaRevertir.id}`);
        console.log('❌ ERROR: El vale aún existe después de la reversión');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('✅ CONFIRMADO: El vale fue eliminado correctamente');
        } else {
          console.log('❌ ERROR inesperado al verificar:', error.message);
        }
      }
      
      console.log('\n✅ TEST EXITOSO');
    } else {
      console.log('\n❌ ERROR EN REVERSIÓN:');
      console.log('   Success:', response.data.success);
      console.log('   Error:', response.data.error);
      console.log('\n❌ TEST FALLÓ');
    }
    
  } catch (error) {
    console.log('\n❌ ERROR EN TEST:');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error || 'Error desconocido');
    console.log('   Message:', error.response?.data?.message || error.message);
    console.log('\n❌ TEST FALLÓ');
  }
}

testRevertirVale();
