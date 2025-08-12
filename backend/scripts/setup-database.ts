import { PrismaClient } from '@prisma/client';
import { migrateEntregaBase } from './migrate-entrega-base';
import { createDatabaseTriggers, verifyTriggers } from './create-triggers';

const prisma = new PrismaClient();

/**
 * Script de configuración inicial de la base de datos
 * Ejecuta todas las migraciones y configuraciones necesarias
 */
async function setupDatabase() {
  console.log('🚀 Iniciando configuración de la base de datos...');
  
  try {
    // 1. Verificar conexión a la base de datos
    console.log('🔍 Verificando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');

    // 2. Ejecutar migraciones de Prisma
    console.log('📦 Aplicando migraciones de Prisma...');
    // Nota: Las migraciones de Prisma se ejecutan con `prisma migrate deploy` en producción
    // o `prisma migrate dev` en desarrollo

    // 3. Verificar si hay datos existentes
    const movimientosCount = await prisma.movimientoVacuna.count();
    console.log(`📊 Movimientos de vacunas existentes: ${movimientosCount}`);

    if (movimientosCount > 0) {
      // 4. Ejecutar migración de entrega_base si hay datos
      console.log('🔄 Ejecutando migración de entrega_base...');
      await migrateEntregaBase();
    } else {
      console.log('ℹ️  No hay datos existentes, omitiendo migración de entrega_base');
    }

    // 5. Crear funciones y triggers de PostgreSQL
    console.log('🔧 Configurando triggers de base de datos...');
    await createDatabaseTriggers();

    // 6. Verificar configuraciones del sistema
    const configCount = await prisma.configuracionSistema.count();
    console.log(`⚙️  Configuraciones del sistema: ${configCount}`);

    if (configCount === 0) {
      console.log('⚠️  No se encontraron configuraciones del sistema. Ejecuta el seeder: npm run db:seed');
    }

    // 7. Verificar triggers creados
    console.log('🔍 Verificando triggers de base de datos...');
    await verifyTriggers();

    console.log('🎉 Configuración de la base de datos completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la configuración de la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la configuración si el script se ejecuta directamente
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Configuración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la configuración:', error);
      process.exit(1);
    });
}

export { setupDatabase };
