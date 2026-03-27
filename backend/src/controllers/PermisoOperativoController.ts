import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { PermisoOperativoService, TIPOS_PERMISO } from '@/services/PermisoOperativoService';
import { ResponseUtil } from '@/utils/response';

export class PermisoOperativoController {

  /**
   * GET / — Listar responsables de acopio con sus permisos del período
   */
  static async getResponsablesConPermisos(req: AuthenticatedRequest, res: Response): Promise<void> {
    const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
    const anio = parseInt(req.query.anio as string) || new Date().getFullYear();

    if (mes < 1 || mes > 12) {
      ResponseUtil.validationError(res, 'Mes inválido (1-12)');
      return;
    }

    const result = await PermisoOperativoService.getResponsablesConPermisos(mes, anio);
    ResponseUtil.success(res, result, 'Responsables con permisos cargados correctamente');
  }

  /**
   * POST /toggle — Activar/desactivar un permiso operativo
   */
  static async togglePermiso(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { tipo, mes, anio, habilitado, usuarioId, programado, fechaActivacion, fechaDesactivacion } = req.body;

    if (!tipo || !Object.values(TIPOS_PERMISO).includes(tipo)) {
      ResponseUtil.validationError(res, `Tipo de permiso inválido. Debe ser: ${Object.values(TIPOS_PERMISO).join(', ')}`);
      return;
    }

    if (!mes || !anio || mes < 1 || mes > 12) {
      ResponseUtil.validationError(res, 'Mes (1-12) y año son requeridos');
      return;
    }

    if (typeof habilitado !== 'boolean') {
      ResponseUtil.validationError(res, 'El campo habilitado debe ser boolean');
      return;
    }

    const result = await PermisoOperativoService.togglePermiso({
      tipo,
      mes,
      anio,
      habilitado,
      usuarioId: usuarioId || null,
      programado: programado || false,
      fechaActivacion: fechaActivacion ? new Date(fechaActivacion) : null,
      fechaDesactivacion: fechaDesactivacion ? new Date(fechaDesactivacion) : null,
      creadoPorId: req.user!.id,
    });

    ResponseUtil.success(res, result, `Permiso ${habilitado ? 'habilitado' : 'deshabilitado'} correctamente`);
  }

  /**
   * GET /usuario/:usuarioId — Obtener permisos de un usuario específico
   */
  static async getPermisosUsuario(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { usuarioId } = req.params;
    const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
    const anio = parseInt(req.query.anio as string) || new Date().getFullYear();

    const permisos = await PermisoOperativoService.getPermisosUsuario(usuarioId, mes, anio);
    ResponseUtil.success(res, permisos, 'Permisos del usuario cargados');
  }

  /**
   * GET /mis-permisos — Obtener los permisos activos del usuario autenticado
   */
  static async getMisPermisos(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
    const anio = parseInt(req.query.anio as string) || new Date().getFullYear();

    const permisos = await PermisoOperativoService.getPermisosUsuario(userId, mes, anio);
    ResponseUtil.success(res, permisos, 'Mis permisos cargados');
  }

  /**
   * POST /procesar-programados — Procesar permisos programados (para cron o manual)
   */
  static async procesarProgramados(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await PermisoOperativoService.procesarPermisosProgramados();
    ResponseUtil.success(res, result, `Procesados: ${result.activados} activados, ${result.desactivados} desactivados`);
  }
}
