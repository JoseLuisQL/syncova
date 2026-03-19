import { NextFunction, Response } from 'express';
import { prisma } from '@/config/database';
import { AuthenticatedRequest, RolUsuario } from '@/types';
import { ResponseUtil } from '@/utils/response';

type RequestUser = NonNullable<AuthenticatedRequest['user']>;

const resolveRequestUser = (value?: AuthenticatedRequest | RequestUser): RequestUser | undefined => {
  if (!value) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(value, 'user')) {
    return (value as AuthenticatedRequest).user;
  }
  return value as RequestUser;
};

export const isResponsableAcopio = (req: AuthenticatedRequest | AuthenticatedRequest['user']): boolean => {
  const user = req ? resolveRequestUser(req as AuthenticatedRequest | RequestUser) : undefined;
  return user?.rol === 'responsable_acopio';
};

export const getScopedCentroAcopioId = (req: AuthenticatedRequest | AuthenticatedRequest['user']): string | undefined => {
  const user = req ? resolveRequestUser(req as AuthenticatedRequest | RequestUser) : undefined;
  if (!user) return undefined;
  if (user.rol !== 'responsable_acopio') return undefined;
  return user.centroAcopioId || user.centroAcopioIds?.[0];
};

export const getScopedCentroAcopioIds = (req: AuthenticatedRequest | AuthenticatedRequest['user']): string[] | undefined => {
  const user = req ? resolveRequestUser(req as AuthenticatedRequest | RequestUser) : undefined;
  if (!user || user.rol !== 'responsable_acopio') return undefined;

  const ids = user.centroAcopioIds?.length ? user.centroAcopioIds : user.centroAcopioId ? [user.centroAcopioId] : [];
  return ids.length > 0 ? ids : undefined;
};

export const requireCentroAcopioAssignment = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    ResponseUtil.unauthorized(res, 'Usuario no autenticado');
    return;
  }

  const scopedIds = getScopedCentroAcopioIds(req);
  if (req.user.rol === 'responsable_acopio' && (!scopedIds || scopedIds.length === 0)) {
    ResponseUtil.forbidden(res, 'El usuario responsable de acopio no tiene un centro de acopio asignado');
    return;
  }

  next();
};

export const denyRoles = (roles: RolUsuario[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      return;
    }

    if (roles.includes(req.user.rol)) {
      ResponseUtil.forbidden(res, 'No tiene permisos para realizar esta acción');
      return;
    }

    next();
  };
};

export const resolveScopedCentroAcopioId = (
  req: AuthenticatedRequest,
  requestedCentroAcopioId?: string,
): string | undefined => {
  if (!req.user) {
    throw new Error('Usuario no autenticado');
  }

  if (req.user.rol !== 'responsable_acopio') {
    return requestedCentroAcopioId;
  }

  const scopedIds = getScopedCentroAcopioIds(req);
  if (!scopedIds || scopedIds.length === 0) {
    throw new Error('El usuario responsable de acopio no tiene un centro de acopio asignado');
  }

  if (
    requestedCentroAcopioId &&
    requestedCentroAcopioId !== 'todos' &&
    !scopedIds.includes(requestedCentroAcopioId)
  ) {
    throw new Error('No tiene permisos para acceder a otro centro de acopio');
  }

  return requestedCentroAcopioId && requestedCentroAcopioId !== 'todos'
    ? requestedCentroAcopioId
    : req.user.centroAcopioId || scopedIds[0];
};

export const resolveScopedCentroAcopioIds = (
  req: AuthenticatedRequest,
  requestedCentroAcopioId?: string,
): string[] | undefined => {
  if (!req.user) {
    throw new Error('Usuario no autenticado');
  }

  if (req.user.rol !== 'responsable_acopio') {
    if (!requestedCentroAcopioId || requestedCentroAcopioId === 'todos') {
      return undefined;
    }
    return [requestedCentroAcopioId];
  }

  const scopedIds = getScopedCentroAcopioIds(req);
  if (!scopedIds || scopedIds.length === 0) {
    throw new Error('El usuario responsable de acopio no tiene un centro de acopio asignado');
  }

  if (!requestedCentroAcopioId || requestedCentroAcopioId === 'todos') {
    return scopedIds;
  }

  if (!scopedIds.includes(requestedCentroAcopioId)) {
    throw new Error('No tiene permisos para acceder a otro centro de acopio');
  }

  return [requestedCentroAcopioId];
};

export const ensureEstablecimientoInScope = async (
  req: AuthenticatedRequest,
  establecimientoId?: string,
): Promise<void> => {
  if (!establecimientoId || !req.user || req.user.rol !== 'responsable_acopio') {
    return;
  }

  const scopedIds = getScopedCentroAcopioIds(req);
  if (!scopedIds || scopedIds.length === 0) {
    throw new Error('El usuario responsable de acopio no tiene un centro de acopio asignado');
  }

  const establecimiento = await prisma.establecimiento.findUnique({
    where: { id: establecimientoId },
    select: { id: true, centroAcopioId: true },
  });

  if (!establecimiento) {
    throw new Error('Establecimiento no encontrado');
  }

  if (!scopedIds.includes(establecimiento.centroAcopioId)) {
    throw new Error('No tiene permisos para acceder a establecimientos fuera de su centro de acopio');
  }
};

export default {
  denyRoles,
  ensureEstablecimientoInScope,
  getScopedCentroAcopioId,
  getScopedCentroAcopioIds,
  isResponsableAcopio,
  requireCentroAcopioAssignment,
  resolveScopedCentroAcopioId,
  resolveScopedCentroAcopioIds,
};
