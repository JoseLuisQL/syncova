import { PrismaClient } from '@prisma/client';
import { DEFAULT_ROLE_PERMISSIONS } from '../../src/config/defaultRolePermissions';

const prisma = new PrismaClient();

/**
 * Seed de roles y permisos granulares v2
 * Sistema profesional con control por módulo y sección
 */
export async function seedRolesAndPermissionsV2() {
  console.log('🌱 Iniciando seed de roles y permisos v2 (granular)...');

  try {
    // 1. Crear permisos granulares del sistema (78 permisos)
    const permissions = [
      // =====================================================
      // DASHBOARD
      // =====================================================
      { nombre: 'Ver Dashboard', codigo: 'dashboard:read', recurso: 'dashboard', accion: 'read', categoria: 'Dashboard', descripcion: 'Acceso al dashboard principal' },

      // =====================================================
      // ESTABLECIMIENTOS (4 secciones)
      // =====================================================
      // Redes
      { nombre: 'Ver Redes', codigo: 'redes:read', recurso: 'redes', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de redes de salud' },
      { nombre: 'Gestionar Redes', codigo: 'redes:write', recurso: 'redes', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar redes' },
      // Microredes
      { nombre: 'Ver Microredes', codigo: 'microredes:read', recurso: 'microredes', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de microredes' },
      { nombre: 'Gestionar Microredes', codigo: 'microredes:write', recurso: 'microredes', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar microredes' },
      // Centros de Acopio
      { nombre: 'Ver Centros de Acopio', codigo: 'centros_acopio:read', recurso: 'centros_acopio', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de centros de acopio' },
      { nombre: 'Gestionar Centros de Acopio', codigo: 'centros_acopio:write', recurso: 'centros_acopio', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar centros de acopio' },
      // Establecimientos
      { nombre: 'Ver Establecimientos', codigo: 'establecimientos:read', recurso: 'establecimientos', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de establecimientos de salud' },
      { nombre: 'Gestionar Establecimientos', codigo: 'establecimientos:write', recurso: 'establecimientos', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar establecimientos' },

      // =====================================================
      // INVENTARIO (5 secciones)
      // =====================================================
      // Vacunas
      { nombre: 'Ver Catálogo Vacunas', codigo: 'vacunas:read', recurso: 'vacunas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver catálogo de vacunas' },
      { nombre: 'Gestionar Vacunas', codigo: 'vacunas:write', recurso: 'vacunas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar vacunas del catálogo' },
      // Jeringas
      { nombre: 'Ver Catálogo Jeringas', codigo: 'jeringas:read', recurso: 'jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver catálogo de jeringas' },
      { nombre: 'Gestionar Jeringas', codigo: 'jeringas:write', recurso: 'jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar jeringas del catálogo' },
      // Lotes Vacunas
      { nombre: 'Ver Lotes Vacunas', codigo: 'lotes_vacunas:read', recurso: 'lotes_vacunas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver lotes de vacunas' },
      { nombre: 'Gestionar Lotes Vacunas', codigo: 'lotes_vacunas:write', recurso: 'lotes_vacunas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar lotes de vacunas' },
      // Lotes Jeringas
      { nombre: 'Ver Lotes Jeringas', codigo: 'lotes_jeringas:read', recurso: 'lotes_jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver lotes de jeringas' },
      { nombre: 'Gestionar Lotes Jeringas', codigo: 'lotes_jeringas:write', recurso: 'lotes_jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar lotes de jeringas' },
      // Configuración de Jeringas
      { nombre: 'Ver Config. Jeringas', codigo: 'config_jeringas:read', recurso: 'config_jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver configuración de jeringas por vacuna' },
      { nombre: 'Gestionar Config. Jeringas', codigo: 'config_jeringas:write', recurso: 'config_jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Configurar jeringas por vacuna' },
      // Nuevo Ingreso
      { nombre: 'Registrar Ingresos', codigo: 'inventario:ingreso', recurso: 'inventario', accion: 'ingreso', categoria: 'Inventario', descripcion: 'Registrar nuevos ingresos de lotes' },

      // =====================================================
      // MOVIMIENTOS
      // =====================================================
      { nombre: 'Ver Movimientos', codigo: 'movimientos:read', recurso: 'movimientos', accion: 'read', categoria: 'Movimientos', descripcion: 'Ver listado de movimientos de inventario' },
      { nombre: 'Registrar Movimientos', codigo: 'movimientos:write', recurso: 'movimientos', accion: 'write', categoria: 'Movimientos', descripcion: 'Registrar nuevos movimientos' },
      { nombre: 'Anular Movimientos', codigo: 'movimientos:anular', recurso: 'movimientos', accion: 'anular', categoria: 'Movimientos', descripcion: 'Anular movimientos registrados' },

      // =====================================================
      // PLANIFICACIÓN
      // =====================================================
      { nombre: 'Ver Planificación', codigo: 'planificacion:read', recurso: 'planificacion', accion: 'read', categoria: 'Planificación', descripcion: 'Ver planificaciones anuales' },
      { nombre: 'Gestionar Planificación', codigo: 'planificacion:write', recurso: 'planificacion', accion: 'write', categoria: 'Planificación', descripcion: 'Crear y editar planificaciones' },
      { nombre: 'Aprobar Planificación', codigo: 'planificacion:aprobar', recurso: 'planificacion', accion: 'aprobar', categoria: 'Planificación', descripcion: 'Aprobar planificaciones para ejecución' },
      { nombre: 'Ver ICI DEMID', codigo: 'ici_demid:read', recurso: 'ici_demid', accion: 'read', categoria: 'Planificación', descripcion: 'Ver módulo de importación y consulta ICI DEMID' },
      { nombre: 'Gestionar ICI DEMID', codigo: 'ici_demid:write', recurso: 'ici_demid', accion: 'write', categoria: 'Planificación', descripcion: 'Importar y actualizar registros ICI DEMID' },

      // =====================================================
      // KARDEX
      // =====================================================
      { nombre: 'Ver Kardex', codigo: 'kardex:read', recurso: 'kardex', accion: 'read', categoria: 'Kardex', descripcion: 'Ver kardex de inventario' },
      { nombre: 'Exportar Kardex', codigo: 'kardex:export', recurso: 'kardex', accion: 'export', categoria: 'Kardex', descripcion: 'Exportar kardex a Excel/PDF' },

      // =====================================================
      // REPORTES (5 secciones)
      // =====================================================
      // Inventario
      { nombre: 'Ver Rep. Inventario', codigo: 'reportes_inventario:read', recurso: 'reportes_inventario', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de inventario' },
      { nombre: 'Exportar Rep. Inventario', codigo: 'reportes_inventario:export', recurso: 'reportes_inventario', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de inventario' },
      // Movimientos
      { nombre: 'Ver Rep. Movimientos', codigo: 'reportes_movimientos:read', recurso: 'reportes_movimientos', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de movimientos' },
      { nombre: 'Exportar Rep. Movimientos', codigo: 'reportes_movimientos:export', recurso: 'reportes_movimientos', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de movimientos' },
      // Planificación
      { nombre: 'Ver Rep. Planificación', codigo: 'reportes_planificacion:read', recurso: 'reportes_planificacion', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de planificación' },
      { nombre: 'Exportar Rep. Planificación', codigo: 'reportes_planificacion:export', recurso: 'reportes_planificacion', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de planificación' },
      // CENARES
      { nombre: 'Ver Rep. CENARES', codigo: 'reportes_cenares:read', recurso: 'reportes_cenares', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes CENARES' },
      { nombre: 'Exportar Rep. CENARES', codigo: 'reportes_cenares:export', recurso: 'reportes_cenares', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes CENARES' },
      // Configuración de Reportes
      { nombre: 'Ver Config. Reportes', codigo: 'reportes_config:read', recurso: 'reportes_config', accion: 'read', categoria: 'Reportes', descripcion: 'Ver configuración de reportes' },
      { nombre: 'Gestionar Config. Reportes', codigo: 'reportes_config:write', recurso: 'reportes_config', accion: 'write', categoria: 'Reportes', descripcion: 'Configurar reportes programados' },

      // =====================================================
      // ALERTAS (4 secciones)
      // =====================================================
      // Dashboard de Alertas
      { nombre: 'Ver Dashboard Alertas', codigo: 'alertas_dashboard:read', recurso: 'alertas_dashboard', accion: 'read', categoria: 'Alertas', descripcion: 'Ver dashboard de alertas' },
      // Alertas
      { nombre: 'Ver Alertas', codigo: 'alertas:read', recurso: 'alertas', accion: 'read', categoria: 'Alertas', descripcion: 'Ver listado de alertas' },
      { nombre: 'Gestionar Alertas', codigo: 'alertas:write', recurso: 'alertas', accion: 'write', categoria: 'Alertas', descripcion: 'Crear y eliminar alertas' },
      { nombre: 'Marcar Alertas Leídas', codigo: 'alertas:marcar', recurso: 'alertas', accion: 'marcar', categoria: 'Alertas', descripcion: 'Marcar alertas como leídas' },
      // Reportes de Alertas
      { nombre: 'Ver Rep. Alertas', codigo: 'alertas_reportes:read', recurso: 'alertas_reportes', accion: 'read', categoria: 'Alertas', descripcion: 'Ver reportes de alertas' },
      // Configuración de Alertas
      { nombre: 'Ver Config. Alertas', codigo: 'alertas_config:read', recurso: 'alertas_config', accion: 'read', categoria: 'Alertas', descripcion: 'Ver configuración de alertas' },
      { nombre: 'Gestionar Config. Alertas', codigo: 'alertas_config:write', recurso: 'alertas_config', accion: 'write', categoria: 'Alertas', descripcion: 'Configurar umbrales y notificaciones' },

      // =====================================================
      // USUARIOS (3 secciones)
      // =====================================================
      // Usuarios
      { nombre: 'Ver Usuarios', codigo: 'usuarios:read', recurso: 'usuarios', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de usuarios' },
      { nombre: 'Crear Usuarios', codigo: 'usuarios:write', recurso: 'usuarios', accion: 'write', categoria: 'Usuarios', descripcion: 'Crear nuevos usuarios' },
      { nombre: 'Editar Usuarios', codigo: 'usuarios:update', recurso: 'usuarios', accion: 'update', categoria: 'Usuarios', descripcion: 'Editar usuarios existentes' },
      { nombre: 'Eliminar Usuarios', codigo: 'usuarios:delete', recurso: 'usuarios', accion: 'delete', categoria: 'Usuarios', descripcion: 'Eliminar usuarios' },
      { nombre: 'Cambiar Contraseñas', codigo: 'usuarios:password', recurso: 'usuarios', accion: 'password', categoria: 'Usuarios', descripcion: 'Cambiar contraseñas de usuarios' },
      { nombre: 'Cambiar Estado Usuarios', codigo: 'usuarios:estado', recurso: 'usuarios', accion: 'estado', categoria: 'Usuarios', descripcion: 'Activar/desactivar usuarios' },
      // Roles
      { nombre: 'Ver Roles', codigo: 'roles:read', recurso: 'roles', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de roles' },
      { nombre: 'Gestionar Roles', codigo: 'roles:write', recurso: 'roles', accion: 'write', categoria: 'Usuarios', descripcion: 'Crear, editar y eliminar roles' },
      // Permisos
      { nombre: 'Ver Permisos', codigo: 'permisos:read', recurso: 'permisos', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de permisos' },
      { nombre: 'Asignar Permisos', codigo: 'permisos:assign', recurso: 'permisos', accion: 'assign', categoria: 'Usuarios', descripcion: 'Asignar permisos a roles' },

      // =====================================================
      // CONFIGURACIÓN (8 secciones)
      // =====================================================
      // General
      { nombre: 'Ver Config. General', codigo: 'config_general:read', recurso: 'config_general', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración general' },
      { nombre: 'Gestionar Config. General', codigo: 'config_general:write', recurso: 'config_general', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración general' },
      // Notificaciones
      { nombre: 'Ver Config. Notificaciones', codigo: 'config_notificaciones:read', recurso: 'config_notificaciones', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de notificaciones' },
      { nombre: 'Gestionar Config. Notificaciones', codigo: 'config_notificaciones:write', recurso: 'config_notificaciones', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración de notificaciones' },
      // Seguridad
      { nombre: 'Ver Config. Seguridad', codigo: 'config_seguridad:read', recurso: 'config_seguridad', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de seguridad' },
      { nombre: 'Gestionar Config. Seguridad', codigo: 'config_seguridad:write', recurso: 'config_seguridad', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar políticas de seguridad' },
      // Respaldos
      { nombre: 'Ver Config. Respaldos', codigo: 'config_respaldos:read', recurso: 'config_respaldos', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de respaldos' },
      { nombre: 'Gestionar Config. Respaldos', codigo: 'config_respaldos:write', recurso: 'config_respaldos', accion: 'write', categoria: 'Configuración', descripcion: 'Configurar respaldos automáticos' },
      // Sistema
      { nombre: 'Ver Config. Sistema', codigo: 'config_sistema:read', recurso: 'config_sistema', accion: 'read', categoria: 'Configuración', descripcion: 'Ver parámetros del sistema' },
      { nombre: 'Gestionar Config. Sistema', codigo: 'config_sistema:write', recurso: 'config_sistema', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar parámetros del sistema' },
      // Mantenimiento
      { nombre: 'Ver Config. Mantenimiento', codigo: 'config_mantenimiento:read', recurso: 'config_mantenimiento', accion: 'read', categoria: 'Configuración', descripcion: 'Ver tareas de mantenimiento' },
      { nombre: 'Ejecutar Mantenimiento', codigo: 'config_mantenimiento:write', recurso: 'config_mantenimiento', accion: 'write', categoria: 'Configuración', descripcion: 'Ejecutar tareas de mantenimiento' },
      // Integraciones
      { nombre: 'Ver Config. Integraciones', codigo: 'config_integraciones:read', recurso: 'config_integraciones', accion: 'read', categoria: 'Configuración', descripcion: 'Ver integraciones externas' },
      { nombre: 'Gestionar Config. Integraciones', codigo: 'config_integraciones:write', recurso: 'config_integraciones', accion: 'write', categoria: 'Configuración', descripcion: 'Configurar integraciones externas' },
      // Avanzado
      { nombre: 'Ver Config. Avanzado', codigo: 'config_avanzado:read', recurso: 'config_avanzado', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración avanzada' },
      { nombre: 'Gestionar Config. Avanzado', codigo: 'config_avanzado:write', recurso: 'config_avanzado', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración avanzada' },
    ];

    console.log(`📝 Creando ${permissions.length} permisos granulares...`);
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { codigo: permission.codigo },
        update: permission,
        create: permission,
      });
    }

    // 2. Crear/actualizar roles del sistema
    const roles = [
      {
        nombre: 'Administrador',
        codigo: 'administrador',
        descripcion: 'Acceso completo a todos los módulos y funciones del sistema',
        esDefault: true,
      },
      {
        nombre: 'Coordinador',
        codigo: 'coordinador',
        descripcion: 'Gestión de planificación, reportes y coordinación general',
        esDefault: true,
      },
      {
        nombre: 'Responsable de Acopio',
        codigo: 'responsable_acopio',
        descripcion: 'Gestión de inventario, movimientos y entregas',
        esDefault: true,
      },
      {
        nombre: 'Operador',
        codigo: 'operador',
        descripcion: 'Consultas y operaciones básicas del sistema',
        esDefault: true,
      },
    ];

    console.log('👥 Creando/actualizando roles...');
    for (const role of roles) {
      await prisma.role.upsert({
        where: { codigo: role.codigo },
        update: role,
        create: role,
      });
    }

    // 3. Asignar permisos a roles
    console.log('🔗 Asignando permisos a roles...');

    // Obtener todos los permisos
    const allPermissions = await prisma.permission.findMany();
    const permissionMap = new Map(allPermissions.map(p => [p.codigo, p.id]));

    // Función helper para asignar permisos
    const assignPermissionsToRole = async (roleCodigo: string, permissionCodigos: string[]) => {
      const role = await prisma.role.findUnique({ where: { codigo: roleCodigo } });
      if (!role) return;

      for (const codigo of permissionCodigos) {
        const permissionId = permissionMap.get(codigo);
        if (permissionId) {
          await prisma.rolePermission.upsert({
            where: {
              unique_role_permission: {
                roleId: role.id,
                permissionId: permissionId,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permissionId,
            },
          });
        }
      }
    };

    const allPermissionCodigos = permissions.map(p => p.codigo);
    const resolvedDefaults: Record<string, string[]> = {
      ...DEFAULT_ROLE_PERMISSIONS,
      administrador: allPermissionCodigos,
    };

    await assignPermissionsToRole('administrador', resolvedDefaults.administrador);
    await assignPermissionsToRole('coordinador', resolvedDefaults.coordinador || []);
    await assignPermissionsToRole('responsable_acopio', resolvedDefaults.responsable_acopio || []);
    await assignPermissionsToRole('operador', resolvedDefaults.operador || []);

    // 4. Actualizar usuarios existentes con roleId
    console.log('🔄 Actualizando usuarios existentes con roles...');
    const usuarios = await prisma.usuario.findMany();

    for (const usuario of usuarios) {
      const role = await prisma.role.findUnique({ where: { codigo: usuario.rol } });
      if (role && usuario.roleId !== role.id) {
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { roleId: role.id },
        });
      }
    }

    // Resumen
    const totalPermisos = await prisma.permission.count();
    const totalRoles = await prisma.role.count();
    const totalAsignaciones = await prisma.rolePermission.count();
    const usuariosActualizados = await prisma.usuario.count({ where: { roleId: { not: null } } });

    console.log('\n✅ Seed de roles y permisos v2 completado:');
    console.log(`   📝 Permisos: ${totalPermisos}`);
    console.log(`   👥 Roles: ${totalRoles}`);
    console.log(`   🔗 Asignaciones: ${totalAsignaciones}`);
    console.log(`   👤 Usuarios actualizados: ${usuariosActualizados}`);

  } catch (error) {
    console.error('❌ Error en seed de roles y permisos v2:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedRolesAndPermissionsV2()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
