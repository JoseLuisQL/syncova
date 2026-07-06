import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, RolUsuario } from '@/types';
import { ResponseUtil } from '@/utils/response';
import { prisma } from '@/config/database';

/**
 * Cache para permisos de usuario para evitar consultas repetitivas
 */
const userPermissionsCache = new Map<string, { permissions: string[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtener permisos de un usuario desde la base de datos
 */
async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // Verificar cache
    const cached = userPermissionsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.permissions;
    }

    // Obtener usuario con su rol y permisos
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.role) {
      return [];
    }

    const permissions = user.role.rolePermissions
      .filter(rp => rp.permission.estado === 'activo')
      .map(rp => rp.permission.codigo);

    // Actualizar cache
    userPermissionsCache.set(userId, {
      permissions,
      timestamp: Date.now()
    });

    return permissions;
  } catch (error) {
    console.error('Error al obtener permisos del usuario:', error);
    return [];
  }
}

/**
 * Limpiar cache de permisos (útil cuando se actualizan roles/permisos)
 */
export function clearPermissionsCache(userId?: string): void {
  if (userId) {
    userPermissionsCache.delete(userId);
  } else {
    userPermissionsCache.clear();
  }
}

/**
 * Middleware para validar permisos específicos por código
 * @param requiredPermissions Array de códigos de permisos requeridos (ej: ['usuarios:read', 'roles:write'])
 */
export const requirePermissions = (requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Los administradores tienen acceso total
      if (req.user.rol === 'administrador') {
        next();
        return;
      }

      // Obtener permisos del usuario
      const userPermissions = await getUserPermissions(req.user.id);

      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        ResponseUtil.forbidden(res, 'No tiene permisos para realizar esta acción');
        return;
      }

      // Agregar permisos al request para uso posterior
      req.user.permissions = userPermissions;
      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      ResponseUtil.internalError(res, 'Error interno de autorización');
    }
  };
};

/**
 * Middleware para validar permisos basados en roles (LEGACY - mantener compatibilidad)
 * @param allowedRoles Array de roles que tienen permiso para acceder
 */
export const validatePermissions = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const userRole = req.user.rol;

      // Mapear roles del sistema a roles permitidos
      const roleMapping: Record<string, RolUsuario[]> = {
        'admin': ['administrador'],
        'supervisor': ['administrador', 'coordinador'],
        'operador': ['administrador', 'coordinador', 'operador'],
        'responsable': ['administrador', 'coordinador', 'responsable_acopio'],
        'coordinador': ['administrador', 'coordinador'],
        'administrador': ['administrador']
      };

      // Verificar si el rol del usuario está permitido
      let hasPermission = false;

      for (const allowedRole of allowedRoles) {
        const mappedRoles = roleMapping[allowedRole] || [];
        const mappedRolesSet = new Set(mappedRoles);
        if (mappedRolesSet.has(userRole)) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        ResponseUtil.forbidden(res, 'No tiene permisos para realizar esta acción');
        return;
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      ResponseUtil.internalError(res, 'Error interno de autorización');
    }
  };
};

/**
 * Middleware para verificar permisos específicos de recursos (DINÁMICO)
 * @param resource Recurso al que se quiere acceder
 * @param action Acción que se quiere realizar (read, write, delete, etc.)
 */
export const checkResourcePermission = (resource: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Los administradores tienen acceso total
      if (req.user.rol === 'administrador') {
        next();
        return;
      }

      // Construir código de permiso
      const permissionCode = `${resource}:${action}`;

      // Obtener permisos del usuario
      const userPermissions = await getUserPermissions(req.user.id);

      // Verificar si el usuario tiene el permiso específico
      if (!userPermissions.includes(permissionCode)) {
        ResponseUtil.forbidden(res, `No tiene permisos para ${action} en ${resource}`);
        return;
      }

      // Agregar permisos al request para uso posterior
      req.user.permissions = userPermissions;
      next();
    } catch (error) {
      console.error('Error en middleware de permisos de recurso:', error);
      ResponseUtil.internalError(res, 'Error interno de autorización');
    }
  };
};

/**
 * Middleware para verificar permisos específicos de recursos (LEGACY - mantener compatibilidad)
 * @param resource Recurso al que se quiere acceder
 * @param action Acción que se quiere realizar (read, write, delete)
 */
export const checkResourcePermissionLegacy = (resource: string, action: 'read' | 'write' | 'delete') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      const { rol } = req.user;

      // Definir permisos por rol y recurso
      const permissions: Record<RolUsuario, Record<string, string[]>> = {
        administrador: {
          '*': ['read', 'write', 'delete'] // Acceso total
        },
        coordinador: {
          'redes': ['read', 'write'],
          'microredes': ['read', 'write'],
          'centros-acopio': ['read', 'write'],
          'establecimientos': ['read', 'write'],
          'usuarios': ['read'],
          'vacunas': ['read', 'write'],
          'planificacion': ['read', 'write'],
          'movimientos': ['read', 'write'],
          'reportes': ['read'],
          'kardex': ['read']
        },
        responsable_acopio: {
          'redes': ['read'],
          'microredes': ['read'],
          'centros-acopio': ['read'],
          'establecimientos': ['read'],
          'vacunas': ['read'],
          'planificacion': ['read'],
          'movimientos': ['read', 'write'],
          'kardex': ['read', 'write'],
          'vales': ['read', 'write']
        },
        operador: {
          'redes': ['read'],
          'microredes': ['read'],
          'centros-acopio': ['read'],
          'establecimientos': ['read'],
          'vacunas': ['read'],
          'planificacion': ['read'],
          'movimientos': ['read'],
          'kardex': ['read']
        }
      };

      const userPermissions = permissions[rol] || {};
      const resourcePermissions = userPermissions[resource] || userPermissions['*'] || [];

      if (!resourcePermissions.includes(action)) {
        ResponseUtil.forbidden(res, `No tiene permisos para ${action} en ${resource}`);
        return;
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos de recurso:', error);
      ResponseUtil.internalError(res, 'Error interno de autorización');
    }
  };
};

/**
 * Middleware para verificar permisos de establecimiento
 * Verifica que el usuario tenga acceso al establecimiento específico
 */
export const checkEstablecimientoPermission = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      return;
    }

    const { rol, establecimientoId: userEstablecimientoId } = req.user;

    // Administradores y coordinadores tienen acceso a todos los establecimientos
    if (['administrador', 'coordinador'].includes(rol)) {
      next();
      return;
    }

    // Para otros roles, verificar que tengan establecimiento asignado
    if (!userEstablecimientoId) {
      ResponseUtil.forbidden(res, 'Usuario no tiene establecimiento asignado');
      return;
    }

    // Obtener el ID del establecimiento de la solicitud
    const requestedEstablecimientoId = req.params.establecimientoId || 
                                     req.body.establecimientoId || 
                                     req.query.establecimientoId;

    // Si se especifica un establecimiento, verificar que coincida
    if (requestedEstablecimientoId && requestedEstablecimientoId !== userEstablecimientoId) {
      ResponseUtil.forbidden(res, 'No tiene permisos para acceder a este establecimiento');
      return;
    }

    next();
  } catch (error) {
    console.error('Error en middleware de permisos de establecimiento:', error);
    ResponseUtil.internalError(res, 'Error interno de autorización');
  }
};

export default {
  validatePermissions,
  requirePermissions,
  checkResourcePermission,
  checkResourcePermissionLegacy,
  checkEstablecimientoPermission,
  clearPermissionsCache
};
