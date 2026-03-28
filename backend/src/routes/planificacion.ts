import { Router } from 'express';
import { PlanificacionController } from '@/controllers/PlanificacionController';
import { authenticate } from '@/middleware/auth';
import { denyRoles, requireCentroAcopioAssignment } from '@/middleware/accessControl';
import { requirePermissions } from '@/middleware/permissions';
import { uploadSingleExcel, handleUploadError } from '@/middleware/upload';
import { AuthenticatedRequest } from '@/types';
import { Response, NextFunction } from 'express';
import { PermisoOperativoService, TIPOS_PERMISO } from '@/services/PermisoOperativoService';
import { prisma } from '@/config/database';

/**
 * Rutas para gestión de planificación anual de vacunas
 */
const router = Router();
const denyResponsableAcopio = denyRoles(['responsable_acopio']);

const denyResponsableUnlessPlanificacionEdicion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user || req.user.rol !== 'responsable_acopio') {
    next();
    return;
  }

  let anio: number | undefined;

  if (req.body?.anio) {
    anio = parseInt(req.body.anio);
  } else if (req.query?.anio) {
    anio = parseInt(req.query.anio as string);
  }

  if (!anio && req.params?.id && req.method === 'PUT') {
    try {
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: { id: req.params.id },
        select: { anio: true },
      });
      if (planificacion) {
        anio = planificacion.anio;
      }
    } catch (err) {
      console.error('[denyResponsableUnlessPlanificacionEdicion] Error looking up planificacion:', err);
    }
  }

  if (!anio) {
    anio = new Date().getFullYear();
  }

  const tiene = await PermisoOperativoService.verificarPermiso(
    req.user.id,
    TIPOS_PERMISO.PLANIFICACION_EDICION,
    1,
    anio,
  );

  const tienePermisoAnual = tiene
    || await PermisoOperativoService.verificarPermisoEnAnio(
      req.user.id,
      TIPOS_PERMISO.PLANIFICACION_EDICION,
      anio,
    );

  if (tienePermisoAnual) {
    next();
    return;
  }

  denyResponsableAcopio(req, res, next);
};

const denyResponsableUnlessPlanificacionExport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user || req.user.rol !== 'responsable_acopio') {
    next();
    return;
  }
  next();
};

const requirePlanificacionExportAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.rol === 'responsable_acopio') {
    next();
    return;
  }

  requirePermissions(['planificacion:write'])(req, res, next);
};

router.use(authenticate, requireCentroAcopioAssignment, requirePermissions(['planificacion:read']));

/**
 * @route GET /api/planificacion/anios-disponibles
 * @desc Obtener años disponibles con planificaciones registradas
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/anios-disponibles', PlanificacionController.getAniosDisponibles);

/**
 * @route GET /api/planificacion/estadisticas
 * @desc Obtener estadísticas de planificación
 * @access Public (TODO: Proteger con autenticación)
 * @query {number} [anio] - Año para filtrar estadísticas
 */
router.get('/estadisticas', PlanificacionController.getEstadisticas);

/**
 * @route GET /api/planificacion/vacuna/:vacunaId/anio/:anio
 * @desc Obtener planificaciones por vacuna y año
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} anio - Año de planificación
 * @query {string} [centroAcopioId] - ID del centro de acopio o 'todos'
 */
router.get('/vacuna/:vacunaId/anio/:anio', PlanificacionController.getByVacunaAndYear);

/**
 * @route POST /api/planificacion/importar
 * @desc Importar planificaciones desde datos estructurados
 * @access Public (TODO: Proteger con autenticación)
 * @body {ImportarPlanificacionDto} data - Datos de planificación a importar
 */
router.post('/importar', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.importar);

/**
 * @route POST /api/planificacion/distribucion-automatica
 * @desc Generar distribución automática de planificación
 * @access Public (TODO: Proteger con autenticación)
 * @body {DistribucionAutomaticaDto} data - Parámetros para distribución automática
 */
router.post('/distribucion-automatica', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.distribucionAutomatica);

/**
 * @route GET /api/planificacion
 * @desc Obtener todas las planificaciones con filtros opcionales
 * @access Public (TODO: Proteger con autenticación)
 * @query {string} [establecimientoId] - ID del establecimiento
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {number} [anio] - Año de planificación
 * @query {string} [estado] - Estado de planificación (borrador, aprobado, ejecutado, todos)
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {string} [search] - Búsqueda por texto
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=50] - Límite de resultados por página
 */
router.get('/', PlanificacionController.getAll);

/**
 * @route GET /api/planificacion/:id
 * @desc Obtener planificación por ID
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la planificación
 */
router.get('/:id', PlanificacionController.getById);

/**
 * @route POST /api/planificacion
 * @desc Crear nueva planificación
 * @access Public (TODO: Proteger con autenticación)
 * @body {CreatePlanificacionDto} data - Datos de la nueva planificación
 */
router.post('/', requirePermissions(['planificacion:write']), denyResponsableUnlessPlanificacionEdicion, PlanificacionController.create);

/**
 * @route PUT /api/planificacion/:id
 * @desc Actualizar planificación existente
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la planificación
 * @body {UpdatePlanificacionDto} data - Datos a actualizar
 */
router.put('/:id', requirePermissions(['planificacion:write']), denyResponsableUnlessPlanificacionEdicion, PlanificacionController.update);



/**
 * @route DELETE /api/planificacion/:id
 * @desc Eliminar planificación
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la planificación
 */
router.delete('/:id', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.delete);

/**
 * @route GET /api/planificacion/plantilla/vacuna/:vacunaId/anio/:anio
 * @desc Descargar plantilla Excel para importación por vacuna específica
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} anio - Año de planificación
 */
router.get('/plantilla/vacuna/:vacunaId/anio/:anio', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.descargarPlantillaVacuna);

/**
 * @route GET /api/planificacion/plantilla/masiva/anio/:anio
 * @desc Descargar plantilla Excel masiva para todas las vacunas de un año
 * @access Public (TODO: Proteger con autenticación)
 * @param {number} anio - Año de planificación
 */
router.get('/plantilla/masiva/anio/:anio', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.descargarPlantillaMasiva);

/**
 * @route POST /api/planificacion/importar/vacuna/:vacunaId/anio/:anio
 * @desc Importar planificaciones desde archivo Excel por vacuna específica
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} anio - Año de planificación
 * @body {file} archivo - Archivo Excel con la programación
 */
router.post('/importar/vacuna/:vacunaId/anio/:anio',
  requirePermissions(['planificacion:write']),
  denyResponsableAcopio,
  uploadSingleExcel,
  handleUploadError,
  PlanificacionController.importarDesdeExcelVacuna
);

/**
 * @route POST /api/planificacion/importar/masivo/anio/:anio
 * @desc Importar planificaciones masivas desde archivo Excel (múltiples hojas)
 * @access Public (TODO: Proteger con autenticación)
 * @param {number} anio - Año de planificación
 * @body {file} archivo - Archivo Excel con múltiples hojas de programación
 */
router.post('/importar/masivo/anio/:anio',
  requirePermissions(['planificacion:write']),
  denyResponsableAcopio,
  uploadSingleExcel,
  handleUploadError,
  PlanificacionController.importarDesdeExcelMasivo
);

/**
 * @route POST /api/planificacion/:id/sincronizar-movimientos
 * @desc Sincronizar planificación con movimientos de vacunas
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la planificación
 */
router.post('/:id/sincronizar-movimientos', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.sincronizarConMovimientos);

/**
 * @route GET /api/planificacion/verificar/:establecimientoId/:vacunaId/:anio
 * @desc Verificar existencia de planificación para un establecimiento específico
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} establecimientoId - ID del establecimiento
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} anio - Año de planificación
 */
router.get('/verificar/:establecimientoId/:vacunaId/:anio', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.verificarExistenciaPlanificacion);

/**
 * @route GET /api/planificacion/verificar-disponibilidad/:establecimientoId/:vacunaId/:mes/:anio
 * @desc Verificar disponibilidad de entregas en próximos meses
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} establecimientoId - ID del establecimiento
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} mes - Mes actual (1-12)
 * @param {number} anio - Año de planificación
 */
router.get('/verificar-disponibilidad/:establecimientoId/:vacunaId/:mes/:anio', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.verificarDisponibilidadEntregas);

/**
 * @route POST /api/planificacion/registrar-mes-actual
 * @desc Registrar entrega en mes actual cuando no hay disponibilidad futura
 * @access Public (TODO: Proteger con autenticación)
 * @body {string} establecimientoId - ID del establecimiento
 * @body {string} vacunaId - ID de la vacuna
 * @body {number} mesActual - Mes actual (1-12)
 * @body {number} anio - Año de planificación
 * @body {number} cantidad - Cantidad a registrar
 * @body {string} [usuarioId] - ID del usuario (opcional)
 */
router.post('/registrar-mes-actual', requirePermissions(['planificacion:write']), denyResponsableAcopio, PlanificacionController.registrarEntregaMesActual);

/**
 * @route POST /api/planificacion/exportar/vacuna/:vacunaId
 * @desc Exportar planificación por vacuna específica a Excel
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @body {number} anio - Año de planificación
 * @body {string} [centroAcopioId] - ID del centro de acopio (opcional)
 * @body {boolean} [incluirEstablecimientosSinProgramacion] - Incluir establecimientos sin programación
 * @body {string} responsableReporte - Nombre del responsable del reporte
 * @body {string} [observaciones] - Observaciones adicionales
 */
router.post('/exportar/vacuna/:vacunaId', requirePlanificacionExportAccess, denyResponsableUnlessPlanificacionExport, PlanificacionController.exportarPorVacuna);

/**
 * @route POST /api/planificacion/exportar/todas-vacunas
 * @desc Exportar todas las vacunas a Excel (hojas separadas)
 * @access Public (TODO: Proteger con autenticación)
 * @body {number} anio - Año de planificación
 * @body {string} [centroAcopioId] - ID del centro de acopio (opcional)
 * @body {boolean} [incluirEstablecimientosSinProgramacion] - Incluir establecimientos sin programación
 * @body {string} responsableReporte - Nombre del responsable del reporte
 * @body {string} [observaciones] - Observaciones adicionales
 */
router.post('/exportar/todas-vacunas', requirePlanificacionExportAccess, denyResponsableUnlessPlanificacionExport, PlanificacionController.exportarTodasVacunas);

export default router;
