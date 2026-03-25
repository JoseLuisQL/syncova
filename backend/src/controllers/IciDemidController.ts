import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { errorResponse, successResponse } from '@/utils/response';
import { validateUUID } from '@/utils/validation';
import { resolveScopedCentroAcopioId, resolveScopedCentroAcopioIds } from '@/middleware/accessControl';
import { IciDemidService } from '@/services/IciDemidService';

export class IciDemidController {
  static async getAniosDisponibles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await IciDemidService.getAniosDisponibles();
      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener años disponibles', result.statusCode || 500);
        return;
      }
      successResponse(res, result.data, 'Años ICI DEMID obtenidos exitosamente');
    } catch (error) {
      console.error('Error en IciDemidController.getAniosDisponibles:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  static async previewImport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const file = req.file;
      const result = await IciDemidService.previewImport(file as Express.Multer.File);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al previsualizar archivo', result.statusCode || 400);
        return;
      }

      successResponse(res, result.data, 'Previsualización generada exitosamente');
    } catch (error) {
      console.error('Error en IciDemidController.previewImport:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  static async importFromExcel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const file = req.file;
      const result = await IciDemidService.importFromExcel(file as Express.Multer.File, req.user?.id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al importar archivo', result.statusCode || 400);
        return;
      }

      successResponse(res, result.data, 'Archivo ICI DEMID importado exitosamente');
    } catch (error) {
      console.error('Error en IciDemidController.importFromExcel:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { anio, establecimientoId, vacunaId, centroAcopioId, page = '1', limit = '200' } = req.query;

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
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

      const result = await IciDemidService.getAll({
        anio: anio ? Number(anio) : undefined,
        establecimientoId: establecimientoId as string | undefined,
        vacunaId: vacunaId as string | undefined,
        centroAcopioId: scopedCentroAcopioId,
        centroAcopioIds: scopedCentroAcopioIds,
        page: Number(page),
        limit: Number(limit),
      });

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener registros ICI DEMID', result.statusCode || 500);
        return;
      }

      successResponse(
        res,
        {
          registros: result.data?.registros || [],
          total: result.data?.total || 0,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: result.data?.total || 0,
            totalPages: Math.max(1, Math.ceil((result.data?.total || 0) / Number(limit))),
          },
        },
        'Registros ICI DEMID obtenidos exitosamente',
      );
    } catch (error) {
      console.error('Error en IciDemidController.getAll:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}

export default IciDemidController;
