export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  administrador: ['*'],
  coordinador: [
    'dashboard:read',
    'redes:read',
    'microredes:read',
    'centros_acopio:read',
    'establecimientos:read',
    'vacunas:read',
    'jeringas:read',
    'movimientos:read',
    'planificacion:read',
    'planificacion:write',
    'planificacion:aprobar',
    'ici_demid:read',
    'ici_demid:write',
    'reportes_inventario:read',
    'reportes_inventario:export',
    'reportes_movimientos:read',
    'reportes_movimientos:export',
    'reportes_planificacion:read',
    'reportes_planificacion:export',
    'roles:read',
    'permisos:read',
    'usuarios:read',
  ],
  responsable_acopio: [
    'dashboard:read',
    'establecimientos:read',
    'vacunas:read',
    'movimientos:read',
    'planificacion:read',
    'ici_demid:read',
  ],
  operador: [
    'dashboard:read',
    'establecimientos:read',
    'vacunas:read',
    'movimientos:read',
    'planificacion:read',
    'ici_demid:read',
  ],
};

export const getAssignablePermissionCodesForRole = (roleCode: string): string[] | null => {
  if (roleCode === 'administrador') {
    return null;
  }

  return DEFAULT_ROLE_PERMISSIONS[roleCode] || null;
};

export default DEFAULT_ROLE_PERMISSIONS;
