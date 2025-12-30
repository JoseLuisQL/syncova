import { Response } from 'express';
import { ResponseUtil } from '@/utils/response';

// Mock Express Response
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('ResponseUtil', () => {
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
  });

  describe('success', () => {
    it('should return success response with default message', () => {
      const data = { id: 1, name: 'Test' };
      ResponseUtil.success(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Operación exitosa',
          data,
        })
      );
    });

    it('should return success response with custom message and status', () => {
      const data = { id: 1 };
      ResponseUtil.success(res, data, 'Custom message', 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Custom message',
          data,
        })
      );
    });
  });

  describe('error', () => {
    it('should return error response with default message', () => {
      ResponseUtil.error(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error interno del servidor',
        })
      );
    });

    it('should return error response with custom message and status', () => {
      ResponseUtil.error(res, 'Custom error', 400);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Custom error',
        })
      );
    });

    it('should include error details when provided', () => {
      ResponseUtil.error(res, 'Error', 400, 'Error details');

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Error details',
        })
      );
    });
  });

  describe('paginated', () => {
    it('should return paginated response with correct pagination info', () => {
      const data = [{ id: 1 }, { id: 2 }];
      ResponseUtil.paginated(res, data, 1, 10, 25);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          },
        })
      );
    });

    it('should calculate hasNext and hasPrev correctly', () => {
      const data = [{ id: 1 }];
      ResponseUtil.paginated(res, data, 2, 10, 25);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            hasNext: true,
            hasPrev: true,
          }),
        })
      );
    });

    it('should set hasNext to false on last page', () => {
      const data = [{ id: 1 }];
      ResponseUtil.paginated(res, data, 3, 10, 25);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            hasNext: false,
            hasPrev: true,
          }),
        })
      );
    });
  });

  describe('created', () => {
    it('should return 201 status for created resources', () => {
      const data = { id: 1 };
      ResponseUtil.created(res, data);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Recurso creado exitosamente',
        })
      );
    });
  });

  describe('notFound', () => {
    it('should return 404 status', () => {
      ResponseUtil.notFound(res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Recurso no encontrado',
        })
      );
    });
  });

  describe('unauthorized', () => {
    it('should return 401 status', () => {
      ResponseUtil.unauthorized(res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No autorizado',
        })
      );
    });
  });

  describe('forbidden', () => {
    it('should return 403 status', () => {
      ResponseUtil.forbidden(res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Acceso prohibido',
        })
      );
    });
  });

  describe('validationError', () => {
    it('should return 400 status for validation errors', () => {
      ResponseUtil.validationError(res, 'Invalid input');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid input',
        })
      );
    });
  });

  describe('conflict', () => {
    it('should return 409 status', () => {
      ResponseUtil.conflict(res, 'Resource already exists');

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Resource already exists',
        })
      );
    });
  });

  describe('tooManyRequests', () => {
    it('should return 429 status', () => {
      ResponseUtil.tooManyRequests(res);

      expect(res.status).toHaveBeenCalledWith(429);
    });
  });

  describe('serviceUnavailable', () => {
    it('should return 503 status', () => {
      ResponseUtil.serviceUnavailable(res);

      expect(res.status).toHaveBeenCalledWith(503);
    });
  });
});
