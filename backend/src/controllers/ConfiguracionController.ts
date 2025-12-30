import { Request, Response } from 'express';
import { ConfiguracionService } from '@/services/ConfiguracionService';
import { ResponseUtil } from '@/utils/response';
import { AuthenticatedRequest } from '@/types';

/**
 * Controlador para gestión de configuraciones del sistema
 */
export class ConfiguracionController {
  /**
   * Obtener configuraciones públicas
   * GET /api/configuracion/public
   */
  static async getPublicConfigurations(req: Request, res: Response): Promise<void> {
    try {
      const result = await ConfiguracionService.getPublicConfigurations();

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener configuraciones públicas');
        return;
      }

      ResponseUtil.success(
        res,
        result.data,
        'Configuraciones públicas obtenidas exitosamente'
      );
    } catch (error) {
      console.error('Error en getPublicConfigurations:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Obtener todas las configuraciones (solo administradores)
   * GET /api/configuracion
   */
  static async getAllConfigurations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await ConfiguracionService.getAllConfigurations();

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener configuraciones');
        return;
      }

      ResponseUtil.success(
        res,
        result.data,
        'Configuraciones obtenidas exitosamente'
      );
    } catch (error) {
      console.error('Error en getAllConfigurations:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Obtener configuración por clave
   * GET /api/configuracion/:clave
   */
  static async getByKey(req: Request, res: Response): Promise<void> {
    try {
      const { clave } = req.params;

      const result = await ConfiguracionService.getByKey(clave);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener configuración');
        return;
      }

      if (!result.data) {
        ResponseUtil.notFound(res, 'Configuración no encontrada');
        return;
      }

      ResponseUtil.success(
        res,
        result.data,
        'Configuración obtenida exitosamente'
      );
    } catch (error) {
      console.error('Error en getByKey:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Obtener configuraciones por categoría
   * GET /api/configuracion/categoria/:categoria
   */
  static async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoria } = req.params;

      const result = await ConfiguracionService.getByCategory(categoria);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener configuraciones por categoría');
        return;
      }

      ResponseUtil.success(
        res,
        result.data,
        `Configuraciones de la categoría '${categoria}' obtenidas exitosamente`
      );
    } catch (error) {
      console.error('Error en getByCategory:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Crear nueva configuración
   * POST /api/configuracion
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { clave, valor, descripcion, tipoDato, categoria, esPublico } = req.body;

      const result = await ConfiguracionService.create({
        clave,
        valor,
        descripcion,
        tipoDato,
        categoria,
        esPublico,
      });

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al crear configuración', 400);
        return;
      }

      ResponseUtil.created(
        res,
        result.data,
        'Configuración creada exitosamente'
      );
    } catch (error) {
      console.error('Error en create:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Actualizar configuración
   * PUT /api/configuracion/:id
   */
  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { valor, descripcion, tipoDato, categoria, esPublico } = req.body;

      const result = await ConfiguracionService.update(id, {
        valor,
        descripcion,
        tipoDato,
        categoria,
        esPublico,
      });

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al actualizar configuración', 400);
        return;
      }

      ResponseUtil.updated(
        res,
        result.data,
        'Configuración actualizada exitosamente'
      );
    } catch (error) {
      console.error('Error en update:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Actualizar valor de configuración por clave
   * PATCH /api/configuracion/:clave/valor
   */
  static async updateByKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { clave } = req.params;
      const { valor } = req.body;

      if (!valor && valor !== '') {
        ResponseUtil.validationError(res, 'El valor es requerido');
        return;
      }

      const result = await ConfiguracionService.updateByKey(clave, valor);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al actualizar configuración', 400);
        return;
      }

      ResponseUtil.updated(
        res,
        result.data,
        'Valor de configuración actualizado exitosamente'
      );
    } catch (error) {
      console.error('Error en updateByKey:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Eliminar configuración
   * DELETE /api/configuracion/:id
   */
  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await ConfiguracionService.delete(id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al eliminar configuración', 400);
        return;
      }

      ResponseUtil.deleted(res, 'Configuración eliminada exitosamente');
    } catch (error) {
      console.error('Error en delete:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Obtener información del sistema
   * GET /api/configuracion/sistema/info
   */
  static async getSystemInfo(req: Request, res: Response): Promise<void> {
    try {
      const result = await ConfiguracionService.getSystemInfo();

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener información del sistema');
        return;
      }

      ResponseUtil.success(
        res,
        result.data,
        'Información del sistema obtenida exitosamente'
      );
    } catch (error) {
      console.error('Error en getSystemInfo:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Actualizar múltiples configuraciones
   * PUT /api/configuracion/bulk
   */
  static async bulkUpdate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { configuraciones } = req.body;

      if (!Array.isArray(configuraciones)) {
        ResponseUtil.validationError(res, 'Se requiere un array de configuraciones');
        return;
      }

      const results = [];
      const errors = [];

      for (const config of configuraciones) {
        const { clave, valor } = config;
        
        if (!clave || valor === undefined) {
          errors.push(`Configuración inválida: ${JSON.stringify(config)}`);
          continue;
        }

        const result = await ConfiguracionService.updateByKey(clave, valor);
        
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push(`Error al actualizar ${clave}: ${result.error}`);
        }
      }

      if (errors.length > 0) {
        ResponseUtil.error(
          res,
          `Algunas configuraciones no pudieron ser actualizadas: ${errors.length} errores`,
          400,
          JSON.stringify({ errors, updated: results })
        );
        return;
      }

      ResponseUtil.success(
        res,
        results,
        `${results.length} configuraciones actualizadas exitosamente`
      );
    } catch (error) {
      console.error('Error en bulkUpdate:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * Obtener categorías disponibles
   * GET /api/configuracion/categorias
   */
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await ConfiguracionService.getAllConfigurations();

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener categorías');
        return;
      }

      // Extraer categorías únicas
      const categorias = [...new Set(result.data?.map(config => config.categoria) || [])];

      ResponseUtil.success(
        res,
        categorias,
        'Categorías obtenidas exitosamente'
      );
    } catch (error) {
      console.error('Error en getCategories:', error);
      ResponseUtil.internalError(res);
    }
  }
}

export default ConfiguracionController;
