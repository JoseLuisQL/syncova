import { Request, Response } from 'express';
import { ConfiguracionJeringaVacunaService } from '@/services/ConfiguracionJeringaVacunaService';
import { 
  CreateConfiguracionDefectoDto,
  UpdateConfiguracionDefectoDto,
  CreateConfiguracionCentroDto,
  UpdateConfiguracionCentroDto,
  ConfiguracionJeringaVacunaFilters
} from '@/types';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/response';
import { validateRequired, validateUUID } from '@/utils/validation';

/**
 * Controlador para gestión de configuraciones jeringa-vacuna
 */
export class ConfiguracionJeringaVacunaController {
  
  // =====================================================
  // CONFIGURACIONES POR DEFECTO
  // =====================================================

  /**
   * Obtener todas las configuraciones por defecto
   * GET /api/configuracion-jeringa-vacuna/defecto
   */
  static async getAllDefecto(req: Request, res: Response): Promise<void> {
    try {
      const {
        vacunaId,
        jeringaId,
        activo,
        search,
        page = '1',
        limit = '100'
      } = req.query;

      // Validaciones de parámetros
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        errorResponse(res, 'El parámetro page debe ser un número mayor a 0', 400);
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        errorResponse(res, 'El parámetro limit debe ser un número entre 1 y 1000', 400);
        return;
      }

      // Validar UUIDs si se proporcionan
      if (vacunaId && !validateUUID(vacunaId as string)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (jeringaId && !validateUUID(jeringaId as string)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      const filters: ConfiguracionJeringaVacunaFilters = {
        vacunaId: vacunaId as string,
        jeringaId: jeringaId as string,
        activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
        search: search as string,
        page: pageNum,
        limit: limitNum
      };

      const result = await ConfiguracionJeringaVacunaService.getAllDefecto(filters);

      if (result.success) {
        paginatedResponse(res, {
          data: result.data.configuraciones,
          page: pageNum,
          limit: limitNum,
          total: result.data.total,
          message: result.message
        });
      } else {
        errorResponse(res, result.message || 'Error al obtener configuraciones', 500);
      }
    } catch (error) {
      console.error('Error en getAllDefecto:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nueva configuración por defecto
   * POST /api/configuracion-jeringa-vacuna/defecto
   */
  static async createDefecto(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId, jeringaId, multiplicador, prioridad, activo } = req.body;

      // Validaciones requeridas
      const vacunaError = validateRequired(vacunaId, 'ID de vacuna');
      if (vacunaError) {
        errorResponse(res, vacunaError, 400);
        return;
      }

      const jeringaError = validateRequired(jeringaId, 'ID de jeringa');
      if (jeringaError) {
        errorResponse(res, jeringaError, 400);
        return;
      }

      const multiplicadorError = validateRequired(multiplicador, 'Multiplicador');
      if (multiplicadorError) {
        errorResponse(res, multiplicadorError, 400);
        return;
      }

      // Validar UUIDs
      if (!validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (!validateUUID(jeringaId)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      // Validar multiplicador
      const multiplicadorNum = parseFloat(multiplicador);
      if (isNaN(multiplicadorNum) || multiplicadorNum <= 0) {
        errorResponse(res, 'El multiplicador debe ser un número mayor a 0', 400);
        return;
      }

      // Validar prioridad si se proporciona
      let prioridadNum = 1;
      if (prioridad !== undefined) {
        prioridadNum = parseInt(prioridad, 10);
        if (isNaN(prioridadNum) || prioridadNum <= 0) {
          errorResponse(res, 'La prioridad debe ser un número mayor a 0', 400);
          return;
        }
      }

      const data: CreateConfiguracionDefectoDto = {
        vacunaId,
        jeringaId,
        multiplicador: multiplicadorNum,
        prioridad: prioridadNum,
        activo: activo !== undefined ? Boolean(activo) : true
      };

      const result = await ConfiguracionJeringaVacunaService.createDefecto(data);

      if (result.success) {
        successResponse(res, result.data, result.message, 201);
      } else {
        errorResponse(res, result.message || 'Error al crear configuración', 400);
      }
    } catch (error) {
      console.error('Error en createDefecto:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar configuración por defecto
   * PUT /api/configuracion-jeringa-vacuna/defecto/:id
   */
  static async updateDefecto(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { multiplicador, prioridad, activo } = req.body;

      // Validar UUID
      if (!validateUUID(id)) {
        errorResponse(res, 'ID de configuración inválido', 400);
        return;
      }

      const data: UpdateConfiguracionDefectoDto = {};

      // Validar multiplicador si se proporciona
      if (multiplicador !== undefined) {
        const multiplicadorNum = parseFloat(multiplicador);
        if (isNaN(multiplicadorNum) || multiplicadorNum <= 0) {
          errorResponse(res, 'El multiplicador debe ser un número mayor a 0', 400);
          return;
        }
        data.multiplicador = multiplicadorNum;
      }

      // Validar prioridad si se proporciona
      if (prioridad !== undefined) {
        const prioridadNum = parseInt(prioridad, 10);
        if (isNaN(prioridadNum) || prioridadNum <= 0) {
          errorResponse(res, 'La prioridad debe ser un número mayor a 0', 400);
          return;
        }
        data.prioridad = prioridadNum;
      }

      // Validar activo si se proporciona
      if (activo !== undefined) {
        data.activo = Boolean(activo);
      }

      const result = await ConfiguracionJeringaVacunaService.updateDefecto(id, data);

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message || 'Error al actualizar configuración', 400);
      }
    } catch (error) {
      console.error('Error en updateDefecto:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar configuración por defecto
   * DELETE /api/configuracion-jeringa-vacuna/defecto/:id
   */
  static async deleteDefecto(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validar UUID
      if (!validateUUID(id)) {
        errorResponse(res, 'ID de configuración inválido', 400);
        return;
      }

      const result = await ConfiguracionJeringaVacunaService.deleteDefecto(id);

      if (result.success) {
        successResponse(res, null, result.message);
      } else {
        errorResponse(res, result.message || 'Error al eliminar configuración', 400);
      }
    } catch (error) {
      console.error('Error en deleteDefecto:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  // =====================================================
  // CONFIGURACIONES POR CENTRO DE ACOPIO
  // =====================================================

  /**
   * Obtener todas las configuraciones por centro de acopio
   * GET /api/configuracion-jeringa-vacuna/centro
   */
  static async getAllCentro(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        jeringaId,
        activo,
        search,
        page = '1',
        limit = '100'
      } = req.query;

      // Validaciones de parámetros
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        errorResponse(res, 'El parámetro page debe ser un número mayor a 0', 400);
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        errorResponse(res, 'El parámetro limit debe ser un número entre 1 y 1000', 400);
        return;
      }

      // Validar UUIDs si se proporcionan
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (jeringaId && !validateUUID(jeringaId as string)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      const filters: ConfiguracionJeringaVacunaFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        jeringaId: jeringaId as string,
        activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
        search: search as string,
        page: pageNum,
        limit: limitNum
      };

      const result = await ConfiguracionJeringaVacunaService.getAllCentro(filters);

      if (result.success) {
        paginatedResponse(res, {
          data: result.data.configuraciones,
          page: pageNum,
          limit: limitNum,
          total: result.data.total,
          message: result.message
        });
      } else {
        errorResponse(res, result.message || 'Error al obtener configuraciones', 500);
      }
    } catch (error) {
      console.error('Error en getAllCentro:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nueva configuración por centro de acopio
   * POST /api/configuracion-jeringa-vacuna/centro
   */
  static async createCentro(req: Request, res: Response): Promise<void> {
    try {
      const { centroAcopioId, vacunaId, jeringaId, multiplicador, prioridad, activo } = req.body;

      // Validaciones requeridas
      const centroError = validateRequired(centroAcopioId, 'ID de centro de acopio');
      if (centroError) {
        errorResponse(res, centroError, 400);
        return;
      }

      const vacunaError = validateRequired(vacunaId, 'ID de vacuna');
      if (vacunaError) {
        errorResponse(res, vacunaError, 400);
        return;
      }

      const jeringaError = validateRequired(jeringaId, 'ID de jeringa');
      if (jeringaError) {
        errorResponse(res, jeringaError, 400);
        return;
      }

      const multiplicadorError = validateRequired(multiplicador, 'Multiplicador');
      if (multiplicadorError) {
        errorResponse(res, multiplicadorError, 400);
        return;
      }

      // Validar UUIDs
      if (!validateUUID(centroAcopioId)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (!validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (!validateUUID(jeringaId)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      // Validar multiplicador
      const multiplicadorNum = parseFloat(multiplicador);
      if (isNaN(multiplicadorNum) || multiplicadorNum <= 0) {
        errorResponse(res, 'El multiplicador debe ser un número mayor a 0', 400);
        return;
      }

      // Validar prioridad si se proporciona
      let prioridadNum = 1;
      if (prioridad !== undefined) {
        prioridadNum = parseInt(prioridad, 10);
        if (isNaN(prioridadNum) || prioridadNum <= 0) {
          errorResponse(res, 'La prioridad debe ser un número mayor a 0', 400);
          return;
        }
      }

      const data: CreateConfiguracionCentroDto = {
        centroAcopioId,
        vacunaId,
        jeringaId,
        multiplicador: multiplicadorNum,
        prioridad: prioridadNum,
        activo: activo !== undefined ? Boolean(activo) : true
      };

      const result = await ConfiguracionJeringaVacunaService.createCentro(data);

      if (result.success) {
        successResponse(res, result.data, result.message, 201);
      } else {
        errorResponse(res, result.message || 'Error al crear configuración', 400);
      }
    } catch (error) {
      console.error('Error en createCentro:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar configuración por centro de acopio
   * PUT /api/configuracion-jeringa-vacuna/centro/:id
   */
  static async updateCentro(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { multiplicador, prioridad, activo } = req.body;

      // Validar UUID
      if (!validateUUID(id)) {
        errorResponse(res, 'ID de configuración inválido', 400);
        return;
      }

      const data: UpdateConfiguracionCentroDto = {};

      // Validar multiplicador si se proporciona
      if (multiplicador !== undefined) {
        const multiplicadorNum = parseFloat(multiplicador);
        if (isNaN(multiplicadorNum) || multiplicadorNum <= 0) {
          errorResponse(res, 'El multiplicador debe ser un número mayor a 0', 400);
          return;
        }
        data.multiplicador = multiplicadorNum;
      }

      // Validar prioridad si se proporciona
      if (prioridad !== undefined) {
        const prioridadNum = parseInt(prioridad, 10);
        if (isNaN(prioridadNum) || prioridadNum <= 0) {
          errorResponse(res, 'La prioridad debe ser un número mayor a 0', 400);
          return;
        }
        data.prioridad = prioridadNum;
      }

      // Validar activo si se proporciona
      if (activo !== undefined) {
        data.activo = Boolean(activo);
      }

      const result = await ConfiguracionJeringaVacunaService.updateCentro(id, data);

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message || 'Error al actualizar configuración', 400);
      }
    } catch (error) {
      console.error('Error en updateCentro:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar configuración por centro de acopio
   * DELETE /api/configuracion-jeringa-vacuna/centro/:id
   */
  static async deleteCentro(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validar UUID
      if (!validateUUID(id)) {
        errorResponse(res, 'ID de configuración inválido', 400);
        return;
      }

      const result = await ConfiguracionJeringaVacunaService.deleteCentro(id);

      if (result.success) {
        successResponse(res, null, result.message);
      } else {
        errorResponse(res, result.message || 'Error al eliminar configuración', 400);
      }
    } catch (error) {
      console.error('Error en deleteCentro:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  // =====================================================
  // MÉTODOS DE CÁLCULO Y CONFIGURACIÓN
  // =====================================================

  /**
   * Obtener configuración efectiva para una vacuna
   * GET /api/configuracion-jeringa-vacuna/efectiva/:vacunaId
   */
  static async getConfiguracionEfectiva(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId } = req.params;
      const { centroAcopioId } = req.query;

      // Validar UUID de vacuna
      if (!validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      // Validar UUID de centro de acopio si se proporciona
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const result = await ConfiguracionJeringaVacunaService.getConfiguracionEfectiva(
        vacunaId,
        centroAcopioId as string
      );

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message || 'Error al obtener configuración efectiva', 500);
      }
    } catch (error) {
      console.error('Error en getConfiguracionEfectiva:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Calcular jeringas necesarias para una cantidad de vacunas
   * POST /api/configuracion-jeringa-vacuna/calcular
   */
  static async calcularJeringas(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId, cantidadVacunas, centroAcopioId } = req.body;

      // Validaciones requeridas
      const vacunaError = validateRequired(vacunaId, 'ID de vacuna');
      if (vacunaError) {
        errorResponse(res, vacunaError, 400);
        return;
      }

      const cantidadError = validateRequired(cantidadVacunas, 'Cantidad de vacunas');
      if (cantidadError) {
        errorResponse(res, cantidadError, 400);
        return;
      }

      // Validar UUID de vacuna
      if (!validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      // Validar cantidad
      const cantidad = parseInt(cantidadVacunas, 10);
      if (isNaN(cantidad) || cantidad <= 0) {
        errorResponse(res, 'La cantidad de vacunas debe ser un número mayor a 0', 400);
        return;
      }

      // Validar UUID de centro de acopio si se proporciona
      if (centroAcopioId && !validateUUID(centroAcopioId)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const result = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
        vacunaId,
        cantidad,
        centroAcopioId
      );

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message || 'Error al calcular jeringas necesarias', 500);
      }
    } catch (error) {
      console.error('Error en calcularJeringas:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}
