import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/env';
import { ResponseUtil } from '@/utils/response';
import { AuthenticatedRequest, RolUsuario } from '@/types';
import { prisma } from '@/config/database';

/**
 * Interface para el payload del JWT
 */
interface JwtPayload {
  id: string;
  usuario: string;
  rol: RolUsuario;
  establecimientoId?: string;
  centroAcopioId?: string;
  centroAcopioIds?: string[];
  roleId?: string;
  iat: number;
  exp: number;
}

export interface ResolvedAuthUser {
  id: string;
  usuario: string;
  rol: RolUsuario;
  roleId?: string;
  establecimientoId?: string;
  centroAcopioId?: string;
  centroAcopioIds?: string[];
}

export const resolveAuthenticatedUserFromToken = async (token: string): Promise<ResolvedAuthUser | null> => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        usuario: true,
        rol: true,
        roleId: true,
        establecimientoId: true,
        centroAcopioId: true,
        centrosAcopioAsignados: {
          select: {
            centroAcopioId: true,
          },
        },
        estado: true,
      },
    });

    if (!user || user.estado !== 'activo') {
      return null;
    }

    return {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol as RolUsuario,
      roleId: user.roleId || undefined,
      establecimientoId: user.establecimientoId || undefined,
      centroAcopioId: user.centroAcopioId || undefined,
      centroAcopioIds: user.centrosAcopioAsignados?.map((item) => item.centroAcopioId) || [],
    };
  } catch {
    return null;
  }
};

/**
 * Middleware de autenticación
 * Verifica que el usuario esté autenticado y el token sea válido
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseUtil.unauthorized(res, 'Token de acceso requerido');
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar y decodificar el token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        ResponseUtil.unauthorized(res, 'Token expirado');
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        ResponseUtil.unauthorized(res, 'Token inválido');
        return;
      }
      throw error;
    }

    // Verificar que el usuario existe y está activo
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        usuario: true,
        rol: true,
        roleId: true,
        establecimientoId: true,
        centroAcopioId: true,
        centrosAcopioAsignados: {
          select: {
            centroAcopioId: true,
          },
        },
        estado: true,
      },
    });

    if (!user) {
      ResponseUtil.unauthorized(res, 'Usuario no encontrado');
      return;
    }

    if (user.estado !== 'activo') {
      ResponseUtil.unauthorized(res, 'Usuario inactivo');
      return;
    }

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() },
    });

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol as RolUsuario,
      roleId: user.roleId || undefined,
      establecimientoId: user.establecimientoId || undefined,
      centroAcopioId: user.centroAcopioId || undefined,
      centroAcopioIds: user.centrosAcopioAsignados?.map((item) => item.centroAcopioId) || [],
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    ResponseUtil.internalError(res, 'Error interno de autenticación');
  }
};

/**
 * Middleware de autorización por roles
 * Verifica que el usuario tenga uno de los roles permitidos
 */
export const authorize = (allowedRoles: RolUsuario[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      return;
    }

    if (!allowedRoles.includes(req.user.rol)) {
      ResponseUtil.forbidden(res, 'No tiene permisos para realizar esta acción');
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario pertenece al establecimiento
 * Solo para roles que están asociados a un establecimiento específico
 */
export const checkEstablecimiento = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    ResponseUtil.unauthorized(res, 'Usuario no autenticado');
    return;
  }

  // Los administradores y coordinadores pueden acceder a cualquier establecimiento
  if (['administrador', 'coordinador'].includes(req.user.rol)) {
    next();
    return;
  }

  // Para responsables de acopio y operadores, verificar establecimiento
  const establecimientoId = req.params.establecimientoId || req.body.establecimientoId;
  
  if (!establecimientoId) {
    ResponseUtil.validationError(res, 'ID de establecimiento requerido');
    return;
  }

  if (req.user.establecimientoId !== establecimientoId) {
    ResponseUtil.forbidden(res, 'No tiene permisos para acceder a este establecimiento');
    return;
  }

  next();
};

/**
 * Middleware opcional de autenticación
 * Permite acceso sin autenticación pero agrega información del usuario si está autenticado
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      const user = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          usuario: true,
          rol: true,
          roleId: true,
          establecimientoId: true,
          centroAcopioId: true,
          centrosAcopioAsignados: {
            select: {
              centroAcopioId: true,
            },
          },
          estado: true,
        },
      });

      if (user && user.estado === 'activo') {
        req.user = {
          id: user.id,
          usuario: user.usuario,
          rol: user.rol as RolUsuario,
          roleId: user.roleId || undefined,
          establecimientoId: user.establecimientoId || undefined,
          centroAcopioId: user.centroAcopioId || undefined,
          centroAcopioIds: user.centrosAcopioAsignados?.map((item) => item.centroAcopioId) || [],
        };
      }
    } catch {
      // Ignorar errores de token en autenticación opcional
    }

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    next();
  }
};

/**
 * Middleware para verificar permisos específicos basados en el contexto
 */
export const checkPermissions = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      return;
    }

    const { rol } = req.user;

    // Definir permisos por rol
    const permissions: Record<RolUsuario, string[]> = {
      administrador: ['*'], // Acceso total
      coordinador: [
        'read:establecimientos',
        'read:vacunas',
        'read:usuarios',
        'read:planificacion',
        'read:movimientos',
        'read:reportes',
        'read:alertas',
        'write:planificacion',
        'write:alertas',
      ],
      responsable_acopio: [
        'read:establecimientos',
        'read:vacunas',
        'read:planificacion',
        'read:movimientos',
        'write:movimientos',
        'write:entregas',
        'read:kardex',
        'write:kardex',
        'read:vales',
        'write:vales',
      ],
      operador: [
        'read:establecimientos',
        'read:vacunas',
        'read:planificacion',
        'read:movimientos',
        'read:kardex',
      ],
    };

    const userPermissions = permissions[rol] || [];

    // Verificar si tiene el permiso específico o acceso total
    if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
      ResponseUtil.forbidden(res, `No tiene permisos para: ${permission}`);
      return;
    }

    next();
  };
};

// Alias para compatibilidad con rutas existentes
export const authenticateToken = authenticate;

export default {
  authenticate,
  authenticateToken,
  authorize,
  checkEstablecimiento,
  optionalAuth,
  checkPermissions,
};
