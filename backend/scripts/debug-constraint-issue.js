const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugConstraintIssue() {
  try {
    console.log('🐛 Depurando el problema de constraints...\n');

    // 1. Verificar todos los constraints en la tabla
    console.log('1️⃣ Verificando TODOS los constraints en vales_entrega:');
    const allConstraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns_array,
        string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns_string
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'vales_entrega' 
      GROUP BY tc.constraint_name, tc.constraint_type
      ORDER BY tc.constraint_type, tc.constraint_name;
    `;

    allConstraints.forEach((constraint, index) => {
      console.log(`  ${index + 1}. ${constraint.constraint_name} (${constraint.constraint_type})`);
      console.log(`     Columnas: ${constraint.columns_string}`);
    });

    // 2. Buscar específicamente constraints únicos problemáticos
    console.log('\n2️⃣ Buscando constraints únicos problemáticos:');
    const uniqueConstraints = allConstraints.filter(c => c.constraint_type === 'UNIQUE');
    
    uniqueConstraints.forEach((constraint, index) => {
      const hasOldPattern = constraint.columns_array.includes('centro_acopio_id') && 
                           constraint.columns_array.includes('mes') && 
                           constraint.columns_array.includes('anio') && 
                           constraint.columns_array.includes('tipo_vale') &&
                           !constraint.columns_array.includes('grupos_entregas_adicionales');
      
      const hasNewPattern = constraint.columns_array.includes('centro_acopio_id') && 
                           constraint.columns_array.includes('mes') && 
                           constraint.columns_array.includes('anio') && 
                           constraint.columns_array.includes('tipo_vale') &&
                           constraint.columns_array.includes('grupos_entregas_adicionales');

      let status = '✅ OK';
      if (hasOldPattern) status = '❌ PROBLEMÁTICO (patrón viejo)';
      else if (hasNewPattern) status = '✅ CORRECTO (patrón nuevo)';
      else if (constraint.constraint_name.includes('numero')) status = '✅ OK (número único)';
      else status = '❓ OTRO';

      console.log(`  ${index + 1}. ${constraint.constraint_name} - ${status}`);
      console.log(`     Columnas: ${constraint.columns_string}`);
    });

    // 3. Intentar eliminar constraints problemáticos
    console.log('\n3️⃣ Eliminando constraints problemáticos:');
    const problematicConstraints = uniqueConstraints.filter(c => 
      c.columns_array.includes('centro_acopio_id') && 
      c.columns_array.includes('mes') && 
      c.columns_array.includes('anio') && 
      c.columns_array.includes('tipo_vale') &&
      !c.columns_array.includes('grupos_entregas_adicionales')
    );

    if (problematicConstraints.length === 0) {
      console.log('  ✅ No se encontraron constraints problemáticos');
    } else {
      for (const constraint of problematicConstraints) {
        console.log(`  🗑️ Eliminando: ${constraint.constraint_name}`);
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE vales_entrega DROP CONSTRAINT "${constraint.constraint_name}";`);
          console.log(`     ✅ Eliminado exitosamente`);
        } catch (error) {
          console.log(`     ❌ Error: ${error.message}`);
        }
      }
    }

    // 4. Verificar si existe el constraint correcto
    console.log('\n4️⃣ Verificando constraint correcto:');
    const correctConstraints = uniqueConstraints.filter(c => 
      c.columns_array.includes('centro_acopio_id') && 
      c.columns_array.includes('mes') && 
      c.columns_array.includes('anio') && 
      c.columns_array.includes('tipo_vale') &&
      c.columns_array.includes('grupos_entregas_adicionales')
    );

    if (correctConstraints.length === 0) {
      console.log('  ❌ No existe constraint correcto, creándolo...');
      try {
        await prisma.$executeRaw`
          ALTER TABLE vales_entrega 
          ADD CONSTRAINT uk_centro_periodo_tipo_grupos 
          UNIQUE (centro_acopio_id, mes, anio, tipo_vale, grupos_entregas_adicionales);
        `;
        console.log('     ✅ Constraint correcto creado');
      } catch (error) {
        console.log(`     ❌ Error creando constraint: ${error.message}`);
      }
    } else {
      console.log(`  ✅ Existe(n) ${correctConstraints.length} constraint(s) correcto(s):`);
      correctConstraints.forEach(c => {
        console.log(`     - ${c.constraint_name}`);
      });
    }

    // 5. Verificación final
    console.log('\n5️⃣ Verificación final:');
    const finalConstraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns_array
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'vales_entrega' 
        AND tc.constraint_type = 'UNIQUE'
      GROUP BY tc.constraint_name
      ORDER BY tc.constraint_name;
    `;

    const stillHasProblems = finalConstraints.some(c => 
      c.columns_array.includes('centro_acopio_id') && 
      c.columns_array.includes('tipo_vale') &&
      !c.columns_array.includes('grupos_entregas_adicionales')
    );

    if (stillHasProblems) {
      console.log('  ❌ PROBLEMA PERSISTE: Aún hay constraints problemáticos');
      finalConstraints.forEach(c => {
        const isProblematic = c.columns_array.includes('centro_acopio_id') && 
                             c.columns_array.includes('tipo_vale') &&
                             !c.columns_array.includes('grupos_entregas_adicionales');
        if (isProblematic) {
          console.log(`     ❌ ${c.constraint_name}: ${c.columns_array.join(', ')}`);
        }
      });
    } else {
      console.log('  ✅ PROBLEMA RESUELTO: Todos los constraints están correctos');
    }

    // 6. Probar creación de vale
    console.log('\n6️⃣ Probando creación de vale de prueba:');
    
    // Buscar datos existentes
    const usuario = await prisma.usuario.findFirst();
    const establecimiento = await prisma.establecimiento.findFirst();
    
    if (!usuario || !establecimiento) {
      console.log('  ⚠️ No hay datos suficientes para probar (usuario o establecimiento faltante)');
    } else {
      // Limpiar vales de prueba existentes
      await prisma.valeEntrega.deleteMany({
        where: {
          numero: { startsWith: 'DEBUG-TEST-' }
        }
      });

      // Intentar crear vale #1
      try {
        const vale1 = await prisma.valeEntrega.create({
          data: {
            numero: 'DEBUG-TEST-001',
            centroAcopioId: establecimiento.id,
            mes: 12,
            anio: 2024,
            estado: 'generado',
            tipoVale: 'solo_adicionales',
            gruposEntregasAdicionales: '1',
            usuarioId: usuario.id,
            observaciones: 'Vale de prueba #1'
          }
        });
        console.log(`  ✅ Vale #1 creado: ${vale1.numero}`);

        // Intentar crear vale #2 (este debería funcionar ahora)
        try {
          const vale2 = await prisma.valeEntrega.create({
            data: {
              numero: 'DEBUG-TEST-002',
              centroAcopioId: establecimiento.id,
              mes: 12,
              anio: 2024,
              estado: 'generado',
              tipoVale: 'solo_adicionales',
              gruposEntregasAdicionales: '2',
              usuarioId: usuario.id,
              observaciones: 'Vale de prueba #2'
            }
          });
          console.log(`  ✅ Vale #2 creado: ${vale2.numero}`);
          console.log('  🎉 ¡ÉXITO! El problema está resuelto');

          // Limpiar vales de prueba
          await prisma.valeEntrega.deleteMany({
            where: {
              id: { in: [vale1.id, vale2.id] }
            }
          });
          console.log('  🧹 Vales de prueba eliminados');

        } catch (error) {
          console.log(`  ❌ Error creando vale #2: ${error.message}`);
          if (error.code === 'P2002') {
            console.log('     🔍 Aún hay problema de constraint único');
          }
        }

      } catch (error) {
        console.log(`  ❌ Error creando vale #1: ${error.message}`);
      }
    }

    console.log('\n📋 RESUMEN:');
    console.log('  - Si los vales de prueba se crearon exitosamente, el problema está resuelto');
    console.log('  - Si aún hay errores, puede ser necesario reiniciar el servidor backend');
    console.log('  - Ejecutar: npx prisma generate && reiniciar servidor');

  } catch (error) {
    console.error('❌ Error en depuración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugConstraintIssue()
    .then(() => {
      console.log('\n🏁 Depuración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { debugConstraintIssue };
