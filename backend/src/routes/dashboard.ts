import { Router } from 'express';
import { DashboardController } from '@/controllers/DashboardController';

/**
 * Rutas para el Dashboard
 */
const router = Router();

/**
 * @route GET /api/dashboard
 * @desc Obtener todos los datos del dashboard
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/', DashboardController.getDashboardData);

/**
 * @route GET /api/dashboard/estadisticas
 * @desc Obtener estadísticas generales del sistema
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/estadisticas', DashboardController.getEstadisticas);

/**
 * @route GET /api/dashboard/movimientos-mensuales
 * @desc Obtener datos de movimientos mensuales para gráficos
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/movimientos-mensuales', DashboardController.getMovimientosMensuales);

/**
 * @route GET /api/dashboard/stock-por-vacuna
 * @desc Obtener datos de stock por vacuna para gráfico de torta
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/stock-por-vacuna', DashboardController.getStockPorVacuna);

/**
 * @route GET /api/dashboard/centros-acopio-status
 * @desc Obtener estado de centros de acopio (sin paginación - para compatibilidad)
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/centros-acopio-status', DashboardController.getCentrosAcopioStatus);

/**
 * @route GET /api/dashboard/centros-acopio
 * @desc Obtener centros de acopio con paginación
 * @query page - Número de página (default: 1)
 * @query limit - Elementos por página (default: 5)
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/centros-acopio', DashboardController.getCentrosAcopio);

/**
 * @route GET /api/dashboard/alertas-recientes
 * @desc Obtener alertas recientes (sin paginación - para compatibilidad)
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/alertas-recientes', DashboardController.getAlertasRecientes);

/**
 * @route GET /api/dashboard/alertas
 * @desc Obtener alertas recientes con paginación
 * @query page - Número de página (default: 1)
 * @query limit - Elementos por página (default: 3)
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/alertas', DashboardController.getAlertasRecientes);

/**
 * @route GET /api/dashboard/actividad-reciente
 * @desc Obtener actividad reciente del sistema (sin paginación - para compatibilidad)
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/actividad-reciente', DashboardController.getActividadReciente);

/**
 * @route GET /api/dashboard/actividad
 * @desc Obtener actividad reciente con paginación
 * @query page - Número de página (default: 1)
 * @query limit - Elementos por página (default: 5)
 * @access Public (TODO: Proteger con autenticación)
 */
router.get('/actividad', DashboardController.getActividadReciente);

export default router;
