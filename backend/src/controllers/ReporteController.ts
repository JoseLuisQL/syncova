import { ReporteStockController } from './reportes/ReporteStockController';
import { ReporteKardexController } from './reportes/ReporteKardexController';
import { ReporteMovimientosController } from './reportes/ReporteMovimientosController';

/**
 * Controlador facade para gestión de reportes
 * Re-exporta métodos de sub-controladores para mantener compatibilidad
 * Módulo: REPORTES
 */
export class ReporteController {
  // Stock y Inventario
  static generarStockActual = ReporteStockController.generarStockActual;
  static generarStockCritico = ReporteStockController.generarStockCritico;
  static generarProximosVencimientos = ReporteStockController.generarProximosVencimientos;
  static generarLotesVencidos = ReporteStockController.generarLotesVencidos;
  static obtenerEstadisticas = ReporteStockController.obtenerEstadisticas;
  static exportarStockActualExcel = ReporteStockController.exportarStockActualExcel;
  static exportarStockCriticoExcel = ReporteStockController.exportarStockCriticoExcel;
  static exportarProximosVencimientosExcel = ReporteStockController.exportarProximosVencimientosExcel;
  static exportarLotesVencidosExcel = ReporteStockController.exportarLotesVencidosExcel;
  static exportarStockVacunasEESS = ReporteStockController.exportarStockVacunasEESS;

  // Kardex
  static generarKardexDetallado = ReporteKardexController.generarKardexDetallado;
  static exportarKardexDetalladoExcel = ReporteKardexController.exportarKardexDetalladoExcel;

  // Movimientos y Análisis
  static generarMovimientosMensuales = ReporteMovimientosController.generarMovimientosMensuales;
  static generarConsumoHistorico = ReporteMovimientosController.generarConsumoHistorico;
  static generarEntregasPorEstablecimiento = ReporteMovimientosController.generarEntregasPorEstablecimiento;
  static generarEficienciaDistribucion = ReporteMovimientosController.generarEficienciaDistribucion;
  static generarMovimientosPorEESS = ReporteMovimientosController.generarMovimientosPorEESS;
  static exportarMovimientosMensuales = ReporteMovimientosController.exportarMovimientosMensuales;
  static exportarConsumoHistorico = ReporteMovimientosController.exportarConsumoHistorico;
  static exportarEntregasPorEstablecimiento = ReporteMovimientosController.exportarEntregasPorEstablecimiento;
  static exportarEficienciaDistribucion = ReporteMovimientosController.exportarEficienciaDistribucion;
  static exportarMovimientosPorEESS = ReporteMovimientosController.exportarMovimientosPorEESS;
}
