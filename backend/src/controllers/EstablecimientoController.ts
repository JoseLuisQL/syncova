import { Request, Response } from 'express';
import { EstablecimientoService } from '@/services/EstablecimientoService';
import { CreateEstablecimientoDto, UpdateEstablecimientoDto, TipoEstablecimiento, EstadoGeneral, AuthenticatedRequest } from '@/types';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/response';
import { validateRequired, validateEnum, validateUUID } from '@/utils/validation';
import { ensureEstablecimientoInScope, resolveScopedCentroAcopioId, resolveScopedCentroAcopioIds } from '@/middleware/accessControl';

/**
 * Controlador para gestión de establecimientos
 */
export class EstablecimientoController {
  /**
   * Obtener todos los establecimientos
   * GET /api/establecimientos
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        tipo,
        estado = 'todos',
        search,
        centroAcopioId,
        page = '1',
        limit = '50',
        noPagination
      } = req.query;



      // Validaciones de parámetros
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);



      if (isNaN(pageNum) || pageNum < 1) {
        errorResponse(res, 'El parámetro page debe ser un número mayor a 0', 400);
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 2000) {
        errorResponse(res, 'El parámetro limit debe ser un número entre 1 y 2000', 400);
        return;
      }

      if (tipo && !['centro_acopio', 'centro_salud', 'puesto_salud'].includes(tipo as string)) {
        errorResponse(res, 'Tipo de establecimiento inválido', 400);
        return;
      }

      if (estado && !['activo', 'inactivo', 'todos'].includes(estado as string)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      let scopedCentroAcopioId: string | undefined;
      let scopedCentroAcopioIds: string[] | undefined;
      try {
        scopedCentroAcopioId = resolveScopedCentroAcopioId(req, centroAcopioId as string | undefined);
        scopedCentroAcopioIds = resolveScopedCentroAcopioIds(req, centroAcopioId as string | undefined);
      } catch (scopeError) {
        errorResponse(res, scopeError instanceof Error ? scopeError.message : 'No tiene permisos para acceder a estos datos', 403);
        return;
      }

      const result = await EstablecimientoService.getAll({
        tipo: tipo as TipoEstablecimiento,
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        centroAcopioId: scopedCentroAcopioId,
        centroAcopioIds: scopedCentroAcopioIds,
        page: pageNum,
        limit: limitNum,
        noPagination: noPagination === 'true' // NUEVO: Convertir string a boolean
      });

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener establecimientos', 500);
        return;
      }

      const { establecimientos, total } = result.data!;

      paginatedResponse(res, {
        data: establecimientos,
        page: pageNum,
        limit: limitNum,
        total,
        message: 'Establecimientos obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error en EstablecimientoController.getAll:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener establecimiento por ID
   * GET /api/establecimientos/:id
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const result = await EstablecimientoService.getById(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener establecimiento', 500);
        return;
      }

      if (!result.data) {
        errorResponse(res, 'Establecimiento no encontrado', 404);
        return;
      }

      try {
        await ensureEstablecimientoInScope(req, result.data.id);
      } catch (scopeError) {
        errorResponse(res, scopeError instanceof Error ? scopeError.message : 'No tiene permisos para acceder a este establecimiento', 403);
        return;
      }

      successResponse(res, result.data, 'Establecimiento obtenido exitosamente');
    } catch (error) {
      console.error('Error en EstablecimientoController.getById:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener establecimiento por código
   * GET /api/establecimientos/codigo/:codigo
   */
  static async getByCodigo(req: Request, res: Response): Promise<void> {
    try {
      const { codigo } = req.params;

      if (!codigo || codigo.trim().length === 0) {
        errorResponse(res, 'Código de establecimiento requerido', 400);
        return;
      }

      const result = await EstablecimientoService.getByCodigo(codigo);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener establecimiento', 500);
        return;
      }

      if (!result.data) {
        errorResponse(res, 'Establecimiento no encontrado', 404);
        return;
      }

      successResponse(res, result.data, 'Establecimiento obtenido exitosamente');
    } catch (error) {
      console.error('Error en EstablecimientoController.getByCodigo:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener centros de acopio (ahora desde la tabla centros_acopio)
   * GET /api/establecimientos/centros-acopio
   */
  static async getCentrosAcopio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const scopedCentroAcopioIds = resolveScopedCentroAcopioIds(req);
      const result = await EstablecimientoService.getCentrosAcopio(scopedCentroAcopioIds);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener centros de acopio', 500);
        return;
      }

      successResponse(res, result.data, 'Centros de acopio obtenidos exitosamente');
    } catch (error) {
      console.error('Error en EstablecimientoController.getCentrosAcopio:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener opciones jerárquicas para formularios
   * GET /api/establecimientos/opciones-jerarquicas
   */
  static async getOpcionesJerarquicas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Importar servicios dinámicamente para evitar dependencias circulares
      const [{ RedService }, { MicroredService }, { CentroAcopioService }] = await Promise.all([
        import('@/services/RedService'),
        import('@/services/MicroredService'),
        import('@/services/CentroAcopioService'),
      ]);

      const [redesResult, microredesResult, centrosResult] = await Promise.all([
        RedService.getAll({ estado: 'activo', limit: 1000 }),
        MicroredService.getAll({ estado: 'activo', limit: 1000 }),
        CentroAcopioService.getAll({ estado: 'activo', limit: 1000 })
      ]);

      if (!redesResult.success || !microredesResult.success || !centrosResult.success) {
        errorResponse(res, 'Error al obtener opciones jerárquicas', 500);
        return;
      }

      successResponse(res, {
        redes: redesResult.data.redes,
        microredes: microredesResult.data.microredes,
        centrosAcopio: centrosResult.data.centrosAcopio
      }, 'Opciones jerárquicas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en EstablecimientoController.getOpcionesJerarquicas:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener establecimientos por centro de acopio
   * GET /api/establecimientos/centro-acopio/:centroAcopioId
   */
  static async getByCentroAcopio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { centroAcopioId } = req.params;

      if (!validateUUID(centroAcopioId)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      try {
        resolveScopedCentroAcopioId(req, centroAcopioId);
      } catch (scopeError) {
        errorResponse(res, scopeError instanceof Error ? scopeError.message : 'No tiene permisos para acceder a este centro de acopio', 403);
        return;
      }

      const result = await EstablecimientoService.getBycentroAcopio(centroAcopioId);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener establecimientos', 500);
        return;
      }

      successResponse(res, result.data, 'Establecimientos obtenidos exitosamente');
    } catch (error) {
      console.error('Error en EstablecimientoController.getByCentroAcopio:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nuevo establecimiento
   * POST /api/establecimientos
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateEstablecimientoDto = req.body;

      console.log('📝 Datos recibidos para crear establecimiento:', JSON.stringify(data, null, 2));

      // Validaciones de campos requeridos
      const validationErrors = [
        validateRequired(data.nombre, 'nombre'),
        validateRequired(data.tipo, 'tipo'),
        validateRequired(data.codigo, 'codigo'),
        validateRequired(data.direccion, 'direccion'),
        validateRequired(data.responsable, 'responsable'),
        validateEnum(data.tipo, ['centro_acopio', 'centro_salud', 'puesto_salud'], 'tipo')
      ].filter(Boolean);

      console.log('🔍 Errores de validación encontrados:', validationErrors);

      if (validationErrors.length > 0) {
        console.log('❌ Validación fallida:', validationErrors.join(', '));
        errorResponse(res, `Errores de validación: ${validationErrors.join(', ')}`, 400);
        return;
      }

      // Validar centroAcopioId si se proporciona
      if (data.centroAcopioId && !validateUUID(data.centroAcopioId)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const result = await EstablecimientoService.create(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al crear establecimiento', 400);
        return;
      }

      successResponse(res, result.data, 'Establecimiento creado exitosamente', 201);
    } catch (error) {
      console.error('Error en EstablecimientoController.create:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar establecimiento
   * PUT /api/establecimientos/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateEstablecimientoDto = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      console.log('📝 Datos recibidos para actualizar establecimiento:', JSON.stringify(data, null, 2));

      // Validaciones opcionales
      const validationErrors = [];

      if (data.tipo) {
        const tipoError = validateEnum(data.tipo, ['centro_acopio', 'centro_salud', 'puesto_salud'], 'tipo');
        if (tipoError) {
          validationErrors.push(tipoError);
        }
      }

      if (data.estado) {
        const estadoError = validateEnum(data.estado, ['activo', 'inactivo'], 'estado');
        if (estadoError) {
          validationErrors.push(estadoError);
        }
      }

      if (data.centroAcopioId && !validateUUID(data.centroAcopioId)) {
        validationErrors.push('ID de centro de acopio inválido');
      }

      console.log('🔍 Errores de validación en actualización:', validationErrors);

      if (validationErrors.length > 0) {
        errorResponse(res, `Errores de validación: ${validationErrors.join(', ')}`, 400);
        return;
      }

      const result = await EstablecimientoService.update(id, data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al actualizar establecimiento', 400);
        return;
      }

      successResponse(res, result.data, 'Establecimiento actualizado exitosamente');
    } catch (error) {
      console.error('Error en EstablecimientoController.update:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar establecimiento
   * DELETE /api/establecimientos/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const result = await EstablecimientoService.delete(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al eliminar establecimiento', 400);
        return;
      }

      successResponse(res, null, 'Establecimiento eliminado exitosamente');
    } catch (error) {
      console.error('Error en EstablecimientoController.delete:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}

export default EstablecimientoController;
