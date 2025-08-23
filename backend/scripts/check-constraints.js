const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConstraints() {
  try {
    console.log('🔍 Verificando constraints en la tabla vales_entrega...\n');

    // Verificar todos los constraints únicos
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'vales_entrega' 
        AND tc.constraint_type = 'UNIQUE'
      GROUP BY tc.constraint_name, tc.constraint_type
      ORDER BY tc.constraint_name;
    `;

    console.log('📋 Constraints únicos encontrados:');
    constraints.forEach((constraint, index) => {
      console.log(`  ${index + 1}. ${constraint.constraint_name}`);
      console.log(`     Tipo: ${constraint.constraint_type}`);
      console.log(`     Columnas: ${constraint.columns}`);
      console.log('');
    });

    // Verificar si existe el constraint problemático
    const oldConstraint = constraints.find(c => 
      c.columns === 'centro_acopio_id, mes, anio, tipo_vale' ||
      c.constraint_name === 'uk_centro_periodo_tipo'
    );

    const newConstraint = constraints.find(c => 
      c.constraint_name === 'uk_centro_periodo_tipo_grupos'
    );

    console.log('🔍 Análisis de constraints:');
    console.log(`  ❌ Constraint problemático (viejo): ${oldConstraint ? 'EXISTE' : 'No existe'}`);
    if (oldConstraint) {
      console.log(`     Nombre: ${oldConstraint.constraint_name}`);
      console.log(`     Columnas: ${oldConstraint.columns}`);
    }
    
    console.log(`  ✅ Constraint correcto (nuevo): ${newConstraint ? 'EXISTE' : 'No existe'}`);
    if (newConstraint) {
      console.log(`     Nombre: ${newConstraint.constraint_name}`);
      console.log(`     Columnas: ${newConstraint.columns}`);
    }

    // Verificar estructura de la tabla
    console.log('\n📋 Estructura de la tabla vales_entrega:');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'vales_entrega' 
      ORDER BY ordinal_position;
    `;

    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    if (oldConstraint) {
      console.log('  🔧 ACCIÓN REQUERIDA: Eliminar el constraint viejo que está causando el problema');
      console.log(`     SQL: ALTER TABLE vales_entrega DROP CONSTRAINT ${oldConstraint.constraint_name};`);
    }
    
    if (!newConstraint) {
      console.log('  🔧 ACCIÓN REQUERIDA: Crear el constraint nuevo');
      console.log('     SQL: ALTER TABLE vales_entrega ADD CONSTRAINT uk_centro_periodo_tipo_grupos UNIQUE (centro_acopio_id, mes, anio, tipo_vale, grupos_entregas_adicionales);');
    }

    if (!oldConstraint && newConstraint) {
      console.log('  ✅ Los constraints están correctos. El problema puede ser que Prisma esté usando cache.');
      console.log('     Solución: Ejecutar "npx prisma generate" y reiniciar el servidor.');
    }

  } catch (error) {
    console.error('❌ Error verificando constraints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkConstraints()
    .then(() => {
      console.log('\n🏁 Verificación de constraints completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { checkConstraints };
