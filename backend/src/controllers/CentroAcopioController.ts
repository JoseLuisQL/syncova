import { Request, Response } from 'express';
import { CentroAcopioService } from '@/services/CentroAcopioService';
import { CreateCentroAcopioDto, UpdateCentroAcopioDto, EstadoGeneral } from '@/types';

/**
 * Controlador para gestión de centros de acopio
 */
export class CentroAcopioController {
  /**
   * Obtener todos los centros de acopio
   * GET /api/centros-acopio
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        microredId,
        redId,
        estado,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      const filters = {
        microredId: microredId as string,
        redId: redId as string,
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };

      const result = await CentroAcopioService.getAll(filters);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        data: result.data.centrosAcopio,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.data.total,
          totalPages: Math.ceil(result.data.total / filters.limit)
        }
      });
    } catch (error) {
      console.error('Error en CentroAcopioController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener centro de acopio por ID
   * GET /api/centros-acopio/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de centro de acopio requerido'
        });
        return;
      }

      const result = await CentroAcopioService.getById(id);

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
          message: 'Centro de acopio no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error en CentroAcopioController.getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener centros de acopio por microred
   * GET /api/centros-acopio/microred/:microredId
   */
  static async getByMicrored(req: Request, res: Response): Promise<void> {
    try {
      const { microredId } = req.params;

      if (!microredId) {
        res.status(400).json({
          success: false,
          message: 'ID de microred requerido'
        });
        return;
      }

      const result = await CentroAcopioService.getByMicrored(microredId);

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
      console.error('Error en CentroAcopioController.getByMicrored:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener centros de acopio por red
   * GET /api/centros-acopio/red/:redId
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

      const result = await CentroAcopioService.getByRed(redId);

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
      console.error('Error en CentroAcopioController.getByRed:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nuevo centro de acopio
   * POST /api/centros-acopio
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, codigo, microredId, direccion, responsable, telefono } = req.body;

      // Validaciones básicas
      if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El nombre del centro de acopio es requerido'
        });
        return;
      }

      if (!direccion || typeof direccion !== 'string' || direccion.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'La dirección es requerida'
        });
        return;
      }

      if (!responsable || typeof responsable !== 'string' || responsable.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El responsable es requerido'
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

      if (microredId && typeof microredId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El ID de microred debe ser una cadena de texto'
        });
        return;
      }

      if (telefono && typeof telefono !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El teléfono debe ser una cadena de texto'
        });
        return;
      }

      const createData: CreateCentroAcopioDto = {
        nombre: nombre.trim(),
        codigo: codigo?.trim() || undefined,
        microredId: microredId?.trim() || undefined,
        direccion: direccion.trim(),
        responsable: responsable.trim(),
        telefono: telefono?.trim() || undefined
      };

      const result = await CentroAcopioService.create(createData);

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
        message: 'Centro de acopio creado exitosamente'
      });
    } catch (error) {
      console.error('Error en CentroAcopioController.create:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar centro de acopio
   * PUT /api/centros-acopio/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, codigo, microredId, direccion, responsable, telefono, estado } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de centro de acopio requerido'
        });
        return;
      }

      // Validaciones básicas
      if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: 'El nombre del centro de acopio debe ser una cadena no vacía'
        });
        return;
      }

      if (direccion !== undefined && (typeof direccion !== 'string' || direccion.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: 'La dirección debe ser una cadena no vacía'
        });
        return;
      }

      if (responsable !== undefined && (typeof responsable !== 'string' || responsable.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: 'El responsable debe ser una cadena no vacía'
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

      if (microredId !== undefined && typeof microredId !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El ID de microred debe ser una cadena de texto'
        });
        return;
      }

      if (telefono !== undefined && typeof telefono !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El teléfono debe ser una cadena de texto'
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

      const updateData: UpdateCentroAcopioDto = {};
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (codigo !== undefined) updateData.codigo = codigo.trim() || undefined;
      if (microredId !== undefined) updateData.microredId = microredId.trim() || undefined;
      if (direccion !== undefined) updateData.direccion = direccion.trim();
      if (responsable !== undefined) updateData.responsable = responsable.trim();
      if (telefono !== undefined) updateData.telefono = telefono.trim() || undefined;
      if (estado !== undefined) updateData.estado = estado as EstadoGeneral;

      const result = await CentroAcopioService.update(id, updateData);

      if (!result.success) {
        const statusCode = result.error?.includes('no encontrado') ? 404 :
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
        message: 'Centro de acopio actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en CentroAcopioController.update:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar centro de acopio
   * DELETE /api/centros-acopio/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de centro de acopio requerido'
        });
        return;
      }

      const result = await CentroAcopioService.delete(id);

      if (!result.success) {
        const statusCode = result.error?.includes('no encontrado') ? 404 :
                          result.error?.includes('establecimientos') ? 409 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'Centro de acopio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en CentroAcopioController.delete:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default CentroAcopioController;
