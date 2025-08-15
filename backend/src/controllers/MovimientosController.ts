import { Request, Response } from 'express';
import { MovimientosService, MovimientosFilters, CreateMovimientoDto, UpdateMovimientoDto, CreateEntregaAdicionalDto } from '@/services/MovimientosService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';
import { prisma } from '@/config/database';

/**
 * Controlador para gestión de movimientos de vacunas
 */
export class MovimientosController {
  /**
   * Obtener todos los movimientos con filtros opcionales
   * GET /api/movimientos
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        establecimientoId,
        vacunaId,
        mes,
        anio,
        centroAcopioId,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      // Validaciones de parámetros
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        ResponseUtil.error(res, 'El parámetro page debe ser un número mayor a 0', 400);
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 2000) {
        ResponseUtil.error(res, 'El parámetro limit debe ser un número entre 1 y 2000', 400);
        return;
      }

      // Validar UUIDs si se proporcionan
      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      // Validar mes
      const mesNum = mes ? parseInt(mes as string, 10) : undefined;
      if (mes && (isNaN(mesNum!) || mesNum! < 1 || mesNum! > 12)) {
        ResponseUtil.error(res, 'El mes debe estar entre 1 y 12', 400);
        return;
      }

      // Validar año
      const anioNum = anio ? parseInt(anio as string, 10) : undefined;
      if (anio && (isNaN(anioNum!) || anioNum! < 2020 || anioNum! > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const filters: MovimientosFilters = {
        establecimientoId: establecimientoId as string,
        vacunaId: vacunaId as string,
        mes: mesNum,
        anio: anioNum || new Date().getFullYear(), // Valor por defecto
        centroAcopioId: centroAcopioId as string,
        search: search as string,
        page: pageNum,
        limit: limitNum
      };

      const result = await MovimientosService.getAll(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener movimientos', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimientos obtenidos exitosamente');
    } catch (error) {
      console.error('Error en MovimientosController.getAll:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener movimiento por ID
   * GET /api/movimientos/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      const result = await MovimientosService.getById(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener movimiento', result.error === 'Movimiento no encontrado' ? 404 : 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimiento obtenido exitosamente');
    } catch (error) {
      console.error('Error en MovimientosController.getById:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nuevo movimiento
   * POST /api/movimientos
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateMovimientoDto = req.body;

      // Validaciones básicas
      if (!data.establecimientoId || !validateUUID(data.establecimientoId)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (!data.vacunaId || !validateUUID(data.vacunaId)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (!data.usuarioId || !validateUUID(data.usuarioId)) {
        ResponseUtil.error(res, 'ID de usuario inválido', 400);
        return;
      }

      if (!data.mes || data.mes < 1 || data.mes > 12) {
        ResponseUtil.error(res, 'El mes debe estar entre 1 y 12', 400);
        return;
      }

      if (!data.anio || data.anio < 2020 || data.anio > 2050) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await MovimientosService.create(data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al crear movimiento', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimiento creado exitosamente', 201);
    } catch (error) {
      console.error('Error en MovimientosController.create:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar movimiento existente
   * PUT /api/movimientos/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateMovimientoDto = req.body;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      const result = await MovimientosService.update(id, data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al actualizar movimiento', result.error === 'Movimiento no encontrado' ? 404 : 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimiento actualizado exitosamente');
    } catch (error) {
      console.error('Error en MovimientosController.update:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar movimiento
   * DELETE /api/movimientos/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      const result = await MovimientosService.delete(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al eliminar movimiento', result.error === 'Movimiento no encontrado' ? 404 : 500);
        return;
      }

      ResponseUtil.success(res, null, 'Movimiento eliminado exitosamente');
    } catch (error) {
      console.error('Error en MovimientosController.delete:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * FUNCIONALIDAD CLAVE: Generar movimientos desde planificación anual
   * POST /api/movimientos/generar-desde-planificacion/:planificacionId
   */
  static async generarDesdeplanificacion(req: Request, res: Response): Promise<void> {
    try {
      const { planificacionId } = req.params;
      const { usuarioId } = req.body;

      if (!validateUUID(planificacionId)) {
        ResponseUtil.error(res, 'ID de planificación inválido', 400);
        return;
      }

      if (!usuarioId || !validateUUID(usuarioId)) {
        ResponseUtil.error(res, 'ID de usuario inválido', 400);
        return;
      }

      const result = await MovimientosService.generarMovimientosDesdeplanificacion(planificacionId, usuarioId);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar movimientos desde planificación', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Movimientos generados exitosamente desde planificación anual');
    } catch (error) {
      console.error('Error en MovimientosController.generarDesdeplanificacion:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de movimientos
   * GET /api/movimientos/estadisticas
   */
  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const { anio } = req.query;

      // Validar año si se proporciona
      const anioNum = anio ? parseInt(anio as string, 10) : undefined;
      if (anio && (isNaN(anioNum!) || anioNum! < 2020 || anioNum! > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await MovimientosService.getEstadisticas(anioNum);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener estadísticas', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en MovimientosController.getEstadisticas:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * FUNCIONALIDAD CLAVE: Crear entrega adicional
   * POST /api/movimientos/:movimientoId/entregas-adicionales
   */
  static async createEntregaAdicional(req: Request, res: Response): Promise<void> {
    try {
      const { movimientoId } = req.params;
      const data: CreateEntregaAdicionalDto = {
        ...req.body,
        movimientoVacunaId: movimientoId
      };

      if (!validateUUID(movimientoId)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      // Manejar usuario temporal hasta implementar autenticación completa
      let usuarioId = data.usuarioId;
      if (!data.usuarioId || data.usuarioId === 'temp-user-id' || !validateUUID(data.usuarioId)) {
        // Buscar un usuario administrador para usar como temporal
        const usuarioAdmin = await prisma.usuario.findFirst({
          where: { rol: 'administrador', estado: 'activo' }
        });

        if (!usuarioAdmin) {
          ResponseUtil.error(res, 'No se encontró usuario válido para la operación', 400);
          return;
        }

        usuarioId = usuarioAdmin.id;
      }

      if (!data.numeroEntrega || data.numeroEntrega < 1) {
        ResponseUtil.error(res, 'El número de entrega debe ser mayor a 0', 400);
        return;
      }

      // Permitir cantidad 0 para entregas adicionales que se editarán después
      if (data.cantidad === undefined || data.cantidad < 0) {
        ResponseUtil.error(res, 'La cantidad debe ser un número no negativo', 400);
        return;
      }

      // Crear datos con el usuarioId correcto
      const dataConUsuario = {
        ...data,
        usuarioId
      };

      const result = await MovimientosService.createEntregaAdicional(dataConUsuario);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al crear entrega adicional', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Entrega adicional creada exitosamente', 201);
    } catch (error) {
      console.error('Error en MovimientosController.createEntregaAdicional:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar entrega adicional
   * PUT /api/movimientos/entregas-adicionales/:id
   */
  static async updateEntregaAdicional(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { cantidad, motivo } = req.body;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de entrega adicional inválido', 400);
        return;
      }

      if (!cantidad || cantidad <= 0) {
        ResponseUtil.error(res, 'La cantidad debe ser mayor a 0', 400);
        return;
      }

      const result = await MovimientosService.updateEntregaAdicional(id, cantidad, motivo);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al actualizar entrega adicional', result.error === 'Entrega adicional no encontrada' ? 404 : 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Entrega adicional actualizada exitosamente');
    } catch (error) {
      console.error('Error en MovimientosController.updateEntregaAdicional:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar entrega adicional
   * DELETE /api/movimientos/entregas-adicionales/:id
   */
  static async deleteEntregaAdicional(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de entrega adicional inválido', 400);
        return;
      }

      const result = await MovimientosService.deleteEntregaAdicional(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al eliminar entrega adicional', result.error === 'Entrega adicional no encontrada' ? 404 : 500);
        return;
      }

      ResponseUtil.success(res, null, 'Entrega adicional eliminada exitosamente');
    } catch (error) {
      console.error('Error en MovimientosController.deleteEntregaAdicional:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener stock disponible por vacuna
   */
  static async getStockDisponible(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId, mes, anio } = req.query;

      // Validaciones
      if (!vacunaId || !mes || !anio) {
        ResponseUtil.error(res, 'vacunaId, mes y anio son requeridos', 400);
        return;
      }

      const mesNum = parseInt(mes as string, 10);
      const anioNum = parseInt(anio as string, 10);

      if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
        ResponseUtil.error(res, 'El mes debe estar entre 1 y 12', 400);
        return;
      }

      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await MovimientosService.getStockDisponible(
        vacunaId as string,
        mesNum,
        anioNum
      );

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener stock disponible', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Stock disponible obtenido exitosamente');
    } catch (error) {
      console.error('Error en getStockDisponible:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Sincronizar saldo anterior del siguiente mes
   * POST /api/movimientos/sincronizar-saldo-anterior
   */
  static async sincronizarSaldoAnterior(req: Request, res: Response): Promise<void> {
    try {
      const { establecimientoId, vacunaId, mes, anio } = req.body;

      // Validaciones
      if (!establecimientoId || !vacunaId || !mes || !anio) {
        ResponseUtil.error(res, 'establecimientoId, vacunaId, mes y anio son requeridos', 400);
        return;
      }

      if (!validateUUID(establecimientoId)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (!validateUUID(vacunaId)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      const mesNum = parseInt(mes, 10);
      const anioNum = parseInt(anio, 10);

      if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
        ResponseUtil.error(res, 'El mes debe estar entre 1 y 12', 400);
        return;
      }

      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await MovimientosService.sincronizarSaldoAnteriorSiguienteMes(
        establecimientoId,
        vacunaId,
        mesNum,
        anioNum
      );

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al sincronizar saldo anterior', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Saldo anterior sincronizado exitosamente');
    } catch (error) {
      console.error('Error al sincronizar saldo anterior:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
