import { Request, Response } from 'express';
import { RedService } from '@/services/RedService';
import { CreateRedDto, UpdateRedDto, EstadoGeneral } from '@/types';

/**
 * Controlador para gestión de redes
 */
export class RedController {
  /**
   * Obtener todas las redes
   * GET /api/redes
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        estado,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      const filters = {
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };

      const result = await RedService.getAll(filters);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data.redes,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.data.total,
          totalPages: Math.ceil(result.data.total / filters.limit)
        }
      });
    } catch (error) {
      console.error('Error en RedController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener red por ID
   * GET /api/redes/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de red requerido'
        });
        return;
      }

      const result = await RedService.getById(id);

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
          message: 'Red no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error en RedController.getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nueva red
   * POST /api/redes
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, codigo, descripcion } = req.body;

      // Validaciones básicas
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la red es requerido'
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

      const createData: CreateRedDto = {
        nombre: nombre.trim(),
        codigo: codigo?.trim() || undefined,
        descripcion: descripcion?.trim() || undefined
      };

      const result = await RedService.create(createData);

      if (!result.success) {
        const statusCode = result.error?.includes('Ya existe') ? 409 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Red creada exitosamente'
      });
    } catch (error) {
      console.error('Error en RedController.create:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar red
   * PUT /api/redes/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, codigo, descripcion, estado } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de red requerido'
        });
        return;
      }

      // Validaciones básicas
      if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la red debe ser una cadena no vacía'
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

      const updateData: UpdateRedDto = {};
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (codigo !== undefined) updateData.codigo = codigo.trim() || undefined;
      if (descripcion !== undefined) updateData.descripcion = descripcion.trim() || undefined;
      if (estado !== undefined) updateData.estado = estado as EstadoGeneral;

      const result = await RedService.update(id, updateData);

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
        message: 'Red actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error en RedController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar red
   * DELETE /api/redes/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de red requerido'
        });
        return;
      }

      const result = await RedService.delete(id);

      if (!result.success) {
        const statusCode = result.error?.includes('no encontrada') ? 404 :
                          result.error?.includes('tiene microredes') ? 409 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'Red eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en RedController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default RedController;
