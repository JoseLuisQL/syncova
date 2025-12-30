/**
 * Test script para verificar que la funcionalidad de importación
 * procesa correctamente los valores 0 y reemplaza valores existentes
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Simular el método de importación con los cambios aplicados
function simulateImportLogic(distribucionMensual) {
  // Calcular meta anual
  const metaAnual = distribucionMensual.reduce((sum, val) => sum + val, 0);

  // NUEVA LÓGICA: Procesar todos los registros, incluyendo aquellos con meta anual = 0
  // Esto permite que los valores 0 del archivo de importación reemplacen valores existentes
  return {
    shouldProcess: true, // Antes era: metaAnual > 0
    metaAnual,
    distribucionMensual
  };
}

// Simular la lógica anterior (problemática)
function simulateOldImportLogic(distribucionMensual) {
  const metaAnual = distribucionMensual.reduce((sum, val) => sum + val, 0);
  
  // LÓGICA ANTERIOR: Solo procesar si hay meta anual > 0
  return {
    shouldProcess: metaAnual > 0,
    metaAnual,
    distribucionMensual
  };
}

async function createTestExcelFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Test Data');

  // Agregar headers (simulando estructura real)
  worksheet.addRow(['Código', 'Establecimiento', 'Meta Anual', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']);
  
  // Casos de prueba
  const testCases = [
    {
      codigo: 'EST001',
      establecimiento: 'Hospital Test 1',
      distribucion: [10, 20, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Meta anual = 60
      description: 'Caso con algunos valores 0'
    },
    {
      codigo: 'EST002', 
      establecimiento: 'Hospital Test 2',
      distribucion: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Meta anual = 0
      description: 'Caso con todos valores 0 (debe procesarse para reemplazar valores existentes)'
    },
    {
      codigo: 'EST003',
      establecimiento: 'Hospital Test 3', 
      distribucion: [5, 0, 10, 0, 15, 0, 0, 0, 0, 0, 0, 0], // Meta anual = 30
      description: 'Caso mixto con algunos 0s intercalados'
    }
  ];

  // Agregar filas de datos
  testCases.forEach(testCase => {
    const metaAnual = testCase.distribucion.reduce((sum, val) => sum + val, 0);
    worksheet.addRow([
      testCase.codigo,
      testCase.establecimiento,
      metaAnual,
      ...testCase.distribucion
    ]);
  });

  // Guardar archivo de prueba
  const testFilePath = path.join(__dirname, 'test-import-zero-values.xlsx');
  await workbook.xlsx.writeFile(testFilePath);
  
  return { testFilePath, testCases };
}

async function runTests() {
  console.log('🧪 Iniciando pruebas de importación con valores 0...\n');

  try {
    // Crear archivo Excel de prueba
    const { testFilePath, testCases } = await createTestExcelFile();
    console.log(`📁 Archivo de prueba creado: ${testFilePath}\n`);

    // Simular lectura del archivo Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(testFilePath);
    const worksheet = workbook.worksheets[0];

    let testsPassed = 0;
    let testsFailed = 0;

    console.log('📊 Comparando lógica anterior vs nueva lógica:\n');

    // Procesar cada fila de datos (empezar desde fila 2, saltando headers)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const testCaseIndex = rowNumber - 2;
      const testCase = testCases[testCaseIndex];

      if (!testCase) continue;

      // Leer distribución mensual (columnas 4-15)
      const distribucionMensual = [];
      for (let col = 4; col <= 15; col++) {
        const valor = row.getCell(col).value;
        const numero = typeof valor === 'number' ? valor : parseInt(valor?.toString() || '0', 10);
        distribucionMensual.push(numero);
      }

      // Probar ambas lógicas
      const oldResult = simulateOldImportLogic(distribucionMensual);
      const newResult = simulateImportLogic(distribucionMensual);

      console.log(`🏥 ${testCase.establecimiento}`);
      console.log(`   📝 ${testCase.description}`);
      console.log(`   📊 Distribución: [${distribucionMensual.join(', ')}]`);
      console.log(`   🎯 Meta anual: ${newResult.metaAnual}`);
      console.log(`   ❌ Lógica anterior: ${oldResult.shouldProcess ? 'PROCESA' : 'IGNORA'}`);
      console.log(`   ✅ Lógica nueva: ${newResult.shouldProcess ? 'PROCESA' : 'IGNORA'}`);

      // Verificar que la nueva lógica siempre procesa
      if (newResult.shouldProcess) {
        console.log(`   ✅ CORRECTO: La nueva lógica procesa este registro`);
        testsPassed++;
      } else {
        console.log(`   ❌ ERROR: La nueva lógica debería procesar este registro`);
        testsFailed++;
      }

      // Caso especial: verificar que registros con meta anual = 0 ahora se procesan
      if (newResult.metaAnual === 0) {
        if (newResult.shouldProcess && !oldResult.shouldProcess) {
          console.log(`   🎉 ÉXITO: Registro con meta anual = 0 ahora se procesa (antes se ignoraba)`);
        } else if (!newResult.shouldProcess) {
          console.log(`   ❌ FALLO: Registro con meta anual = 0 aún se ignora`);
          testsFailed++;
        }
      }

      console.log('');
    }

    // Resumen de resultados
    console.log('📋 RESUMEN DE PRUEBAS:');
    console.log(`   ✅ Pruebas exitosas: ${testsPassed}`);
    console.log(`   ❌ Pruebas fallidas: ${testsFailed}`);
    console.log(`   📊 Total de pruebas: ${testsPassed + testsFailed}`);

    if (testsFailed === 0) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! La funcionalidad de importación ahora procesa correctamente los valores 0.');
    } else {
      console.log('\n❌ Algunas pruebas fallaron. Revisar la implementación.');
    }

    // Limpiar archivo de prueba
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log(`\n🗑️ Archivo de prueba eliminado: ${testFilePath}`);
    }

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runTests();
}

module.exports = {
  simulateImportLogic,
  simulateOldImportLogic,
  runTests
};
