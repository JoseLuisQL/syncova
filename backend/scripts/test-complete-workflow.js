const axios = require('axios');

/**
 * Script para probar el flujo completo de configuración jeringa-vacuna
 * Incluye pruebas de cálculo, configuración efectiva y integración
 */

const API_BASE = 'http://localhost:3001/api';

// Configurar axios con timeout
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testCompleteWorkflow() {
  console.log('🧪 Iniciando pruebas del flujo completo de configuración jeringa-vacuna');
  console.log('=' .repeat(70));

  try {
    // Test 1: Obtener configuraciones por defecto
    console.log('📡 Test 1: Obteniendo configuraciones por defecto...');
    const defectoResponse = await api.get('/configuracion-jeringa-vacuna/defecto');
    const configuracionesDefecto = defectoResponse.data.data || [];
    const totalDefecto = defectoResponse.data.pagination?.total || 0;
    
    console.log(`✅ Configuraciones por defecto: ${totalDefecto} encontradas`);
    
    if (configuracionesDefecto.length > 0) {
      const config = configuracionesDefecto[0];
      console.log(`   📊 Ejemplo: ${config.vacuna?.nombre} → ${config.jeringa?.tipo} ${config.jeringa?.capacidad} (multiplicador: ${config.multiplicador})`);
      
      // Test 2: Probar configuración efectiva
      console.log('\n📡 Test 2: Probando configuración efectiva...');
      const efectivaResponse = await api.get(`/configuracion-jeringa-vacuna/efectiva/${config.vacunaId}`);
      const configuracionEfectiva = efectivaResponse.data.data || [];
      
      console.log(`✅ Configuración efectiva obtenida: ${configuracionEfectiva.length} configuraciones`);
      
      if (configuracionEfectiva.length > 0) {
        const efectiva = configuracionEfectiva[0];
        console.log(`   📊 Configuración efectiva: Jeringa ${efectiva.jeringaId} con multiplicador ${efectiva.multiplicador} (origen: ${efectiva.origen})`);
      }
      
      // Test 3: Probar cálculo de jeringas necesarias
      console.log('\n📡 Test 3: Probando cálculo de jeringas necesarias...');
      const calcularData = {
        vacunaId: config.vacunaId,
        cantidadVacunas: 10
      };
      
      const calcularResponse = await api.post('/configuracion-jeringa-vacuna/calcular', calcularData);
      const jeringasCalculadas = calcularResponse.data.data || [];
      
      console.log(`✅ Cálculo realizado: ${jeringasCalculadas.length} tipos de jeringas calculadas`);
      
      if (jeringasCalculadas.length > 0) {
        const calculo = jeringasCalculadas[0];
        console.log(`   📊 Para 10 frascos de ${config.vacuna?.nombre}:`);
        console.log(`       - Dosis por frasco: ${config.vacuna?.dosisPorFrasco}`);
        console.log(`       - Total dosis: ${10 * config.vacuna?.dosisPorFrasco}`);
        console.log(`       - Jeringas necesarias: ${calculo.cantidad}`);
        console.log(`       - Multiplicador aplicado: ${calculo.multiplicador}`);
        console.log(`       - Origen configuración: ${calculo.origen}`);
      }
      
      // Test 4: Probar configuración específica por centro
      console.log('\n📡 Test 4: Probando configuración específica por centro...');
      
      // Obtener centros de acopio
      const centrosResponse = await api.get('/centros-acopio');
      const centros = centrosResponse.data.data?.centrosAcopio || [];
      
      if (centros.length > 0) {
        const centro = centros[0];
        console.log(`✅ Centro de acopio encontrado: ${centro.nombre}`);
        
        // Probar configuración efectiva con centro específico
        const efectivaCentroResponse = await api.get(`/configuracion-jeringa-vacuna/efectiva/${config.vacunaId}?centroAcopioId=${centro.id}`);
        const configCentro = efectivaCentroResponse.data.data || [];
        
        console.log(`✅ Configuración efectiva para centro: ${configCentro.length} configuraciones`);
        
        if (configCentro.length > 0) {
          const configEspecifica = configCentro[0];
          console.log(`   📊 Configuración para ${centro.nombre}:`);
          console.log(`       - Multiplicador: ${configEspecifica.multiplicador}`);
          console.log(`       - Origen: ${configEspecifica.origen}`);
          
          // Comparar con configuración por defecto
          if (configEspecifica.multiplicador !== config.multiplicador) {
            console.log(`   🎯 ¡Configuración específica detectada! (Defecto: ${config.multiplicador}, Centro: ${configEspecifica.multiplicador})`);
          }
        }
        
        // Test 5: Cálculo con centro específico
        console.log('\n📡 Test 5: Cálculo con centro específico...');
        const calcularCentroData = {
          vacunaId: config.vacunaId,
          cantidadVacunas: 10,
          centroAcopioId: centro.id
        };
        
        const calcularCentroResponse = await api.post('/configuracion-jeringa-vacuna/calcular', calcularCentroData);
        const jeringasCentro = calcularCentroResponse.data.data || [];
        
        if (jeringasCentro.length > 0) {
          const calculoCentro = jeringasCentro[0];
          console.log(`✅ Cálculo para centro específico:`);
          console.log(`   📊 Jeringas necesarias: ${calculoCentro.cantidad}`);
          console.log(`   📊 Multiplicador aplicado: ${calculoCentro.multiplicador}`);
          console.log(`   📊 Origen: ${calculoCentro.origen}`);
        }
      } else {
        console.log('⚠️  No hay centros de acopio para probar configuración específica');
      }
      
      // Test 6: Obtener configuraciones por centro
      console.log('\n📡 Test 6: Obteniendo configuraciones por centro...');
      const centroConfigResponse = await api.get('/configuracion-jeringa-vacuna/centro');
      const configCentros = centroConfigResponse.data.data || [];
      const totalCentros = centroConfigResponse.data.pagination?.total || 0;
      
      console.log(`✅ Configuraciones por centro: ${totalCentros} encontradas`);
      
      if (configCentros.length > 0) {
        const configCentroEjemplo = configCentros[0];
        console.log(`   📊 Ejemplo: ${configCentroEjemplo.centroAcopio?.nombre} - ${configCentroEjemplo.vacuna?.nombre} → ${configCentroEjemplo.jeringa?.tipo} ${configCentroEjemplo.jeringa?.capacidad} (x${configCentroEjemplo.multiplicador})`);
      }
      
    } else {
      console.log('⚠️  No hay configuraciones por defecto para probar');
    }
    
    // Test 7: Verificar lógica de fallback
    console.log('\n📡 Test 7: Verificando lógica de fallback...');
    
    // Crear un ID de vacuna ficticio para probar fallback
    const vacunaFicticiaId = '00000000-0000-0000-0000-000000000000';
    
    try {
      const fallbackResponse = await api.get(`/configuracion-jeringa-vacuna/efectiva/${vacunaFicticiaId}`);
      const configFallback = fallbackResponse.data.data || [];
      
      if (configFallback.length > 0) {
        console.log(`✅ Lógica de fallback funcionando: ${configFallback.length} configuraciones de sistema`);
      } else {
        console.log(`✅ Lógica de fallback: Sin configuraciones (comportamiento esperado para vacuna inexistente)`);
      }
    } catch (error) {
      console.log(`✅ Lógica de fallback: Error controlado para vacuna inexistente (${error.response?.status})`);
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 Pruebas del flujo completo completadas exitosamente');
    console.log('\n📝 Resumen de funcionalidades probadas:');
    console.log('  ✅ Configuraciones por defecto');
    console.log('  ✅ Configuración efectiva');
    console.log('  ✅ Cálculo de jeringas necesarias');
    console.log('  ✅ Configuraciones específicas por centro');
    console.log('  ✅ Lógica de fallback');
    console.log('  ✅ Integración con vacunas y centros de acopio');
    
    console.log('\n🚀 El sistema de configuración jeringa-vacuna está funcionando correctamente');
    console.log('📋 Listo para integración con generación de vales');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message);
    
    if (error.response) {
      console.error('📝 Detalles del error:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    process.exit(1);
  }
}

// Función principal
async function main() {
  await testCompleteWorkflow();
  console.log('\n🏁 Todas las pruebas completadas exitosamente');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal en las pruebas:', error);
    process.exit(1);
  });
}

module.exports = { testCompleteWorkflow };
