/**
 * Utilidades para manejo de errores
 */

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Crear error con código de estado específico
 */
export function createError(message: string, statusCode: number = 500): AppError {
  return new AppError(message, statusCode);
}

/**
 * Errores comunes predefinidos
 */
export const CommonErrors = {
  NotFound: (resource: string) => createError(`${resource} no encontrado`, 404),
  BadRequest: (message: string) => createError(message, 400),
  Unauthorized: (message: string = 'No autorizado') => createError(message, 401),
  Forbidden: (message: string = 'Acceso prohibido') => createError(message, 403),
  Conflict: (message: string) => createError(message, 409),
  ValidationError: (message: string) => createError(`Error de validación: ${message}`, 400),
  DatabaseError: (message: string) => createError(`Error de base de datos: ${message}`, 500),
  InternalError: (message: string = 'Error interno del servidor') => createError(message, 500)
};
