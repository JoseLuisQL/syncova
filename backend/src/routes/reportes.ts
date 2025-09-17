import { Router } from 'express';
import { ReporteController } from '@/controllers/ReporteController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

/**
 * Rutas para reportes de inventario y stock
 * Todas las rutas requieren autenticación
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

/**
 * Rutas para generación de reportes (datos JSON)
 */

// GET /api/reportes/stock-actual - Generar reporte de stock actual
router.get('/stock-actual', ReporteController.generarStockActual);

// GET /api/reportes/stock-critico - Generar reporte de stock crítico
router.get('/stock-critico', ReporteController.generarStockCritico);

// GET /api/reportes/proximos-vencimientos - Generar reporte de próximos vencimientos
router.get('/proximos-vencimientos', ReporteController.generarProximosVencimientos);

// GET /api/reportes/lotes-vencidos - Generar reporte de lotes vencidos
router.get('/lotes-vencidos', ReporteController.generarLotesVencidos);

// POST /api/reportes/kardex-detallado - Generar reporte de kardex detallado
router.post('/kardex-detallado', ReporteController.generarKardexDetallado);

// GET /api/reportes/estadisticas - Obtener estadísticas generales
router.get('/estadisticas', ReporteController.obtenerEstadisticas);

/**
 * Rutas para reportes de movimientos
 */

// GET /api/reportes/movimientos-mensuales - Generar reporte de movimientos mensuales
router.get('/movimientos-mensuales', ReporteController.generarMovimientosMensuales);

// GET /api/reportes/consumo-historico - Generar reporte de consumo histórico
router.get('/consumo-historico', ReporteController.generarConsumoHistorico);

// GET /api/reportes/entregas-por-establecimiento - Generar reporte de entregas por establecimiento
router.get('/entregas-por-establecimiento', ReporteController.generarEntregasPorEstablecimiento);

// GET /api/reportes/eficiencia-distribucion - Generar reporte de eficiencia de distribución
router.get('/eficiencia-distribucion', ReporteController.generarEficienciaDistribucion);

// POST /api/reportes/movimientos-por-eess - Generar reporte de movimientos por EESS
router.post('/movimientos-por-eess', ReporteController.generarMovimientosPorEESS);

/**
 * Rutas para exportar reportes de movimientos
 */

// POST /api/reportes/movimientos-mensuales/exportar - Exportar reporte de movimientos mensuales
router.post('/movimientos-mensuales/exportar', ReporteController.exportarMovimientosMensuales);

// POST /api/reportes/consumo-historico/exportar - Exportar reporte de consumo histórico
router.post('/consumo-historico/exportar', ReporteController.exportarConsumoHistorico);

// POST /api/reportes/entregas-por-establecimiento/exportar - Exportar reporte de entregas por establecimiento
router.post('/entregas-por-establecimiento/exportar', ReporteController.exportarEntregasPorEstablecimiento);

// POST /api/reportes/eficiencia-distribucion/exportar - Exportar reporte de eficiencia de distribución
router.post('/eficiencia-distribucion/exportar', ReporteController.exportarEficienciaDistribucion);

// POST /api/reportes/movimientos-por-eess/exportar - Exportar reporte de movimientos por EESS
router.post('/movimientos-por-eess/exportar', ReporteController.exportarMovimientosPorEESS);

/**
 * Rutas para exportación de reportes (archivos Excel)
 */

// POST /api/reportes/stock-actual/export/excel - Exportar stock actual a Excel
router.post('/stock-actual/export/excel', ReporteController.exportarStockActualExcel);

// POST /api/reportes/stock-critico/export/excel - Exportar stock crítico a Excel
router.post('/stock-critico/export/excel', ReporteController.exportarStockCriticoExcel);

// POST /api/reportes/proximos-vencimientos/export/excel - Exportar vencimientos a Excel
router.post('/proximos-vencimientos/export/excel', ReporteController.exportarProximosVencimientosExcel);

// POST /api/reportes/lotes-vencidos/export/excel - Exportar lotes vencidos a Excel
router.post('/lotes-vencidos/export/excel', ReporteController.exportarLotesVencidosExcel);

// POST /api/reportes/kardex-detallado/export/excel - Exportar kardex detallado a Excel
router.post('/kardex-detallado/export/excel', ReporteController.exportarKardexDetalladoExcel);

/**
 * Rutas adicionales para futuras funcionalidades
 */

// TODO: Implementar rutas para:
// - Reportes programados
// - Configuración de reportes
// - Historial de reportes generados
// - Plantillas personalizadas

export default router;