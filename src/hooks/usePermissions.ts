import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Mapeo de módulos del menú a los permisos requeridos
 * Si el usuario tiene AL MENOS UNO de estos permisos, puede ver el módulo
 */
export const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: ['dashboard:read'],
  establecimientos: [
    'redes:read', 'redes:write',
    'microredes:read', 'microredes:write',
    'centros_acopio:read', 'centros_acopio:write',
    'establecimientos:read', 'establecimientos:write'
  ],
  inventario: [
    'vacunas:read', 'vacunas:write',
    'jeringas:read', 'jeringas:write',
    'lotes_vacunas:read', 'lotes_vacunas:write',
    'lotes_jeringas:read', 'lotes_jeringas:write',
    'config_jeringas:read', 'config_jeringas:write',
    'inventario:ingreso'
  ],
  movimientos: ['movimientos:read', 'movimientos:write', 'movimientos:anular'],
  planificacion: ['planificacion:read', 'planificacion:write', 'planificacion:aprobar'],
  kardex: ['kardex:read', 'kardex:export'],
  reportes: [
    'reportes_inventario:read', 'reportes_inventario:export',
    'reportes_movimientos:read', 'reportes_movimientos:export',
    'reportes_planificacion:read', 'reportes_planificacion:export',
    'reportes_cenares:read', 'reportes_cenares:export',
    'reportes_config:read', 'reportes_config:write'
  ],
  alertas: [
    'alertas_dashboard:read',
    'alertas:read', 'alertas:write', 'alertas:marcar',
    'alertas_reportes:read',
    'alertas_config:read', 'alertas_config:write'
  ],
  usuarios: [
    'usuarios:read', 'usuarios:write', 'usuarios:update', 'usuarios:delete', 'usuarios:password', 'usuarios:estado',
    'roles:read', 'roles:write',
    'permisos:read', 'permisos:assign'
  ],
  configuracion: [
    'config_general:read', 'config_general:write',
    'config_notificaciones:read', 'config_notificaciones:write',
    'config_seguridad:read', 'config_seguridad:write',
    'config_respaldos:read', 'config_respaldos:write',
    'config_sistema:read', 'config_sistema:write',
    'config_mantenimiento:read', 'config_mantenimiento:write',
    'config_integraciones:read', 'config_integraciones:write',
    'config_avanzado:read', 'config_avanzado:write'
  ],
};

/**
 * Mapeo de secciones internas de cada módulo a sus permisos
 */
export const SECTION_PERMISSIONS: Record<string, Record<string, string[]>> = {
  // Establecimientos
  establecimientos: {
    redes: ['redes:read'],
    microredes: ['microredes:read'],
    'centros-acopio': ['centros_acopio:read'],
    establecimientos: ['establecimientos:read'],
  },
  // Inventario
  inventario: {
    vacunas: ['vacunas:read'],
    jeringas: ['jeringas:read'],
    'lotes-vacunas': ['lotes_vacunas:read'],
    'lotes-jeringas': ['lotes_jeringas:read'],
    'configuracion-jeringas': ['config_jeringas:read'],
  },
  // Reportes
  reportes: {
    inventario: ['reportes_inventario:read'],
    movimientos: ['reportes_movimientos:read'],
    planificacion: ['reportes_planificacion:read'],
    cenares: ['reportes_cenares:read'],
    configuracion: ['reportes_config:read'],
  },
  // Alertas
  alertas: {
    dashboard: ['alertas_dashboard:read'],
    alertas: ['alertas:read'],
    reportes: ['alertas_reportes:read'],
    configuracion: ['alertas_config:read'],
  },
  // Usuarios
  usuarios: {
    usuarios: ['usuarios:read'],
    roles: ['roles:read'],
    permisos: ['permisos:read'],
  },
  // Configuración
  configuracion: {
    general: ['config_general:read'],
    notificaciones: ['config_notificaciones:read'],
    seguridad: ['config_seguridad:read'],
    respaldos: ['config_respaldos:read'],
    sistema: ['config_sistema:read'],
    mantenimiento: ['config_mantenimiento:read'],
    integraciones: ['config_integraciones:read'],
    avanzado: ['config_avanzado:read'],
  },
};

/**
 * Hook para gestión de permisos
 */
export const usePermissions = () => {
  const { user } = useAuth();

  // Permisos del usuario actual
  const permissions = useMemo(() => {
    return user?.permissions || [];
  }, [user?.permissions]);

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = useCallback((codigo: string): boolean => {
    return permissions.includes(codigo);
  }, [permissions]);

  /**
   * Verifica si el usuario tiene al menos uno de los permisos indicados
   */
  const hasAnyPermission = useCallback((codigos: string[]): boolean => {
    return codigos.some(codigo => permissions.includes(codigo));
  }, [permissions]);

  /**
   * Verifica si el usuario tiene todos los permisos indicados
   */
  const hasAllPermissions = useCallback((codigos: string[]): boolean => {
    return codigos.every(codigo => permissions.includes(codigo));
  }, [permissions]);

  /**
   * Verifica si el usuario puede acceder a un módulo del menú
   */
  const canAccessModule = useCallback((moduleId: string): boolean => {
    const requiredPermissions = MODULE_PERMISSIONS[moduleId];
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Si no hay permisos definidos, se permite acceso
    }
    return hasAnyPermission(requiredPermissions);
  }, [hasAnyPermission]);

  /**
   * Verifica si el usuario puede acceder a una sección de un módulo
   */
  const canAccessSection = useCallback((moduleId: string, sectionId: string): boolean => {
    const moduleSections = SECTION_PERMISSIONS[moduleId];
    if (!moduleSections) {
      return true; // Si no hay secciones definidas, se permite acceso
    }
    const requiredPermissions = moduleSections[sectionId];
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    return hasAnyPermission(requiredPermissions);
  }, [hasAnyPermission]);

  /**
   * Verifica si el usuario puede crear/escribir en un recurso
   */
  const canWrite = useCallback((recurso: string): boolean => {
    return hasPermission(`${recurso}:write`);
  }, [hasPermission]);

  /**
   * Verifica si el usuario puede eliminar un recurso
   */
  const canDelete = useCallback((recurso: string): boolean => {
    return hasPermission(`${recurso}:delete`) || hasPermission(`${recurso}:write`);
  }, [hasPermission]);

  /**
   * Verifica si el usuario puede exportar un recurso
   */
  const canExport = useCallback((recurso: string): boolean => {
    return hasPermission(`${recurso}:export`);
  }, [hasPermission]);

  /**
   * Filtra un array de items según los permisos del usuario
   */
  const filterByPermission = useCallback(<T extends { id: string }>(
    items: T[],
    moduleId: string
  ): T[] => {
    const moduleSections = SECTION_PERMISSIONS[moduleId];
    if (!moduleSections) {
      return items;
    }
    return items.filter(item => {
      const requiredPermissions = moduleSections[item.id];
      if (!requiredPermissions) {
        return true;
      }
      return hasAnyPermission(requiredPermissions);
    });
  }, [hasAnyPermission]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    canAccessSection,
    canWrite,
    canDelete,
    canExport,
    filterByPermission,
  };
};

export default usePermissions;
