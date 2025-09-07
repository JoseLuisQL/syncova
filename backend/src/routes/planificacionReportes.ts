import { Router } from 'express';
import { PlanificacionReportesController } from '@/controllers/PlanificacionReportesController';

/**
 * Rutas para reportes de planificación
 */
const router = Router();

/**
 * @route GET /api/reportes/planificacion/programacion-anual
 * @desc Generar reporte de programación anual
 * @access Public (TODO: Proteger con autenticación)
 * @query {number} [anio] - Año de planificación
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {string} [establecimientoId] - ID del establecimiento
 * @query {boolean} [incluirInactivos] - Incluir establecimientos inactivos
 */
router.get('/programacion-anual', PlanificacionReportesController.generarProgramacionAnual);

/**
 * @route GET /api/reportes/planificacion/cumplimiento-metas
 * @desc Generar reporte de cumplimiento de metas
 * @access Public (TODO: Proteger con autenticación)
 * @query {number} [anio] - Año de planificación
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {string} [establecimientoId] - ID del establecimiento
 * @query {boolean} [incluirInactivos] - Incluir establecimientos inactivos
 */
router.get('/cumplimiento-metas', PlanificacionReportesController.generarCumplimientoMetas);

/**
 * @route GET /api/reportes/planificacion/proyeccion-demanda
 * @desc Generar reporte de proyección de demanda
 * @access Public (TODO: Proteger con autenticación)
 * @query {number} [anio] - Año de planificación
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {string} [establecimientoId] - ID del establecimiento
 * @query {boolean} [incluirInactivos] - Incluir establecimientos inactivos
 */
router.get('/proyeccion-demanda', PlanificacionReportesController.generarProyeccionDemanda);

/**
 * @route GET /api/reportes/planificacion/distribucion-geografica
 * @desc Generar reporte de distribución geográfica
 * @access Public (TODO: Proteger con autenticación)
 * @query {number} [anio] - Año de planificación
 * @query {string} [vacunaId] - ID de la vacuna
 * @query {string} [centroAcopioId] - ID del centro de acopio
 * @query {boolean} [incluirInactivos] - Incluir establecimientos inactivos
 */
router.get('/distribucion-geografica', PlanificacionReportesController.generarDistribucionGeografica);

/**
 * @route POST /api/reportes/planificacion/programacion-anual/exportar
 * @desc Exportar reporte de programación anual a Excel
 * @access Public (TODO: Proteger con autenticación)
 * @body {number} anio - Año de planificación
 * @body {string} [vacunaId] - ID de la vacuna
 * @body {string} [centroAcopioId] - ID del centro de acopio
 * @body {string} responsableReporte - Nombre del responsable del reporte
 * @body {string} [observaciones] - Observaciones adicionales
 */
router.post('/programacion-anual/exportar', PlanificacionReportesController.exportarProgramacionAnual);

/**
 * @route POST /api/reportes/planificacion/cumplimiento-metas/exportar
 * @desc Exportar reporte de cumplimiento de metas a Excel
 * @access Public (TODO: Proteger con autenticación)
 * @body {number} anio - Año de planificación
 * @body {string} [vacunaId] - ID de la vacuna
 * @body {string} [centroAcopioId] - ID del centro de acopio
 * @body {string} responsableReporte - Nombre del responsable del reporte
 * @body {string} [observaciones] - Observaciones adicionales
 */
router.post('/cumplimiento-metas/exportar', PlanificacionReportesController.exportarCumplimientoMetas);

/**
 * @route POST /api/reportes/planificacion/proyeccion-demanda/exportar
 * @desc Exportar reporte de proyección de demanda a Excel
 * @access Public (TODO: Proteger con autenticación)
 * @body {number} anio - Año de planificación
 * @body {string} [vacunaId] - ID de la vacuna
 * @body {string} [centroAcopioId] - ID del centro de acopio
 * @body {string} responsableReporte - Nombre del responsable del reporte
 * @body {string} [observaciones] - Observaciones adicionales
 */
router.post('/proyeccion-demanda/exportar', PlanificacionReportesController.exportarProyeccionDemanda);

/**
 * @route POST /api/reportes/planificacion/distribucion-geografica/exportar
 * @desc Exportar reporte de distribución geográfica a Excel
 * @access Public (TODO: Proteger con autenticación)
 * @body {number} anio - Año de planificación
 * @body {string} [vacunaId] - ID de la vacuna
 * @body {string} [centroAcopioId] - ID del centro de acopio
 * @body {string} responsableReporte - Nombre del responsable del reporte
 * @body {string} [observaciones] - Observaciones adicionales
 */
router.post('/distribucion-geografica/exportar', PlanificacionReportesController.exportarDistribucionGeografica);

export default router;
