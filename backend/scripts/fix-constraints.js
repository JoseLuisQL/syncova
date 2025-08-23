const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixConstraints() {
  try {
    console.log('🔧 Reparando constraints en la tabla vales_entrega...\n');

    // Verificar todos los constraints únicos existentes
    const allConstraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'vales_entrega' 
        AND tc.constraint_type = 'UNIQUE'
        AND tc.constraint_name != 'vales_entrega_numero_key'  -- Excluir el constraint del número
      GROUP BY tc.constraint_name, tc.constraint_type
      ORDER BY tc.constraint_name;
    `;

    console.log('📋 Constraints únicos encontrados:');
    allConstraints.forEach((constraint, index) => {
      console.log(`  ${index + 1}. ${constraint.constraint_name}`);
      console.log(`     Columnas: ${constraint.columns}`);
    });

    // Buscar constraints problemáticos (que no incluyan grupos_entregas_adicionales)
    const problematicConstraints = allConstraints.filter(c => 
      c.columns.includes('centro_acopio_id') && 
      c.columns.includes('mes') && 
      c.columns.includes('anio') && 
      c.columns.includes('tipo_vale') &&
      !c.columns.includes('grupos_entregas_adicionales')
    );

    console.log(`\n🔍 Constraints problemáticos encontrados: ${problematicConstraints.length}`);

    // Eliminar constraints problemáticos
    for (const constraint of problematicConstraints) {
      console.log(`\n🗑️  Eliminando constraint problemático: ${constraint.constraint_name}`);
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE vales_entrega DROP CONSTRAINT ${constraint.constraint_name};`);
        console.log(`   ✅ Constraint ${constraint.constraint_name} eliminado exitosamente`);
      } catch (error) {
        console.log(`   ⚠️  Error eliminando constraint ${constraint.constraint_name}: ${error.message}`);
      }
    }

    // Verificar si existe el constraint correcto
    const correctConstraints = allConstraints.filter(c => 
      c.columns.includes('centro_acopio_id') && 
      c.columns.includes('mes') && 
      c.columns.includes('anio') && 
      c.columns.includes('tipo_vale') &&
      c.columns.includes('grupos_entregas_adicionales')
    );

    console.log(`\n✅ Constraints correctos encontrados: ${correctConstraints.length}`);

    if (correctConstraints.length === 0) {
      console.log('\n🔧 Creando constraint correcto...');
      try {
        await prisma.$executeRaw`
          ALTER TABLE vales_entrega 
          ADD CONSTRAINT uk_centro_periodo_tipo_grupos 
          UNIQUE (centro_acopio_id, mes, anio, tipo_vale, grupos_entregas_adicionales);
        `;
        console.log('   ✅ Constraint uk_centro_periodo_tipo_grupos creado exitosamente');
      } catch (error) {
        console.log(`   ⚠️  Error creando constraint: ${error.message}`);
      }
    } else {
      console.log('   ✅ Ya existe un constraint correcto');
      correctConstraints.forEach(c => {
        console.log(`      - ${c.constraint_name}: ${c.columns}`);
      });
    }

    // Verificación final
    console.log('\n🔍 Verificación final...');
    const finalConstraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'vales_entrega' 
        AND tc.constraint_type = 'UNIQUE'
        AND tc.constraint_name != 'vales_entrega_numero_key'
      GROUP BY tc.constraint_name
      ORDER BY tc.constraint_name;
    `;

    console.log('📋 Constraints finales:');
    finalConstraints.forEach((constraint, index) => {
      const isCorrect = constraint.columns.includes('grupos_entregas_adicionales');
      console.log(`  ${index + 1}. ${constraint.constraint_name} ${isCorrect ? '✅' : '❌'}`);
      console.log(`     Columnas: ${constraint.columns}`);
    });

    const hasProblematicConstraints = finalConstraints.some(c => 
      c.columns.includes('centro_acopio_id') && 
      c.columns.includes('tipo_vale') &&
      !c.columns.includes('grupos_entregas_adicionales')
    );

    if (hasProblematicConstraints) {
      console.log('\n❌ ADVERTENCIA: Aún existen constraints problemáticos');
      console.log('   Esto puede causar errores al generar múltiples vales de entregas adicionales');
    } else {
      console.log('\n✅ ÉXITO: Todos los constraints están correctos');
      console.log('   El sistema debería poder generar múltiples vales de entregas adicionales');
    }

    console.log('\n🔄 SIGUIENTE PASO: Regenerar cliente Prisma y reiniciar servidor');
    console.log('   1. npx prisma generate');
    console.log('   2. Reiniciar el servidor backend');

  } catch (error) {
    console.error('❌ Error reparando constraints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixConstraints()
    .then(() => {
      console.log('\n🏁 Reparación de constraints completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { fixConstraints };
