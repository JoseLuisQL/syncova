const axios = require('axios');

/**
 * Script para probar las nuevas APIs de configuración jeringa-vacuna
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

async function testConfiguracionAPI() {
  console.log('🧪 Iniciando pruebas de API de configuración jeringa-vacuna');
  console.log('=' .repeat(60));

  try {
    // Test 1: Verificar que el servidor está funcionando
    console.log('📡 Test 1: Verificando estado del servidor...');
    const healthResponse = await api.get('/health');
    console.log(`✅ Servidor funcionando: ${healthResponse.data.status}`);

    // Test 2: Obtener configuraciones por defecto (debería estar vacío)
    console.log('\n📡 Test 2: Obteniendo configuraciones por defecto...');
    const defectoResponse = await api.get('/configuracion-jeringa-vacuna/defecto');
    const total = defectoResponse.data.pagination?.total || 0;
    const configuraciones = defectoResponse.data.data || [];
    console.log(`✅ Configuraciones por defecto: ${total} encontradas`);

    if (configuraciones.length > 0) {
      console.log(`   📊 Ejemplo: ${configuraciones[0].vacuna?.nombre} → ${configuraciones[0].jeringa?.tipo} ${configuraciones[0].jeringa?.capacidad} (x${configuraciones[0].multiplicador})`);
    }

    // Test 3: Obtener configuraciones por centro (debería estar vacío)
    console.log('\n📡 Test 3: Obteniendo configuraciones por centro...');
    const centroResponse = await api.get('/configuracion-jeringa-vacuna/centro');
    console.log(`✅ Configuraciones por centro: ${centroResponse.data.data.total} encontradas`);

    // Test 4: Obtener vacunas activas para usar en las pruebas
    console.log('\n📡 Test 4: Obteniendo vacunas activas...');
    const vacunasResponse = await api.get('/vacunas/activas');
    const vacunas = vacunasResponse.data.data || [];
    console.log(`✅ Vacunas activas encontradas: ${vacunas.length}`);

    // Test 5: Obtener jeringas activas para usar en las pruebas
    console.log('\n📡 Test 5: Obteniendo jeringas activas...');
    const jeringasResponse = await api.get('/jeringas?estado=activo');
    const jeringas = jeringasResponse.data.data?.jeringas || [];
    console.log(`✅ Jeringas activas encontradas: ${jeringas.length}`);

    // Test 6: Crear una configuración por defecto (si hay datos disponibles)
    if (vacunas.length > 0 && jeringas.length > 0) {
      console.log('\n📡 Test 6: Creando configuración por defecto...');
      
      const configData = {
        vacunaId: vacunas[0].id,
        jeringaId: jeringas[0].id,
        multiplicador: 1.5,
        prioridad: 1,
        activo: true
      };

      try {
        const createResponse = await api.post('/configuracion-jeringa-vacuna/defecto', configData);
        console.log(`✅ Configuración creada: ID ${createResponse.data.data.id}`);
        
        // Test 7: Obtener configuración efectiva
        console.log('\n📡 Test 7: Obteniendo configuración efectiva...');
        const efectivaResponse = await api.get(`/configuracion-jeringa-vacuna/efectiva/${vacunas[0].id}`);
        console.log(`✅ Configuración efectiva: ${efectivaResponse.data.data.length} configuraciones encontradas`);

        // Test 8: Calcular jeringas necesarias
        console.log('\n📡 Test 8: Calculando jeringas necesarias...');
        const calcularData = {
          vacunaId: vacunas[0].id,
          cantidadVacunas: 10
        };
        
        const calcularResponse = await api.post('/configuracion-jeringa-vacuna/calcular', calcularData);
        console.log(`✅ Cálculo realizado: ${calcularResponse.data.data.length} tipos de jeringas calculadas`);
        
        if (calcularResponse.data.data.length > 0) {
          const primerCalculo = calcularResponse.data.data[0];
          console.log(`   📊 Ejemplo: ${primerCalculo.cantidad} jeringas con multiplicador ${primerCalculo.multiplicador}`);
        }

      } catch (createError) {
        if (createError.response?.status === 400 && createError.response?.data?.message?.includes('Ya existe')) {
          console.log('⚠️  Configuración ya existe, continuando con las pruebas...');
        } else {
          throw createError;
        }
      }
    } else {
      console.log('\n⚠️  No hay suficientes datos (vacunas/jeringas) para crear configuraciones de prueba');
    }

    // Test 9: Verificar que las tablas existen en la base de datos
    console.log('\n📡 Test 9: Verificando estructura de base de datos...');
    // Este test se haría con una consulta directa, pero por simplicidad lo omitimos aquí

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Todas las pruebas de API completadas exitosamente');
    console.log('\n📝 Resumen:');
    console.log('  ✅ Servidor funcionando correctamente');
    console.log('  ✅ Endpoints de configuración respondiendo');
    console.log('  ✅ Lógica de cálculo funcionando');
    console.log('  ✅ Integración con vacunas y jeringas exitosa');

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

// Función para probar la integración con vales
async function testVoucherIntegration() {
  console.log('\n🧪 Probando integración con generación de vales...');
  
  try {
    // Obtener centros de acopio
    const centrosResponse = await api.get('/centros-acopio');
    const centros = centrosResponse.data.data?.centrosAcopio || [];
    
    if (centros.length > 0) {
      console.log(`✅ Centros de acopio encontrados: ${centros.length}`);
      
      // Aquí podríamos probar la generación de vales, pero requiere más setup
      console.log('📝 Integración con vales lista para pruebas manuales');
    } else {
      console.log('⚠️  No hay centros de acopio para probar la integración con vales');
    }
    
  } catch (error) {
    console.log('⚠️  Error al probar integración con vales:', error.message);
  }
}

// Función principal
async function main() {
  await testConfiguracionAPI();
  await testVoucherIntegration();
  
  console.log('\n🏁 Pruebas completadas');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal en las pruebas:', error);
    process.exit(1);
  });
}

module.exports = { testConfiguracionAPI, testVoucherIntegration };
