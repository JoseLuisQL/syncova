import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed inicial para roles y permisos del sistema
 */
export async function seedRolesAndPermissions() {
  console.log('🌱 Iniciando seed de roles y permisos...');

  try {
    // 1. Crear permisos del sistema
    const permissions = [
      // Usuarios
      { nombre: 'Ver Usuarios', codigo: 'usuarios:read', recurso: 'usuarios', accion: 'read', categoria: 'Gestión de Usuarios', descripcion: 'Permite ver la lista de usuarios del sistema' },
      { nombre: 'Crear Usuarios', codigo: 'usuarios:write', recurso: 'usuarios', accion: 'write', categoria: 'Gestión de Usuarios', descripcion: 'Permite crear nuevos usuarios' },
      { nombre: 'Editar Usuarios', codigo: 'usuarios:update', recurso: 'usuarios', accion: 'update', categoria: 'Gestión de Usuarios', descripcion: 'Permite editar usuarios existentes' },
      { nombre: 'Eliminar Usuarios', codigo: 'usuarios:delete', recurso: 'usuarios', accion: 'delete', categoria: 'Gestión de Usuarios', descripcion: 'Permite eliminar usuarios' },
      { nombre: 'Gestionar Contraseñas', codigo: 'usuarios:password', recurso: 'usuarios', accion: 'password', categoria: 'Gestión de Usuarios', descripcion: 'Permite cambiar contraseñas de usuarios' },

      // Roles y Permisos
      { nombre: 'Ver Roles', codigo: 'roles:read', recurso: 'roles', accion: 'read', categoria: 'Gestión de Roles', descripcion: 'Permite ver roles del sistema' },
      { nombre: 'Gestionar Roles', codigo: 'roles:write', recurso: 'roles', accion: 'write', categoria: 'Gestión de Roles', descripcion: 'Permite crear, editar y eliminar roles' },
      { nombre: 'Asignar Permisos', codigo: 'permissions:assign', recurso: 'permissions', accion: 'assign', categoria: 'Gestión de Roles', descripcion: 'Permite asignar permisos a roles' },

      // Establecimientos
      { nombre: 'Ver Establecimientos', codigo: 'establecimientos:read', recurso: 'establecimientos', accion: 'read', categoria: 'Infraestructura', descripcion: 'Permite ver establecimientos de salud' },
      { nombre: 'Gestionar Establecimientos', codigo: 'establecimientos:write', recurso: 'establecimientos', accion: 'write', categoria: 'Infraestructura', descripcion: 'Permite crear y editar establecimientos' },

      // Vacunas
      { nombre: 'Ver Vacunas', codigo: 'vacunas:read', recurso: 'vacunas', accion: 'read', categoria: 'Inventario', descripcion: 'Permite ver catálogo de vacunas' },
      { nombre: 'Gestionar Vacunas', codigo: 'vacunas:write', recurso: 'vacunas', accion: 'write', categoria: 'Inventario', descripcion: 'Permite gestionar vacunas y jeringas' },

      // Planificación
      { nombre: 'Ver Planificación', codigo: 'planificacion:read', recurso: 'planificacion', accion: 'read', categoria: 'Planificación', descripcion: 'Permite ver planificaciones anuales' },
      { nombre: 'Gestionar Planificación', codigo: 'planificacion:write', recurso: 'planificacion', accion: 'write', categoria: 'Planificación', descripcion: 'Permite crear y editar planificaciones' },

      // Movimientos
      { nombre: 'Ver Movimientos', codigo: 'movimientos:read', recurso: 'movimientos', accion: 'read', categoria: 'Operaciones', descripcion: 'Permite ver movimientos de inventario' },
      { nombre: 'Registrar Movimientos', codigo: 'movimientos:write', recurso: 'movimientos', accion: 'write', categoria: 'Operaciones', descripcion: 'Permite registrar movimientos de inventario' },

      // Entregas
      { nombre: 'Ver Entregas', codigo: 'entregas:read', recurso: 'entregas', accion: 'read', categoria: 'Operaciones', descripcion: 'Permite ver entregas de vacunas' },
      { nombre: 'Gestionar Entregas', codigo: 'entregas:write', recurso: 'entregas', accion: 'write', categoria: 'Operaciones', descripcion: 'Permite gestionar entregas de vacunas' },

      // Vales
      { nombre: 'Ver Vales', codigo: 'vales:read', recurso: 'vales', accion: 'read', categoria: 'Operaciones', descripcion: 'Permite ver vales de entrega' },
      { nombre: 'Gestionar Vales', codigo: 'vales:write', recurso: 'vales', accion: 'write', categoria: 'Operaciones', descripcion: 'Permite crear y gestionar vales' },

      // Kardex
      { nombre: 'Ver Kardex', codigo: 'kardex:read', recurso: 'kardex', accion: 'read', categoria: 'Reportes', descripcion: 'Permite ver kardex de inventario' },
      { nombre: 'Gestionar Kardex', codigo: 'kardex:write', recurso: 'kardex', accion: 'write', categoria: 'Reportes', descripcion: 'Permite gestionar kardex de inventario' },

      // Reportes
      { nombre: 'Ver Reportes', codigo: 'reportes:read', recurso: 'reportes', accion: 'read', categoria: 'Reportes', descripcion: 'Permite ver reportes del sistema' },
      { nombre: 'Exportar Reportes', codigo: 'reportes:export', recurso: 'reportes', accion: 'export', categoria: 'Reportes', descripcion: 'Permite exportar reportes' },

      // Alertas
      { nombre: 'Ver Alertas', codigo: 'alertas:read', recurso: 'alertas', accion: 'read', categoria: 'Sistema', descripcion: 'Permite ver alertas del sistema' },
      { nombre: 'Gestionar Alertas', codigo: 'alertas:write', recurso: 'alertas', accion: 'write', categoria: 'Sistema', descripcion: 'Permite gestionar alertas' },

      // Configuración
      { nombre: 'Ver Configuración', codigo: 'configuracion:read', recurso: 'configuracion', accion: 'read', categoria: 'Sistema', descripcion: 'Permite ver configuración del sistema' },
      { nombre: 'Gestionar Configuración', codigo: 'configuracion:write', recurso: 'configuracion', accion: 'write', categoria: 'Sistema', descripcion: 'Permite modificar configuración del sistema' },
    ];

    console.log('📝 Creando permisos...');
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { codigo: permission.codigo },
        update: permission,
        create: permission,
      });
    }

    // 2. Crear roles del sistema
    const roles = [
      {
        nombre: 'Administrador',
        codigo: 'administrador',
        descripcion: 'Acceso completo al sistema',
        esDefault: true,
      },
      {
        nombre: 'Coordinador',
        codigo: 'coordinador',
        descripcion: 'Gestión de planificación y coordinación',
        esDefault: true,
      },
      {
        nombre: 'Responsable de Acopio',
        codigo: 'responsable_acopio',
        descripcion: 'Gestión de inventario y movimientos',
        esDefault: true,
      },
      {
        nombre: 'Operador',
        codigo: 'operador',
        descripcion: 'Operaciones básicas del sistema',
        esDefault: true,
      },
    ];

    console.log('👥 Creando roles...');
    for (const role of roles) {
      await prisma.role.upsert({
        where: { codigo: role.codigo },
        update: role,
        create: role,
      });
    }

    // 3. Asignar permisos a roles
    console.log('🔗 Asignando permisos a roles...');

    // Administrador - Todos los permisos
    const adminRole = await prisma.role.findUnique({ where: { codigo: 'administrador' } });
    const allPermissions = await prisma.permission.findMany();
    
    if (adminRole) {
      for (const permission of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            unique_role_permission: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        });
      }
    }

    // Coordinador - Permisos de gestión y lectura
    const coordinadorRole = await prisma.role.findUnique({ where: { codigo: 'coordinador' } });
    const coordinadorPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { codigo: { in: ['establecimientos:read', 'vacunas:read', 'vacunas:write', 'planificacion:read', 'planificacion:write'] } },
          { codigo: { in: ['movimientos:read', 'reportes:read', 'reportes:export', 'alertas:read', 'alertas:write'] } },
          { codigo: { in: ['usuarios:read', 'kardex:read'] } },
        ],
      },
    });

    if (coordinadorRole) {
      for (const permission of coordinadorPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            unique_role_permission: {
              roleId: coordinadorRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: coordinadorRole.id,
            permissionId: permission.id,
          },
        });
      }
    }

    // Responsable de Acopio - Permisos operacionales
    const responsableRole = await prisma.role.findUnique({ where: { codigo: 'responsable_acopio' } });
    const responsablePermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { codigo: { in: ['establecimientos:read', 'vacunas:read', 'planificacion:read'] } },
          { codigo: { in: ['movimientos:read', 'movimientos:write', 'entregas:read', 'entregas:write'] } },
          { codigo: { in: ['vales:read', 'vales:write', 'kardex:read', 'kardex:write'] } },
          { codigo: { in: ['reportes:read', 'alertas:read'] } },
        ],
      },
    });

    if (responsableRole) {
      for (const permission of responsablePermissions) {
        await prisma.rolePermission.upsert({
          where: {
            unique_role_permission: {
              roleId: responsableRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: responsableRole.id,
            permissionId: permission.id,
          },
        });
      }
    }

    // Operador - Solo permisos de lectura
    const operadorRole = await prisma.role.findUnique({ where: { codigo: 'operador' } });
    const operadorPermissions = await prisma.permission.findMany({
      where: {
        codigo: { in: ['establecimientos:read', 'vacunas:read', 'planificacion:read', 'movimientos:read', 'kardex:read', 'reportes:read'] },
      },
    });

    if (operadorRole) {
      for (const permission of operadorPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            unique_role_permission: {
              roleId: operadorRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: operadorRole.id,
            permissionId: permission.id,
          },
        });
      }
    }

    // 4. Actualizar usuarios existentes con roles
    console.log('🔄 Actualizando usuarios existentes con roles...');
    const usuarios = await prisma.usuario.findMany();

    for (const usuario of usuarios) {
      const role = await prisma.role.findUnique({ where: { codigo: usuario.rol } });
      if (role) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { roleId: role.id },
        });
      }
    }

    console.log('✅ Seed de roles y permisos completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed de roles y permisos:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedRolesAndPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
