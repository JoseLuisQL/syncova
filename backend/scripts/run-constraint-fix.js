const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runConstraintFix() {
  try {
    console.log('🔧 Ejecutando reparación directa de constraints...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'fix-constraint-direct.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Ejecutando ${statements.length} statements SQL...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`${i + 1}/${statements.length}: Ejecutando...`);
          
          // Ejecutar el statement
          const result = await prisma.$executeRawUnsafe(statement + ';');
          
          console.log(`✅ Ejecutado exitosamente`);
          
          // Si es un SELECT, mostrar resultados
          if (statement.trim().toUpperCase().startsWith('SELECT')) {
            try {
              const queryResult = await prisma.$queryRawUnsafe(statement + ';');
              if (queryResult && queryResult.length > 0) {
                console.log('📊 Resultados:');
                queryResult.forEach((row, index) => {
                  console.log(`  ${index + 1}. ${JSON.stringify(row)}`);
                });
              }
            } catch (queryError) {
              // Ignorar errores de query para mostrar resultados
            }
          }
          
        } catch (error) {
          if (error.message.includes('does not exist') || 
              error.message.includes('already exists') ||
              error.message.includes('no existe') ||
              error.message.includes('ya existe')) {
            console.log(`⚠️ Warning: ${error.message}`);
          } else {
            console.error(`❌ Error: ${error.message}`);
          }
        }
        console.log('');
      }
    }

    console.log('✅ Reparación de constraints completada\n');

    // Verificación final simple
    console.log('🔍 Verificación final...');
    
    try {
      // Intentar crear dos vales de prueba para verificar que funciona
      const usuario = await prisma.usuario.findFirst();
      const establecimiento = await prisma.establecimiento.findFirst();
      
      if (usuario && establecimiento) {
        // Limpiar vales de prueba existentes
        await prisma.valeEntrega.deleteMany({
          where: {
            numero: { startsWith: 'CONSTRAINT-TEST-' }
          }
        });

        console.log('📝 Probando creación de múltiples vales...');

        // Vale #1
        const vale1 = await prisma.valeEntrega.create({
          data: {
            numero: 'CONSTRAINT-TEST-001',
            centroAcopioId: establecimiento.id,
            mes: 12,
            anio: 2024,
            estado: 'generado',
            tipoVale: 'solo_adicionales',
            gruposEntregasAdicionales: '1',
            usuarioId: usuario.id,
            observaciones: 'Prueba constraint #1'
          }
        });
        console.log(`✅ Vale #1 creado: ${vale1.numero}`);

        // Vale #2 (este debería funcionar ahora)
        const vale2 = await prisma.valeEntrega.create({
          data: {
            numero: 'CONSTRAINT-TEST-002',
            centroAcopioId: establecimiento.id,
            mes: 12,
            anio: 2024,
            estado: 'generado',
            tipoVale: 'solo_adicionales',
            gruposEntregasAdicionales: '2',
            usuarioId: usuario.id,
            observaciones: 'Prueba constraint #2'
          }
        });
        console.log(`✅ Vale #2 creado: ${vale2.numero}`);

        console.log('\n🎉 ¡ÉXITO! El problema de constraints está resuelto');
        console.log('   Ahora puedes generar múltiples vales de entregas adicionales');

        // Limpiar vales de prueba
        await prisma.valeEntrega.deleteMany({
          where: {
            id: { in: [vale1.id, vale2.id] }
          }
        });
        console.log('🧹 Vales de prueba eliminados');

      } else {
        console.log('⚠️ No hay datos suficientes para probar (falta usuario o establecimiento)');
        console.log('   Pero los constraints deberían estar corregidos');
      }

    } catch (testError) {
      if (testError.code === 'P2002') {
        console.log('❌ El problema de constraint único persiste');
        console.log('   Puede ser necesario reiniciar el servidor backend');
        console.log('   O ejecutar: npx prisma db push --force-reset');
      } else {
        console.log(`❌ Error en prueba: ${testError.message}`);
      }
    }

    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Reiniciar el servidor backend');
    console.log('2. Ejecutar: npx prisma generate');
    console.log('3. Probar generar vales de entregas adicionales en la aplicación');

  } catch (error) {
    console.error('❌ Error ejecutando reparación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runConstraintFix()
    .then(() => {
      console.log('\n🏁 Reparación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { runConstraintFix };
