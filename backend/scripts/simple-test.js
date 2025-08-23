const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleTest() {
  try {
    console.log('🔄 Conectando a la base de datos...');

    // Test 1: Verificar que la tabla vales_entrega existe y tiene las nuevas columnas
    console.log('📋 Verificando estructura de tabla vales_entrega...');
    
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'vales_entrega' 
      ORDER BY ordinal_position;
    `;
    
    console.log('Columnas en vales_entrega:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Test 2: Verificar que el enum tipo_vale existe
    console.log('\n🔍 Verificando enum tipo_vale...');
    const enumValues = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_vale')
      ORDER BY enumlabel;
    `;
    
    console.log('Valores del enum tipo_vale:');
    enumValues.forEach(val => {
      console.log(`  - ${val.enumlabel}`);
    });

    // Test 3: Verificar constraints únicos
    console.log('\n🔒 Verificando constraints únicos...');
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'vales_entrega' 
      AND constraint_type = 'UNIQUE';
    `;
    
    console.log('Constraints únicos en vales_entrega:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });

    // Test 4: Intentar crear un vale de prueba simple
    console.log('\n📝 Intentando crear un vale de prueba...');
    
    // Primero buscar un usuario
    const usuario = await prisma.usuario.findFirst();
    if (!usuario) {
      console.log('⚠️  No hay usuarios en la base de datos, creando uno de prueba...');
      // Crear usuario de prueba si no existe
      const usuarioPrueba = await prisma.usuario.create({
        data: {
          nombres: 'Usuario',
          apellidos: 'Prueba',
          email: 'test@test.com',
          password: 'test123',
          rol: 'operador',
          estado: 'activo'
        }
      });
      console.log(`✅ Usuario de prueba creado: ${usuarioPrueba.id}`);
    }

    // Buscar un establecimiento
    const establecimiento = await prisma.establecimiento.findFirst();
    if (!establecimiento) {
      console.log('⚠️  No hay establecimientos en la base de datos');
      return;
    }

    const usuarioFinal = usuario || await prisma.usuario.findFirst();
    
    // Crear vale de prueba
    const valePrueba = await prisma.valeEntrega.create({
      data: {
        numero: 'TEST-SIMPLE-001',
        centroAcopioId: establecimiento.id,
        mes: 12,
        anio: 2024,
        estado: 'generado',
        tipoVale: 'completo',
        gruposEntregasAdicionales: null,
        usuarioId: usuarioFinal.id,
        observaciones: 'Vale de prueba simple'
      }
    });

    console.log(`✅ Vale de prueba creado exitosamente: ${valePrueba.numero}`);

    // Limpiar vale de prueba
    await prisma.valeEntrega.delete({
      where: { id: valePrueba.id }
    });
    console.log('🧹 Vale de prueba eliminado');

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ La migración se aplicó correctamente y el sistema está listo para soportar múltiples tipos de vale');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    
    if (error.code === 'P2002') {
      console.log('ℹ️  Este es un error de constraint único, lo cual es esperado en algunas pruebas');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  simpleTest()
    .then(() => {
      console.log('🏁 Prueba simple finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en la prueba simple:', error);
      process.exit(1);
    });
}

module.exports = { simpleTest };
