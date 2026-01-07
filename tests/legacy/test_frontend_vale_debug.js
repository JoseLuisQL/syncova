import axios from 'axios';

// Configurar axios igual que en el frontend (con timeout largo)
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 120000, // 2 minutos como en el frontend
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testFrontendValeReversion() {
  try {
    console.log('🔍 Simulando petición desde el frontend...');
    
    // Obtener vales disponibles
    const valesResponse = await apiClient.get('/vales');
    
    if (!valesResponse.data.success || !valesResponse.data.data) {
      console.log('❌ No se pudieron obtener los vales');
      return;
    }
    
    const vales = valesResponse.data.data.vales || [];
    
    if (vales.length === 0) {
      console.log('❌ No hay vales disponibles para probar');
      return;
    }
    
    // Buscar un vale en estado 'generado'
    let valeParaRevertir = vales.find(vale => vale.estado === 'generado');
    
    if (!valeParaRevertir) {
      console.log('❌ No hay vales en estado "generado" disponibles');
      console.log('📋 Vales disponibles:');
      vales.forEach(vale => {
        console.log(`   - ${vale.numero}: ${vale.estado}`);
      });
      return;
    }
    
    console.log(`📄 Vale seleccionado para revertir: ${valeParaRevertir.numero}`);
    console.log(`   ID: ${valeParaRevertir.id}`);
    console.log(`   Estado: ${valeParaRevertir.estado}`);
    console.log(`   Centro: ${valeParaRevertir.centroAcopio?.nombre || 'N/A'}`);
    console.log(`   Período: ${valeParaRevertir.mes}/${valeParaRevertir.anio}`);
    
    // Intentar revertir el vale usando la misma configuración que el frontend
    console.log('\n🔄 Enviando solicitud de reversión (simulando frontend)...');
    console.log(`URL: ${apiClient.defaults.baseURL}/vales/${valeParaRevertir.id}/revertir`);
    console.log('Headers:', apiClient.defaults.headers);
    console.log('Timeout:', apiClient.defaults.timeout);
    
    const response = await apiClient.post(`/vales/${valeParaRevertir.id}/revertir`);
    
    console.log('✅ Reversión exitosa:');
    console.log('📋 Respuesta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error durante la prueba:');
    
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Status Text:', error.response.statusText);
      console.error('📋 Response Data:', JSON.stringify(error.response.data, null, 2));
      
      // Mostrar detalles específicos del error
      if (error.response.data && error.response.data.message) {
        console.error('📋 Error Message:', error.response.data.message);
      }
      
    } else if (error.request) {
      console.error('📋 Request Error:', error.request);
    } else {
      console.error('📋 Error Message:', error.message);
    }
    
    console.error('📋 Full Error Stack:', error.stack);
  }
}

// Ejecutar la prueba
testFrontendValeReversion();
