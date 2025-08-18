const axios = require('axios');

async function checkKardexUnified() {
  try {
    console.log('🔍 VERIFICANDO KARDEX UNIFICADO Y STOCK UPDATES\n');

    // 1. Verificar vales existentes usando la API
    console.log('📄 PASO 1: Verificando vales existentes...');
    
    const valesResponse = await axios.get('http://localhost:3001/api/vales', {
      params: {
        centroAcopioId: 'f625e450-f8dd-4f2d-b81b-6df8dadd7f1c', // Centro de Salud Andahuaylas
        mes: 11,
        anio: 2025,
        limit: 10
      }
    });

    if (!valesResponse.data.success) {
      console.log('❌ Error obteniendo vales:', valesResponse.data.error);
      return;
    }

    const vales = valesResponse.data.data.vales;
    console.log(`   Vales encontrados: ${vales.length}`);
    
    if (vales.length === 0) {
      console.log('   ❌ No hay vales para este centro y período');
      return;
    }

    // 2. Analizar cada vale
    for (const vale of vales) {
      console.log(`\n📋 VALE: ${vale.numero}`);
      console.log(`   Centro: ${vale.centroAcopio.nombre}`);
      console.log(`   Fecha: ${vale.fechaGeneracion.split('T')[0]}`);
      console.log(`   Estado: ${vale.estado}`);
      console.log(`   Total vacunas: ${vale.totalVacunas}`);
      console.log(`   Total establecimientos: ${vale.totalEstablecimientos}`);

      // 3. Verificar movimientos de kardex para este vale usando la API
      console.log(`\n📊 KARDEX para vale ${vale.numero}:`);
      
      try {
        const kardexResponse = await axios.get('http://localhost:3001/api/kardex', {
          params: {
            numeroDocumento: vale.numero,
            limit: 50
          }
        });

        if (kardexResponse.data.success) {
          const kardexEntries = kardexResponse.data.data.movimientos || [];
          console.log(`   📦 Total movimientos kardex: ${kardexEntries.length}`);
          
          if (kardexEntries.length > 0) {
            const vacunaEntries = kardexEntries.filter(k => k.tipo === 'vacuna');
            const jeringaEntries = kardexEntries.filter(k => k.tipo === 'jeringa');
            
            console.log(`   📦 Movimientos de vacunas: ${vacunaEntries.length}`);
            console.log(`   💉 Movimientos de jeringas: ${jeringaEntries.length}`);
            
            // Mostrar algunos movimientos
            vacunaEntries.slice(0, 3).forEach(kardex => {
              console.log(`      📦 ${kardex.tipoMovimiento} ${kardex.cantidad} unidades (${kardex.saldoAnterior} → ${kardex.saldoActual})`);
            });
            
            jeringaEntries.slice(0, 3).forEach(kardex => {
              console.log(`      💉 ${kardex.tipoMovimiento} ${kardex.cantidad} unidades (${kardex.saldoAnterior} → ${kardex.saldoActual})`);
            });
          } else {
            console.log('      ❌ NO HAY MOVIMIENTOS DE KARDEX - PROBLEMA CRÍTICO');
          }
        } else {
          console.log(`   ❌ Error obteniendo kardex: ${kardexResponse.data.error}`);
        }
      } catch (kardexError) {
        console.log(`   ❌ Error consultando kardex: ${kardexError.message}`);
      }

      // 4. Verificar detalles del vale
      try {
        const valeDetalleResponse = await axios.get(`http://localhost:3001/api/vales/${vale.id}`);
        
        if (valeDetalleResponse.data.success) {
          const valeCompleto = valeDetalleResponse.data.data;
          
          console.log(`\n📄 DETALLES del vale ${vale.numero}:`);
          console.log(`   📦 Detalles de vacunas: ${valeCompleto.detalles.length}`);
          console.log(`   💉 Detalles de jeringas: ${valeCompleto.detallesJeringas.length}`);
          
          // Mostrar algunos detalles
          valeCompleto.detalles.slice(0, 3).forEach(detalle => {
            console.log(`      📦 Lote ${detalle.loteVacuna.numero}: ${detalle.cantidad} unidades de ${detalle.loteVacuna.vacuna.nombre}`);
          });
          
          valeCompleto.detallesJeringas.slice(0, 3).forEach(detalle => {
            console.log(`      💉 Lote ${detalle.loteJeringa.numero}: ${detalle.cantidad} unidades de ${detalle.loteJeringa.jeringa.tipo}`);
          });
        }
      } catch (detalleError) {
        console.log(`   ❌ Error obteniendo detalles: ${detalleError.message}`);
      }
    }

    // 5. Verificar stock actual de algunos lotes
    console.log('\n📊 PASO 5: Verificando stock actual de lotes...');
    
    try {
      const lotesVacunasResponse = await axios.get('http://localhost:3001/api/lotes-vacunas', {
        params: {
          estado: 'disponible',
          limit: 5
        }
      });

      if (lotesVacunasResponse.data.success) {
        const lotes = lotesVacunasResponse.data.data.lotes;
        console.log(`   📦 Lotes de vacunas disponibles: ${lotes.length}`);
        
        lotes.slice(0, 3).forEach(lote => {
          console.log(`      • ${lote.numero}: ${lote.cantidadActual} unidades (${lote.vacuna.nombre})`);
        });
      }

      const lotesJeringasResponse = await axios.get('http://localhost:3001/api/lotes-jeringas', {
        params: {
          estado: 'disponible',
          limit: 5
        }
      });

      if (lotesJeringasResponse.data.success) {
        const lotes = lotesJeringasResponse.data.data.lotes;
        console.log(`   💉 Lotes de jeringas disponibles: ${lotes.length}`);
        
        lotes.slice(0, 3).forEach(lote => {
          console.log(`      • ${lote.numero}: ${lote.cantidadActual} unidades (${lote.jeringa.tipo})`);
        });
      }
    } catch (stockError) {
      console.log(`   ❌ Error verificando stock: ${stockError.message}`);
    }

    // 6. Resumen del análisis
    console.log('\n📊 RESUMEN DEL ANÁLISIS:');
    
    let totalValesConKardex = 0;
    let totalValesSinKardex = 0;

    for (const vale of vales) {
      try {
        const kardexResponse = await axios.get('http://localhost:3001/api/kardex', {
          params: {
            numeroDocumento: vale.numero,
            limit: 1
          }
        });

        if (kardexResponse.data.success) {
          const kardexEntries = kardexResponse.data.data.movimientos || [];
          if (kardexEntries.length > 0) {
            totalValesConKardex++;
          } else {
            totalValesSinKardex++;
          }
        }
      } catch (error) {
        totalValesSinKardex++;
      }
    }

    console.log(`   📄 Total vales analizados: ${vales.length}`);
    console.log(`   ✅ Vales con movimientos kardex: ${totalValesConKardex}`);
    console.log(`   ❌ Vales SIN movimientos kardex: ${totalValesSinKardex}`);

    if (totalValesSinKardex > 0) {
      console.log('\n🚨 PROBLEMA CRÍTICO IDENTIFICADO:');
      console.log('   Los vales se están generando pero NO se están registrando en kardex');
      console.log('   Esto significa que los stocks NO se están actualizando');
      console.log('   Esto confirma el problema reportado por el usuario');
    } else {
      console.log('\n✅ Los stocks se están actualizando correctamente');
      console.log('   Todos los vales tienen movimientos de kardex registrados');
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    if (error.response) {
      console.error('   📄 Response data:', error.response.data);
      console.error('   📊 Status:', error.response.status);
    }
    throw error;
  }
}

// Ejecutar verificación
checkKardexUnified()
  .then(() => {
    console.log('\n✅ Verificación de kardex unificado completada');
  })
  .catch(error => {
    console.error('\n❌ Error en verificación:', error);
    process.exit(1);
  });
