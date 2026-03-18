import { Request, Response } from 'express';
import { AlertaService, CreateAlertaDto, UpdateAlertaDto, AlertaFilters } from '@/services/AlertaService';
import { AlertaAutomaticaService } from '@/services/AlertaAutomaticaService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';
import { AuthenticatedRequest } from '@/types';
import { resolveAuthenticatedUserFromToken } from '@/middleware/auth';
import { AlertaRealtimeService } from '@/services/AlertaRealtimeService';

/**
 * Controlador para gestión de alertas del sistema
 */
export class AlertaController {
  static async stream(req: Request, res: Response): Promise<void> {
    try {
      const token = typeof req.query.token === 'string' ? req.query.token : '';

      if (!token) {
        ResponseUtil.unauthorized(res, 'Token de acceso requerido');
        return;
      }

      const user = await resolveAuthenticatedUserFromToken(token);

      if (!user) {
        ResponseUtil.unauthorized(res, 'Token inválido');
        return;
      }

      AlertaRealtimeService.addClient(user.id, res);
    } catch (error) {
      console.error('Error en AlertaController.stream:', error);
      if (!res.headersSent) {
        ResponseUtil.error(res, 'No se pudo abrir el canal en tiempo real', 500);
      }
    }
  }

  /**
   * Obtener todas las alertas con filtros opcionales
   * GET /api/alertas
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        tipo,
        nivel,
        leida,
        usuarioId,
        fechaDesde,
        fechaHasta,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      const filters: AlertaFilters = {
        tipo: tipo as AlertaFilters['tipo'],
        nivel: nivel as AlertaFilters['nivel'],
        leida: leida === 'true' ? true : leida === 'false' ? false : undefined,
        usuarioId: usuarioId as string,
        fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
        search: search as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };

      const result = await AlertaService.getAll(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener alertas', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Alertas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en AlertaController.getAll:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener alerta por ID
   * GET /api/alertas/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de alerta inválido', 400);
        return;
      }

      const result = await AlertaService.getById(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener alerta', result.error === 'Alerta no encontrada' ? 404 : 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Alerta obtenida exitosamente');
    } catch (error) {
      console.error('Error en AlertaController.getById:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nueva alerta
   * POST /api/alertas
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data: CreateAlertaDto = req.body;

      console.log('📝 Datos recibidos para crear alerta:', JSON.stringify(data, null, 2));

      // Validaciones de campos requeridos
      if (!data.tipo) {
        ResponseUtil.error(res, 'El tipo de alerta es requerido', 400);
        return;
      }

      if (!data.titulo || data.titulo.trim().length === 0) {
        ResponseUtil.error(res, 'El título es requerido', 400);
        return;
      }

      if (!data.descripcion || data.descripcion.trim().length === 0) {
        ResponseUtil.error(res, 'La descripción es requerida', 400);
        return;
      }

      if (!data.nivel) {
        ResponseUtil.error(res, 'El nivel de alerta es requerido', 400);
        return;
      }

      // Si no se especifica usuario, usar el usuario autenticado
      if (!data.usuarioId && req.user) {
        data.usuarioId = req.user.id;
      }

      const result = await AlertaService.create(data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al crear alerta', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Alerta creada exitosamente', 201);
    } catch (error) {
      console.error('Error en AlertaController.create:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar alerta existente
   * PUT /api/alertas/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateAlertaDto = req.body;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de alerta inválido', 400);
        return;
      }

      console.log('📝 Datos recibidos para actualizar alerta:', JSON.stringify(data, null, 2));

      const result = await AlertaService.update(id, data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al actualizar alerta', result.error === 'Alerta no encontrada' ? 404 : 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Alerta actualizada exitosamente');
    } catch (error) {
      console.error('Error en AlertaController.update:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar alerta
   * DELETE /api/alertas/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de alerta inválido', 400);
        return;
      }

      const result = await AlertaService.delete(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al eliminar alerta', result.error === 'Alerta no encontrada' ? 404 : 400);
        return;
      }

      ResponseUtil.success(res, null, 'Alerta eliminada exitosamente');
    } catch (error) {
      console.error('Error en AlertaController.delete:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Marcar alerta como leída
   * PUT /api/alertas/:id/leer
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de alerta inválido', 400);
        return;
      }

      const result = await AlertaService.markAsRead(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al marcar alerta como leída', result.error === 'Alerta no encontrada' ? 404 : 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Alerta marcada como leída exitosamente');
    } catch (error) {
      console.error('Error en AlertaController.markAsRead:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Marcar múltiples alertas como leídas
   * PUT /api/alertas/leer-multiples
   */
  static async markMultipleAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        ResponseUtil.error(res, 'Se requiere un array de IDs válido', 400);
        return;
      }

      // Validar que todos los IDs sean UUIDs válidos
      const invalidIds = ids.filter(id => !validateUUID(id));
      if (invalidIds.length > 0) {
        ResponseUtil.error(res, 'Algunos IDs no son válidos', 400);
        return;
      }

      const result = await AlertaService.markMultipleAsRead(ids);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al marcar alertas como leídas', 400);
        return;
      }

      ResponseUtil.success(res, result.data, `${result.data?.count || 0} alertas marcadas como leídas exitosamente`);
    } catch (error) {
      console.error('Error en AlertaController.markMultipleAsRead:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de alertas
   * GET /api/alertas/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await AlertaService.getStats();

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener estadísticas', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en AlertaController.getStats:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener alertas no leídas para el usuario autenticado
   * GET /api/alertas/no-leidas
   */
  static async getUnreadForUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      const result = await AlertaService.getUnreadByUser(req.user.id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener alertas no leídas', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Alertas no leídas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en AlertaController.getUnreadForUser:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Limpiar alertas antiguas
   * DELETE /api/alertas/limpiar-antiguas
   */
  static async cleanupOldAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { days = '30' } = req.query;
      const daysOld = parseInt(days as string, 10);

      if (isNaN(daysOld) || daysOld < 1) {
        ResponseUtil.error(res, 'El número de días debe ser un entero positivo', 400);
        return;
      }

      const result = await AlertaService.cleanupOldAlerts(daysOld);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al limpiar alertas antiguas', 500);
        return;
      }

      ResponseUtil.success(res, result.data, `${result.data?.count || 0} alertas antiguas eliminadas exitosamente`);
    } catch (error) {
      console.error('Error en AlertaController.cleanupOldAlerts:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar alertas automáticas (vencimiento y stock bajo)
   * POST /api/alertas/generar-automaticas
   */
  static async generateAutomatic(req: Request, res: Response): Promise<void> {
    try {
      const { diasAnticipacion = 30, porcentajeMinimo, stockMinimo } = req.body;
      const threshold = Number(stockMinimo ?? porcentajeMinimo ?? 100);

      const result = await AlertaAutomaticaService.generarAlertas(
        Number(diasAnticipacion),
        threshold
      );

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar alertas automáticas', 500);
        return;
      }

      ResponseUtil.success(res, result.data, `Se generaron ${result.data?.alertasGeneradas || 0} alertas automáticas`);
    } catch (error) {
      console.error('Error en AlertaController.generateAutomatic:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Limpiar alertas antiguas leídas
   * DELETE /api/alertas/limpiar-antiguas
   */
  static async cleanupResolved(req: Request, res: Response): Promise<void> {
    try {
      const { days = '30' } = req.query;
      const diasAntiguedad = parseInt(days as string, 10);

      const result = await AlertaAutomaticaService.limpiarAlertasAntiguas(diasAntiguedad);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al limpiar alertas antiguas', 500);
        return;
      }

      ResponseUtil.success(res, result.data, `Se eliminaron ${result.data?.eliminadas || 0} alertas antiguas`);
    } catch (error) {
      console.error('Error en AlertaController.cleanupResolved:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Verificar y generar alertas automáticas, luego devolver alertas no leídas
   * GET /api/alertas/verificar-y-generar
   * Endpoint optimizado para polling del frontend
   */
  static async verifyAndGenerate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Usuario no autenticado', 401);
        return;
      }

      const { diasAnticipacion = 30, stockMinimo = 100 } = req.query;

      // Generar nuevas alertas automáticas
      const generationResult = await AlertaAutomaticaService.generarAlertas(
        Number(diasAnticipacion),
        Number(stockMinimo)
      );

      // Obtener alertas no leídas actualizadas
      const unreadResult = await AlertaService.getUnreadByUser(req.user.id);

      if (!unreadResult.success) {
        ResponseUtil.error(res, unreadResult.error || 'Error al obtener alertas', 500);
        return;
      }

      ResponseUtil.success(res, {
        alertas: unreadResult.data,
        generadas: generationResult.success ? generationResult.data?.alertasGeneradas || 0 : 0,
        detalles: generationResult.success ? generationResult.data?.detalles || [] : []
      }, 'Verificación completada');
    } catch (error) {
      console.error('Error en AlertaController.verifyAndGenerate:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
