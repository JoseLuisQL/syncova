const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyRolesAndPermissions() {
  console.log('🔍 Verificando datos de roles y permisos...\n');

  try {
    // Contar registros
    const rolesCount = await prisma.role.count();
    const permissionsCount = await prisma.permission.count();
    const rolePermissionsCount = await prisma.rolePermission.count();
    const usuariosConRoleId = await prisma.usuario.count({ where: { roleId: { not: null } } });
    const usuariosTotales = await prisma.usuario.count();

    console.log('📊 RESUMEN DE DATOS:');
    console.log('─'.repeat(40));
    console.log(`   Roles:              ${rolesCount}`);
    console.log(`   Permisos:           ${permissionsCount}`);
    console.log(`   Role-Permissions:   ${rolePermissionsCount}`);
    console.log(`   Usuarios con Role:  ${usuariosConRoleId} / ${usuariosTotales}`);
    console.log('─'.repeat(40));

    // Listar roles
    console.log('\n👥 ROLES CREADOS:');
    const roles = await prisma.role.findMany({
      include: {
        _count: { select: { rolePermissions: true, usuarios: true } }
      },
      orderBy: { nombre: 'asc' }
    });
    
    roles.forEach(role => {
      console.log(`   • ${role.nombre} (${role.codigo})`);
      console.log(`     - Permisos: ${role._count.rolePermissions}`);
      console.log(`     - Usuarios: ${role._count.usuarios}`);
    });

    // Listar permisos por categoría
    console.log('\n🔑 PERMISOS POR CATEGORÍA:');
    const permissions = await prisma.permission.findMany({
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }]
    });

    const byCategory = {};
    permissions.forEach(p => {
      if (!byCategory[p.categoria]) byCategory[p.categoria] = [];
      byCategory[p.categoria].push(p.nombre);
    });

    Object.entries(byCategory).forEach(([cat, perms]) => {
      console.log(`   📁 ${cat}: ${perms.length} permisos`);
    });

    // Verificar usuarios sin roleId
    const usuariosSinRole = await prisma.usuario.findMany({
      where: { roleId: null },
      select: { id: true, usuario: true, rol: true, email: true }
    });

    if (usuariosSinRole.length > 0) {
      console.log('\n⚠️  USUARIOS SIN ROLE_ID ASIGNADO:');
      usuariosSinRole.forEach(u => {
        console.log(`   • ${u.usuario} (${u.email}) - rol enum: ${u.rol}`);
      });
    } else {
      console.log('\n✅ Todos los usuarios tienen roleId asignado');
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRolesAndPermissions();
