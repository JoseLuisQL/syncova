const axios = require('axios');

async function testVistaPrevia() {
  console.log('🧪 TEST: Vista Previa Completa');
  console.log('============================================================');
  
  const baseURL = 'http://localhost:3001/api';
  const centroAcopioId = '5e63c00a-2289-4d56-afa5-0f50e56fb959';
  const mes = 7;
  const anio = 2025;
  
  try {
    console.log('📡 Enviando solicitud de vista previa...');
    console.log(`   Centro: ${centroAcopioId}`);
    console.log(`   Período: ${mes}/${anio}`);
    
    const response = await axios.post(`${baseURL}/vales/vista-previa`, {
      centroAcopioId,
      mes,
      anio
    });
    
    console.log('\n✅ RESPUESTA EXITOSA:');
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Message: ${response.data.message}`);
    
    if (response.data.data) {
      const data = response.data.data;
      console.log('\n📊 DATOS DE VISTA PREVIA:');
      console.log(`   Centro: ${data.centroAcopio.nombre} (${data.centroAcopio.codigo})`);
      console.log(`   Período: ${data.mes}/${data.anio}`);
      console.log(`   Total Vacunas: ${data.consolidado.totalVacunas}`);
      console.log(`   Total Establecimientos: ${data.consolidado.totalEstablecimientos}`);
      console.log(`   Detalles: ${data.detalles.length} registros`);
      
      console.log('\n🏢 ESTABLECIMIENTOS:');
      Object.entries(data.consolidado.vacunasPorEstablecimiento).forEach(([estId, estData]) => {
        console.log(`   - ${estData.establecimiento.nombre} (${estData.establecimiento.codigo})`);
        const totalVacunasEst = Object.values(estData.vacunas).reduce((sum, vac) => sum + vac.cantidadTotal, 0);
        console.log(`     Total vacunas: ${totalVacunasEst}`);
        console.log(`     Tipos de vacunas: ${Object.keys(estData.vacunas).length}`);
      });
      
      console.log('\n💉 TOP 5 VACUNAS:');
      const todasVacunas = [];
      Object.values(data.consolidado.vacunasPorEstablecimiento).forEach(estData => {
        Object.values(estData.vacunas).forEach(vacData => {
          const existing = todasVacunas.find(v => v.vacuna.id === vacData.vacuna.id);
          if (existing) {
            existing.cantidadTotal += vacData.cantidadTotal;
            existing.jeringasNecesarias += vacData.jeringasNecesarias;
          } else {
            todasVacunas.push({
              vacuna: vacData.vacuna,
              cantidadTotal: vacData.cantidadTotal,
              jeringasNecesarias: vacData.jeringasNecesarias
            });
          }
        });
      });
      
      todasVacunas
        .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
        .slice(0, 5)
        .forEach((vac, index) => {
          console.log(`   ${index + 1}. ${vac.vacuna.nombre}: ${vac.cantidadTotal} unidades (${vac.jeringasNecesarias} jeringas)`);
        });
    }
    
    console.log('\n✅ TEST COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.error('\n❌ ERROR EN TEST:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
    console.error(`   Error: ${error.response?.data?.error || 'Error desconocido'}`);
  }
}

testVistaPrevia();
