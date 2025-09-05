import { Request, Response } from 'express';
import {
  ReporteService,
  ReporteInventarioFilters,
  StockCriticoFilters,
  VencimientosFilters,
  KardexDetalladoFilters,
  LoteVencidoItem,
  MovimientosMensualesFilters,
  ConsumoHistoricoFilters,
  EntregasPorEstablecimientoFilters,
  EficienciaDistribucionFilters
} from '@/services/ReporteService';
import {
  ReporteExportService,
  ReporteExportConfig
} from '@/services/ReporteExportService';
import { KardexExportService, KardexExportConfig } from '@/services/KardexExportService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';

/**
 * Controlador para gestión de reportes de inventario
 * Módulo: REPORTES DE INVENTARIO Y STOCK
 */
export class ReporteController {
  /**
   * Generar reporte de stock actual
   * GET /api/reportes/stock-actual
   */
  static async generarStockActual(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        fechaInicio,
        fechaFin,
        incluirInactivos
      } = req.query;

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      // Construir filtros
      const filters: ReporteInventarioFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await ReporteService.generarStockActual(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de stock actual', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de stock actual generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarStockActual:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de stock crítico
   * GET /api/reportes/stock-critico
   */
  static async generarStockCritico(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        porcentajeMinimo,
        cantidadMinima,
        incluirInactivos
      } = req.query;

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      const porcentaje = porcentajeMinimo ? parseInt(porcentajeMinimo as string, 10) : undefined;
      if (porcentaje && (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100)) {
        ResponseUtil.error(res, 'Porcentaje mínimo debe estar entre 0 y 100', 400);
        return;
      }

      const cantidad = cantidadMinima ? parseInt(cantidadMinima as string, 10) : undefined;
      if (cantidad && (isNaN(cantidad) || cantidad < 0)) {
        ResponseUtil.error(res, 'Cantidad mínima debe ser mayor a 0', 400);
        return;
      }

      // Construir filtros
      const filters: StockCriticoFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        porcentajeMinimo: porcentaje,
        cantidadMinima: cantidad,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await ReporteService.generarStockCritico(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de stock crítico', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de stock crítico generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarStockCritico:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de próximos vencimientos
   * GET /api/reportes/proximos-vencimientos
   */
  static async generarProximosVencimientos(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        diasAnticipacion,
        incluirInactivos
      } = req.query;

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      const dias = diasAnticipacion ? parseInt(diasAnticipacion as string, 10) : undefined;
      if (dias && (isNaN(dias) || dias < 1 || dias > 365)) {
        ResponseUtil.error(res, 'Días de anticipación debe estar entre 1 y 365', 400);
        return;
      }

      // Construir filtros
      const filters: VencimientosFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        diasAnticipacion: dias,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await ReporteService.generarProximosVencimientos(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de próximos vencimientos', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de próximos vencimientos generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarProximosVencimientos:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de lotes vencidos
   * GET /api/reportes/lotes-vencidos
   */
  static async generarLotesVencidos(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        incluirInactivos
      } = req.query;

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      // Construir filtros
      const filters: ReporteInventarioFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await ReporteService.generarLotesVencidos(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de lotes vencidos', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de lotes vencidos generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarLotesVencidos:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de kardex detallado
   * POST /api/reportes/kardex-detallado
   */
  static async generarKardexDetallado(req: Request, res: Response): Promise<void> {
    try {
      const {
        tipo,
        itemId,
        loteId,
        establecimientoId,
        tipoMovimiento,
        fechaInicio,
        fechaFin,
        incluirTrazabilidad
      } = req.body;

      // Validaciones requeridas
      if (!fechaInicio || !fechaFin) {
        ResponseUtil.error(res, 'Las fechas de inicio y fin son requeridas', 400);
        return;
      }

      // Validar fechas
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);

      if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
        ResponseUtil.error(res, 'Formato de fecha inválido', 400);
        return;
      }

      if (fechaInicioDate > fechaFinDate) {
        ResponseUtil.error(res, 'La fecha de inicio debe ser menor a la fecha de fin', 400);
        return;
      }

      // Validar UUIDs si se proporcionan
      if (itemId && !validateUUID(itemId)) {
        ResponseUtil.error(res, 'ID de item inválido', 400);
        return;
      }

      if (loteId && !validateUUID(loteId)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      // Validar tipo si se proporciona
      if (tipo && !['vacuna', 'jeringa'].includes(tipo)) {
        ResponseUtil.error(res, 'Tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      // Validar tipo de movimiento si se proporciona
      if (tipoMovimiento && !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(tipoMovimiento)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      // Construir filtros
      const filters: KardexDetalladoFilters = {
        tipo: tipo as 'vacuna' | 'jeringa',
        itemId,
        loteId,
        establecimientoId,
        tipoMovimiento: tipoMovimiento as 'ingreso' | 'salida' | 'transferencia' | 'ajuste',
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        incluirTrazabilidad: incluirTrazabilidad === true
      };

      const result = await ReporteService.generarKardexDetallado(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de kardex detallado', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de kardex detallado generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarKardexDetallado:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de kardex detallado a Excel
   * POST /api/reportes/kardex-detallado/export/excel
   */
  static async exportarKardexDetalladoExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      console.log('🔄 Iniciando exportación de Kardex detallado desde ReporteController');
      console.log('📋 Body completo recibido:', JSON.stringify(req.body, null, 2));
      console.log('📋 Filtros recibidos:', JSON.stringify(filters, null, 2));

      // Validaciones requeridas
      if (!filters || !filters.fechaInicio || !filters.fechaFin) {
        ResponseUtil.error(res, 'Los filtros con fechas de inicio y fin son requeridos', 400);
        return;
      }

      // Validar y procesar fechas - CORREGIR ZONA HORARIA
      // El frontend envía fechas en formato YYYY-MM-DD, pero new Date() las interpreta en UTC
      // Necesitamos crear las fechas en zona horaria local para evitar cambios de día
      const fechaInicioDate = new Date(filters.fechaInicio + 'T00:00:00.000');
      const fechaFinDate = new Date(filters.fechaFin + 'T23:59:59.999');

      console.log(`📅 Fechas recibidas del frontend:`);
      console.log(`   - fechaInicio (string): ${filters.fechaInicio}`);
      console.log(`   - fechaFin (string): ${filters.fechaFin}`);
      console.log(`📅 Fechas convertidas a Date (con zona horaria corregida):`);
      console.log(`   - fechaInicioDate: ${fechaInicioDate.toISOString()} (${fechaInicioDate.toLocaleDateString('es-PE')})`);
      console.log(`   - fechaFinDate: ${fechaFinDate.toISOString()} (${fechaFinDate.toLocaleDateString('es-PE')})`);

      if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
        ResponseUtil.error(res, 'Formato de fecha inválido', 400);
        return;
      }

      if (fechaInicioDate > fechaFinDate) {
        ResponseUtil.error(res, 'La fecha de inicio debe ser menor a la fecha de fin', 400);
        return;
      }

      // Validar UUIDs si se proporcionan
      if (filters.itemId && !validateUUID(filters.itemId)) {
        ResponseUtil.error(res, 'ID de item inválido', 400);
        return;
      }

      if (filters.loteId && !validateUUID(filters.loteId)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      if (filters.establecimientoId && !validateUUID(filters.establecimientoId)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      // Validar tipo si se proporciona
      if (filters.tipo && !['vacuna', 'jeringa'].includes(filters.tipo)) {
        ResponseUtil.error(res, 'Tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      // Validar tipo de movimiento si se proporciona
      if (filters.tipoMovimiento && !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(filters.tipoMovimiento)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      // Construir configuración para KardexExportService
      // Mapear desde ConfiguracionExportacion (frontend) a KardexExportConfig (backend)
      const kardexExportConfig: KardexExportConfig = {
        incluirDetalleCompleto: config?.incluirDetalles !== false,
        incluirTrazabilidad: false, // No se usa en el frontend actual
        incluirEstadisticas: config?.incluirEstadisticas !== false,
        formatoExportacion: 'excel',
        filtros: {
          tipo: filters.tipo as 'vacuna' | 'jeringa',
          itemId: filters.itemId,
          loteId: filters.loteId,
          tipoMovimiento: filters.tipoMovimiento as 'ingreso' | 'salida' | 'transferencia' | 'ajuste',
          establecimientoOrigenId: filters.establecimientoId,
          establecimientoDestinoId: filters.establecimientoId,
          fechaInicio: fechaInicioDate,
          fechaFin: fechaFinDate,
          search: filters.search
        }
      };

      console.log('🔍 Fechas que se enviarán a KardexExportService:');
      console.log('   - fechaInicio (Date):', fechaInicioDate.toISOString());
      console.log('   - fechaFin (Date):', fechaFinDate.toISOString());
      console.log('   - tipo:', filters.tipo);
      console.log('   - itemId:', filters.itemId);
      console.log('   - loteId:', filters.loteId);
      console.log('📊 Mapeo de configuración:');
      console.log('   Frontend config.incluirDetalles:', config?.incluirDetalles, '→ Backend incluirDetalleCompleto:', kardexExportConfig.incluirDetalleCompleto);
      console.log('   Frontend config.incluirEstadisticas:', config?.incluirEstadisticas, '→ Backend incluirEstadisticas:', kardexExportConfig.incluirEstadisticas);
      console.log('   Backend incluirTrazabilidad:', kardexExportConfig.incluirTrazabilidad);
      console.log('   Backend formatoExportacion:', kardexExportConfig.formatoExportacion);
      console.log('📊 Filtros mapeados:');
      console.log('   - tipo:', kardexExportConfig.filtros?.tipo);
      console.log('   - itemId:', kardexExportConfig.filtros?.itemId);
      console.log('   - loteId:', kardexExportConfig.filtros?.loteId);
      console.log('   - fechaInicio existe:', !!kardexExportConfig.filtros?.fechaInicio);
      console.log('   - fechaFin existe:', !!kardexExportConfig.filtros?.fechaFin);

      // Hacer una prueba rápida para verificar los filtros
      console.log('🧪 PRUEBA: Verificando filtros antes de exportar');
      console.log('   - Rango de fechas solicitado:', {
        inicio: fechaInicioDate.toLocaleDateString('es-PE'),
        fin: fechaFinDate.toLocaleDateString('es-PE')
      });

      console.log('🚀 Llamando a KardexExportService.exportToExcel...');

      // Usar KardexExportService para generar el Excel
      const exportResult = await KardexExportService.exportToExcel(kardexExportConfig);

      console.log('📊 Resultado de exportación:', {
        success: exportResult.success,
        hasData: !!exportResult.data,
        error: exportResult.error
      });

      if (!exportResult.success) {
        console.error('❌ Error en exportación:', exportResult.error);
        ResponseUtil.error(res, exportResult.error || 'Error al exportar kardex detallado', 400);
        return;
      }

      console.log('✅ Exportación exitosa, generando buffer...');

      // Generar buffer del archivo Excel
      const buffer = await exportResult.data.workbook.xlsx.writeBuffer();

      console.log(`📁 Archivo generado: ${exportResult.data.filename} (${buffer.length} bytes)`);

      // Configurar headers para descarga de archivo Excel
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data.filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());

      // Enviar el buffer del archivo
      res.send(buffer);

      console.log('✅ Kardex detallado exportado exitosamente');
    } catch (error) {
      console.error('❌ Error en ReporteController.exportarKardexDetalladoExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas generales de reportes
   * GET /api/reportes/estadisticas
   */
  static async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const result = await ReporteService.obtenerEstadisticasGenerales();

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener estadísticas', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.obtenerEstadisticas:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de stock actual a Excel
   * POST /api/reportes/stock-actual/export/excel
   */
  static async exportarStockActualExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      // Validar configuración de exportación
      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarStockActual(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      // Configuración por defecto para exportación
      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarStockActual(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      // Configurar respuesta para descarga
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarStockActualExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de stock crítico a Excel
   * POST /api/reportes/stock-critico/export/excel
   */
  static async exportarStockCriticoExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      // Validar configuración de exportación
      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarStockCritico(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      // Configuración por defecto para exportación
      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarStockCritico(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      // Configurar respuesta para descarga
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarStockCriticoExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de próximos vencimientos a Excel
   * POST /api/reportes/proximos-vencimientos/export/excel
   */
  static async exportarProximosVencimientosExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      // Validar configuración de exportación
      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarProximosVencimientos(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      // Configuración por defecto para exportación
      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarProximosVencimientos(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      // Configurar respuesta para descarga
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarProximosVencimientosExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de lotes vencidos a Excel
   * POST /api/reportes/lotes-vencidos/export/excel
   */
  static async exportarLotesVencidosExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      // Validar configuración de exportación
      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      // Generar reporte de lotes vencidos
      const reporteResult = await ReporteService.generarLotesVencidos(filters);

      if (!reporteResult.success || !reporteResult.data) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar reporte de lotes vencidos', 400);
        return;
      }

      // Configurar exportación
      const exportConfig: ReporteExportConfig = {
        incluirDetalles: config.incluirDetalles !== false,
        incluirGraficos: config.incluirGraficos === true,
        incluirEstadisticas: config.incluirEstadisticas !== false,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarLotesVencidos(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success || !exportResult.data) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte de lotes vencidos', 500);
        return;
      }

      // Generar buffer del archivo Excel
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarLotesVencidosExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  // =====================================================
  // MÉTODOS PARA REPORTES DE MOVIMIENTOS
  // =====================================================

  /**
   * Generar reporte de movimientos mensuales
   * GET /api/reportes/movimientos-mensuales
   */
  static async generarMovimientosMensuales(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        mes,
        anio,
        incluirInactivos,
        agruparPor
      } = req.query;

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      // Validar mes
      const mesNum = mes ? parseInt(mes as string, 10) : undefined;
      if (mes && (isNaN(mesNum!) || mesNum! < 1 || mesNum! > 12)) {
        ResponseUtil.error(res, 'El mes debe estar entre 1 y 12', 400);
        return;
      }

      // Validar año
      const anioNum = anio ? parseInt(anio as string, 10) : undefined;
      if (anio && (isNaN(anioNum!) || anioNum! < 2020 || anioNum! > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      // Construir filtros
      const filters: MovimientosMensualesFilters = {};

      if (centroAcopioId) filters.centroAcopioId = centroAcopioId as string;
      if (vacunaId) filters.vacunaId = vacunaId as string;
      if (establecimientoId) filters.establecimientoId = establecimientoId as string;
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaFin = new Date(fechaFin as string);
      if (mesNum) filters.mes = mesNum;
      if (anioNum) filters.anio = anioNum;
      if (incluirInactivos) filters.incluirInactivos = incluirInactivos === 'true';
      if (agruparPor) filters.agruparPor = agruparPor as 'mes' | 'vacuna' | 'establecimiento';

      const result = await ReporteService.generarMovimientosMensuales(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de movimientos mensuales', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de movimientos mensuales generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarMovimientosMensuales:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de consumo histórico
   * GET /api/reportes/consumo-historico
   */
  static async generarConsumoHistorico(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        periodoMeses,
        incluirInactivos,
        incluirProyecciones
      } = req.query;

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      // Validar período de meses
      const periodoMesesNum = periodoMeses ? parseInt(periodoMeses as string, 10) : 12;
      if (periodoMeses && (isNaN(periodoMesesNum) || periodoMesesNum < 1 || periodoMesesNum > 60)) {
        ResponseUtil.error(res, 'El período de meses debe estar entre 1 y 60', 400);
        return;
      }

      // Construir filtros
      const filters: ConsumoHistoricoFilters = {};

      if (centroAcopioId) filters.centroAcopioId = centroAcopioId as string;
      if (vacunaId) filters.vacunaId = vacunaId as string;
      if (establecimientoId) filters.establecimientoId = establecimientoId as string;
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaFin = new Date(fechaFin as string);
      filters.periodoMeses = periodoMesesNum;
      if (incluirInactivos) filters.incluirInactivos = incluirInactivos === 'true';
      filters.incluirProyecciones = incluirProyecciones !== 'false';

      const result = await ReporteService.generarConsumoHistorico(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de consumo histórico', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de consumo histórico generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarConsumoHistorico:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de entregas por establecimiento
   * GET /api/reportes/entregas-por-establecimiento
   */
  static async generarEntregasPorEstablecimiento(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        incluirInactivos,
        incluirDetalleVacunas,
        ordenarPor
      } = req.query;

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      // Construir filtros
      const filters: EntregasPorEstablecimientoFilters = {};

      if (centroAcopioId) filters.centroAcopioId = centroAcopioId as string;
      if (vacunaId) filters.vacunaId = vacunaId as string;
      if (establecimientoId) filters.establecimientoId = establecimientoId as string;
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaFin = new Date(fechaFin as string);
      if (incluirInactivos) filters.incluirInactivos = incluirInactivos === 'true';
      filters.incluirDetalleVacunas = incluirDetalleVacunas !== 'false';
      if (ordenarPor) filters.ordenarPor = ordenarPor as 'establecimiento' | 'cantidad' | 'fecha';

      const result = await ReporteService.generarEntregasPorEstablecimiento(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de entregas por establecimiento', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de entregas por establecimiento generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarEntregasPorEstablecimiento:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de eficiencia de distribución
   * GET /api/reportes/eficiencia-distribucion
   */
  static async generarEficienciaDistribucion(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        incluirInactivos,
        incluirIndicadores,
        calcularTendencias
      } = req.query;

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      // Construir filtros
      const filters: EficienciaDistribucionFilters = {};

      if (centroAcopioId) filters.centroAcopioId = centroAcopioId as string;
      if (vacunaId) filters.vacunaId = vacunaId as string;
      if (establecimientoId) filters.establecimientoId = establecimientoId as string;
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaFin = new Date(fechaFin as string);
      if (incluirInactivos) filters.incluirInactivos = incluirInactivos === 'true';
      filters.incluirIndicadores = incluirIndicadores !== 'false';
      filters.calcularTendencias = calcularTendencias !== 'false';

      const result = await ReporteService.generarEficienciaDistribucion(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de eficiencia de distribución', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de eficiencia de distribución generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteController.generarEficienciaDistribucion:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  // =====================================================
  // MÉTODOS PARA EXPORTAR REPORTES DE MOVIMIENTOS
  // =====================================================

  /**
   * Exportar reporte de movimientos mensuales a Excel
   * POST /api/reportes/movimientos-mensuales/exportar
   */
  static async exportarMovimientosMensuales(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarMovimientosMensuales(filtros);
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
        return;
      }

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarMovimientosMensuales(
        reporteResult.data!,
        config
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      // Generar buffer del archivo
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      // Enviar archivo
      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarMovimientosMensuales:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de consumo histórico a Excel
   * POST /api/reportes/consumo-historico/exportar
   */
  static async exportarConsumoHistorico(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarConsumoHistorico(filtros);
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
        return;
      }

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarConsumoHistorico(
        reporteResult.data!,
        config
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      // Generar buffer del archivo
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      // Enviar archivo
      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarConsumoHistorico:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de entregas por establecimiento a Excel
   * POST /api/reportes/entregas-por-establecimiento/exportar
   */
  static async exportarEntregasPorEstablecimiento(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarEntregasPorEstablecimiento(filtros);
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
        return;
      }

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarEntregasPorEstablecimiento(
        reporteResult.data!,
        config
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      // Generar buffer del archivo
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      // Enviar archivo
      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarEntregasPorEstablecimiento:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de eficiencia de distribución a Excel
   * POST /api/reportes/eficiencia-distribucion/exportar
   */
  static async exportarEficienciaDistribucion(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarEficienciaDistribucion(filtros);
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
        return;
      }

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarEficienciaDistribucion(
        reporteResult.data!,
        config
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      // Generar buffer del archivo
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      // Enviar archivo
      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarEficienciaDistribucion:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}