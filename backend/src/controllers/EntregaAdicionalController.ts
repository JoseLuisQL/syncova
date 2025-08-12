import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { EntregaAdicionalService } from '@/services/EntregaAdicionalService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';
import { CreateEntregaAdicionalDto, UpdateEntregaAdicionalDto } from '@/types';

const prisma = new PrismaClient();

/**
 * Controlador para gestión de entregas adicionales
 * Módulo 10: ENTREGAS ADICIONALES
 */
export class EntregaAdicionalController {
  
  /**
   * Obtener entregas adicionales por movimiento
   * GET /api/entregas-adicionales/movimiento/:movimientoId
   */
  static async getByMovimiento(req: Request, res: Response): Promise<void> {
    try {
      const { movimientoId } = req.params;

      if (!validateUUID(movimientoId)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      const result = await EntregaAdicionalService.getByMovimientoId(movimientoId);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener entregas adicionales', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Entregas adicionales obtenidas exitosamente');
    } catch (error) {
      console.error('Error en EntregaAdicionalController.getByMovimiento:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener entrega adicional por ID
   * GET /api/entregas-adicionales/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de entrega adicional inválido', 400);
        return;
      }

      const result = await EntregaAdicionalService.getById(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener entrega adicional', result.error === 'Entrega adicional no encontrada' ? 404 : 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Entrega adicional obtenida exitosamente');
    } catch (error) {
      console.error('Error en EntregaAdicionalController.getById:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear entrega adicional
   * POST /api/entregas-adicionales
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateEntregaAdicionalDto = req.body;

      // Validaciones básicas
      if (!data.movimientoVacunaId || !validateUUID(data.movimientoVacunaId)) {
        ResponseUtil.error(res, 'ID de movimiento de vacuna inválido', 400);
        return;
      }

      // Manejar usuario temporal hasta implementar autenticación completa
      if (!data.usuarioId) {
        ResponseUtil.error(res, 'ID de usuario es requerido', 400);
        return;
      }

      // Si es un usuario temporal, usar el primer usuario administrador disponible
      let usuarioId = data.usuarioId;
      if (data.usuarioId === 'temp-user-id' || !validateUUID(data.usuarioId)) {
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

      if (data.cantidad === undefined || data.cantidad < 0) {
        ResponseUtil.error(res, 'La cantidad debe ser un número no negativo', 400);
        return;
      }

      // Crear datos con el usuarioId correcto
      const dataConUsuario = {
        ...data,
        usuarioId
      };

      const result = await EntregaAdicionalService.create(dataConUsuario);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al crear entrega adicional', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Entrega adicional creada exitosamente', 201);
    } catch (error) {
      console.error('Error en EntregaAdicionalController.create:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar entrega adicional
   * PUT /api/entregas-adicionales/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateEntregaAdicionalDto = req.body;

      console.log('🔄 Actualizando entrega adicional:', { id, data });

      if (!validateUUID(id)) {
        console.log('❌ ID inválido:', id);
        ResponseUtil.error(res, 'ID de entrega adicional inválido', 400);
        return;
      }

      if (data.cantidad !== undefined && data.cantidad < 0) {
        console.log('❌ Cantidad negativa:', data.cantidad);
        ResponseUtil.error(res, 'La cantidad debe ser un número no negativo', 400);
        return;
      }

      console.log('✅ Validaciones pasadas, llamando al servicio...');
      const result = await EntregaAdicionalService.update(id, data);

      if (!result.success) {
        console.log('❌ Error del servicio:', result.error);
        ResponseUtil.error(res, result.error || 'Error al actualizar entrega adicional', result.error === 'Entrega adicional no encontrada' ? 404 : 400);
        return;
      }

      console.log('✅ Entrega actualizada exitosamente:', result.data);
      ResponseUtil.success(res, result.data, 'Entrega adicional actualizada exitosamente');
    } catch (error) {
      console.error('💥 Error en EntregaAdicionalController.update:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar entrega adicional
   * DELETE /api/entregas-adicionales/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de entrega adicional inválido', 400);
        return;
      }

      const result = await EntregaAdicionalService.delete(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al eliminar entrega adicional', result.error === 'Entrega adicional no encontrada' ? 404 : 500);
        return;
      }

      ResponseUtil.success(res, null, 'Entrega adicional eliminada exitosamente');
    } catch (error) {
      console.error('Error en EntregaAdicionalController.delete:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de entregas adicionales por movimiento
   * GET /api/entregas-adicionales/movimiento/:movimientoId/estadisticas
   */
  static async getEstadisticasByMovimiento(req: Request, res: Response): Promise<void> {
    try {
      const { movimientoId } = req.params;

      if (!validateUUID(movimientoId)) {
        ResponseUtil.error(res, 'ID de movimiento inválido', 400);
        return;
      }

      const result = await EntregaAdicionalService.getEstadisticasByMovimiento(movimientoId);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener estadísticas', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en EntregaAdicionalController.getEstadisticasByMovimiento:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
