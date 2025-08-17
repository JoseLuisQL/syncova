const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

/**
 * Script para aplicar la migración de configuración jeringa-vacuna
 * Este script aplica manualmente la migración SQL usando Prisma
 */

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Conectando a la base de datos...');

    console.log('📖 Leyendo archivo de migración...');
    const migrationPath = path.join(__dirname, '..', 'migrations', '001_simple_configuracion_jeringa_vacuna.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Aplicando migración...');

    // Dividir el SQL en statements individuales y ejecutarlos uno por uno
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Ejecutando ${statements.length} statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`  ${i + 1}/${statements.length}: Ejecutando statement...`);
          await prisma.$executeRawUnsafe(statement + ';');
        } catch (error) {
          // Ignorar errores de extensiones ya existentes y otros errores menores
          if (error.message.includes('already exists') ||
              error.message.includes('ya existe') ||
              error.message.includes('does not exist')) {
            console.log(`  ⚠️  Warning: ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✅ Migración aplicada exitosamente');

    // Verificar que las tablas se crearon
    console.log('🔍 Verificando tablas creadas...');
    const result = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('configuracion_jeringa_vacuna_defecto', 'configuracion_jeringa_vacuna_centro')
      ORDER BY table_name;
    `;

    console.log('📋 Tablas encontradas:');
    result.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Verificar índices
    console.log('🔍 Verificando índices...');
    const indexResult = await prisma.$queryRaw`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('configuracion_jeringa_vacuna_defecto', 'configuracion_jeringa_vacuna_centro')
      AND indexname LIKE 'idx_config_%'
      ORDER BY indexname;
    `;

    console.log('📋 Índices creados:');
    indexResult.forEach(row => {
      console.log(`  ✓ ${row.indexname}`);
    });

    // Verificar constraints
    console.log('🔍 Verificando constraints...');
    const constraintResult = await prisma.$queryRaw`
      SELECT constraint_name, table_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name IN ('configuracion_jeringa_vacuna_defecto', 'configuracion_jeringa_vacuna_centro')
      AND constraint_type IN ('FOREIGN KEY', 'UNIQUE', 'CHECK')
      ORDER BY table_name, constraint_name;
    `;

    console.log('📋 Constraints creados:');
    constraintResult.forEach(row => {
      console.log(`  ✓ ${row.table_name}.${row.constraint_name} (${row.constraint_type})`);
    });

  } catch (error) {
    console.error('❌ Error al aplicar la migración:', error.message);
    console.error('📝 Detalles del error:', error);
    process.exit(1);
  }
}

// Función para verificar el estado actual
async function checkCurrentState() {
  try {
    console.log('🔍 Verificando estado actual de la base de datos...');

    // Verificar si las tablas ya existen
    const existingTables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('configuracion_jeringa_vacuna_defecto', 'configuracion_jeringa_vacuna_centro');
    `;

    if (existingTables.length > 0) {
      console.log('⚠️  Las siguientes tablas ya existen:');
      existingTables.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });

      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        rl.question('¿Desea continuar y recrear las tablas? (y/N): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });
    }

    return true;

  } catch (error) {
    console.error('❌ Error al verificar el estado:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🎯 Iniciando aplicación de migración de configuración jeringa-vacuna');
  console.log('=' .repeat(60));
  
  // Verificar estado actual
  const shouldContinue = await checkCurrentState();
  if (!shouldContinue) {
    console.log('❌ Operación cancelada por el usuario');
    process.exit(0);
  }
  
  // Aplicar migración
  await applyMigration();
  
  console.log('=' .repeat(60));
  console.log('🎉 Migración completada exitosamente');
  console.log('');
  console.log('📝 Próximos pasos:');
  console.log('  1. Verificar que el backend puede conectarse correctamente');
  console.log('  2. Probar las nuevas funcionalidades de configuración');
  console.log('  3. Configurar algunas configuraciones por defecto');

  await prisma.$disconnect();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { applyMigration, checkCurrentState };
