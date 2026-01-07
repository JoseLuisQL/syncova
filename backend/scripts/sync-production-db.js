/**
 * SCRIPT DE SINCRONIZACIÓN DE BD DE PRODUCCIÓN
 * =============================================
 * 
 * Este script sincroniza la base de datos de producción con los cambios de:
 * - Commit ef4dc2fa: Sistema de permisos granular (71 permisos)
 * - Commit 1c2dba67: Campo centroAcopioId en Usuario
 * 
 * USO:
 *   cd backend
 *   node scripts/sync-production-db.js
 * 
 * IMPORTANTE: 
 * - Hacer backup de la BD antes de ejecutar
 * - Detener el backend antes de ejecutar
 * - Ejecutar npx prisma generate después
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// =====================================================
// DEFINICIÓN DE 71 PERMISOS GRANULARES
// =====================================================
const PERMISSIONS = [
  // DASHBOARD
  { nombre: 'Ver Dashboard', codigo: 'dashboard:read', recurso: 'dashboard', accion: 'read', categoria: 'Dashboard', descripcion: 'Acceso al dashboard principal' },

  // ESTABLECIMIENTOS
  { nombre: 'Ver Redes', codigo: 'redes:read', recurso: 'redes', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de redes de salud' },
  { nombre: 'Gestionar Redes', codigo: 'redes:write', recurso: 'redes', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar redes' },
  { nombre: 'Ver Microredes', codigo: 'microredes:read', recurso: 'microredes', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de microredes' },
  { nombre: 'Gestionar Microredes', codigo: 'microredes:write', recurso: 'microredes', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar microredes' },
  { nombre: 'Ver Centros de Acopio', codigo: 'centros_acopio:read', recurso: 'centros_acopio', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de centros de acopio' },
  { nombre: 'Gestionar Centros de Acopio', codigo: 'centros_acopio:write', recurso: 'centros_acopio', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar centros de acopio' },
  { nombre: 'Ver Establecimientos', codigo: 'establecimientos:read', recurso: 'establecimientos', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de establecimientos de salud' },
  { nombre: 'Gestionar Establecimientos', codigo: 'establecimientos:write', recurso: 'establecimientos', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar establecimientos' },

  // INVENTARIO
  { nombre: 'Ver Catálogo Vacunas', codigo: 'vacunas:read', recurso: 'vacunas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver catálogo de vacunas' },
  { nombre: 'Gestionar Vacunas', codigo: 'vacunas:write', recurso: 'vacunas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar vacunas del catálogo' },
  { nombre: 'Ver Catálogo Jeringas', codigo: 'jeringas:read', recurso: 'jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver catálogo de jeringas' },
  { nombre: 'Gestionar Jeringas', codigo: 'jeringas:write', recurso: 'jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar jeringas del catálogo' },
  { nombre: 'Ver Lotes Vacunas', codigo: 'lotes_vacunas:read', recurso: 'lotes_vacunas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver lotes de vacunas' },
  { nombre: 'Gestionar Lotes Vacunas', codigo: 'lotes_vacunas:write', recurso: 'lotes_vacunas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar lotes de vacunas' },
  { nombre: 'Ver Lotes Jeringas', codigo: 'lotes_jeringas:read', recurso: 'lotes_jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver lotes de jeringas' },
  { nombre: 'Gestionar Lotes Jeringas', codigo: 'lotes_jeringas:write', recurso: 'lotes_jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar lotes de jeringas' },
  { nombre: 'Ver Config Jeringas', codigo: 'config_jeringas:read', recurso: 'config_jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver configuración de jeringas por vacuna' },
  { nombre: 'Gestionar Config Jeringas', codigo: 'config_jeringas:write', recurso: 'config_jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Configurar jeringas por vacuna' },
  { nombre: 'Registrar Ingresos', codigo: 'inventario:ingreso', recurso: 'inventario', accion: 'ingreso', categoria: 'Inventario', descripcion: 'Registrar nuevos ingresos de lotes' },

  // MOVIMIENTOS
  { nombre: 'Ver Movimientos', codigo: 'movimientos:read', recurso: 'movimientos', accion: 'read', categoria: 'Movimientos', descripcion: 'Ver listado de movimientos de inventario' },
  { nombre: 'Registrar Movimientos', codigo: 'movimientos:write', recurso: 'movimientos', accion: 'write', categoria: 'Movimientos', descripcion: 'Registrar nuevos movimientos' },
  { nombre: 'Anular Movimientos', codigo: 'movimientos:anular', recurso: 'movimientos', accion: 'anular', categoria: 'Movimientos', descripcion: 'Anular movimientos registrados' },

  // PLANIFICACIÓN
  { nombre: 'Ver Planificación', codigo: 'planificacion:read', recurso: 'planificacion', accion: 'read', categoria: 'Planificación', descripcion: 'Ver planificaciones anuales' },
  { nombre: 'Gestionar Planificación', codigo: 'planificacion:write', recurso: 'planificacion', accion: 'write', categoria: 'Planificación', descripcion: 'Crear y editar planificaciones' },
  { nombre: 'Aprobar Planificación', codigo: 'planificacion:aprobar', recurso: 'planificacion', accion: 'aprobar', categoria: 'Planificación', descripcion: 'Aprobar planificaciones para ejecución' },

  // KARDEX
  { nombre: 'Ver Kardex', codigo: 'kardex:read', recurso: 'kardex', accion: 'read', categoria: 'Kardex', descripcion: 'Ver kardex de inventario' },
  { nombre: 'Exportar Kardex', codigo: 'kardex:export', recurso: 'kardex', accion: 'export', categoria: 'Kardex', descripcion: 'Exportar kardex a Excel/PDF' },

  // REPORTES
  { nombre: 'Ver Rep Inventario', codigo: 'reportes_inventario:read', recurso: 'reportes_inventario', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de inventario' },
  { nombre: 'Exportar Rep Inventario', codigo: 'reportes_inventario:export', recurso: 'reportes_inventario', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de inventario' },
  { nombre: 'Ver Rep Movimientos', codigo: 'reportes_movimientos:read', recurso: 'reportes_movimientos', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de movimientos' },
  { nombre: 'Exportar Rep Movimientos', codigo: 'reportes_movimientos:export', recurso: 'reportes_movimientos', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de movimientos' },
  { nombre: 'Ver Rep Planificación', codigo: 'reportes_planificacion:read', recurso: 'reportes_planificacion', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de planificación' },
  { nombre: 'Exportar Rep Planificación', codigo: 'reportes_planificacion:export', recurso: 'reportes_planificacion', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de planificación' },
  { nombre: 'Ver Rep CENARES', codigo: 'reportes_cenares:read', recurso: 'reportes_cenares', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes CENARES' },
  { nombre: 'Exportar Rep CENARES', codigo: 'reportes_cenares:export', recurso: 'reportes_cenares', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes CENARES' },
  { nombre: 'Ver Config Reportes', codigo: 'reportes_config:read', recurso: 'reportes_config', accion: 'read', categoria: 'Reportes', descripcion: 'Ver configuración de reportes' },
  { nombre: 'Gestionar Config Reportes', codigo: 'reportes_config:write', recurso: 'reportes_config', accion: 'write', categoria: 'Reportes', descripcion: 'Configurar reportes programados' },

  // ALERTAS
  { nombre: 'Ver Dashboard Alertas', codigo: 'alertas_dashboard:read', recurso: 'alertas_dashboard', accion: 'read', categoria: 'Alertas', descripcion: 'Ver dashboard de alertas' },
  { nombre: 'Ver Alertas', codigo: 'alertas:read', recurso: 'alertas', accion: 'read', categoria: 'Alertas', descripcion: 'Ver listado de alertas' },
  { nombre: 'Gestionar Alertas', codigo: 'alertas:write', recurso: 'alertas', accion: 'write', categoria: 'Alertas', descripcion: 'Crear y eliminar alertas' },
  { nombre: 'Marcar Alertas Leídas', codigo: 'alertas:marcar', recurso: 'alertas', accion: 'marcar', categoria: 'Alertas', descripcion: 'Marcar alertas como leídas' },
  { nombre: 'Ver Rep Alertas', codigo: 'alertas_reportes:read', recurso: 'alertas_reportes', accion: 'read', categoria: 'Alertas', descripcion: 'Ver reportes de alertas' },
  { nombre: 'Ver Config Alertas', codigo: 'alertas_config:read', recurso: 'alertas_config', accion: 'read', categoria: 'Alertas', descripcion: 'Ver configuración de alertas' },
  { nombre: 'Gestionar Config Alertas', codigo: 'alertas_config:write', recurso: 'alertas_config', accion: 'write', categoria: 'Alertas', descripcion: 'Configurar umbrales y notificaciones' },

  // USUARIOS
  { nombre: 'Ver Usuarios', codigo: 'usuarios:read', recurso: 'usuarios', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de usuarios' },
  { nombre: 'Crear Usuarios', codigo: 'usuarios:write', recurso: 'usuarios', accion: 'write', categoria: 'Usuarios', descripcion: 'Crear nuevos usuarios' },
  { nombre: 'Editar Usuarios', codigo: 'usuarios:update', recurso: 'usuarios', accion: 'update', categoria: 'Usuarios', descripcion: 'Editar usuarios existentes' },
  { nombre: 'Eliminar Usuarios', codigo: 'usuarios:delete', recurso: 'usuarios', accion: 'delete', categoria: 'Usuarios', descripcion: 'Eliminar usuarios' },
  { nombre: 'Cambiar Contraseñas', codigo: 'usuarios:password', recurso: 'usuarios', accion: 'password', categoria: 'Usuarios', descripcion: 'Cambiar contraseñas de usuarios' },
  { nombre: 'Cambiar Estado Usuarios', codigo: 'usuarios:estado', recurso: 'usuarios', accion: 'estado', categoria: 'Usuarios', descripcion: 'Activar/desactivar usuarios' },
  { nombre: 'Ver Roles', codigo: 'roles:read', recurso: 'roles', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de roles' },
  { nombre: 'Gestionar Roles', codigo: 'roles:write', recurso: 'roles', accion: 'write', categoria: 'Usuarios', descripcion: 'Crear, editar y eliminar roles' },
  { nombre: 'Ver Permisos', codigo: 'permisos:read', recurso: 'permisos', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de permisos' },
  { nombre: 'Asignar Permisos', codigo: 'permisos:assign', recurso: 'permisos', accion: 'assign', categoria: 'Usuarios', descripcion: 'Asignar permisos a roles' },

  // CONFIGURACIÓN
  { nombre: 'Ver Config General', codigo: 'config_general:read', recurso: 'config_general', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración general' },
  { nombre: 'Gestionar Config General', codigo: 'config_general:write', recurso: 'config_general', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración general' },
  { nombre: 'Ver Config Notificaciones', codigo: 'config_notificaciones:read', recurso: 'config_notificaciones', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de notificaciones' },
  { nombre: 'Gestionar Config Notificaciones', codigo: 'config_notificaciones:write', recurso: 'config_notificaciones', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración de notificaciones' },
  { nombre: 'Ver Config Seguridad', codigo: 'config_seguridad:read', recurso: 'config_seguridad', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de seguridad' },
  { nombre: 'Gestionar Config Seguridad', codigo: 'config_seguridad:write', recurso: 'config_seguridad', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar políticas de seguridad' },
  { nombre: 'Ver Config Respaldos', codigo: 'config_respaldos:read', recurso: 'config_respaldos', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de respaldos' },
  { nombre: 'Gestionar Config Respaldos', codigo: 'config_respaldos:write', recurso: 'config_respaldos', accion: 'write', categoria: 'Configuración', descripcion: 'Configurar respaldos automáticos' },
  { nombre: 'Ver Config Sistema', codigo: 'config_sistema:read', recurso: 'config_sistema', accion: 'read', categoria: 'Configuración', descripcion: 'Ver parámetros del sistema' },
  { nombre: 'Gestionar Config Sistema', codigo: 'config_sistema:write', recurso: 'config_sistema', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar parámetros del sistema' },
  { nombre: 'Ver Config Mantenimiento', codigo: 'config_mantenimiento:read', recurso: 'config_mantenimiento', accion: 'read', categoria: 'Configuración', descripcion: 'Ver tareas de mantenimiento' },
  { nombre: 'Ejecutar Mantenimiento', codigo: 'config_mantenimiento:write', recurso: 'config_mantenimiento', accion: 'write', categoria: 'Configuración', descripcion: 'Ejecutar tareas de mantenimiento' },
  { nombre: 'Ver Config Integraciones', codigo: 'config_integraciones:read', recurso: 'config_integraciones', accion: 'read', categoria: 'Configuración', descripcion: 'Ver integraciones externas' },
  { nombre: 'Gestionar Config Integraciones', codigo: 'config_integraciones:write', recurso: 'config_integraciones', accion: 'write', categoria: 'Configuración', descripcion: 'Configurar integraciones externas' },
  { nombre: 'Ver Config Avanzado', codigo: 'config_avanzado:read', recurso: 'config_avanzado', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración avanzada' },
  { nombre: 'Gestionar Config Avanzado', codigo: 'config_avanzado:write', recurso: 'config_avanzado', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración avanzada' },
];

// =====================================================
// DEFINICIÓN DE ROLES Y SUS PERMISOS
// =====================================================
const ROLES = [
  { nombre: 'Administrador', codigo: 'administrador', descripcion: 'Acceso completo a todos los módulos y funciones del sistema', esDefault: true },
  { nombre: 'Coordinador', codigo: 'coordinador', descripcion: 'Gestión de planificación, reportes y coordinación general', esDefault: true },
  { nombre: 'Responsable de Acopio', codigo: 'responsable_acopio', descripcion: 'Gestión de inventario, movimientos y entregas', esDefault: true },
  { nombre: 'Operador', codigo: 'operador', descripcion: 'Consultas y operaciones básicas del sistema', esDefault: true },
];

const ROLE_PERMISSIONS = {
  administrador: PERMISSIONS.map(p => p.codigo), // Todos los permisos
  
  coordinador: [
    'dashboard:read',
    'redes:read', 'microredes:read', 'centros_acopio:read', 'establecimientos:read',
    'vacunas:read', 'vacunas:write', 'jeringas:read', 'jeringas:write',
    'lotes_vacunas:read', 'lotes_jeringas:read',
    'config_jeringas:read', 'config_jeringas:write',
    'movimientos:read',
    'planificacion:read', 'planificacion:write', 'planificacion:aprobar',
    'kardex:read', 'kardex:export',
    'reportes_inventario:read', 'reportes_inventario:export',
    'reportes_movimientos:read', 'reportes_movimientos:export',
    'reportes_planificacion:read', 'reportes_planificacion:export',
    'reportes_cenares:read', 'reportes_cenares:export',
    'reportes_config:read', 'reportes_config:write',
    'alertas_dashboard:read', 'alertas:read', 'alertas:marcar', 'alertas_reportes:read',
    'usuarios:read',
  ],
  
  responsable_acopio: [
    'dashboard:read',
    'redes:read', 'microredes:read', 'centros_acopio:read', 'establecimientos:read',
    'vacunas:read', 'jeringas:read',
    'lotes_vacunas:read', 'lotes_vacunas:write',
    'lotes_jeringas:read', 'lotes_jeringas:write',
    'config_jeringas:read',
    'inventario:ingreso',
    'movimientos:read', 'movimientos:write',
    'planificacion:read',
    'kardex:read', 'kardex:export',
    'reportes_inventario:read', 'reportes_inventario:export',
    'reportes_movimientos:read', 'reportes_movimientos:export',
    'alertas_dashboard:read', 'alertas:read', 'alertas:marcar',
  ],
  
  operador: [
    'dashboard:read',
    'redes:read', 'microredes:read', 'centros_acopio:read', 'establecimientos:read',
    'vacunas:read', 'jeringas:read',
    'lotes_vacunas:read', 'lotes_jeringas:read',
    'movimientos:read',
    'planificacion:read',
    'kardex:read',
    'reportes_inventario:read',
    'alertas:read',
  ],
};

// =====================================================
// FUNCIONES DE MIGRACIÓN
// =====================================================

async function addCentroAcopioColumn() {
  const columnExists = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'centro_acopio_id'
  `;
  
  if (columnExists.length === 0) {
    console.log('   ⚠️  Columna centro_acopio_id no existe, agregándola...');
    
    // Agregar columna
    await prisma.$executeRawUnsafe(`
      ALTER TABLE usuarios 
      ADD COLUMN centro_acopio_id UUID NULL
    `);
    
    // Agregar foreign key
    await prisma.$executeRawUnsafe(`
      ALTER TABLE usuarios 
      ADD CONSTRAINT fk_usuario_centro_acopio 
      FOREIGN KEY (centro_acopio_id) 
      REFERENCES centros_acopio(id) 
      ON DELETE SET NULL
    `);
    
    // Agregar índice
    await prisma.$executeRawUnsafe(`
      CREATE INDEX idx_usuario_centro_acopio ON usuarios(centro_acopio_id)
    `);
    
    console.log('   ✅ Columna, foreign key e índice creados');
  } else {
    console.log('   ✅ Columna centro_acopio_id ya existe');
  }
}

async function cleanOldPermissions() {
  const rolePermCount = await prisma.rolePermission.count();
  const permCount = await prisma.permission.count();
  
  if (rolePermCount > 0 || permCount > 0) {
    console.log(`   🗑️  Eliminando ${rolePermCount} asignaciones y ${permCount} permisos anteriores...`);
    await prisma.rolePermission.deleteMany({});
    await prisma.permission.deleteMany({});
  }
  console.log('   ✅ Limpieza completada');
}

async function createPermissions() {
  await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });
  console.log(`   ✅ ${PERMISSIONS.length} permisos creados`);
}

async function createRoles() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { codigo: role.codigo },
      update: { 
        nombre: role.nombre, 
        descripcion: role.descripcion, 
        esDefault: role.esDefault 
      },
      create: role,
    });
  }
  console.log(`   ✅ ${ROLES.length} roles configurados`);
}

async function assignPermissionsToRoles() {
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map(p => [p.codigo, p.id]));
  
  for (const [roleCodigo, permissionCodigos] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { codigo: roleCodigo } });
    if (!role) {
      console.log(`   ⚠️  Rol ${roleCodigo} no encontrado, saltando...`);
      continue;
    }
    
    const data = permissionCodigos
      .filter(codigo => permissionMap.has(codigo))
      .map(codigo => ({
        roleId: role.id,
        permissionId: permissionMap.get(codigo),
      }));
    
    if (data.length > 0) {
      await prisma.rolePermission.createMany({ data, skipDuplicates: true });
      console.log(`   ✅ ${data.length} permisos asignados a ${roleCodigo}`);
    }
  }
}

async function updateUsersWithRoles() {
  // Usar query raw para evitar problemas con el schema desincronizado
  const usuarios = await prisma.$queryRaw`
    SELECT id, rol FROM usuarios WHERE role_id IS NULL
  `;
  
  console.log(`   📝 ${usuarios.length} usuarios sin roleId encontrados`);
  
  let updated = 0;
  for (const usuario of usuarios) {
    const role = await prisma.role.findUnique({ where: { codigo: usuario.rol } });
    if (role) {
      await prisma.$executeRawUnsafe(`
        UPDATE usuarios SET role_id = '${role.id}' WHERE id = '${usuario.id}'
      `);
      updated++;
    }
  }
  
  console.log(`   ✅ ${updated} usuarios actualizados con roleId`);
}

async function verifyIntegrity() {
  const stats = {
    permisos: await prisma.permission.count(),
    roles: await prisma.role.count(),
    asignaciones: await prisma.rolePermission.count(),
    usuariosConRole: await prisma.$queryRaw`SELECT COUNT(*) as count FROM usuarios WHERE role_id IS NOT NULL`,
    usuariosSinRole: await prisma.$queryRaw`SELECT COUNT(*) as count FROM usuarios WHERE role_id IS NULL`,
  };
  
  console.log('\n   📊 ESTADÍSTICAS DE VERIFICACIÓN:');
  console.log(`   ├── Permisos: ${stats.permisos}`);
  console.log(`   ├── Roles: ${stats.roles}`);
  console.log(`   ├── Asignaciones rol-permiso: ${stats.asignaciones}`);
  console.log(`   ├── Usuarios con roleId: ${stats.usuariosConRole[0].count}`);
  console.log(`   └── Usuarios sin roleId: ${stats.usuariosSinRole[0].count}`);
  
  // Verificar que todo está correcto
  if (stats.permisos !== 71) {
    console.log(`   ⚠️  ADVERTENCIA: Se esperaban 71 permisos, se encontraron ${stats.permisos}`);
  }
  if (stats.roles !== 4) {
    console.log(`   ⚠️  ADVERTENCIA: Se esperaban 4 roles, se encontraron ${stats.roles}`);
  }
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function syncProductionDB() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     SINCRONIZACIÓN DE BD DE PRODUCCIÓN - SIVAC            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Commits a sincronizar:                                    ║');
  console.log('║  • ef4dc2fa - Sistema de permisos granular                 ║');
  console.log('║  • 1c2dba67 - Campo centroAcopioId en Usuario              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // PASO 1: Agregar columna centro_acopio_id
    console.log('📊 PASO 1: Verificando estructura de tabla usuarios...');
    await addCentroAcopioColumn();
    console.log('');

    // PASO 2: Limpiar permisos anteriores
    console.log('🧹 PASO 2: Limpiando datos de permisos anteriores...');
    await cleanOldPermissions();
    console.log('');

    // PASO 3: Crear permisos
    console.log('📝 PASO 3: Creando permisos granulares...');
    await createPermissions();
    console.log('');

    // PASO 4: Crear/Actualizar roles
    console.log('👥 PASO 4: Configurando roles del sistema...');
    await createRoles();
    console.log('');

    // PASO 5: Asignar permisos a roles
    console.log('🔗 PASO 5: Asignando permisos a roles...');
    await assignPermissionsToRoles();
    console.log('');

    // PASO 6: Actualizar usuarios
    console.log('👤 PASO 6: Actualizando usuarios existentes...');
    await updateUsersWithRoles();
    console.log('');

    // PASO 7: Verificar
    console.log('✅ PASO 7: Verificando integridad...');
    await verifyIntegrity();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║        ✅ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE          ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Próximos pasos:                                          ║');
    console.log('║  1. Ejecutar: npx prisma generate                         ║');
    console.log('║  2. Reiniciar el backend: npm run dev                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║              ❌ ERROR EN SINCRONIZACIÓN                    ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error('\nDetalles del error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
syncProductionDB();
