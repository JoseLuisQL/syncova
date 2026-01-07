import { AppError, createError, CommonErrors } from '@/utils/errors';

describe('AppError', () => {
  it('should create an error with default values', () => {
    const error = new AppError('Test error');
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('should create an error with custom status code', () => {
    const error = new AppError('Not found', 404);
    
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create a non-operational error', () => {
    const error = new AppError('Fatal error', 500, false);
    
    expect(error.isOperational).toBe(false);
  });
});

describe('createError', () => {
  it('should create an AppError with default status code', () => {
    const error = createError('Test message');
    
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(500);
  });

  it('should create an AppError with custom status code', () => {
    const error = createError('Bad request', 400);
    
    expect(error.message).toBe('Bad request');
    expect(error.statusCode).toBe(400);
  });
});

describe('CommonErrors', () => {
  describe('NotFound', () => {
    it('should create a 404 error', () => {
      const error = CommonErrors.NotFound('Usuario');
      
      expect(error.message).toBe('Usuario no encontrado');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('BadRequest', () => {
    it('should create a 400 error', () => {
      const error = CommonErrors.BadRequest('Invalid data');
      
      expect(error.message).toBe('Invalid data');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('Unauthorized', () => {
    it('should create a 401 error with default message', () => {
      const error = CommonErrors.Unauthorized();
      
      expect(error.message).toBe('No autorizado');
      expect(error.statusCode).toBe(401);
    });

    it('should create a 401 error with custom message', () => {
      const error = CommonErrors.Unauthorized('Token expired');
      
      expect(error.message).toBe('Token expired');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('Forbidden', () => {
    it('should create a 403 error with default message', () => {
      const error = CommonErrors.Forbidden();
      
      expect(error.message).toBe('Acceso prohibido');
      expect(error.statusCode).toBe(403);
    });

    it('should create a 403 error with custom message', () => {
      const error = CommonErrors.Forbidden('Insufficient permissions');
      
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('Conflict', () => {
    it('should create a 409 error', () => {
      const error = CommonErrors.Conflict('Resource already exists');
      
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('ValidationError', () => {
    it('should create a 400 error with validation prefix', () => {
      const error = CommonErrors.ValidationError('Email is required');
      
      expect(error.message).toBe('Error de validación: Email is required');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('DatabaseError', () => {
    it('should create a 500 error with database prefix', () => {
      const error = CommonErrors.DatabaseError('Connection failed');
      
      expect(error.message).toBe('Error de base de datos: Connection failed');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('InternalError', () => {
    it('should create a 500 error with default message', () => {
      const error = CommonErrors.InternalError();
      
      expect(error.message).toBe('Error interno del servidor');
      expect(error.statusCode).toBe(500);
    });

    it('should create a 500 error with custom message', () => {
      const error = CommonErrors.InternalError('Something went wrong');
      
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
    });
  });
});
