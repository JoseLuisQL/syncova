const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleConstraintFix() {
  try {
    console.log('🔧 Reparación simple de constraints...\n');

    // 1. Verificar constraints actuales
    console.log('1️⃣ Verificando constraints actuales...');
    const currentConstraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'vales_entrega' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name != 'vales_entrega_numero_key'
      ORDER BY constraint_name;
    `;

    console.log('Constraints únicos encontrados:');
    currentConstraints.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.constraint_name}`);
    });

    // 2. Eliminar constraints problemáticos conocidos
    console.log('\n2️⃣ Eliminando constraints problemáticos...');
    
    const problematicNames = [
      'uk_centro_periodo_tipo',
      'vales_entrega_centro_acopio_id_mes_anio_tipo_vale_key',
      'vales_entrega_centro_acopio_id_mes_anio_tipo_vale_idx'
    ];

    for (const constraintName of problematicNames) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE vales_entrega DROP CONSTRAINT IF EXISTS "${constraintName}";`);
        console.log(`  ✅ Eliminado (si existía): ${constraintName}`);
      } catch (error) {
        console.log(`  ⚠️ No se pudo eliminar ${constraintName}: ${error.message}`);
      }
    }

    // 3. Crear el constraint correcto
    console.log('\n3️⃣ Creando constraint correcto...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE vales_entrega 
        ADD CONSTRAINT uk_centro_periodo_tipo_grupos 
        UNIQUE (centro_acopio_id, mes, anio, tipo_vale, grupos_entregas_adicionales);
      `;
      console.log('  ✅ Constraint uk_centro_periodo_tipo_grupos creado');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('ya existe')) {
        console.log('  ✅ Constraint ya existe');
      } else {
        console.log(`  ❌ Error creando constraint: ${error.message}`);
      }
    }

    // 4. Verificar resultado final
    console.log('\n4️⃣ Verificando resultado...');
    const finalConstraints = await prisma.$queryRaw`
      SELECT constraint_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'vales_entrega' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name != 'vales_entrega_numero_key'
      ORDER BY constraint_name;
    `;

    console.log('Constraints únicos finales:');
    finalConstraints.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.constraint_name}`);
    });

    // 5. Regenerar cliente Prisma
    console.log('\n5️⃣ Regenerando cliente Prisma...');
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const generateProcess = spawn('npx', ['prisma', 'generate'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });

      generateProcess.on('close', (code) => {
        if (code === 0) {
          console.log('  ✅ Cliente Prisma regenerado');
          resolve();
        } else {
          console.log('  ⚠️ Error regenerando cliente Prisma');
          resolve(); // Continuar aunque falle
        }
      });

      generateProcess.on('error', (error) => {
        console.log(`  ⚠️ Error ejecutando prisma generate: ${error.message}`);
        resolve(); // Continuar aunque falle
      });
    });

  } catch (error) {
    console.error('❌ Error en reparación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  simpleConstraintFix()
    .then(() => {
      console.log('\n🎉 Reparación completada');
      console.log('\n📋 PRÓXIMOS PASOS:');
      console.log('1. Reiniciar el servidor backend');
      console.log('2. Probar generar vales de entregas adicionales');
      console.log('\nSi el problema persiste, puede ser necesario:');
      console.log('- Verificar que no hay cache de Prisma');
      console.log('- Reiniciar completamente el proceso Node.js');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { simpleConstraintFix };
