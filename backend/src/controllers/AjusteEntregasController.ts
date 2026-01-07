import { Request, Response, NextFunction } from 'express';
import { AjusteEntregasService, EjecutarAjusteDto } from '@/services/movimientos/AjusteEntregasService';
import { ResponseUtil } from '@/utils/response';

/**
 * Controller for automatic delivery adjustments
 */
export class AjusteEntregasController {
  
  /**
   * Get data for adjustment modal
   * GET /api/movimientos/ajuste-entregas/datos/:vacunaId/:mes/:anio
   */
  static async obtenerDatosParaAjuste(req: Request, res: Response, next: NextFunction) {
    try {
      const { vacunaId, mes, anio } = req.params;

      if (!vacunaId || !mes || !anio) {
        return ResponseUtil.validationError(res, 'Se requieren vacunaId, mes y anio');
      }

      const mesNum = parseInt(mes, 10);
      const anioNum = parseInt(anio, 10);

      if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
        return ResponseUtil.validationError(res, 'El mes debe estar entre 1 y 12');
      }

      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        return ResponseUtil.validationError(res, 'El año debe estar entre 2020 y 2050');
      }

      const result = await AjusteEntregasService.obtenerDatosParaAjuste(
        vacunaId,
        mesNum,
        anioNum
      );

      if (!result.success) {
        return ResponseUtil.validationError(res, result.error || 'Error al obtener datos');
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate adjustment options
   * POST /api/movimientos/ajuste-entregas/calcular-opciones
   */
  static async calcularOpcionesAjuste(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = req.body;

      if (!datos || !datos.vacunaId || !datos.mes || !datos.anio) {
        return ResponseUtil.validationError(res, 'Datos incompletos');
      }

      const result = await AjusteEntregasService.calcularOpcionesAjuste(datos);

      if (!result.success) {
        return ResponseUtil.validationError(res, result.error || 'Error al calcular opciones');
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute adjustment
   * POST /api/movimientos/ajuste-entregas/ejecutar
   */
  static async ejecutarAjuste(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: EjecutarAjusteDto = req.body;

      if (!dto || !dto.vacunaId || !dto.mes || !dto.anio || !dto.ajustes || !dto.usuarioId) {
        return ResponseUtil.validationError(res, 'Datos incompletos para ejecutar ajuste');
      }

      if (!Array.isArray(dto.ajustes) || dto.ajustes.length === 0) {
        return ResponseUtil.validationError(res, 'Se requiere al menos un ajuste');
      }

      // Validate each adjustment
      for (const ajuste of dto.ajustes) {
        if (!ajuste.movimientoId || ajuste.entregaNueva === undefined || ajuste.entregaNueva < 0) {
          return ResponseUtil.validationError(res, 'Ajuste inválido: se requiere movimientoId y entregaNueva >= 0');
        }
      }

      const result = await AjusteEntregasService.ejecutarAjuste(dto);

      if (!result.success) {
        return ResponseUtil.validationError(res, result.error || 'Error al ejecutar ajuste');
      }

      return ResponseUtil.success(res, result.data, result.data?.mensaje);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if adjustment is available
   * GET /api/movimientos/ajuste-entregas/verificar/:vacunaId/:mes/:anio
   */
  static async verificarDisponibilidad(req: Request, res: Response, next: NextFunction) {
    try {
      const { vacunaId, mes, anio } = req.params;

      if (!vacunaId || !mes || !anio) {
        return ResponseUtil.validationError(res, 'Se requieren vacunaId, mes y anio');
      }

      const mesNum = parseInt(mes, 10);
      const anioNum = parseInt(anio, 10);

      if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
        return ResponseUtil.validationError(res, 'El mes debe estar entre 1 y 12');
      }

      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        return ResponseUtil.validationError(res, 'El año debe estar entre 2020 y 2050');
      }

      const result = await AjusteEntregasService.verificarDisponibilidadAjuste(
        vacunaId,
        mesNum,
        anioNum
      );

      if (!result.success) {
        return ResponseUtil.validationError(res, result.error || 'Error al verificar disponibilidad');
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      next(error);
    }
  }
}
