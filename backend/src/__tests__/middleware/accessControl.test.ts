import { Response } from 'express';
import { denyRoles, getScopedCentroAcopioId, requireCentroAcopioAssignment, resolveScopedCentroAcopioId } from '@/middleware/accessControl';
import { AuthenticatedRequest } from '@/types';

const createResponseMock = () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));

  return ({
    status,
    json,
  } as unknown) as Response;
};

describe('accessControl', () => {
  it('fuerza el centro de acopio del responsable aunque envíe otro en query', () => {
    const req = {
      user: {
        id: 'user-1',
        usuario: 'responsable',
        rol: 'responsable_acopio',
        centroAcopioId: 'centro-1',
      },
    } as AuthenticatedRequest;

    expect(resolveScopedCentroAcopioId(req, undefined)).toBe('centro-1');
    expect(resolveScopedCentroAcopioId(req, 'todos')).toBe('centro-1');
    expect(() => resolveScopedCentroAcopioId(req, 'centro-2')).toThrow(
      'No tiene permisos para acceder a otro centro de acopio',
    );
  });

  it('permite centro de acopio libre para administrador', () => {
    const req = {
      user: {
        id: 'user-1',
        usuario: 'admin',
        rol: 'administrador',
      },
    } as AuthenticatedRequest;

    expect(resolveScopedCentroAcopioId(req, 'centro-x')).toBe('centro-x');
    expect(getScopedCentroAcopioId(req)).toBeUndefined();
  });

  it('bloquea responsable sin centro asignado', () => {
    const req = {
      user: {
        id: 'user-1',
        usuario: 'responsable',
        rol: 'responsable_acopio',
      },
    } as AuthenticatedRequest;
    const res = createResponseMock();
    const next = jest.fn();

    requireCentroAcopioAssignment(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('denyRoles rechaza el rol restringido', () => {
    const req = {
      user: {
        id: 'user-1',
        usuario: 'responsable',
        rol: 'responsable_acopio',
      },
    } as AuthenticatedRequest;
    const res = createResponseMock();
    const next = jest.fn();

    denyRoles(['responsable_acopio'])(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
