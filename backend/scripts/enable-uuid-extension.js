const { PrismaClient } = require('@prisma/client');

/**
 * Script para habilitar la extensión UUID en PostgreSQL
 */

const prisma = new PrismaClient();

async function enableUuidExtension() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    console.log('🚀 Habilitando extensión uuid-ossp...');
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
    
    console.log('✅ Extensión UUID habilitada exitosamente');
    
    // Verificar que la extensión está habilitada
    console.log('🔍 Verificando extensión...');
    const result = await prisma.$queryRaw`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'uuid-ossp';
    `;
    
    if (result.length > 0) {
      console.log(`📋 Extensión encontrada: ${result[0].extname} v${result[0].extversion}`);
    } else {
      console.log('⚠️  Extensión no encontrada');
    }
    
  } catch (error) {
    console.error('❌ Error al habilitar la extensión UUID:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  enableUuidExtension().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { enableUuidExtension };
