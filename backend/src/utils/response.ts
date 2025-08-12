import { Response } from 'express';
import { ApiResponse, PaginatedResponse, AuthResponse } from '@/types';

/**
 * Utilidades para respuestas estandarizadas de la API
 */
export class ResponseUtil {
  /**
   * Respuesta exitosa estándar
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operación exitosa',
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta de error estándar
   */
  static error(
    res: Response,
    message: string = 'Error interno del servidor',
    statusCode: number = 500,
    error?: string
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta paginada
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Datos obtenidos exitosamente'
  ): Response<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  }

  /**
   * Respuesta de autenticación
   */
  static auth(
    res: Response,
    user: any,
    token: string,
    expiresIn: string,
    message: string = 'Autenticación exitosa'
  ): Response<AuthResponse> {
    const response: AuthResponse = {
      success: true,
      message,
      data: {
        user,
        token,
        expiresIn,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  }

  /**
   * Respuesta de creación exitosa
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Recurso creado exitosamente'
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  /**
   * Respuesta de actualización exitosa
   */
  static updated<T>(
    res: Response,
    data: T,
    message: string = 'Recurso actualizado exitosamente'
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, 200);
  }

  /**
   * Respuesta de eliminación exitosa
   */
  static deleted(
    res: Response,
    message: string = 'Recurso eliminado exitosamente'
  ): Response<ApiResponse> {
    return this.success(res, null, message, 200);
  }

  /**
   * Respuesta de no encontrado
   */
  static notFound(
    res: Response,
    message: string = 'Recurso no encontrado'
  ): Response<ApiResponse> {
    return this.error(res, message, 404);
  }

  /**
   * Respuesta de no autorizado
   */
  static unauthorized(
    res: Response,
    message: string = 'No autorizado'
  ): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  /**
   * Respuesta de prohibido
   */
  static forbidden(
    res: Response,
    message: string = 'Acceso prohibido'
  ): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  /**
   * Respuesta de validación fallida
   */
  static validationError(
    res: Response,
    message: string = 'Error de validación',
    errors?: any
  ): Response<ApiResponse> {
    return this.error(res, message, 400, errors);
  }

  /**
   * Respuesta de conflicto
   */
  static conflict(
    res: Response,
    message: string = 'Conflicto en la operación'
  ): Response<ApiResponse> {
    return this.error(res, message, 409);
  }

  /**
   * Respuesta de demasiadas solicitudes
   */
  static tooManyRequests(
    res: Response,
    message: string = 'Demasiadas solicitudes'
  ): Response<ApiResponse> {
    return this.error(res, message, 429);
  }

  /**
   * Respuesta de error interno del servidor
   */
  static internalError(
    res: Response,
    message: string = 'Error interno del servidor',
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, 500, error);
  }

  /**
   * Respuesta de servicio no disponible
   */
  static serviceUnavailable(
    res: Response,
    message: string = 'Servicio no disponible'
  ): Response<ApiResponse> {
    return this.error(res, message, 503);
  }
}

export default ResponseUtil;

// =====================================================
// FUNCIONES DE CONVENIENCIA
// =====================================================

/**
 * Funciones de conveniencia para usar directamente
 */
export const successResponse = ResponseUtil.success.bind(ResponseUtil);
export const errorResponse = ResponseUtil.error.bind(ResponseUtil);

/**
 * Función paginatedResponse con interfaz personalizada
 */
export function paginatedResponse<T>(
  res: Response,
  options: {
    data: T[];
    page: number;
    limit: number;
    total: number;
    message?: string;
  }
): Response<PaginatedResponse<T>> {
  return ResponseUtil.paginated(
    res,
    options.data,
    options.page,
    options.limit,
    options.total,
    options.message
  );
}
export const createdResponse = ResponseUtil.created.bind(ResponseUtil);
export const updatedResponse = ResponseUtil.updated.bind(ResponseUtil);
export const deletedResponse = ResponseUtil.deleted.bind(ResponseUtil);
export const notFoundResponse = ResponseUtil.notFound.bind(ResponseUtil);
export const unauthorizedResponse = ResponseUtil.unauthorized.bind(ResponseUtil);
export const forbiddenResponse = ResponseUtil.forbidden.bind(ResponseUtil);
export const validationErrorResponse = ResponseUtil.validationError.bind(ResponseUtil);
export const conflictResponse = ResponseUtil.conflict.bind(ResponseUtil);
export const tooManyRequestsResponse = ResponseUtil.tooManyRequests.bind(ResponseUtil);
export const internalErrorResponse = ResponseUtil.internalError.bind(ResponseUtil);
export const serviceUnavailableResponse = ResponseUtil.serviceUnavailable.bind(ResponseUtil);
