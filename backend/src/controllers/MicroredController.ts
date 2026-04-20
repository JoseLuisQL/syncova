import { Request, Response } from 'express';
import { MicroredService } from '@/services/MicroredService';
import { CreateMicroredDto, UpdateMicroredDto, EstadoGeneral } from '@/types';

/**
 * Controlador para gestión de microredes
 */
export class MicroredController {
  /**
   * Obtener todas las microredes
   * GET /api/microredes
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        redId,
        estado,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      const filters = {
        redId: redId as string,
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };

      const result = await MicroredService.getAll(filters);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data.microredes,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.data.total,
          totalPages: Math.ceil(result.data.total / filters.limit)
        }
      });
    } catch (error) {
      console.error('Error en MicroredController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener microred por ID
   * GET /api/microredes/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de microred requerido'
        });
        return;
      }

      const result = await MicroredService.getById(id);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error
        });
        return;
      }

      if (!result.data) {
        res.status(404).json({
          success: false,
          message: 'Microred no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error en MicroredController.getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener microredes por red
   * GET /api/microredes/red/:redId
   */
  static async getByRed(req: Request, res: Response): Promise<void> {
    try {
      const { redId } = req.params;

      if (!redId) {
        res.status(400).json({
          success: false,
          message: 'ID de red requerido'
        });
        return;
      }

      const result = await MicroredService.getByRed(redId);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error en MicroredController.getByRed:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nueva microred
   * POST /api/microredes
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, codigo, descripcion, redId } = req.body;

      // Validaciones básicas
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la microred es requerido'
        });
        return;
      }

      if (!redId || typeof redId !== 'string' || redId.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El ID de la red es requerido'
        });
        return;
      }

      if (codigo && typeof codigo !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El código debe ser una cadena de texto'
        });
        return;
      }

      if (descripcion && typeof descripcion !== 'string') {
        res.status(400).json({
          success: false,
          message: 'La descripción debe ser una cadena de texto'
        });
        return;
      }

      const createData: CreateMicroredDto = {
        nombre: nombre.trim(),
        codigo: codigo?.trim() || undefined,
        descripcion: descripcion?.trim() || undefined,
        redId: redId.trim()
      };

      const result = await MicroredService.create(createData);

      if (!result.success) {
        const statusCode = result.error?.includes('Ya existe') ? 409 :
                          result.error?.includes('no existe') ? 400 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Microred creada exitosamente'
      });
    } catch (error) {
      console.error('Error en MicroredController.create:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar microred
   * PUT /api/microredes/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, codigo, descripcion, redId, estado } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de microred requerido'
        });
        return;
      }

      // Validaciones básicas
      if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la microred debe ser una cadena no vacía'
        });
        return;
      }

      if (redId !== undefined && (typeof redId !== 'string' || redId.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: 'El ID de la red debe ser una cadena no vacía'
        });
        return;
      }

      if (codigo !== undefined && typeof codigo !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El código debe ser una cadena de texto'
        });
        return;
      }

      if (descripcion !== undefined && typeof descripcion !== 'string') {
        res.status(400).json({
          success: false,
          message: 'La descripción debe ser una cadena de texto'
        });
        return;
      }

      if (estado !== undefined && !['activo', 'inactivo'].includes(estado)) {
        res.status(400).json({
          success: false,
          message: 'El estado debe ser "activo" o "inactivo"'
        });
        return;
      }

      const updateData: UpdateMicroredDto = {};
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (codigo !== undefined) updateData.codigo = codigo.trim() || undefined;
      if (descripcion !== undefined) updateData.descripcion = descripcion.trim() || undefined;
      if (redId !== undefined) updateData.redId = redId.trim();
      if (estado !== undefined) updateData.estado = estado as EstadoGeneral;

      const result = await MicroredService.update(id, updateData);

      if (!result.success) {
        const statusCode = result.error?.includes('no encontrada') ? 404 :
                          result.error?.includes('Ya existe') ? 409 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Microred actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error en MicroredController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar microred
   * DELETE /api/microredes/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de microred requerido'
        });
        return;
      }

      const result = await MicroredService.delete(id);

      if (!result.success) {
        const statusCode = result.error?.includes('no encontrada') ? 404 :
                          result.error?.includes('centros de acopio') ? 409 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'Microred eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en MicroredController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default MicroredController;
