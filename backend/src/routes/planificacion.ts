import { Router } from 'express';
import { PlanificacionController } from '@/controllers/PlanificacionController';
import { uploadSingleExcel, handleUploadError } from '@/middleware/upload';

/**
 * Rutas para gestión de planificación anual de vacunas
 */
const router = Router();

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
router.post('/importar', PlanificacionController.importar);

/**
 * @route POST /api/planificacion/distribucion-automatica
 * @desc Generar distribución automática de planificación
 * @access Public (TODO: Proteger con autenticación)
 * @body {DistribucionAutomaticaDto} data - Parámetros para distribución automática
 */
router.post('/distribucion-automatica', PlanificacionController.distribucionAutomatica);

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
router.post('/', PlanificacionController.create);

/**
 * @route PUT /api/planificacion/:id
 * @desc Actualizar planificación existente
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la planificación
 * @body {UpdatePlanificacionDto} data - Datos a actualizar
 */
router.put('/:id', PlanificacionController.update);



/**
 * @route DELETE /api/planificacion/:id
 * @desc Eliminar planificación
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} id - ID de la planificación
 */
router.delete('/:id', PlanificacionController.delete);

/**
 * @route GET /api/planificacion/plantilla/vacuna/:vacunaId/anio/:anio
 * @desc Descargar plantilla Excel para importación por vacuna específica
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} anio - Año de planificación
 */
router.get('/plantilla/vacuna/:vacunaId/anio/:anio', PlanificacionController.descargarPlantillaVacuna);

/**
 * @route GET /api/planificacion/plantilla/masiva/anio/:anio
 * @desc Descargar plantilla Excel masiva para todas las vacunas de un año
 * @access Public (TODO: Proteger con autenticación)
 * @param {number} anio - Año de planificación
 */
router.get('/plantilla/masiva/anio/:anio', PlanificacionController.descargarPlantillaMasiva);

/**
 * @route POST /api/planificacion/importar/vacuna/:vacunaId/anio/:anio
 * @desc Importar planificaciones desde archivo Excel por vacuna específica
 * @access Public (TODO: Proteger con autenticación)
 * @param {string} vacunaId - ID de la vacuna
 * @param {number} anio - Año de planificación
 * @body {file} archivo - Archivo Excel con la programación
 */
router.post('/importar/vacuna/:vacunaId/anio/:anio',
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
router.post('/:id/sincronizar-movimientos', PlanificacionController.sincronizarConMovimientos);

export default router;
