import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ResponseUtil } from '@/utils/response';
import { config } from '@/config/env';

/**
 * Interface para errores personalizados
 */
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Middleware global de manejo de errores
 */
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log del error
  console.error('Error capturado:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  // Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, res);
    return;
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    ResponseUtil.internalError(
      res,
      'Error desconocido en la base de datos',
      config.env === 'development' ? error.message : undefined
    );
    return;
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    ResponseUtil.internalError(
      res,
      'Error crítico en la base de datos',
      config.env === 'development' ? error.message : undefined
    );
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    ResponseUtil.serviceUnavailable(
      res,
      'Error de conexión con la base de datos'
    );
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    ResponseUtil.validationError(
      res,
      'Error de validación en la consulta',
      config.env === 'development' ? error.message : undefined
    );
    return;
  }

  // Errores de validación de Joi
  if (error.name === 'ValidationError') {
    ResponseUtil.validationError(
      res,
      'Error de validación de datos',
      error.details
    );
    return;
  }

  // Errores HTTP personalizados
  if (error.statusCode) {
    ResponseUtil.error(
      res,
      error.message,
      error.statusCode,
      config.env === 'development' ? error.stack : undefined
    );
    return;
  }

  // Error por defecto
  ResponseUtil.internalError(
    res,
    'Error interno del servidor',
    config.env === 'development' ? error.message : undefined
  );
};

/**
 * Maneja errores específicos de Prisma
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError, res: Response): void => {
  switch (error.code) {
    case 'P2000':
      ResponseUtil.validationError(
        res,
        'El valor proporcionado es demasiado largo para el campo'
      );
      break;

    case 'P2001':
      ResponseUtil.notFound(
        res,
        'El registro que busca no existe'
      );
      break;

    case 'P2002': {
      const target = error.meta?.target as string[] | undefined;
      const field = target ? target[0] : 'campo';
      ResponseUtil.conflict(
        res,
        `Ya existe un registro con ese ${field}`
      );
      break;
    }

    case 'P2003':
      ResponseUtil.validationError(
        res,
        'Error de clave foránea: el registro referenciado no existe'
      );
      break;

    case 'P2004':
      ResponseUtil.validationError(
        res,
        'Error de restricción en la base de datos'
      );
      break;

    case 'P2005':
      ResponseUtil.validationError(
        res,
        'El valor del campo no es válido'
      );
      break;

    case 'P2006':
      ResponseUtil.validationError(
        res,
        'El valor proporcionado no es válido'
      );
      break;

    case 'P2007':
      ResponseUtil.validationError(
        res,
        'Error de validación de datos'
      );
      break;

    case 'P2008':
      ResponseUtil.validationError(
        res,
        'Error al procesar la consulta'
      );
      break;

    case 'P2009':
      ResponseUtil.validationError(
        res,
        'Error de validación de consulta'
      );
      break;

    case 'P2010':
      ResponseUtil.internalError(
        res,
        'Error en la consulta SQL'
      );
      break;

    case 'P2011':
      ResponseUtil.validationError(
        res,
        'Violación de restricción: campo requerido no puede ser nulo'
      );
      break;

    case 'P2012':
      ResponseUtil.validationError(
        res,
        'Falta un valor requerido'
      );
      break;

    case 'P2013':
      ResponseUtil.validationError(
        res,
        'Falta un argumento requerido'
      );
      break;

    case 'P2014':
      ResponseUtil.validationError(
        res,
        'La relación especificada viola una restricción'
      );
      break;

    case 'P2015':
      ResponseUtil.notFound(
        res,
        'No se encontró el registro relacionado'
      );
      break;

    case 'P2016':
      ResponseUtil.validationError(
        res,
        'Error de interpretación de consulta'
      );
      break;

    case 'P2017':
      ResponseUtil.validationError(
        res,
        'Los registros no están conectados'
      );
      break;

    case 'P2018':
      ResponseUtil.notFound(
        res,
        'Los registros conectados requeridos no fueron encontrados'
      );
      break;

    case 'P2019':
      ResponseUtil.validationError(
        res,
        'Error de entrada'
      );
      break;

    case 'P2020':
      ResponseUtil.validationError(
        res,
        'El valor está fuera del rango permitido'
      );
      break;

    case 'P2021':
      ResponseUtil.internalError(
        res,
        'La tabla no existe en la base de datos'
      );
      break;

    case 'P2022':
      ResponseUtil.internalError(
        res,
        'La columna no existe en la base de datos'
      );
      break;

    case 'P2025':
      ResponseUtil.notFound(
        res,
        'No se encontró el registro para actualizar o eliminar'
      );
      break;

    default:
      ResponseUtil.internalError(
        res,
        'Error de base de datos',
        config.env === 'development' ? error.message : undefined
      );
      break;
  }
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseUtil.notFound(
    res,
    `Ruta no encontrada: ${req.method} ${req.path}`
  );
};

/**
 * Clase para crear errores HTTP personalizados
 */
export class HttpError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Mantener el stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

/**
 * Funciones helper para crear errores específicos
 */
export const createError = {
  badRequest: (message: string = 'Solicitud incorrecta', details?: any) =>
    new HttpError(message, 400, 'BAD_REQUEST', details),

  unauthorized: (message: string = 'No autorizado') =>
    new HttpError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Prohibido') =>
    new HttpError(message, 403, 'FORBIDDEN'),

  notFound: (message: string = 'No encontrado') =>
    new HttpError(message, 404, 'NOT_FOUND'),

  conflict: (message: string = 'Conflicto') =>
    new HttpError(message, 409, 'CONFLICT'),

  unprocessableEntity: (message: string = 'Entidad no procesable', details?: any) =>
    new HttpError(message, 422, 'UNPROCESSABLE_ENTITY', details),

  tooManyRequests: (message: string = 'Demasiadas solicitudes') =>
    new HttpError(message, 429, 'TOO_MANY_REQUESTS'),

  internalServer: (message: string = 'Error interno del servidor') =>
    new HttpError(message, 500, 'INTERNAL_SERVER_ERROR'),

  serviceUnavailable: (message: string = 'Servicio no disponible') =>
    new HttpError(message, 503, 'SERVICE_UNAVAILABLE'),
};

export default {
  errorHandler,
  notFoundHandler,
  HttpError,
  createError,
};
