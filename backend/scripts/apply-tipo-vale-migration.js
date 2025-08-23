const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyTipoValeMigration() {
  try {
    console.log('🔄 Conectando a la base de datos...');

    console.log('📖 Leyendo archivo de migración...');
    const migrationPath = path.join(__dirname, '..', 'migrations', '002_add_tipo_vale_support.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Aplicando migración de soporte para tipos de vale...');

    // Dividir el SQL en bloques DO $$ ... END $$; y otros statements
    const blocks = [];
    let currentBlock = '';
    let inDoBlock = false;
    let dollarCount = 0;

    const lines = migrationSQL.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Ignorar comentarios y líneas vacías cuando no estamos en un bloque DO
      if (!inDoBlock && (trimmedLine.startsWith('--') || trimmedLine === '')) {
        continue;
      }
      
      currentBlock += line + '\n';
      
      // Detectar inicio de bloque DO $$
      if (trimmedLine.includes('DO $$')) {
        inDoBlock = true;
        dollarCount = 0;
      }
      
      // Contar $$ dentro del bloque
      if (inDoBlock) {
        const matches = line.match(/\$\$/g);
        if (matches) {
          dollarCount += matches.length;
        }
        
        // Si tenemos un número par de $$, el bloque está cerrado
        if (dollarCount >= 2 && dollarCount % 2 === 0 && trimmedLine.includes('$$;')) {
          blocks.push(currentBlock.trim());
          currentBlock = '';
          inDoBlock = false;
          dollarCount = 0;
        }
      } else {
        // Para statements normales, terminar en ;
        if (trimmedLine.endsWith(';') && !trimmedLine.startsWith('--')) {
          blocks.push(currentBlock.trim());
          currentBlock = '';
        }
      }
    }
    
    // Agregar el último bloque si existe
    if (currentBlock.trim()) {
      blocks.push(currentBlock.trim());
    }

    console.log(`📝 Ejecutando ${blocks.length} bloques de migración...`);

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.trim()) {
        try {
          console.log(`  ${i + 1}/${blocks.length}: Ejecutando bloque...`);
          console.log(`    Tipo: ${block.includes('DO $$') ? 'Bloque DO' : 'Statement SQL'}`);
          
          await prisma.$executeRawUnsafe(block);
          console.log(`    ✅ Bloque ejecutado exitosamente`);
        } catch (error) {
          // Manejar errores esperados
          if (error.message.includes('already exists') ||
              error.message.includes('ya existe') ||
              error.message.includes('does not exist')) {
            console.log(`    ⚠️  Warning: ${error.message}`);
          } else {
            console.error(`    ❌ Error en bloque ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log('✅ Migración de tipos de vale aplicada exitosamente');

    // Verificar que la migración se aplicó correctamente
    console.log('🔍 Verificando migración...');
    
    try {
      // Verificar que el enum existe
      const enumResult = await prisma.$queryRaw`
        SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_vale') as enum_exists;
      `;
      
      // Verificar que la columna existe
      const columnResult = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'vales_entrega' AND column_name = 'tipo_vale'
        ) as column_exists;
      `;
      
      // Verificar que el constraint existe
      const constraintResult = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'vales_entrega' AND constraint_name = 'uk_centro_periodo_tipo_grupos'
        ) as constraint_exists;
      `;
      
      console.log('📊 Resultados de verificación:');
      console.log(`  - Enum tipo_vale: ${enumResult[0].enum_exists ? '✅' : '❌'}`);
      console.log(`  - Columna tipo_vale: ${columnResult[0].column_exists ? '✅' : '❌'}`);
      console.log(`  - Constraint uk_centro_periodo_tipo_grupos: ${constraintResult[0].constraint_exists ? '✅' : '❌'}`);
      
      if (enumResult[0].enum_exists && columnResult[0].column_exists && constraintResult[0].constraint_exists) {
        console.log('🎉 Migración verificada exitosamente - La base de datos está lista para soportar múltiples tipos de vale');
      } else {
        throw new Error('La verificación de la migración falló');
      }
      
    } catch (verifyError) {
      console.error('❌ Error al verificar la migración:', verifyError.message);
      throw verifyError;
    }

  } catch (error) {
    console.error('❌ Error al aplicar migración de tipos de vale:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  applyTipoValeMigration()
    .then(() => {
      console.log('🏁 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { applyTipoValeMigration };
